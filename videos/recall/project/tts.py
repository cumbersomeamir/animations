"""Generate narration lines locally with Kokoro-82M (Apache-2.0) via kokoro-onnx.

Usage: .venv/bin/python tts.py
Model files are fetched by fetch_models.sh into .cache/kokoro (not committed).
Outputs: audio/narration/<id>.wav (24 kHz mono) + audio/narration/lines.json
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from timeline import NARRATION, VOICE, VOICE_SPEED  # noqa: E402

CACHE = os.path.join(HERE, ".cache", "kokoro")
OUT = os.path.join(HERE, "audio", "narration")


def trim(audio, sr, thresh=0.008, pad=0.03):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(audio), idx[-1] + int(pad * sr))
    return audio[a:b]


def main():
    os.makedirs(OUT, exist_ok=True)
    k = Kokoro(os.path.join(CACHE, "model.onnx"), os.path.join(CACHE, "voices.npz"))
    meta = []
    for line in NARRATION:
        audio, sr = k.create(line["text"], voice=VOICE, speed=line.get("speed", VOICE_SPEED), lang="en-us")
        audio = trim(np.asarray(audio, dtype=np.float32), sr)
        path = os.path.join(OUT, f"{line['id']}.wav")
        sf.write(path, audio, sr, subtype="PCM_16")
        dur = len(audio) / sr
        meta.append({**line, "file": os.path.relpath(path, HERE), "duration": round(dur, 3), "sr": sr})
        print(f"{line['id']}: {dur:.2f}s  start {line['start']:.2f} -> end {line['start'] + dur:.2f}  '{line['text']}'")
    with open(os.path.join(OUT, "lines.json"), "w") as f:
        json.dump({"voice": VOICE, "model": "Kokoro-82M v1.0 ONNX (onnx-community)", "lines": meta}, f, indent=2)


if __name__ == "__main__":
    main()
