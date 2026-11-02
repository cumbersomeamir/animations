"""Narration with local Kokoro-82M ONNX (kokoro-onnx 0.6.1, model-files-v1.0).
Meshline blend: af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us. One take per phrase; no speed-up."""
import json, wave, sys
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro
R = Path(__file__).resolve().parents[1]
k = Kokoro(str(R / "models/kokoro-v1.0.onnx"), str(R / "models/voices-v1.0.bin"))
voice = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
PHRASES = ["Donating a coat?", "Ask the size first.", "Useful help starts with what the person actually needs."]
out = R / "audio/voice"; out.mkdir(parents=True, exist_ok=True)
meta = []
for i, p in enumerate(PHRASES):
    x, sr = k.create(p, voice=voice, speed=0.98, lang="en-us")
    x = np.asarray(x, np.float32)
    idx = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.04 * sr)]
    f = out / f"p{i}.wav"
    with wave.open(str(f), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    meta.append({"i": i, "text": p, "dur": round(len(x) / sr, 3), "sr": sr, "file": f"audio/voice/p{i}.wav"})
    print(i, round(len(x) / sr, 2), p)
(out / "phrases.json").write_text(json.dumps({"voice": "af_bella*0.7+am_puck*0.3", "speed": 0.98, "lang": "en-us", "phrases": meta}, indent=1))
