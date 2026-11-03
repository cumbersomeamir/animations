#!/usr/bin/env python3
"""Kokoro-82M ONNX narration (kokoro-onnx 0.6.1), Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
Usage: tts.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <lines.json>  -> audio/narration/<id>.wav (24 kHz, trimmed) + timing.json
lines.json: [{"id","text","start"}]. Deterministic for a given text/voice/speed."""
import json, os, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'narration'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(sys.argv[1], sys.argv[2]); lines = json.load(open(sys.argv[3]))
voice = 0.7 * k.get_voice_style('af_bella') + 0.3 * k.get_voice_style('am_puck')
timing = []
for L in lines:
    a, sr = k.create(L['text'], voice=voice, speed=0.98, lang='en-us'); a = np.asarray(a, np.float32)
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    a *= 0.89 / (np.abs(a).max() + 1e-9)
    with wave.open(os.path.join(OUT, L['id'] + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype(np.int16).tobytes())
    d = round(len(a) / sr, 3); timing.append({**L, 'duration': d, 'end': round(L['start'] + d, 3)})
for a_, b_ in zip(timing, timing[1:]): print(f"{a_['id']} {a_['start']:.2f}-{a_['end']:.2f} ({a_['duration']:.2f}s) gap->{b_['start'] - a_['end']:.2f}  {a_['text']}")
print(f"{timing[-1]['id']} {timing[-1]['start']:.2f}-{timing[-1]['end']:.2f} ({timing[-1]['duration']:.2f}s)  {timing[-1]['text']}")
json.dump({'engine': 'Kokoro-82M v1.0 ONNX via kokoro-onnx 0.6.1', 'voice': 'af_bella*0.7 + am_puck*0.3', 'speed': 0.98, 'lang': 'en-us',
           'speech_seconds': round(sum(t['duration'] for t in timing), 3), 'lines': timing}, open(os.path.join(OUT, 'timing.json'), 'w'), indent=2)
