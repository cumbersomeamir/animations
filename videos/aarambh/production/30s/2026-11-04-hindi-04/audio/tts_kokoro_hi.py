"""Hindi narration with Kokoro-82M ONNX v1.0 Hindi voices (no English voice is fed Hindi).
Voice hf_alpha (Kokoro Hindi female), speed from script.json (default 0.98), lang 'hi' (espeak-ng Hindi G2P). One sentence per file.
Usage: python audio/tts_kokoro_hi.py <kokoro-v1.0.onnx> <voices-v1.0.bin>"""
import sys, json, wave, numpy as np
from pathlib import Path
from kokoro_onnx import Kokoro
here = Path(__file__).parent
k = Kokoro(sys.argv[1], sys.argv[2])
style = k.get_voice_style("hf_alpha")  # chosen over the 0.7 hf_alpha + 0.3 hm_omega blend: lower Hindi ASR CER (0.280 vs 0.305)
only = sys.argv[3] if len(sys.argv) > 3 else None
S = json.loads((here / "script.json").read_text()); speed = S.get("speed", 0.98)
for s in S["sentences"]:
    if only and s["id"] != only: continue
    x, sr = k.create(s["tts"], voice=style, speed=speed, lang="hi")
    with wave.open(str(here / f"narration/{s['id']}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(s["id"], round(len(x) / sr, 2))
