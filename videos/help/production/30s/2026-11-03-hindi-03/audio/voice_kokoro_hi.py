"""Hindi narration: local Kokoro-82M ONNX (kokoro-onnx 0.6.1, model-files-v1.0, cached in tests/10s/pre-reset-2026-11-02/models).
Native Hindi voices (no English voice is fed Hindi): hf_alpha 0.7 + hm_omega 0.3 (female-led blend mirroring the accepted
Meshline proportions), speed 0.98, lang 'hi' (espeak-ng Hindi G2P bundled with espeakng-loader). One take per sentence."""
import json, wave, sys
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro
R = Path(__file__).resolve().parents[1]
M = R.parents[2] / "tests/10s/pre-reset-2026-11-02/models"
k = Kokoro(str(M / "kokoro-v1.0.onnx"), str(M / "voices-v1.0.bin"))
voice = 0.7 * k.get_voice_style("hf_alpha") + 0.3 * k.get_voice_style("hm_omega")
S = json.loads((R / "src/script.json").read_text())["sentences"]
out = R / "audio/voice"; meta = []
for i, s in enumerate(S):
    x, sr = k.create(s["say"], voice=voice, speed=0.98, lang="hi"); x = np.asarray(x, np.float32)
    idx = np.where(np.abs(x) > 0.01)[0]; x = x[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.05 * sr)]
    f = out / f"s{i:02d}.wav"
    with wave.open(str(f), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    meta.append({"i": i, "say": s["say"], "dur": round(len(x) / sr, 3), "file": f"audio/voice/s{i:02d}.wav", "sr": sr}); print(i, round(len(x) / sr, 2), s["say"])
(out / "sentences.json").write_text(json.dumps({"engine": "kokoro-onnx 0.6.1 / kokoro-v1.0.onnx", "voice": "hf_alpha*0.7+hm_omega*0.3", "speed": 0.98, "lang": "hi", "sentences": meta}, ensure_ascii=False, indent=1))
print("total", round(sum(m["dur"] for m in meta), 2))
