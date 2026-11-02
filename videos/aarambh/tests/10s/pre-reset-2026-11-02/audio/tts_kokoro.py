"""Kokoro-82M ONNX narration, Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
Usage: python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>   (official kokoro-onnx model-files-v1.0)"""
import sys, wave, numpy as np
from pathlib import Path
from kokoro_onnx import Kokoro
TEXT = "Marie Curie won Nobel Prizes in physics and chemistry. One person, two different sciences."
k = Kokoro(sys.argv[1], sys.argv[2])
style = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
x, sr = k.create(TEXT, voice=style, speed=0.98, lang="en-us")
out = Path(__file__).parent / "narration_kokoro.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
print(out, sr, round(len(x) / sr, 3))
