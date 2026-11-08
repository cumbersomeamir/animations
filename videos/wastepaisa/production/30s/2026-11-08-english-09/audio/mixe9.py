#!/usr/bin/env python3
"""english-09 episode 01 audio (cotton wiping rags, English): accepted voice-forward mix (subtle pad, no loops), copied from english-08 mixe8.py: Kokoro English Meshline narration (voice upfront) + quiet original music bed + contact-only SFX
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
chords = [(0.0, ['D3', 'F3', 'A3', 'E4']), (8.25, ['A#2', 'D3', 'F3', 'A3']), (15.95, ['F3', 'A3', 'C4', 'E4']), (21.05, ['C3', 'E3', 'G3', 'D4']), (26.0, ['F3', 'A3', 'C4', 'G4'])]
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
plip = lambda f=1400: S.mx((S.tink(f, 0.12), 0.5), (S.tap(700, 0.04), 0.4))       # oil drop landing
cloth = lambda: S.mx((S.thud(150, 0.1), 0.7), (S.bandnoise(int(0.08 * SR), 300, 1500) * np.hanning(int(0.08 * SR)), 0.3))
snip = lambda: S.mx((S.tap(3200, 0.03), 0.7), (S.tink(4200, 0.05), 0.3))
whirr = lambda d=1.3: S.bandnoise(int(d * SR), 900, 4000) * np.hanning(int(d * SR))
cues = [(0.45, plip(1400), 0.12, -0.2, 'oil drop on cotton'), (0.5, plip(1700), 0.12, 0.3, 'oil drop on polyester'), (0.6, S.bandnoise(int(0.4 * SR), 200, 900) * np.hanning(int(0.4 * SR)), 0.04, -0.2, 'oil soaks in'),
        (1.0, tick(), 0.07, -0.2, 'SOAKS IN'), (1.3, tick(), 0.07, 0.3, 'BEADS UP'), (1.3, scan(1.0), 0.12, 0.0, 'X-ray shows fibres'),
        (4.2, paper(0.3), 0.04, 0.0, 'bins and tray'), (5.05, tick(), 0.05, 0.0, 'ABSORB OIL chip'),
        (6.56, cloth(), 0.12, -0.4, 'cotton tee lands'), (6.7, cloth(), 0.12, -0.4, 'cotton tee lands'), (6.84, cloth(), 0.12, -0.4, 'cotton tee lands'), (7.34, cloth(), 0.1, 0.4, 'synthetic tee lands'), (7.5, cloth(), 0.1, 0.4, 'synthetic tee lands'),
        (8.15, stampfx(), 0.14, 0.4, 'DEFECT stamp (after the line)'),
        (8.75, snip(), 0.1, -0.3, 'snip'), (8.95, snip(), 0.1, -0.3, 'snip'), (9.15, snip(), 0.1, -0.3, 'snip'), (9.4, S.mx((S.tink(2800, 0.1), 0.6),), 0.08, -0.3, 'buttons into tray'), (9.7, S.mx((S.tink(2200, 0.15), 0.6),), 0.08, -0.3, 'zip into tray'),
        (10.1, cloth(), 0.1, 0.2, 'white stack'), (10.35, cloth(), 0.1, 0.4, 'coloured stack'),
        (11.36, paper(0.25), 0.04, 0.0, 'WORKSHOP'), (12.0, whirr(1.3), 0.04, -0.3, 'band knife'), (12.6, cloth(), 0.08, 0.0, 'pieces drop'), (12.84, cloth(), 0.08, 0.0, 'pieces drop'),
        (13.62, S.mx((S.thud(90, 0.2), 0.8), (S.tap(500, 0.06), 0.4)), 0.14, 0.4, 'baler stroke'), (14.3, S.whoosh(0.4, 400, 1600), 0.05, 0.0, 'buyers appear'),
        (16.05, paper(0.3), 0.04, 0.0, 'EXAMPLE tag'), (16.25, drop(), 0.07, -0.3, 'sacks'), (16.45, drop(), 0.07, -0.3, 'sacks'), (17.05, drop(), 0.07, 0.3, 'rag bales'), (17.29, drop(), 0.07, 0.3, 'rag bales'), (17.5, cloth(), 0.06, 0.0, 'rejects pile'),
        (18.02, paper(0.25), 0.08, -0.3, 'buyer quote'), (18.9, paper(0.25), 0.06, 0.3, 'sales'),
        (21.07, S.whoosh(0.3, 300, 1500), 0.05, 0.0, 'sales bar rises'), (21.78, tick(), 0.08, 0.3, 'rejects'), (22.53, tick(), 0.08, 0.3, 'labour'), (23.25, tick(), 0.08, 0.3, 'transport'), (24.36, ping(1800), 0.08, 0.3, 'LEFT 2,500'),
        (26.05, pop(), 0.3, 0.0, 'WastePaisa icon pops')]
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
