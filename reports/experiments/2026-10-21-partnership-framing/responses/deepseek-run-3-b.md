# Review: memoryview + single-slot queue stereo streaming patch

## 1. Recommendation: **No-ship as written.**

The patch has a real, demonstrable correctness bug that the validation suite does not exercise. It is not a "maybe under load" concern — it is a deterministic data-corruption path that will fire on any machine where the sender is ever slower than capture, which is the normal steady state for a streaming service (capture is cheap; transport is the slow, blocking part).

The bug is **buffer reuse across the queue boundary**. `left` and `right` are single, long-lived bytearrays. `capture_loop` hands `memoryview(left)` / `memoryview(right)` to the queue, then immediately loops and calls `capture.readinto(left, right)` again. `readinto` writes into the *same* underlying buffers. The memoryview the sender is still consuming now aliases bytes from the *next* frame.

The single-slot queue makes this worse, not better: it was presumably chosen to bound memory, but it does not bound *lifetime*. A `maxsize=1` queue guarantees at most one packet is *pending*, but it says nothing about whether the sender has finished with the previous packet's buffers when capture overwrites them.

## 2. Concrete failure scenario

**Demonstrated by inspection (not speculation):**

1. `capture_loop` fills `left`/`right` with frame N, enqueues `(N, ts, mv(left), mv(right))`.
2. `sender_loop` dequeues frame N, calls `send_header`, begins `send_all(left_view)`. Transport blocks (TCP backpressure, slow radio, Android receiver GC pause — all routine).
3. `capture_loop` returns from `put_nowait` (queue now empty), loops, calls `capture.readinto(left, right)`. **This overwrites the bytes `send_all` is mid-transmission on.**
4. Sender finishes `send_all(left_view)` — but it sent a torn mix of frame N and frame N+1 bytes. Then `send_all(right_view)` sends frame N+1's right eye.

Result: the receiver gets a left eye that is partly frame N and partly frame N+1, paired with a right eye that is entirely frame N+1, under a single sequence number and timestamp. Your validation "every received packet has one sequence number and one timestamp for both eyes" passes — the *metadata* is consistent. The *pixels* are not. Eye-order and frame-size checks also pass. This is exactly the class of bug that survives a five-minute manual test: it looks fine until the transport hiccups, and then it produces a subtle stereo mismatch that is hard to attribute.

**Why the test double missed it:** the double "immediately copies the bytes passed to `send_all`." That copy happens synchronously inside `send_all`, before `capture_loop` can overwrite. Real transports block. The test double's contract is weaker than the real transport's contract, and the code relies on the stronger one.

**Speculative but plausible aggravators:** on older hardware (the stated target), capture and send jitter more, widening the race window. GIL scheduling between the two threads is not a barrier — `readinto` releases the GIL during I/O, and `send_all` releases it while blocked, so interleaving is not just possible but likely.

## 3. Smallest sound correction

The performance goal is "avoid per-frame byte copies." You cannot have both zero-copy *and* buffer reuse across an asynchronous handoff. Pick one; the cheapest correct option that preserves most of the win:

**Double-buffer with a handoff, not a shared buffer.** Keep two pairs of bytearrays; capture writes into the pair the sender is *not* using, and swap ownership through the queue.

```python
pending = Queue(maxsize=1)
buffers = [(bytearray(EYE_BYTES), bytearray(EYE_BYTES)) for _ in range(2)]
free = Queue(maxsize=1); free.put(0)   # index of buffer capture may fill
```

`capture_loop`: `idx = free.get()`; `capture.readinto(*buffers[idx])`; enqueue `(seq, ts, idx)`; `sender_loop`: dequeue, send `memoryview(buffers[idx][0])`, `memoryview(buffers[idx][1])`, then `free.put(idx)`.

This still does zero per-frame copies, still bounds memory at two frames, and still keeps the sender's views valid for the entire `send_all` duration. The only cost is one extra frame of latency in the worst case (capture waits for a free buffer), which is the correct trade for correctness. If you want to keep the single-slot `pending` semantics, this is the minimal change: the `free` queue replaces the implicit "the buffer is mine again" assumption.

**Do not** "fix" this by copying in `capture_loop` before enqueue — that reintroduces the allocation you set out to remove. **Do not** rely on `send_all` completing before the next `readinto` — you cannot order two threads that way without a lock, and a lock around `readinto` + `send_all` serializes capture behind transport, which is worse than the copy.

If for some reason double-buffering is unacceptable, the fallback is a single `bytearray` per eye plus an explicit `threading.Event`/`Condition` that `capture_loop` waits on until `sender_loop` signals "done with previous buffers." That is correct but adds a synchronization stall to capture; the double-buffer is strictly better.

## 4. One focused test that would materially strengthen the decision

**A blocking transport double that delays inside `send_all` and asserts byte integrity.**

```python
class SlowTransport:
    def __init__(self, delay_s): self.delay = delay_s; self.received = []
    def send_header(self, *a): pass
    def send_all(self, mv):
        time.sleep(self.delay)          # let capture_loop race
        self.received.append(bytes(mv)) # copy AFTER the delay
```

Drive `capture_loop` with a deterministic pattern (e.g., frame N fills left with `N & 0xFF`, right with `~N & 0xFF`), run sender with `delay_s` long enough that capture produces several frames during one `send_all`, then assert every received left/right pair is internally consistent (`left == expected_left(seq)` and `right == expected_right(seq)` for the sequence number in that packet's header). On the current code this fails immediately; on the double-buffered version it passes. This test is small, deterministic, and directly encodes the contract the real transport provides — which the existing test double does not.

---

**Bottom line:** the allocation and latency wins are real and worth keeping, but the current implementation trades correctness for them in a way the validation cannot see. Ship the double-buffered variant; the extra frame of buffer memory is negligible against the cost of intermittent stereo corruption in the field.