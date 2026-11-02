"""Kokoro-82M ONNX narration (kokoro-onnx; model-files-v1.0 from github.com/thewh1teagle/kokoro-onnx releases).
Voice: Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us. Usage: python voice_kokoro.py model voices out.wav"""
import sys, wave
import numpy as np
from kokoro_onnx import Kokoro
model, voices, out = sys.argv[1:4]
k = Kokoro(model, voices)
style = 0.7 * k.get_voice_style('af_bella') + 0.3 * k.get_voice_style('am_puck')
text = "One hundred grams of mango flesh: sixty calories and about thirty-six milligrams of vitamin C."
samples, sr = k.create(text, voice=style, speed=0.98, lang='en-us')
x = np.clip(np.asarray(samples, dtype=np.float32), -1, 1)
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype(np.int16).tobytes())
print('sr', sr, 'dur', len(x) / sr)
