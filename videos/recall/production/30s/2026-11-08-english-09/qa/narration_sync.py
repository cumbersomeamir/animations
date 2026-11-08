"""Narration timing check: locate every narration line inside the decoded final MP4 audio by cross-correlation.

For each line in timeline.json the line's WAV (audio/narration/<id>.wav) is resampled to 48 kHz and correlated against
the final mix (mono) within +-0.5 s of its planned start. Reports the measured start, the error vs. plan, the
normalised correlation peak and the shot that is on screen when the line starts and ends.
Usage: audio/.venv/bin/python qa/narration_sync.py [path/to/video.mp4]
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MP4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "recall-30s-english09-01.mp4")
SR = 48000
tl = json.load(open(os.path.join(ROOT, "timeline.json")))
mix = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                                   capture_output=True, check=True).stdout, dtype=np.float32)


def shot_at(t):
    for s in tl["shots"]:
        if s["t0"] <= t < s["t1"]:
            return s["id"]
    return tl["shots"][-1]["id"]


rows = []
for line in tl["narration"]:
    x, sr = sf.read(os.path.join(ROOT, "audio", "narration", f"{line['id']}.wav"), dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        g = np.gcd(sr, SR)
        x = resample_poly(x, SR // g, sr // g).astype(np.float32)
    a = int(max(0, (line["start"] - 0.5) * SR)); b = int(min(len(mix), (line["start"] + 0.5) * SR + len(x)))
    seg = mix[a:b]
    c = fftconvolve(seg, x[::-1], mode="valid")
    # normalise by the local energy of the mix window
    e = np.sqrt(fftconvolve(seg ** 2, np.ones(len(x), dtype=np.float32), mode="valid").clip(1e-12)) * np.sqrt((x ** 2).sum())
    k = int(np.argmax(c / e))
    start = (a + k) / SR
    dur = len(x) / SR
    rows.append({"id": line["id"], "planned_start": line["start"], "measured_start": round(start, 3),
                 "error_ms": round((start - line["start"]) * 1000, 1), "corr": round(float((c / e)[k]), 3),
                 "end": round(start + dur, 3), "shot_at_start": shot_at(start), "shot_at_end": shot_at(start + dur - 0.05)})
json.dump(rows, open(os.path.join(HERE, "narration_sync.json"), "w"), indent=1)
for r in rows:
    print(r)
ok = all(abs(r["error_ms"]) <= 25 and r["corr"] >= 0.5 for r in rows) and rows[-1]["end"] <= 30.0
print("narration_sync_ok", ok)
sys.exit(0 if ok else 1)
