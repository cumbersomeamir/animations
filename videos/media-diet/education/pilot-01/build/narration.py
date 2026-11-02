"""Synthesize Nodd's narration lines locally with Piper (voice: en_US-mike-medium, CC0 dataset).

Usage: python build/narration.py <timeline.json> <out_dir>
Writes one trimmed 48 kHz mono 16-bit WAV per line (<out_dir>/<id>.wav) plus lines.json with measured durations.
Piper samples prosody noise, so re-running gives slightly different takes; the committed takes in
audio/narration/ are the build inputs. Regenerate only on purpose (build.sh REGEN_VOICE=1).
"""
import json, subprocess, sys, wave, os
import numpy as np

TL = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
VENV_PY = os.path.join(ROOT, '.cache', 'venv', 'bin', 'python')
VOICE = os.path.join(ROOT, '.cache', 'voices', TL['voice']['model'] + '.onnx')
SR = 48000

def read_wav(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a

meta = []
for i, line in enumerate(TL['narration']):
    raw = os.path.join(OUT, f'line{i+1}_raw.wav')
    proc = os.path.join(OUT, f'line{i+1}_proc.wav')
    subprocess.run([VENV_PY, '-m', 'piper', '-m', VOICE, '--length-scale', str(TL['voice']['length_scale']),
                    '--noise-scale', '0.55', '--noise-w-scale', '0.7', '-f', raw],
                   input=line['text'].encode(), check=True, capture_output=True)
    # Character processing: +1 semitone-ish pitch lift with preserved formants, gentle presence EQ, 48 kHz.
    af = f"rubberband=pitch={TL['voice']['pitch']}:formant=preserved,highpass=f=90,equalizer=f=3200:t=q:w=1.2:g=2.5,aresample={SR}"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ac', '1', '-c:a', 'pcm_s16le', proc], check=True)
    a = read_wav(proc)
    # Trim leading/trailing silence (threshold -45 dBFS on 10 ms windows), keep 30 ms pads.
    win = SR // 100
    rms = np.sqrt(np.convolve(a ** 2, np.ones(win) / win, mode='same'))
    idx = np.where(rms > 10 ** (-45 / 20))[0]
    s, e = max(0, idx[0] - int(0.03 * SR)), min(len(a), idx[-1] + int(0.03 * SR))
    a = a[s:e]
    fade = int(0.008 * SR)
    a[:fade] *= np.linspace(0, 1, fade); a[-fade:] *= np.linspace(1, 0, fade)
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, f"{line['id']}.wav"), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    os.remove(raw); os.remove(proc)
    meta.append({'id': line['id'], 'text': line['text'], 'duration': round(len(a) / SR, 3)})
    print(f"{line['id']}: {len(a)/SR:.3f}s  {line['text']}")
json.dump(meta, open(os.path.join(OUT, 'lines.json'), 'w'), indent=1)
