#!/usr/bin/env python3
"""feedback-05 episode 01 audio (cardboard grading business, Hindi): accepted voice-forward mix (subtle pad, no loops), copied from hindi-04 mixh4.py: Kokoro Hindi narration (voice upfront) + quiet original music bed + contact-only SFX
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
# SFX that coincide with a line's first word are kept low (ASR on the export showed onsets masked otherwise)
# music: subtle evolving pad, slow chord changes, no rhythmic loop; soft resolve under the CTA
chords = [(0.0, ['D3', 'F3', 'A3', 'E4']), (8.35, ['A#2', 'D3', 'F3', 'A3']), (14.5, ['F3', 'A3', 'C4', 'E4']), (22.95, ['C3', 'E3', 'G3', 'D4']), (26.0, ['F3', 'A3', 'C4', 'G4'])]
for i, (t0, tones) in enumerate(chords):
    dur = (chords[i + 1][0] if i + 1 < len(chords) else 30.0) - t0 + 1.2
    S.add(music, S.pad([S.hz(x) for x in tones], dur, attack=1.2, release=1.4), max(0, t0 - 0.6), 0.09)
for k, nt in enumerate(['C5', 'F5', 'A5']): S.add(music, S.bell(S.hz(nt), 2.4, 0.4), 26.0 + k * 0.08, 0.07, (k - 1) * 0.4)
m = music[:N]; f = int(0.8 * SR); m[-f:] *= np.linspace(1, 0, f)[:, None]
m = S.lowpass(m[:, 0], 3500)[:, None] * np.array([[1.0, 0.0]]) + S.lowpass(m[:, 1], 3500)[:, None] * np.array([[0.0, 1.0]])
pin = lambda: S.mx((S.tap(1800, 0.06), 0.8), (S.thud(260, 0.08), 0.5))
drop = lambda: S.mx((S.tap(520, 0.1), 0.7), (S.thud(160, 0.12), 0.5))
paper = lambda d=0.3: S.sweep_noise(int(d * SR), 1500, 5000, 0.6) * np.hanning(int(d * SR))
stampfx = lambda: S.mx((S.thud(80, 0.28), 0.9), (S.tap(700, 0.1), 0.6))
clank = lambda f=900: S.mx((S.tink(f, 0.35), 0.7), (S.thud(140, 0.15), 0.6))
canhit = lambda: S.mx((S.tink(2600, 0.3), 0.6), (S.tink(3900, 0.25), 0.3), (S.tap(600, 0.08), 0.6))
grind = lambda d: S.bandnoise(int(d * SR), 200, 2500) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 18 * np.arange(int(d * SR)) / SR))) * np.hanning(int(d * SR))
scan = lambda d: (np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1400, int(d * SR))) / SR) * 0.4 + S.bandnoise(int(d * SR), 2000, 7000) * 0.3) * np.hanning(int(d * SR))
ping = lambda f=1800: S.bell(f, 0.6, 0.3)
tick = lambda: S.tap(2200, 0.05)
pop = lambda: S.mx((S.tap(900, 0.06), 0.6), (S.thud(160, 0.12), 0.4))
flat = lambda: S.mx((S.thud(140, 0.1), 0.6), (S.tap(500, 0.05), 0.4))            # flattened cardboard landing
peel = lambda d=0.35: S.sweep_noise(int(d * SR), 2500, 7000, 0.6) * np.hanning(int(d * SR))
crinkle = lambda d=0.3: S.bandnoise(int(d * SR), 3000, 9000) * np.hanning(int(d * SR))
squelch = lambda d=0.3: S.bandnoise(int(d * SR), 150, 900) * np.hanning(int(d * SR))
cues = [(0.35, scan(0.95), 0.18, 0.3, 'X-ray scan over the mixed lot'), (1.42, tick(), 0.2, 0.2, 'PROFIT? chip'), (3.15, pop(), 0.24, 0.2, "BUYER'S GRADE chip"),
        (3.95, paper(0.3), 0.05, 0.0, 'bins appear'),
        (4.8, flat(), 0.22, -0.4, 'board 1 lands'), (5.06, flat(), 0.22, -0.4, 'board 2 lands'), (5.3, flat(), 0.22, -0.4, 'board 3 lands'), (5.85, flat(), 0.16, 0.0, 'mixed paper lands'),
        (6.05, peel(), 0.12, 0.3, 'tape peeled off'), (6.47, crinkle(), 0.08, 0.4, 'plastic film out'), (7.13, squelch(), 0.06, 0.4, 'wet paper out'), (7.82, tick(), 0.04, 0.4, 'OUT label (kept under the last word)'),
        (8.6, tick(), 0.06, 0.3, 'grade tag appears'), (9.0, S.whoosh(0.35, 500, 1600), 0.1, -0.3, 'moisture probe goes in'), (9.45, tick(), 0.16, -0.3, 'meter needle rises'),
        (9.95, stampfx(), 0.18, -0.3, 'WEIGHT CLAIM stamp'), (11.08, tick(), 0.2, 0.3, 'CONTAMINATION chip'), (11.75, S.whoosh(0.3, 900, 2200), 0.1, 0.3, 'grade tag flips'), (12.15, flat(), 0.16, 0.3, 'lower grade'),
        (13.1, paper(0.3), 0.05, 0.0, 'EXAMPLE tag'), (14.5, paper(0.25), 0.16, -0.3, 'purchase ticket'), (15.85, S.whoosh(0.4, 600, 2000), 0.1, 0.0, 'lot splits into grades'),
        (16.2, tick(), 0.18, -0.3, 'cardboard price'), (16.3, tick(), 0.14, 0.0, 'mixed price'), (16.6, paper(0.25), 0.16, 0.3, 'sale ticket'),
        (17.66, S.whoosh(0.3, 300, 1500), 0.05, 0.0, 'sales bar rises'), (17.95, S.whoosh(0.35, 1200, 400), 0.06, 0.0, 'purchase covers the bar'), (18.26, tick(), 0.16, 0.3, 'transport'), (18.89, tick(), 0.16, 0.3, 'labour'),
        (19.95, ping(1800), 0.2, 0.3, 'NET PROFIT 200'), (21.35, S.mx((S.thud(110, 0.18), 0.8), (S.tap(300, 0.08), 0.4)), 0.1, 0.3, 'UNSORTED LOSS chip'),
        (23.1, tick(), 0.28, -0.2, 'CARDBOARD APART card'), (23.6, tick(), 0.28, 0.0, 'WET OUT card'), (24.1, tick(), 0.28, 0.2, 'NET ACCOUNT card'),
        (26.0, pop(), 0.3, 0.0, 'WastePaisa icon pops')]
for t, sig, gn, pan, _ in cues: S.add(sfx, sig, t, gn, pan)
sx = sfx[:N]
g, duck = 0.0, np.zeros(N); a_c, r_c = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.1 * SR))
tgt = np.roll(speech, -int(0.06 * SR)); tgt[-int(0.06 * SR):] = 0
for i in range(N): c = a_c if tgt[i] > g else r_c; g = c * g + (1 - c) * tgt[i]; duck[i] = g
mix = voice * 1.35 + m * 0.28 * (10 ** (-10 * duck / 20))[:, None] + sx * 0.4 * (10 ** (-7 * duck / 20))[:, None]
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
