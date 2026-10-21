# Review: memoryview + single-slot queue stereo streaming patch

## 1. Recommendation: **No-ship**

The patch has a real, structural correctness bug that the validation so far cannot detect, and it is exactly the kind of bug that a five-minute manual test and a copy-on-send test double are blind to. The performance goal is achievable without it, so there is no reason to ship as-is.

The core issue: **`left` and `right` are reused bytearrays, but the queue holds `memoryview`s into them, and the sender may still be reading those views when the capture loop overwrites the buffers.** The single-slot queue does not prevent this — it only bounds *pending* packets, not *in-flight* ones.

## 2. Concrete failure scenario

Trace the two threads:

1. Capture: `readinto(left, right)` fills frame N. Puts `(N, ts, mv(left), mv(right))`. Queue now has 1 item.
2. Sender: `pending.get()` removes it. Queue is empty. Sender begins `send_all(left_view)` — this **blocks** (slow link, backpressure, scheduling).
3. Capture: loop iterates. `readinto(left, right)` **overwrites the same bytearrays** that `left_view`/`right_view` still alias. Puts frame N+1 into the now-empty queue.
4. Sender: finishes sending `left_view` — but those bytes are now frame N+1's left eye, not frame N's. Then sends `right_view`, also frame N+1.

Result: the receiver gets a **torn frame** — header says sequence N, payload is frame N+1 (or a mix if the overwrite lands mid-`send_all`). This is *demonstrated by construction*: it follows directly from (a) `readinto` writing into the same buffers, (b) `memoryview` aliasing those buffers, (c) `send_all` blocking, and (d) the capture loop not waiting for the sender to finish. It is not speculative — it is the normal steady-state behavior whenever capture outpaces the transport, which is the entire point of the patch.

Why the existing validation misses it:
- **"Every received packet has one sequence number and one timestamp for both eyes"** — true, but the *payload* can be from a different frame than the header. The test checks metadata consistency, not payload/header correspondence.
- **"Transport test double immediately copies the bytes"** — this is the killer. A copy-on-send double never holds the view across a capture iteration, so it can never observe the race. It validates the happy path only.
- **Five-minute manual test** — tearing on a fast local link with a fast receiver is intermittent and often invisible (a torn frame just looks like a slightly wrong image for one frame). Responsiveness is unaffected.
- **Allocation/latency improvements** — real, but orthogonal to correctness.

Secondary, smaller issues worth noting (not the reason to block, but fix alongside):
- `pending.task_done()` is called but nothing ever calls `pending.join()`, so it's dead bookkeeping. Harmless but misleading.
- `sequence` increments even when the frame is dropped (`Full`), so the receiver sees gaps — presumably fine, but confirm the receiver tolerates it.
- No handling of `running` flipping between `get()` and `send_all`; shutdown can block in `send_all`. Pre-existing, not introduced here.

## 3. Smallest sound correction

The minimal fix that preserves the zero-copy goal: **double-buffer and hand ownership to the sender**, so the capture loop never writes into a buffer the sender may still be reading.

Smallest version — two buffer pairs, swap on put, and only reuse a pair after the sender is done with it:

```python
pending = Queue(maxsize=1)
free = Queue(maxsize=1)          # buffers the sender has released
free.put((bytearray(EYE_BYTES), bytearray(EYE_BYTES)))

def capture_loop():
    sequence = 0
    while running:
        left, right = free.get()          # blocks until a pair is free
        capture.readinto(left, right)
        packet = (sequence, monotonic_ns(), memoryview(left), memoryview(right))
        try:
            pending.put_nowait(packet)
        except Full:
            free.put((left, right))       # drop this frame, recycle buffers
        sequence += 1

def sender_loop():
    while running:
        sequence, timestamp, lv, rv = pending.get()
        transport.send_header(sequence, timestamp, EYE_BYTES)
        transport.send_all(lv)
        transport.send_all(rv)
        free.put((lv.obj, rv.obj))         # release buffers back to capture
```

This keeps zero per-frame allocation in steady state (two pairs, recycled), keeps the queue at one pending frame, and makes the aliasing safe: the capture loop cannot touch a buffer until the sender has finished both `send_all` calls on it. The `free` queue's `maxsize=1` plus the two pairs means at most one frame in flight and one being captured — same latency profile as intended.

(If you want to avoid `memoryview.obj` reliance, carry the bytearrays alongside the views in the tuple; equivalent.)

## 4. One focused test that would materially strengthen the decision

**A blocking, non-copying transport double that holds the memoryview across a capture iteration, plus a payload/header consistency check.**

Concretely:
- Test double's `send_all(view)` records `bytes(view)` **only after** a controllable barrier, and the test forces the capture loop to run `readinto` with a *distinguishable* pattern (e.g., frame N fills `0xNN`, frame N+1 fills `0xNN+1`) while `send_all` is parked mid-call.
- Assert that the bytes the receiver ultimately associates with sequence N are entirely frame N's pattern.

On the current code this test fails deterministically (torn payload). On the double-buffered fix it passes. This is the single test that converts "looked fine for five minutes" into a real correctness signal, and it directly targets the failure mode the current suite structurally cannot see.

---

**Bottom line:** the performance direction is right, but the buffer-aliasing race is a real correctness defect that the current validation is blind to by design. Ship the double-buffered variant, with the blocking-transport test added.