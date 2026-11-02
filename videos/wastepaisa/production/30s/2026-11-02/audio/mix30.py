#!/usr/bin/env python3
"""Production 30s-01 audio: Kokoro narration (voice upfront) + quiet original music bed + contact-only SFX
(instruments reused from education/pilot-01/audio/synth.py, numpy synthesis, fixed seed) -> audio/mix.wav,
48 kHz stereo, exactly 30.000 s (1,440,000 samples), two-pass loudnorm -15 LUFS / -1.5 dBTP."""
import importlib.util, json, os, re, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('syn', os.path.join(HERE, '../../../../education/pilot-01/audio/synth.py'))
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
SR, N = 48000, 1440000
music, sfx, voice, speech = np.zeros((N + SR, 2)), np.zeros((N + SR, 2)), np.zeros((N, 2)), np.zeros(N)
tim = json.load(open(os.path.join(HERE, 'narration', 'timing.json')))
for L in tim['lines']:
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', os.path.join(HERE, 'narration', L['id'] + '.wav'), '-ar', str(SR), '-ac', '1', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, np.int16).astype(np.float64) / 32768; i = int(round(L['start'] * SR))
    voice[i:i + len(a)] += a[:, None][: N - i]; speech[i:i + len(a)] = 1
# music: 96 BPM, 12 bars of 2.5 s; D major palette shared with pilot 01; sparse marimba + pizz bass + soft pad
B, BAR = 60 / 96, 2.5
prog = [(['D4', 'F#4', 'A4'], 'D2'), (['B3', 'D4', 'F#4'], 'B1'), (['G3', 'B3', 'D4'], 'G1'), (['A3', 'D4', 'E4'], 'A1')] * 3
for bar, (tones, bass) in enumerate(prog):
    t0 = bar * BAR
    if t0 >= 28.0: break
    S.add(music, S.pad([S.hz(x) for x in tones], BAR + 0.4), t0, 0.07)
    S.add(music, S.pluck(S.hz(bass) * 2, 0.6, 0.994, 0.35), t0, 0.26, -0.1)
    S.add(music, S.pluck(S.hz(bass) * 2, 0.5, 0.994, 0.35), t0 + 2 * B, 0.18, -0.1)
    for k, nt in enumerate([tones[0][:-1] + '5', tones[1][:-1] + '5', tones[2][:-1] + '5']):
        if (bar + k) % 2 == 0: S.add(music, S.marimba(S.hz(nt), 0.5), t0 + (k * 1.0 + 0.5) * B, 0.13, 0.3 if k % 2 else -0.3)
