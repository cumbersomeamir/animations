"""Hindi narration with Kokoro-82M (Apache-2.0) via kokoro-onnx 0.6.1, using Kokoro's own Hindi-trained voices
(NOT the English af_bella/am_puck voices): blend hm_omega 0.7 + hf_alpha 0.3 (keeps the accepted 0.7/0.3 blend
structure; male-led because Kokoro's Hindi male voice articulates aspirates/retroflexes most clearly in ASR tests), speed 1.1 (meme pace, fitted to 30 s with comic pauses), lang 'hi' (espeak-ng Hindi phonemizer). Text is all Devanagari (Latin words trigger language
switching in the phonemizer).
Model: onnx-community/Kokoro-82M-v1.0-ONNX @ 1939ad2a8e416c0acfeecc08a694d14ef25f2231 (onnx/model.onnx,
voices/hm_omega.bin, voices/hf_alpha.bin).
usage: python make_voice.py KOKORO_DIR  -> wav/<id>.24k.wav ; prints phonemes for review
"""
import json, sys, wave, os
import numpy as np
from kokoro_onnx import Kokoro
K = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
vb = lambda n: np.fromfile(os.path.join(K, 'voices', n + '.bin'), dtype=np.float32).reshape(510, 1, 256)
npz = os.path.join(here, 'build_hi_voices.npz')
np.savez(npz, hm_omega=vb('hm_omega'), hf_alpha=vb('hf_alpha'))
tts = Kokoro(os.path.join(K, 'onnx', 'model.onnx'), npz)
style = 0.7 * tts.get_voice_style('hm_omega') + 0.3 * tts.get_voice_style('hf_alpha')
SPEED = float(os.environ.get('SPEED', '1.1'))
for line in json.load(open(os.path.join(here, 'lines.json'))):
    print(line['id'], tts.tokenizer.phonemize(line['text'], 'hi'))
    audio, sr = tts.create(line['text'], voice=style, speed=SPEED, lang='hi')
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(here, 'wav', line['id'] + '.24k.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    print(line['id'], sr, round(len(audio) / sr, 3))
os.remove(npz)
