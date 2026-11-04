#!/usr/bin/env python3
"""hindi-04 episode 01 audio (wooden-pallet repair business, Hindi): accepted voice-forward mix (subtle pad, no loops), copied from hindi-03 mixh3.py: Kokoro Hindi narration (voice upfront) + quiet original music bed + contact-only SFX
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
chords = [(0.0, ['D3', 'F3', 'A3', 'E4']), (8.8, ['A#2', 'D3', 'F3', 'A3']), (15.0, ['F3', 'A3', 'C4', 'E4']), (23.85, ['C3', 'E3', 'G3', 'D4']), (26.0, ['F3', 'A3', 'C4', 'G4'])]
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
knock = lambda f=700: S.mx((S.tap(f, 0.07), 0.7), (S.thud(170, 0.11), 0.6))       # wood on wood
nailhit = lambda: S.mx((S.tap(1700, 0.05), 0.8), (S.thud(230, 0.08), 0.6))
rumble = lambda d: S.bandnoise(int(d * SR), 80, 600) * np.hanning(int(d * SR))
cues = [(0.45, scan(0.85), 0.18, 0.3, 'X-ray scan over the broken pallet'), (1.0, tick(), 0.22, 0.3, 'PER KILO chip'),
        (2.6, knock(820), 0.24, 0.3, 'new board 1 drops in'), (2.8, knock(760), 0.24, 0.3, 'new board 2 drops in'), (3.4, pop(), 0.24, 0.2, 'PER PIECE chip'),
        (4.45, rumble(0.5), 0.06, 0.4, 'hand-cart rolls in'), (5.85, tick(), 0.16, 0.0, 'three pile zones'),
        (6.9, tick(), 0.2, -0.4, 'OK pile chip'), (7.35, knock(640), 0.22, -0.4, 'pallets land on OK pile'), (7.32, tick(), 0.2, 0.0, 'REPAIRABLE chip'),
        (7.77, knock(600), 0.22, 0.0, 'pallets land on repairable pile'), (8.19, tick(), 0.2, 0.4, 'SCRAP chip'), (8.62, knock(520), 0.2, 0.4, 'pallet lands on scrap pile'),
        (9.3, scan(0.65), 0.15, -0.3, 'X-ray marks good boards'), (10.35, S.whoosh(0.3, 700, 1800), 0.1, -0.2, 'good board 1 pried off'), (10.6, S.whoosh(0.3, 700, 1800), 0.1, -0.1, 'good board 2 pried off'),
        (10.85, knock(800), 0.16, 0.0, 'board 1 on staging'), (11.1, knock(760), 0.16, 0.0, 'board 2 on staging'),
        (11.95, knock(450), 0.2, 0.3, 'broken board 1 falls'), (12.1, knock(420), 0.2, 0.3, 'broken board 2 falls'),
        (12.65, knock(900), 0.09, 0.3, 'reclaimed board 1 in'), (12.85, knock(860), 0.09, 0.3, 'reclaimed board 2 in'),
        (12.75, nailhit(), 0.1, 0.35, 'nail 1'), (12.92, nailhit(), 0.1, 0.35, 'nail 2'), (13.08, nailhit(), 0.22, 0.35, 'nail 3 (after the last word)'),
        (13.4, paper(0.3), 0.06, 0.0, 'EXAMPLE tag'), (13.95, S.whoosh(0.35, 600, 2400), 0.08, 0.0, '20 pallets appear'), (14.55, paper(0.25), 0.16, 0.0, 'purchase ticket'),
        (15.9, tick(), 0.18, 0.0, '12 repaired'), (16.93, stampfx(), 0.2, 0.0, '12 SOLD stamp'), (17.05, knock(500), 0.14, 0.2, 'leftover wood pile'),
        (17.8, S.whoosh(0.35, 300, 1500), 0.05, 0.0, 'turnover bar rises'), (18.0, tick(), 0.16, 0.0, 'turnover split chip'), (18.75, tick(), 0.2, -0.3, 'TURNOVER 6,000'),
        (19.9, S.whoosh(0.45, 1200, 400), 0.09, 0.0, 'purchase covers the bar'), (20.52, tick(), 0.22, 0.3, 'transport'), (21.09, tick(), 0.22, 0.3, 'labour'), (21.87, tick(), 0.22, 0.3, 'nails'),
        (22.8, ping(1800), 0.22, 0.3, 'PROFIT 500'),
        (23.95, tick(), 0.28, -0.2, 'GRADE card'), (24.4, tick(), 0.28, 0.0, 'REPLACE BOARDS card'), (24.85, tick(), 0.28, 0.2, 'FULL ACCOUNT card'),
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
