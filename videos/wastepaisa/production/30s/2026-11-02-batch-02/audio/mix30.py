#!/usr/bin/env python3
"""Production 30s-02 audio (aluminium can-to-can): Kokoro narration (voice upfront) + quiet original music bed + contact-only SFX
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
for k, nt in enumerate(['D5', 'A5', 'F#6']): S.add(music, S.bell(S.hz(nt), 2.2, 0.5), 27.8 + k * 0.06, 0.11, (k - 1) * 0.4)
S.add(music, S.pad([S.hz('D4'), S.hz('F#4'), S.hz('A4')], 2.0, attack=0.3, release=1.2), 28.0, 0.07)
m = music[:N]; f = int(0.6 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
pin = lambda: S.mx((S.tap(1800, 0.06), 0.8), (S.thud(260, 0.08), 0.5))
drop = lambda: S.mx((S.tap(520, 0.1), 0.7), (S.thud(160, 0.12), 0.5))
paper = lambda d=0.3: S.sweep_noise(int(d * SR), 1500, 5000, 0.6) * np.hanning(int(d * SR))
stampfx = lambda: S.mx((S.thud(80, 0.28), 0.9), (S.tap(700, 0.1), 0.6))
clank = lambda f=900: S.mx((S.tink(f, 0.35), 0.7), (S.thud(140, 0.15), 0.6))
canhit = lambda: S.mx((S.tink(2600, 0.3), 0.6), (S.tink(3900, 0.25), 0.3), (S.tap(600, 0.08), 0.6))
grind = lambda d: S.bandnoise(int(d * SR), 200, 2500) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 18 * np.arange(int(d * SR)) / SR))) * np.hanning(int(d * SR))
cues = [(0.17, S.mx((canhit(), 0.6), (S.thud(150, 0.15), 0.6)), 0.5, 0.2, 'can drops on counter'), (0.92, S.tap(900, 0.08), 0.4, 0.2, 'tap can'), (1.33, S.tap(950, 0.08), 0.4, 0.2, 'tap can'),
        (1.17, pin(), 0.42, 0.2, 'pin ALUMINIUM tag'), (2.17, stampfx(), 0.5, 0.2, 'stamp USEFUL METAL'),
        (3.0, paper(0.33), 0.3, 0.0, 'page folds down (transition)'), (4.58, clank(700), 0.4, -0.2, 'magnet grabs steel can'), (5.42, clank(500), 0.3, -0.4, 'steel can into bin'),
        (5.2, S.tap(1200, 0.06), 0.25, 0.3, 'eddy current flick'), (5.58, canhit(), 0.42, 0.4, 'aluminium can lands in bin'),
        (6.17, paper(0.33), 0.3, 0.3, 'panel slides (transition)'), (6.33, canhit(), 0.3, -0.2, 'can into hopper'), (6.58, canhit(), 0.28, -0.2, 'can into hopper'),
        (6.4, grind(0.9), 0.1, -0.2, 'shredder grind (kept low under speech)'), (7.0, S.bandnoise(int(0.7 * SR), 3000, 9000) * np.hanning(int(0.7 * SR)), 0.08, 0.3, 'de-coating heat hiss'),
        (7.83, S.thud(90, 0.3), 0.45, 0.0, 'furnace panel drops (transition)'), (8.0, S.plap(), 0.15, -0.1, 'flakes into melt'), (8.25, S.plap(), 0.15, 0.1, 'flakes into melt'),
        (8.8, S.pour(0.7), 0.12, 0.3, 'pour into mould'), (9.42, pin(), 0.38, 0.3, 'pin CAST tag'), (9.67, paper(0.33), 0.3, 0.3, 'panel slides (transition)'),
        (10.0, S.thud(70, 0.25), 0.35, 0.0, 'roll pass'), (10.25, S.thud(70, 0.25), 0.3, 0.0, 'roll pass'), (10.5, pin(), 0.35, 0.3, 'pin SHEET tag'),
        (11.67, S.mx((S.thud(120, 0.15), 0.8), (S.tap(1500, 0.06), 0.6)), 0.45, 0.4, 'press cuts disc'), (12.17, S.tap(800, 0.08), 0.35, 0.4, 'can formed'), (12.33, pin(), 0.38, 0.2, 'pin NEW CAN tag'),
        (13.17, paper(0.33), 0.3, 0.4, 'magnifier iris (transition)'), (13.83, pin(), 0.38, 0.0, 'pin ALLOY label'), (15.33, pin(), 0.38, -0.3, 'pin PAINT label'), (15.92, pin(), 0.38, 0.2, 'pin INNER label'),
        (16.58, S.mx((drop(), 0.6), (S.tink(2200, 0.2), 0.4)), 0.4, 0.4, 'lid lands'), (17.58, S.slice_(0.25), 0.3, 0.3, 'paint peeled'), (17.92, stampfx(), 0.45, 0.0, 'stamp PROCESSED BY HEAT'),
        (19.0, paper(0.33), 0.3, 0.0, 'page unfolds (transition)'), (19.58, S.plink(1100), 0.25, 0.1, 'drip'), (19.83, S.plink(1000), 0.22, 0.1, 'drip'), (20.08, S.plink(950), 0.2, 0.1, 'drip'),
        (20.75, pin(), 0.38, 0.3, 'pin LOCAL RULES'), (21.42, canhit(), 0.42, 0.4, 'can into ALUMINIUM bin'), (22.83, pin(), 0.38, -0.3, 'pin SCRAP COLLECTOR'),
        (24.58, drop(), 0.35, 0.1, 'map card placed'), (25.0, pin(), 0.3, 0.1, 'pin route'), (25.17, pin(), 0.3, 0.2, 'pin route'), (26.33, pin(), 0.35, 0.3, 'pin PRICE tag'),
        (26.58, stampfx(), 0.45, 0.3, 'stamp VARIES'), (27.75, S.mx((canhit(), 0.6), (S.thud(150, 0.15), 0.6)), 0.48, 0.1, 'new can lands'), (27.92, pin(), 0.36, 0.1, 'pin CAN -> CAN tag')]
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
