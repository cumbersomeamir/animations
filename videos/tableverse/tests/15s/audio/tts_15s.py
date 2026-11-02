"""Narration for the 15 s Manim test, generated locally with Kokoro-82M (Apache-2.0), voice af_heart.
Usage: <kokoro-venv>/bin/python -I audio/tts_15s.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>
Writes audio/narration/<id>.wav (24 kHz mono, silence-trimmed) + narration.json."""
import argparse, json, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "narration")
LINES = {  # "Table Verse" spaced so the brand is pronounced as two words
    "q": ("Six times seven?", 1.0),
    "groups": ("Six groups of seven.", 1.05),
    "split": ("Split seven into five and two.", 1.12),
    "sum": ("Thirty, plus twelve...", 1.05),
    "answer": ("Forty-two!", 1.0),
    "cta": ("Table Verse. Explore on Google Play.", 1.05),
}

def trim(x, sr, thr_db=-42.0, pad_ms=25):
    a = np.abs(x); win = max(1, int(sr * 0.01))
    env = np.convolve(a, np.ones(win) / win, mode="same")
    idx = np.where(env > 10 ** (thr_db / 20) * max(1e-9, a.max()))[0]
    if len(idx) == 0:
        return x
    pad = int(sr * pad_ms / 1000)
    y = x[max(0, idx[0] - pad):min(len(x), idx[-1] + pad)].copy()
    f = min(len(y) // 4, int(sr * 0.006))
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

ap = argparse.ArgumentParser(); ap.add_argument("--model", required=True); a = ap.parse_args()
k = Kokoro(os.path.join(a.model, "kokoro-v1.0.onnx"), os.path.join(a.model, "voices-v1.0.bin"))
os.makedirs(OUT, exist_ok=True)
meta = {"engine": "kokoro-onnx 0.6.1 / Kokoro-82M v1.0 (Apache-2.0)", "voice": "af_heart", "clips": {}}
for cid, (text, speed) in LINES.items():
    s, sr = k.create(text, voice="af_heart", speed=speed, lang="en-us")
    y = trim(np.asarray(s, dtype=np.float32), sr)
    sf.write(os.path.join(OUT, f"{cid}.wav"), y, sr, subtype="PCM_16")
    meta["clips"][cid] = {"text": text, "speed": speed, "seconds": round(len(y) / sr, 3), "frames": round(len(y) / sr * 30, 1)}
    print(f"{cid:7s} {len(y)/sr:5.2f}s = {len(y)/sr*30:5.1f}f  {text}")
json.dump(meta, open(os.path.join(OUT, "narration.json"), "w"), indent=2)
