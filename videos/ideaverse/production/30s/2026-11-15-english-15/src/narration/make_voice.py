"""Narration with Kokoro-82M (Apache-2.0) via kokoro-onnx 0.6.1.
Agreed voice: blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us.
Model: onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a8e416c0acfeecc08a694d14ef25f2231 (onnx/model.onnx, voices/af_bella.bin, voices/am_puck.bin).
usage: python make_voice.py KOKORO_DIR  -> wav/<id>.24k.wav (mono float->int16, 24 kHz)
"""
import json, sys, wave, os
import numpy as np
from kokoro_onnx import Kokoro
K = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
vb = lambda n: np.fromfile(os.path.join(K, 'voices', n + '.bin'), dtype=np.float32).reshape(510, 1, 256)
npz = os.path.join(K, 'voices.npz')
if not os.path.exists(npz): np.savez(npz, af_bella=vb('af_bella'), am_puck=vb('am_puck'))
tts = Kokoro(os.path.join(K, 'onnx', 'model.onnx'), npz)
style = 0.7 * tts.get_voice_style('af_bella') + 0.3 * tts.get_voice_style('am_puck')
for line in json.load(open(os.path.join(here, 'lines.json'))):
    audio, sr = tts.create(line['text'], voice=style, speed=0.98, lang='en-us')
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(here, 'wav', line['id'] + '.24k.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    print(line['id'], sr, round(len(audio) / sr, 3))
