#!/usr/bin/env python3
"""Narration with local Kokoro-82M ONNX (kokoro-onnx), Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
Usage: tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>   -> audio/narration/L*.wav (24 kHz, trimmed) + timing.json"""
import json, os, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'narration'); os.makedirs(OUT, exist_ok=True)
LINES = [('L1', 'This cup looks like paper.', 0.30), ('L2', 'Many have a plastic lining.', 3.05),
         ('L3', 'Check whether your local recycler accepts them.', 6.05)]
k = Kokoro(sys.argv[1], sys.argv[2])
voice = 0.7 * k.get_voice_style('af_bella') + 0.3 * k.get_voice_style('am_puck')
timing = []
for lid, text, start in LINES:
    a, sr = k.create(text, voice=voice, speed=0.98, lang='en-us')
    a = np.asarray(a, dtype=np.float32)
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    a *= 0.89 / (np.abs(a).max() + 1e-9)
    with wave.open(os.path.join(OUT, lid + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype(np.int16).tobytes())
    timing.append({'id': lid, 'text': text, 'start': start, 'duration': round(len(a) / sr, 3), 'end': round(start + len(a) / sr, 3), 'sr': sr})
    print(timing[-1])
json.dump({'engine': 'kokoro-onnx (Kokoro-82M v1.0 ONNX)', 'voice': 'af_bella*0.7 + am_puck*0.3', 'speed': 0.98, 'lang': 'en-us', 'lines': timing},
          open(os.path.join(OUT, 'timing.json'), 'w'), indent=2)
