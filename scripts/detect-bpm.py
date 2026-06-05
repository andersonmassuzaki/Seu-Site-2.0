#!/usr/bin/env python3
"""Detect BPM and downbeat offset from an audio file.

Uses scipy + numpy: extracts an onset envelope (energy diff after lowpass),
runs autocorrelation to find the dominant period, and locates the first
strong onset as the downbeat offset.

Usage: detect-bpm.py path/to/track.mp3
Outputs a single JSON line: {"bpm": 120.0, "offset_ms": 80}
"""
import json
import subprocess
import sys
import tempfile
import os
import numpy as np
from scipy.signal import find_peaks

if len(sys.argv) < 2:
    sys.stderr.write("usage: detect-bpm.py audio_file\n")
    sys.exit(1)

src = sys.argv[1]
sr = 11025  # downsample - plenty for tempo

with tempfile.NamedTemporaryFile(suffix=".raw", delete=False) as tmp:
    raw_path = tmp.name

try:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", src,
         "-ac", "1", "-ar", str(sr), "-f", "s16le", raw_path],
        check=True
    )
    y = np.fromfile(raw_path, dtype=np.int16).astype(np.float32) / 32768.0
finally:
    os.unlink(raw_path)

# energy envelope: short-window RMS
win = int(sr * 0.02)  # 20ms
hop = int(sr * 0.01)  # 10ms (100 Hz envelope)
frames = (len(y) - win) // hop
env = np.zeros(frames, dtype=np.float32)
for i in range(frames):
    s = y[i * hop : i * hop + win]
    env[i] = np.sqrt(np.mean(s * s))

# onset signal = positive energy diff
onset = np.diff(env)
onset = np.maximum(onset, 0)
onset -= onset.mean()
onset = np.maximum(onset, 0)

# autocorrelation
N = len(onset)
ac = np.correlate(onset, onset, mode="full")[N - 1:]
ac[0] = 0  # ignore zero lag

# tempo range 60-180 bpm -> period 0.33s to 1.0s -> lag 33 to 100 samples (at 100 Hz)
min_lag = int(60.0 / 180.0 * 100)
max_lag = int(60.0 / 60.0 * 100)
search = ac[min_lag:max_lag + 1]
best = int(np.argmax(search)) + min_lag
bpm = 60.0 / (best / 100.0)

# nudge into common range (multiply/halve if extreme)
while bpm < 70:
    bpm *= 2
while bpm > 180:
    bpm /= 2

# find first strong onset = downbeat offset
threshold = onset.mean() + onset.std() * 1.5
peaks, _ = find_peaks(onset, height=threshold, distance=int(60.0 / bpm * 100 * 0.4))
offset_ms = int(peaks[0] * 10) if len(peaks) else 0

print(json.dumps({"bpm": round(bpm, 1), "offset_ms": offset_ms}))
