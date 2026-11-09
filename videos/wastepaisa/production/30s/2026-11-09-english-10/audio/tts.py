#!/usr/bin/env python3
"""English narration with Kokoro-82M v1.0 ONNX (kokoro-onnx 0.6.1), the approved Meshline voice character:
blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us (the accepted English episodes 30s-01 ... round02-01).
No Hindi audio is reused; every line is synthesised fresh in English.
Usage: tts.py <kokoro-v1.0.onnx> <voices-v1.0.bin> <lines.json>  -> audio/narration/<id>.wav (24 kHz, trimmed) + timing.json
lines.json: [{"id","text","tts"?,"start"}]; "text" is the Devanagari caption text, "tts" (optional) the spelling sent to the synthesiser
(numbers and the rupee sign are written out as words for speech; captions keep digits and ₹). Deterministic for a given text/voice/speed."""
import json, os, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'narration'); os.makedirs(OUT, exist_ok=True)
k = Kokoro(sys.argv[1], sys.argv[2]); lines = json.load(open(sys.argv[3]))
VOICE, SPEED, LANG = {'af_bella': 0.7, 'am_puck': 0.3}, 0.98, 'en-us'
voice = sum(w * k.get_voice_style(n) for n, w in VOICE.items())
timing = []
for L in lines:
    say = L.get('tts', L['text'])
    a, sr = k.create(say, voice=voice, speed=SPEED, lang=LANG); a = np.asarray(a, np.float32)
    idx = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    a *= 0.89 / (np.abs(a).max() + 1e-9)
    with wave.open(os.path.join(OUT, L['id'] + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype(np.int16).tobytes())
    d = round(len(a) / sr, 3); timing.append({**L, 'phonemes': k.tokenizer.phonemize(say, LANG), 'duration': d, 'end': round(L['start'] + d, 3)})
for a_, b_ in zip(timing, timing[1:]): print(f"{a_['id']} {a_['start']:.2f}-{a_['end']:.2f} ({a_['duration']:.2f}s) gap->{b_['start'] - a_['end']:.2f}  {a_['text']}")
print(f"{timing[-1]['id']} {timing[-1]['start']:.2f}-{timing[-1]['end']:.2f} ({timing[-1]['duration']:.2f}s)  {timing[-1]['text']}")
json.dump({'engine': 'Kokoro-82M v1.0 ONNX via kokoro-onnx 0.6.1', 'voice': 'af_bella*0.7 + am_puck*0.3 (Meshline)', 'speed': SPEED, 'lang': LANG,
           'speech_seconds': round(sum(t['duration'] for t in timing), 3), 'words': sum(len(t['text'].split()) for t in timing), 'lines': timing},
          open(os.path.join(OUT, 'timing.json'), 'w'), indent=2, ensure_ascii=False)
