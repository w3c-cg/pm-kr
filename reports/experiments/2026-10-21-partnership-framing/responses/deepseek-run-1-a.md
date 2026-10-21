# Review: memoryview + single-slot queue stereo streaming patch

## 1. Recommendation: **No-ship** (as written)

The patch has a real, deterministic data-corruption bug that the current validation cannot detect. It is not a performance tradeoff; it is a correctness regression introduced by the memoryview change. The fix is small and preserves the performance goal.

## 2. Concrete failure scenario

**Demonstrated by inspection (not speculation):**

`capture_loop` reuses the same two `bytearray` objects (`left`, `right`) every iteration. It hands `memoryview(left)` / `memoryview(right)` to the queue. The queue holds at most one packet, but the *sender* may still be blocked inside `transport.send_all(left_view)` when `capture_loop` begins the next `capture.readinto(left, right)`.

Sequence of events:

1. Sender dequeues packet N, calls `send_all(left_view_N)`. `send_all` blocks (slow link, backpressure, TCP window full, etc.).
2. Capture thread finishes frame N+1 and calls `capture.readinto(left, right)`, which **overwrites the same buffers** that `left_view_N` / `right_view_N` alias.
3. Sender resumes and finishes sending `left_view_N` — but the bytes it transmits are now frame N+1's left eye (or a torn mix, depending on timing relative to `readinto`).
4. `send_all(right_view_N)` then sends frame N+1's right eye.

Result: the receiver gets a left eye from one frame and a right eye from another, under a single sequence number and timestamp. Stereo is silently corrupted. This is exactly the class of bug the "one sequence number and one timestamp for both eyes" check cannot catch, because the header is still consistent — only the payload is wrong.

**Why the existing validation missed it:**
- The transport test double "immediately copies the bytes passed to `send_all`" — so it never blocks, so the capture loop never races the sender. The test double is the one condition that hides the bug.
- The five-minute manual test on a responsive desktop likely never sustained backpressure long enough to trigger it, and even if it did, a human watching a stereo stream would not reliably notice a one-frame eye swap.
- The queue-never-exceeds-one check is true and irrelevant to this bug.

**Speculative (not relied on for the recommendation):** torn reads within a single `send_all` if `readinto` is mid-write when the sender reads — the spec says `readinto` writes synchronously and `send_all` consumes a memoryview, so partial-overwrite tearing is plausible but the cross-frame swap above is already sufficient and does not depend on tearing.

Note: the *original* per-frame copy code did not have this bug, because the copy decoupled the sender's bytes from the capture buffers. The patch traded that safety for allocation reduction.

## 3. Smallest sound correction

Double-buffer the capture side so the sender never aliases a buffer being written. Keep the memoryview and the single-slot queue; only add one extra pair of buffers and a swap.

```python
pending = Queue(maxsize=1)
bufs = [(bytearray(EYE_BYTES), bytearray(EYE_BYTES)) for _ in range(2)]
write_idx = 0

def capture_loop():
    global write_idx
    sequence = 0
    while running:
        left, right = bufs[write_idx]
        capture.readinto(left, right)
        packet = (sequence, monotonic_ns(), memoryview(left), memoryview(right))
        try:
            pending.put_nowait(packet)
            write_idx ^= 1          # only swap after a successful enqueue
        except Full:
            pass                    # keep writing into the same buffer; it's not in flight
        sequence += 1
```

Why this is sound with `maxsize=1`:
- A buffer is only handed to the queue on a successful `put_nowait`. After that, `write_idx` flips, so the next `readinto` targets the *other* pair.
- The queue holds at most one packet, so at most one buffer pair is "in flight" (owned by the sender). The other pair is always free for capture.
- On `Full`, nothing was enqueued, so the current buffer is not in flight and can be safely overwritten next iteration — no swap needed.
- The sender's `memoryview` therefore never aliases a buffer being written. No per-frame copy, no allocation in steady state (two pairs allocated once).

This preserves the stated performance goal (no per-frame copies, bounded allocations) and removes the race. If you prefer, an equivalent fix is to have the sender copy into a reusable send buffer — but that reintroduces a copy, so the double-buffer is the smaller, faster correction.

One caveat to verify in the real code: `memoryview(left)` must be released (or the buffer not reused) before that buffer is written again. With the two-pair scheme above, the buffer is only rewritten after it has been dequeued *and* the sender has finished with it — but the sender finishes with it only after `send_all(right_view)` returns, and the capture loop can flip back to that pair on the *next* successful enqueue. With `maxsize=1`, the next successful enqueue can only happen after the sender has dequeued the previous packet, but not necessarily after `send_all` has returned. **So the two-pair scheme alone is not sufficient** unless the sender signals completion. The minimal correct version needs the sender to release the buffer before it can be reused:

```python
# sender_loop
while running:
    sequence, timestamp, lv, rv = pending.get()
    transport.send_header(sequence, timestamp, EYE_BYTES)
    transport.send_all(lv)
    transport.send_all(rv)
    lv.release(); rv.release()
    pending.task_done()
```

and the capture loop must not reuse a pair until its views are released. With `maxsize=1` and a single in-flight packet, the simplest correct discipline is: capture writes into `bufs[write_idx]`, enqueues, flips `write_idx`; the sender releases views after `send_all` returns; because only one packet can be in flight and the capture loop cannot enqueue a second until the first is dequeued, the pair the sender holds is never the pair capture is writing — **provided the capture loop flips only on successful enqueue and the sender releases before `task_done`**. That is the smallest sound correction; the `release()` calls are the part that makes buffer reuse provably safe rather than incidentally safe.

## 4. One focused test that would materially strengthen the decision

**Blocking-transport stereo-integrity test.** Replace the immediate-copy test double with a transport whose `send_all` blocks on a `threading.Event` after consuming the first few bytes of the left view, while the capture loop is driven to produce several more frames, then release the event and let the sender finish. Assert that the bytes received for packet N's left and right eyes match a known per-frame pattern (e.g., frame index encoded in every byte of each eye) and that left/right belong to the same frame index.

This test fails on the current patch (sender transmits a later frame's bytes under packet N's header) and passes on the corrected double-buffer + `release()` version. It directly exercises the exact condition the current test double excludes — sender blocking while capture continues — which is the condition the patch's correctness depends on.