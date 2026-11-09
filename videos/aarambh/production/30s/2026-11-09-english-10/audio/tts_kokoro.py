"""Kokoro-82M ONNX narration per sentence. Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
Usage: python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>"""
import sys, json, wave, numpy as np
from pathlib import Path
from kokoro_onnx import Kokoro
here = Path(__file__).parent
k = Kokoro(sys.argv[1], sys.argv[2])
style = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
for s in json.loads((here / "script.json").read_text())["sentences"]:
    x, sr = k.create(s["tts"], voice=style, speed=0.98, lang="en-us")
    with wave.open(str(here / f"narration/{s['id']}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(s["id"], round(len(x) / sr, 2))
