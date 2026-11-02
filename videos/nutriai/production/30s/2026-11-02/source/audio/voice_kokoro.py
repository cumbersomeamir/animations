"""Kokoro-82M ONNX narration, Meshline configuration: af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us.
Model files: kokoro-onnx release model-files-v1.0 (kokoro-v1.0.onnx, voices-v1.0.bin).
Usage: python voice_kokoro.py <model.onnx> <voices.bin> <lines.json> <out_dir>   (one WAV per line id; existing takes are kept)"""
import sys, os, json, wave
import numpy as np
from kokoro_onnx import Kokoro
model, voices, lines_path, out_dir = sys.argv[1:5]
k = Kokoro(model, voices)
style = 0.7 * k.get_voice_style('af_bella') + 0.3 * k.get_voice_style('am_puck')
for ln in json.load(open(lines_path)):
    p = os.path.join(out_dir, ln['id'] + '.wav')
    if os.path.exists(p): continue
    s, sr = k.create(ln['text'], voice=style, speed=0.98, lang='en-us')
    x = np.clip(np.asarray(s, dtype=np.float32), -1, 1)
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(ln['id'], round(len(x) / sr, 2), ln['text'])
