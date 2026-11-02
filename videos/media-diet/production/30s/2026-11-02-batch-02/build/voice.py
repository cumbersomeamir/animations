"""Narration with Kokoro-82M v1.0 (ONNX) — voice blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us.
Usage: python build/voice.py <timeline.json> <out_dir>
Writes <out_dir>/<id>.wav (48 kHz mono 16-bit, trimmed, 8 ms fades) and <out_dir>/lines.json (durations).
Model files (not committed): .cache/models/kokoro-v1.0.onnx, .cache/models/voices-v1.0.bin (sha256 in context/11)."""
import json, os, sys, wave, subprocess, tempfile
import numpy as np
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(sys.argv[1])); OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
V = TL['voice']
k = Kokoro(os.path.join(ROOT, '.cache/models/kokoro-v1.0.onnx'), os.path.join(ROOT, '.cache/models/voices-v1.0.bin'))
style = sum(w * k.get_voice_style(name) for name, w in V['blend'])
SR = 48000
meta = []
for line in TL['narration']:
    samples, sr = k.create(line['say'], voice=style, speed=V['speed'], lang=V['lang'])
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    with wave.open(tmp, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())
    res = subprocess.run(['ffmpeg', '-v', 'error', '-i', tmp, '-af', 'aresample=48000:resampler=soxr,highpass=f=70', '-f', 's16le', '-ac', '1', '-'], capture_output=True, check=True).stdout
    os.remove(tmp)
    a = np.frombuffer(res, dtype=np.int16).astype(np.float32) / 32768
    win = SR // 100; rms = np.sqrt(np.convolve(a ** 2, np.ones(win) / win, mode='same'))
    idx = np.where(rms > 10 ** (-48 / 20))[0]
    a = a[max(0, idx[0] - int(0.02 * SR)): min(len(a), idx[-1] + int(0.04 * SR))].copy()
    f = int(0.008 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    with wave.open(os.path.join(OUT, f"{line['id']}.wav"), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    meta.append({'id': line['id'], 'say': line['say'], 'duration': round(len(a) / SR, 3), 'words': len(line['say'].split())})
    print(f"{line['id']}: {len(a)/SR:5.2f}s  {line['say']}")
json.dump(meta, open(os.path.join(OUT, 'lines.json'), 'w'), indent=1)
print('total speech', round(sum(m['duration'] for m in meta), 2), 's, words', sum(m['words'] for m in meta))
