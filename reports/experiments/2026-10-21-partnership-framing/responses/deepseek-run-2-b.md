# Review: memoryview + single-slot queue stereo streaming patch

## 1. Recommendation: **No-ship as written.**

The patch has a real, demonstrable data-integrity bug that the current validation cannot catch. It is not a performance concern — it is a correctness concern that will produce torn stereo pairs under normal operation, and the failure is silent.

The core issue: `capture.readinto(left, right)` writes into the *same* two `bytearray` objects every iteration, but the packet handed to the sender holds `memoryview(left)` / `memoryview(right)` — views over those same buffers, not copies. The single-slot queue does not prevent the capture loop from overwriting the buffers while the sender is still transmitting them. `send_all()` may block, and the capture loop runs concurrently and unconditionally calls `readinto` on the next iteration. There is no synchronization between "sender finished with these bytes" and "capture may overwrite them."

The queue depth of one bounds *how many packets are pending*, not *how long a buffer is borrowed*. Those are different invariants, and the patch conflates them.

## 2. Concrete failure scenario

**Demonstrated possibility (by construction, not speculation):**

1. Sender calls `pending.get()`, receives packet N with views over `left`/`right`.
2. Sender calls `transport.send_header(...)`, then `send_all(left_view)`. Suppose the socket send buffer is full (slow receiver, congested Wi-Fi, Android device briefly stalled). `send_all` blocks.
3. Capture loop completes `readinto(left, right)` for frame N+1, overwriting both buffers in place.
4. Sender resumes; the remainder of `left_view` and all of `right_view` now contain frame N+1's pixels, while the header already sent says sequence N.
5. Receiver gets a packet labeled N whose left eye is partly frame N and partly frame N+1, and whose right eye is entirely frame N+1.

This is a **torn frame**, and it is *worse* than a dropped frame: the receiver has no way to detect it. The sequence number and timestamp are consistent (they were captured before the overwrite), so the existing validation ("one sequence number and one timestamp for both eyes") passes. Frame sizes pass. Eye order passes. The five-minute manual test looked responsive because tearing is intermittent and visually subtle on a desktop stream — it shows up as brief judder or a one-frame eye mismatch, not a crash.

**Why the test double missed it:** the double "immediately copies the bytes passed to `send_all()`." That eliminates the blocking window entirely, so the race never manifests. The test is structurally incapable of exercising the bug.

**Speculation (flagged as such):** the frequency depends on transport backpressure. On a fast LAN with a fast receiver, `send_all` may rarely block long enough for a full `readinto` to complete, so tearing may be rare in the manual test. On congested Wi-Fi or an older Android device — exactly the target hardware for this optimization — it will be common. I would not rely on "we didn't see it in five minutes" as evidence.

A secondary, smaller issue: `pending.task_done()` is called but nothing ever calls `pending.join()`, so it's dead code. Not a bug, but it signals the queue's lifecycle wasn't fully thought through.

## 3. Smallest sound correction

The invariant you need is: **a buffer may not be overwritten until the sender has finished with it.** The minimal fix that preserves the zero-copy goal is a two-buffer (double-buffer) scheme with an explicit handoff, rather than a single shared pair.

Smallest sound version:

```python
from queue import Queue, Full
from time import monotonic_ns

pending = Queue(maxsize=1)
free = Queue(maxsize=1)          # buffers the sender has released

# Two independent buffer pairs; capture alternates between them.
buffers = [
    (bytearray(EYE_BYTES), bytearray(EYE_BYTES)),
    (bytearray(EYE_BYTES), bytearray(EYE_BYTES)),
]
free.put(buffers[0])
free.put(buffers[1])

def capture_loop():
    sequence = 0
    while running:
        try:
            left, right = free.get_nowait()
        except Empty:
            # Sender is behind; drop this frame rather than tear.
            # (Optionally: still readinto a scratch pair to keep cadence.)
            sequence += 1
            continue
        capture.readinto(left, right)
        packet = (sequence, monotonic_ns(), memoryview(left), memoryview(right))
        try:
            pending.put_nowait(packet)
        except Full:
            free.put((left, right))   # give the buffer back
        sequence += 1

def sender_loop():
    while running:
        sequence, timestamp, left_view, right_view = pending.get()
        transport.send_header(sequence, timestamp, EYE_BYTES)
        transport.send_all(left_view)
        transport.send_all(right_view)
        free.put((left_view.obj, right_view.obj))   # release buffer
```

Key properties:
- Capture only writes into a buffer it *owns* (taken from `free`).
- Sender only releases a buffer after `send_all` has fully consumed it.
- With two buffers, capture can proceed on buffer B while the sender drains buffer A. Under sustained backpressure, capture drops frames (correct behavior — you cannot send faster than the transport) instead of tearing.
- Still zero-copy on the hot path; allocation cost is two fixed pairs at startup.

If you want to keep it even smaller and accept a throughput hit under backpressure, a single buffer pair plus a `threading.Event`/`Condition` "buffer free" handshake also works, but it serializes capture and send and will hurt latency on the exact hardware you're targeting. The two-buffer version is the right size.

Note: `memoryview.obj` gives you back the underlying `bytearray`; if you'd rather not rely on that, carry the buffer tuple in the packet alongside the views.

## 4. One focused test that would materially strengthen the decision

**A backpressure test with a deliberately slow, non-copying transport double.**

```python
class SlowTransport:
    def __init__(self, delay_s):
        self.delay_s = delay_s
        self.received = []   # list of (seq, bytes_left, bytes_right)

    def send_header(self, seq, ts, n):
        self._cur_seq = seq

    def send_all(self, view):
        # Consume slowly, in chunks, WITHOUT copying up front.
        # This is the crucial difference from the current double.
        for i in range(0, len(view), 4096):
            time.sleep(self.delay_s)
            self._chunk = bytes(view[i:i+4096])   # copy at consume time
            self._append_chunk(self._chunk)
```

Then:
- Run capture at full speed for ~2 seconds with `delay_s` tuned so the sender is clearly slower than capture.
- Have the capture loop write a known, monotonically increasing pattern into each buffer (e.g., fill `left` with `sequence & 0xFF`, `right` with `(sequence+1) & 0xFF`).
- Assert that every received packet's left-eye bytes are uniform and equal to `seq & 0xFF`, and right-eye bytes uniform and equal to `(seq+1) & 0xFF`.

On the current patch, this test will fail: you will observe packets whose left-eye bytes are a mix of two sequence values, or whose right eye doesn't match the header's sequence. On the two-buffer fix, it passes, and it also verifies the drop-under-backpressure behavior is clean (no torn packets, only missing sequences).

This test is worth more than the five-minute manual run because it converts an intermittent, visually-subtle race into a deterministic assertion, and it exercises the exact code path (`send_all` blocking mid-view) that the current double deliberately avoids.

---

**Bottom line:** the performance direction is right and worth keeping, but the buffer-lifetime invariant is broken. Ship the two-buffer handoff (or equivalent), add the slow-transport test, and this becomes a clean win.