for k, nt in enumerate(['D5', 'A5', 'F#6']): S.add(music, S.bell(S.hz(nt), 2.2, 0.5), 28.0 + k * 0.06, 0.11, (k - 1) * 0.4)
S.add(music, S.pad([S.hz('D4'), S.hz('F#4'), S.hz('A4')], 2.0, attack=0.3, release=1.2), 28.0, 0.07)
m = music[:N]; f = int(0.6 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
pin = lambda: S.mx((S.tap(1800, 0.06), 0.8), (S.thud(260, 0.08), 0.5))
drop = lambda: S.mx((S.tap(520, 0.1), 0.7), (S.thud(160, 0.12), 0.5))
tape = lambda: S.sweep_noise(int(0.22 * SR), 2500, 6000, 0.5) * np.hanning(int(0.22 * SR))
stampfx = lambda: S.mx((S.thud(80, 0.28), 0.9), (S.tap(700, 0.1), 0.6))
cues = [(0.42, pin(), 0.45, 0.4, 'pin tag on cup'), (1.0, S.tap(430), 0.5, 0.3, 'tap cup'), (1.25, S.tap(410), 0.5, 0.3, 'tap cup'),
        (3.25, S.slice_(0.25), 0.4, 0.2, 'paper tear'), (3.27, S.flutter(0.3), 0.22, 0.2, 'flutter'), (3.33, S.tap(300, 0.1), 0.3, 0.1, 'flap lands'),
        (5.0, pin(), 0.42, -0.2, 'pin PAPER tag'), (5.05, S.tink(3200, 0.2), 0.12, -0.1, 'wire'), (6.08, pin(), 0.42, 0.1, 'pin LINING tag'), (6.12, S.tink(3400, 0.2), 0.12, 0.1, 'wire'),
        (6.58, tape(), 0.18, 0.5, 'tape note'), (7.33, S.thud(120, 0.2), 0.45, -0.1, 'land on crate'), (7.5, pin(), 0.38, 0.1, 'pin swatch'), (7.67, pin(), 0.38, -0.1, 'pin swatch'),
        (8.17, S.plink(1300), 0.3, 0.1, 'drop beads on lined swatch'), (8.92, S.thud(130, 0.18), 0.4, -0.3, 'step'), (9.33, S.plap(), 0.32, -0.2, 'drop hits bare paper'),
        (9.36, S.absorb(0.7), 0.12, -0.2, 'soaks in'), (10.5, S.thud(115, 0.2), 0.45, 0.1, 'land on counter'),
        (10.92, S.mx((S.slice_(0.2), 0.5), (S.bandnoise(int(0.3 * SR), 4000, 11000) * np.hanning(int(0.3 * SR)), 0.6)), 0.3, 0.2, 'layers peel apart'),
        (11.92, S.thud(120, 0.2), 0.45, -0.3, 'land on crate'), (12.42, pin(), 0.42, -0.2, 'pin paper layer'), (12.75, S.thud(130, 0.18), 0.35, -0.1, 'step'),
        (13.08, pin(), 0.42, 0.0, 'pin lining layer'), (13.83, stampfx(), 0.5, 0.4, 'stamp MIXED'),
        (15.17, drop(), 0.4, 0.5, 'facility card drops'), (15.2, S.tink(3000, 0.2), 0.1, 0.4, 'wire'), (16.42, stampfx(), 0.42, 0.5, 'stamp ✓'),
        (17.0, drop(), 0.4, 0.5, 'facility card drops'), (17.05, S.tink(3100, 0.2), 0.1, 0.4, 'wire'), (17.58, stampfx(), 0.42, 0.5, 'stamp ✗'),
        (19.5, S.thud(115, 0.2), 0.42, -0.3, 'land on counter'), (19.55, pin(), 0.38, 0.1, 'pin rules sheet'), (21.58, stampfx(), 0.5, 0.1, 'stamp CHECK LOCALLY'),
        (23.17, S.thud(115, 0.2), 0.42, -0.1, 'land on counter'), (25.58, drop(), 0.38, 0.4, 'tag replaced (looks like)'), (27.42, drop(), 0.42, 0.4, 'tag replaced (made of)')]
for t, sig, gn, pan, _ in cues: S.add(sfx, sig, t, gn, pan)
sx = sfx[:N]
g, duck = 0.0, np.zeros(N); a_c, r_c = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.1 * SR))
tgt = np.roll(speech, -int(0.06 * SR)); tgt[-int(0.06 * SR):] = 0
for i in range(N): c = a_c if tgt[i] > g else r_c; g = c * g + (1 - c) * tgt[i]; duck[i] = g
mix = voice * 1.3 + m * 0.3 * (10 ** (-12 * duck / 20))[:, None] + sx * 0.42 * (10 ** (-7 * duck / 20))[:, None]
pre, out = os.path.join(HERE, 'mix-pre.wav'), os.path.join(HERE, 'mix.wav')
def write(p, a):
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
write(pre, mix * 0.7 / np.abs(mix).max())
LN = 'loudnorm=I=-15:TP=-1.5:LRA=11'
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', pre, '-af', LN + ':print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
J = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0))
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', pre, '-af', f"{LN}:measured_I={J['input_i']}:measured_TP={J['input_tp']}:measured_LRA={J['input_lra']}:measured_thresh={J['input_thresh']}:offset={J['target_offset']}:linear=true,aresample={SR}",
                      '-ac', '2', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.int16).astype(np.float64).reshape(-1, 2) / 32768
a = a[:N] if len(a) >= N else np.vstack([a, np.zeros((N - len(a), 2))])
write(out, a); os.remove(pre)
json.dump({'sfx_cues': [(c[0], c[4]) for c in cues], 'samples': len(a), 'loudnorm_first_pass': J}, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1)
print('mix', len(a), 'samples; first-pass input_i', J['input_i'])
