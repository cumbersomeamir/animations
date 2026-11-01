"""Synthesize Mello narration locally with Kokoro-82M (Apache-2.0) via kokoro-onnx.

Each line is synthesized separately, trimmed of silence, and placed at a target
start time. Writes generated/narration.wav (48 kHz mono float) and
generated/timeline.json, which drives caption timing in render.py.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
GEN = os.path.join(PROJECT, "generated")
SR = 48000
DURATION = 30.0
VOICE = "af_heart"
SPEED = 0.9

# id, text, target start (s), latest allowed end (s)
LINES = [
    ("hook", "Thoughts stuck on a loop?", 0.20, 2.25),
    ("tangle", "When your mind won't stop spinning, everything gets tangled.", 2.40, 7.90),
    ("pause", "Take a soft pause with Mello.", 8.55, 10.95),
    ("in1", "Breathe in...", 11.40, 13.55),
    ("out1", "and slowly, let it go.", 13.90, 16.15),
    ("in2", "Follow a calming exercise,", 16.35, 18.55),
    ("out2", "one breath at a time.", 18.80, 21.10),
    ("f1", "Guided relaxation.", 21.45, 22.90),
    ("f2", "Wellness challenges.", 22.98, 24.28),
    ("f3", "And progress tools.", 24.36, 25.60),
    ("brand", "Mello.", 26.05, 26.85),
    ("cta", "Explore on Google Play.", 26.95, 29.20),
]


def trim(x, sr, thresh_db=-42.0, pad=0.02):
    env = np.abs(x)
    win = int(sr * 0.01)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    thr = 10 ** (thresh_db / 20) * max(env.max(), 1e-9)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(idx[0] - int(pad * sr), 0)
    b = min(idx[-1] + int(pad * sr), len(x))
    return x[a:b]


def resample(x, sr_in, sr_out):
    n_out = int(round(len(x) * sr_out / sr_in))
    t_in = np.arange(len(x)) / sr_in
    t_out = np.arange(n_out) / sr_out
    return np.interp(t_out, t_in, x).astype(np.float32)


def main():
    from kokoro_onnx import Kokoro

    model_dir = os.environ.get("MELLO_TTS_DIR", os.path.join(PROJECT, ".cache", "tts"))
    k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    out = np.zeros(int(SR * DURATION), dtype=np.float32)
    timeline = {"voice": VOICE, "speed": SPEED, "lines": []}
    problems = []
    for lid, text, start, latest_end in LINES:
        samples, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        x = trim(np.asarray(samples, dtype=np.float32), sr)
        x = resample(x, sr, SR)
        # 8 ms fades to avoid clicks at trim points
        f = int(0.008 * SR)
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
        dur = len(x) / SR
        end = start + dur
        if end > latest_end:
            problems.append(f"{lid}: ends {end:.2f}s > slot {latest_end:.2f}s")
        a = int(start * SR)
        out[a:a + len(x)] += x[: len(out) - a]
        timeline["lines"].append({"id": lid, "text": text, "start": round(start, 3), "end": round(end, 3)})
        print(f"{lid:7s} {start:6.2f} -> {end:6.2f}  ({dur:.2f}s)  {text}")
    peak = np.abs(out).max()
    out = out / peak * 0.89  # -1 dBFS peak for the stem
    os.makedirs(GEN, exist_ok=True)
    sf.write(os.path.join(GEN, "narration.wav"), out, SR, subtype="PCM_16")
    with open(os.path.join(GEN, "timeline.json"), "w") as fh:
        json.dump(timeline, fh, indent=2)
    if problems:
        print("SLOT OVERRUNS:\n  " + "\n  ".join(problems))
        sys.exit(1)


if __name__ == "__main__":
    main()
