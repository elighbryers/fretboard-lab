"""Estimate a sample's pitch (MIDI number) by autocorrelation, to check that a set's
mapping matches the real pitch (bass libraries are often mapped an octave up)."""
import aifc
import audioop
import math
import os
import subprocess
import sys
import tempfile


def read_mono(path, sr, seconds=None, offset=0):
    """Decode any WAV/FLAC with macOS afconvert to 16-bit little-endian mono PCM bytes.
    (AIFF output: afconvert writes a WAV header Python's wave module can't read for some inputs.)"""
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'x.aif')
        base = ['afconvert', '-f', 'AIFF', '-d', f'BEI16@{sr}', '-c', '1']
        if subprocess.run(base + ['--mix', path, out], capture_output=True).returncode:  # --mix needs 2+ channels
            subprocess.run(base + [path, out], check=True, capture_output=True)
        with aifc.open(out) as a:
            a.setpos(min(offset, a.getnframes()))
            frames = a.readframes(a.getnframes() if seconds is None else int(seconds * sr))
    return audioop.byteswap(frames, 2)


def midi_of_file(path, at=0.15, length=0.25, sr=22050):
    frames = read_mono(path, sr, at + length + 1.5)
    import array
    x = array.array('h', frames)
    # start after the onset
    peak = max(abs(v) for v in x[: sr]) or 1
    s0 = next(i for i, v in enumerate(x) if abs(v) > peak * 0.2) + int(at * sr)
    seg = [v / 32768 for v in x[s0:s0 + int(length * sr)]]
    # autocorrelation; skip the first lobe (smooth, low sounds peak at the smallest lags),
    # then take the highest peak: that lag is one period
    lags = range(int(sr / 1000), int(sr / 25))  # 25 Hz .. 1000 Hz
    r = [sum(seg[i] * seg[i + lag] for i in range(0, len(seg) - lag, 2)) for lag in lags]
    first_dip = next((k for k, c in enumerate(r) if c < 0), 0)
    k = max(range(first_dip, len(r)), key=lambda j: r[j])
    lag_best = lags[k]
    f = sr / lag_best
    return 69 + 12 * math.log2(f / 440)


if __name__ == '__main__':
    for p in sys.argv[1:]:
        print(f'{midi_of_file(p):6.1f}  {p}')
