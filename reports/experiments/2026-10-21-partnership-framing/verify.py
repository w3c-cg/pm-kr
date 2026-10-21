"""Exercise selected ownership claims; no model or network calls.

These are synthetic, controlled schedules, not application or display tests.
Run from any directory: python3 verify.py
"""
from pathlib import Path
from queue import Queue, Full
from threading import Event, Thread
from time import monotonic_ns
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent


def pair(frame):
    return bytes([frame]) * 16, bytes([frame + 64]) * 16


def capture(buffers, frame):
    for target, source in zip(buffers, pair(frame)):
        target[:] = source


def packet(buffers, frame, copy):
    return frame, tuple(bytes(b) if copy else memoryview(b) for b in buffers)


def delayed_right(copy):
    buffers = [bytearray(16), bytearray(16)]
    capture(buffers, 1)
    frame, views = packet(buffers, 1, copy)
    left_consumed, resume = Event(), Event()
    received = []

    def sender():
        received.append(bytes(views[0]))
        left_consumed.set()
        if resume.wait(5):
            received.append(bytes(views[1]))

    thread = Thread(target=sender, daemon=True)
    thread.start()
    assert left_consumed.wait(5), 'sender did not reach barrier'
    capture(buffers, 2)
    resume.set()
    thread.join(5)
    assert not thread.is_alive() and len(received) == 2
    intact = tuple(received) == pair(frame)
    assert intact == copy
    return dict(copy=copy, header=frame, received_first_bytes=[v[0] for v in received],
                matches_header=intact)


def dropped_capture(copy):
    buffers = [bytearray(16), bytearray(16)]
    pending = Queue(maxsize=1)
    capture(buffers, 1)
    pending.put_nowait(packet(buffers, 1, copy))
    capture(buffers, 2)
    try:
        pending.put_nowait(packet(buffers, 2, copy))
    except Full:
        pass
    else:
        raise AssertionError('expected full queue')
    frame, views = pending.get_nowait()
    received = tuple(bytes(v) for v in views)
    intact = received == pair(frame)
    assert intact == copy
    return dict(copy=copy, header=frame, received_first_bytes=[v[0] for v in received],
                matches_header=intact)


def code_block(name):
    text = (ROOT / 'responses' / name).read_text()
    return re.findall(r'```python\n(.*?)```', text, re.S)[0]


def check_deepseek_first_a():
    """Keep packet 0 borrowed while the proposed capture loop reaches frame 2."""
    env = dict(Queue=Queue, Full=Full, monotonic_ns=monotonic_ns,
               EYE_BYTES=16, running=True)
    exec(compile(code_block('deepseek-run-1-a.md'), '<generated-A1>', 'exec'), env)
    held = []

    class EndSchedule(Exception):
        pass

    class Capture:
        count = 0

        def readinto(self, left, right):
            # The sender dequeues frame 0 and holds its views through frame 2.
            if self.count == 1:
                held.append(env['pending'].get_nowait())
            capture([left, right], self.count + 1)
            self.count += 1
            if self.count == 3:
                raise EndSchedule()

    env['capture'] = Capture()
    try:
        env['capture_loop']()
    except EndSchedule:
        pass
    seq, _, left, right = held[0]
    received = bytes(left), bytes(right)
    assert seq == 0 and received == pair(3)
    return dict(expected_frame=1, actual_frame=3, corruption_reproduced=True,
                note='Releasing views after send cannot prevent this earlier overwrite.')


def check_deepseek_first_b():
    code = code_block('deepseek-run-2-b.md')
    # Only top-level initialization executes; the capture/sender functions are
    # defined but never called. The second free.put blocks in a queue of size 1.
    try:
        subprocess.run([sys.executable, '-c', 'EYE_BYTES=16\n' + code],
                       capture_output=True, timeout=2, check=True)
    except subprocess.TimeoutExpired:
        return dict(initialization_completed=False, timeout_seconds=2,
                    cause='Two blocking puts into a one-slot free queue before consumers start.')
    raise AssertionError('Expected generated initialization to block')


def main():
    results = {
        'scope': 'Controlled reproductions, not production code certification',
        'delayed_right': [delayed_right(c) for c in [False, True]],
        'dropped_capture': [dropped_capture(c) for c in [False, True]],
        'deepseek_first_a': check_deepseek_first_a(),
        'deepseek_first_b': check_deepseek_first_b(),
    }
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
