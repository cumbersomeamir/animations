"""Local narration for the 15 s test: Kokoro-82M v1.0 ONNX (Apache-2.0), voice am_michael.
Reuses the model cache fetched by ../../project/fetch_models.sh. Writes audio/voice/*.wav + lines.json
and reports words/second per cue (skill pitfall: > 3.3 w/s sounds rushed)."""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cues import CUES, SPEED, VOICE  # noqa: E402

CACHE = os.path.join(HERE, "..", "..", "..", "project", ".cache", "kokoro")
OUT = os.path.join(HERE, "..", "audio", "voice")


def trim(a, sr, th=0.008, pad=0.03):
    idx = np.where(np.abs(a) > th)[0]
    return a if len(idx) == 0 else a[max(0, idx[0] - int(pad * sr)): idx[-1] + int(pad * sr)]


k = Kokoro(os.path.join(CACHE, "model.onnx"), os.path.join(CACHE, "voices.npz"))
os.makedirs(OUT, exist_ok=True)
meta = []
for c in CUES:
    a, sr = k.create(c["text"], voice=VOICE, speed=SPEED, lang="en-us")
    a = trim(np.asarray(a, np.float32), sr)
    p = os.path.join(OUT, c["id"] + ".wav")
    sf.write(p, a, sr, subtype="PCM_16")
    d = len(a) / sr
    wps = len(c["text"].split()) / d
    meta.append({**c, "file": os.path.relpath(p, os.path.join(HERE, "..")), "duration": round(d, 3), "sr": sr,
                 "wps": round(wps, 2)})
    print(f"{c['id']} {c['start']:.2f}-{c['start'] + d:.2f} ({d:.2f}s, {wps:.2f} w/s) {c['text']}")
json.dump({"voice": VOICE, "model": "Kokoro-82M v1.0 ONNX", "lines": meta}, open(os.path.join(OUT, "lines.json"), "w"), indent=1)
