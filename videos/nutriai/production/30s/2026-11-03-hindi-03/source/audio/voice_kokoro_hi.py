"""Hindi narration with Kokoro-82M ONNX's own Hindi-trained voice hf_beta (lang 'hi', espeak-ng Hindi G2P), speed 1.0.
Not the English af_bella/am_puck blend (that blend is English-only). Model files: kokoro-onnx release model-files-v1.0.
Usage: python voice_kokoro_hi.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <script.json> <out_dir>   (existing takes are kept)
Numbers are written as Hindi words in "tts" so the voice reads them naturally; "text" is the caption-facing Devanagari line."""
import sys, os, json, wave
import numpy as np
from kokoro_onnx import Kokoro
model, voices, lines_path, out_dir = sys.argv[1:5]
k = Kokoro(model, voices); style = k.get_voice_style('hf_beta')
for ln in json.load(open(lines_path)):
    p = os.path.join(out_dir, ln['id'] + '.wav')
    if os.path.exists(p): continue
    s, sr = k.create(ln['tts'], voice=style, speed=1.0, lang='hi')
    x = np.clip(np.asarray(s, dtype=np.float32), -1, 1)
    with wave.open(p, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(ln['id'], round(len(x) / sr, 2), ln['tts'])
