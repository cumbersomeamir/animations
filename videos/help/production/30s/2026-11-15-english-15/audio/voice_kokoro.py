"""Narration: local Kokoro-82M ONNX (kokoro-onnx 0.6.1, release model-files-v1.0, cached in
videos/help/tests/10s/pre-reset-2026-11-02/models). Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
One take per sentence (natural prosody); no speed-up. Writes audio/voice/sNN.wav + sentences.json."""
import json, wave
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro
R = Path(__file__).resolve().parents[1]
M = R.parents[2] / "tests/10s/pre-reset-2026-11-02/models"
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
voice = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
S = json.loads((R / "src/script.json").read_text())["sentences"]
import sys
ONLY = set(int(x) for x in sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None   # re-take selected sentences, keep others
out = R / "audio/voice"; meta = []
OLD = {m["i"]: m for m in json.loads((out / "sentences.json").read_text())["sentences"]} if ONLY is not None else {}
for i, s in enumerate(S):
    if ONLY is not None and i not in ONLY: meta.append(OLD[i]); continue
    x, sr = k.create(s["say"], voice=voice, speed=0.98, lang="en-us"); x = np.asarray(x, np.float32)
    idx = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.05 * sr)]
    f = out / f"s{i:02d}.wav"
    with wave.open(str(f), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    meta.append({"i": i, "say": s["say"], "dur": round(len(x) / sr, 3), "file": f"audio/voice/s{i:02d}.wav", "sr": sr}); print(i, round(len(x) / sr, 2), s["say"])
(out / "sentences.json").write_text(json.dumps({"engine": "kokoro-onnx 0.6.1 / kokoro-v1.0.onnx", "voice": "af_bella*0.7+am_puck*0.3", "speed": 0.98, "lang": "en-us", "sentences": meta}, indent=1))
print("total", round(sum(m["dur"] for m in meta), 2))
