"""Generate narration clips for the TableVerse 30s promo with Kokoro-82M (Apache-2.0), fully local.

Usage (see ../README.md):
  <venv>/bin/python -I audio/tts.py --model <dir-with-kokoro-v1.0.onnx-and-voices-v1.0.bin>
Writes audio/narration/<id>.wav (24 kHz mono, silence-trimmed) and audio/narration/narration.json.
"""
import argparse, json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "narration")

VOICE = "af_heart"
# id -> (text sent to TTS, speed). "Table Verse" is spaced so the brand name is pronounced as two words.
LINES = {
    "q1":        ("Seven times eight?", 1.0),
    "freeze":    ("Brain freeze!", 1.0),
    "story":     ("In Table Verse, times tables become stories.", 1.05),
    "sleepy":    ("Eight rows of seven sleepy stars.", 1.05),
    "n7":        ("Seven!", 1.1),
    "n14":       ("Fourteen!", 1.1),
    "n21":       ("Twenty-one!", 1.15),
    "n28":       ("Twenty-eight!", 1.15),
    "n35":       ("Thirty-five!", 1.15),
    "n42":       ("Forty-two!", 1.15),
    "n49":       ("Forty-nine!", 1.15),
    "n56":       ("Fifty-six!", 1.1),
    "challenge": ("A fun challenge!", 1.05),
    "q2":        ("Seven times eight?", 1.05),
    "a56":       ("Fifty-six!", 0.95),
    "keep":      ("Keep practising your tables.", 1.0),
    "cta":       ("Table Verse. Explore on Google Play.", 1.0),
}

def trim(x, sr, thr_db=-42.0, pad_ms=25):
    a = np.abs(x)
    win = max(1, int(sr * 0.01))
    env = np.convolve(a, np.ones(win) / win, mode="same")
    thr = 10 ** (thr_db / 20) * max(1e-9, a.max())
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    pad = int(sr * pad_ms / 1000)
    s, e = max(0, idx[0] - pad), min(len(x), idx[-1] + pad)
    y = x[s:e].copy()
    f = min(len(y) // 4, int(sr * 0.006))  # tiny fades to avoid clicks
    if f > 0:
        y[:f] *= np.linspace(0, 1, f)
        y[-f:] *= np.linspace(1, 0, f)
    return y

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voice", default=VOICE)
    args = ap.parse_args()
    k = Kokoro(os.path.join(args.model, "kokoro-v1.0.onnx"), os.path.join(args.model, "voices-v1.0.bin"))
    os.makedirs(OUT, exist_ok=True)
    meta = {"engine": "kokoro-onnx 0.6.1 / Kokoro-82M v1.0 (Apache-2.0)", "voice": args.voice, "clips": {}}
    for cid, (text, speed) in LINES.items():
        samples, sr = k.create(text, voice=args.voice, speed=speed, lang="en-us")
        y = trim(np.asarray(samples, dtype=np.float32), sr)
        sf.write(os.path.join(OUT, f"{cid}.wav"), y, sr, subtype="PCM_16")
        meta["clips"][cid] = {"text": text, "speed": speed, "sr": sr, "seconds": round(len(y) / sr, 3)}
        print(f"{cid:10s} {len(y)/sr:5.2f}s  {text}")
    with open(os.path.join(OUT, "narration.json"), "w") as fh:
        json.dump(meta, fh, indent=2)

if __name__ == "__main__":
    main()
