"""Narration for "Too Many Aliens!" (TableVerse, batch 2026-11-19 english-22).
Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx 0.6.1, fully local with cached model files.
Voice: blend af_bella 0.7 + am_puck 0.3, lang en-us, speed 0.98 (durable rule in context/08).
Usage: <kokoro-venv>/bin/python -I audio/tts.py --model <dir with kokoro-v1.0.onnx + voices-v1.0.bin>
Writes audio/narration/<id>.wav (24 kHz mono PCM16, silence-trimmed) + narration.json."""
import argparse, json, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "narration")
SPEED = 0.98
LINES = [  # final script (episode brief: context/20); "TableVerse" -> "Table Verse"
    ("v01", "Too many aliens! The little one can't squeeze in!"),
    ("v02", "Lift two? Full!"),
    ("v03", "Lift three? Full again!"),
    ("v04", "Why is there never room?"),
    ("v05", "Let's peek inside!"),
    ("v06", "Each lift has four aliens."),  # "…in each lift." ended on a borderline "lift"/"left"
    ("c04", "Four!"), ("c08", "Eight!"), ("c12", "Twelve!"),
    ("v07", "Twelve seats. But one more alien makes thirteen!"),
    ("v08", "Three times four is twelve, so one is left over."),
    ("v09", "The next lift is all yours, little one!"),
    ("v10", "Play and learn tables with Table Verse."),
]

def trim(x, sr, thr_db=-40.0, pad_ms=30):
    a = np.abs(x); win = max(1, int(sr * 0.01))
    env = np.convolve(a, np.ones(win) / win, mode="same")
    idx = np.where(env > 10 ** (thr_db / 20) * max(1e-9, a.max()))[0]
    if len(idx) == 0:
        return x
    pad = int(sr * pad_ms / 1000)
    y = x[max(0, idx[0] - pad):min(len(x), idx[-1] + pad)].copy()
    f = min(len(y) // 4, int(sr * 0.008))
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

ap = argparse.ArgumentParser(); ap.add_argument("--model", required=True); a = ap.parse_args()
k = Kokoro(os.path.join(a.model, "kokoro-v1.0.onnx"), os.path.join(a.model, "voices-v1.0.bin"))
voice = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
os.makedirs(OUT, exist_ok=True)
meta = {"engine": "kokoro-onnx 0.6.1 / Kokoro-82M v1.0 (Apache-2.0)", "voice": "af_bella*0.7 + am_puck*0.3",
        "lang": "en-us", "speed": SPEED, "clips": {}}
for cid, text in LINES:
    s, sr = k.create(text, voice=voice, speed=SPEED, lang="en-us")
    y = trim(np.asarray(s, dtype=np.float32), sr)
    sf.write(os.path.join(OUT, f"{cid}.wav"), y, sr, subtype="PCM_16")
    meta["clips"][cid] = {"text": text, "seconds": round(len(y) / sr, 3), "frames": round(len(y) / sr * 30, 1)}
    print(f"{cid} {len(y)/sr:5.2f}s {len(y)/sr*30:5.1f}f  {text}")
json.dump(meta, open(os.path.join(OUT, "narration.json"), "w"), indent=2)
