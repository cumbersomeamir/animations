#!/usr/bin/env python3
"""Music bed + contact SFX (original numpy synthesis, reusing pilot-01/audio/synth.py instruments) + Kokoro narration
-> audio/mix.wav, 48 kHz stereo, exactly 10.000 s (480000 samples), loudnorm -16 LUFS / -1.5 dBTP."""
import importlib.util, json, os, re, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('syn', os.path.join(HERE, '../../../../education/pilot-01/audio/synth.py'))
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
SR, N = 48000, 480000
def buf(): return np.zeros((N + SR, 2))
music, sfx, voice = buf(), buf(), np.zeros((N, 2)); speech = np.zeros(N)
# narration
tim = json.load(open(os.path.join(HERE, 'narration', 'timing.json')))
for L in tim['lines']:
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', os.path.join(HERE, 'narration', L['id'] + '.wav'), '-ar', str(SR), '-ac', '1', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, np.int16).astype(np.float64) / 32768; i = int(L['start'] * SR)
    voice[i:i + len(a)] += a[:, None][: N - i]; speech[i:i + len(a)] = 1
# music: soft marimba + pizz bass, 96 BPM, D major (as pilot), resolves at 8.4 s
B = 60 / 96
for k, (t, nt) in enumerate([(0, 'D5'), (0.5, 'F#5'), (1, 'A5'), (2, 'B5'), (2.5, 'A5'), (3, 'E5'), (4, 'D5'), (4.5, 'F#5'), (5, 'A5'), (6, 'G5'), (6.5, 'B5'), (7, 'D6'),
                           (8, 'A5'), (8.5, 'F#5'), (9, 'E5'), (10, 'G5'), (10.5, 'B5'), (11, 'A5'), (12, 'F#5'), (13.5, 'D5')]):
    S.add(music, S.marimba(S.hz(nt)), t * B, 0.22, 0.3 if k % 2 else -0.3)
for k, (t, nt) in enumerate([(0, 'D2'), (2, 'B1'), (4, 'G1'), (6, 'A1'), (8, 'B1'), (10, 'G1'), (12, 'A1'), (13.5, 'D2')]):
    S.add(music, S.pluck(S.hz(nt) * 2, 0.6, 0.994, 0.35), t * B, 0.34, -0.1)
for k, t in enumerate(np.arange(4 * B, 9.6, B / 2)):
    S.add(music, S.shaker(), t, 0.08 if k % 2 else 0.12, 0.4)
for k, nt in enumerate(['D5', 'A5', 'F#6']):
    S.add(music, S.bell(S.hz(nt), 1.5, 0.5), 8.5 + k * 0.05, 0.12, (k - 1) * 0.4)
m = music[:N]; f = int(0.3 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
# SFX only at physical contact points (12 fps steps)
cues = [(1.0, S.tap(430), 0.5, 0.2, 'tap cup'), (1.25, S.tap(410), 0.5, 0.2, 'tap cup'),
        (3.0, S.slice_(0.25), 0.4, 0.1, 'paper tear'), (3.02, S.flutter(0.3), 0.25, 0.1, 'paper flutter'),
        (3.25, S.bandnoise(int(0.35 * SR), 4000, 11000) * np.hanning(int(0.35 * SR)), 0.18, -0.2, 'film crinkle'),
        (4.42, S.whoosh(0.18, 800, 3000), 0.25, -0.3, 'hop'), (4.5, S.thud(120, 0.2), 0.5, -0.3, 'land on crate'),
        (4.92, S.mx((S.tap(1800, 0.06), 0.8), (S.thud(260, 0.08), 0.5)), 0.5, -0.2, 'pin click (paper)'),
        (4.95, S.tink(3200, 0.2), 0.14, -0.1, 'copper wire'),
        (5.25, S.thud(130, 0.18), 0.4, -0.1, 'step on crate'),
        (5.5, S.mx((S.tap(1900, 0.06), 0.8), (S.thud(260, 0.08), 0.5)), 0.5, 0.0, 'pin click (film)'),
        (5.53, S.tink(3400, 0.2), 0.14, 0.1, 'copper wire'),
        (6.42, S.mx((S.thud(80, 0.3), 0.9), (S.tap(700, 0.1), 0.6)), 0.6, 0.1, 'stamp impact')]
for t, sig, gn, pan, _ in cues: S.add(sfx, sig, t, gn, pan)
sx = sfx[:N]
# ducking under speech
g, duck = 0.0, np.zeros(N); a_c, r_c = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.1 * SR))
tgt = np.roll(speech, -int(0.06 * SR)); tgt[-int(0.06 * SR):] = 0
for i in range(N): c = a_c if tgt[i] > g else r_c; g = c * g + (1 - c) * tgt[i]; duck[i] = g
mix = voice * 1.25 + m * 0.3 * (10 ** (-12 * duck / 20))[:, None] + sx * 0.45 * (10 ** (-8 * duck / 20))[:, None]
pre = os.path.join(HERE, 'mix-pre.wav'); out = os.path.join(HERE, 'mix.wav')
def write(p, a):
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
write(pre, mix * 0.7 / np.abs(mix).max())
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', pre, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
J = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0))
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', pre, '-af', f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={J['input_i']}:measured_TP={J['input_tp']}:measured_LRA={J['input_lra']}:measured_thresh={J['input_thresh']}:offset={J['target_offset']}:linear=true,aresample={SR}",
                      '-ac', '2', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float64).reshape(-1, 2) / 32768
a = a[:N] if len(a) >= N else np.vstack([a, np.zeros((N - len(a), 2))])
write(out, a); os.remove(pre)
json.dump({'sfx_cues': [(c[0], c[4]) for c in cues], 'samples': len(a)}, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print('mix', len(a), 'samples')
