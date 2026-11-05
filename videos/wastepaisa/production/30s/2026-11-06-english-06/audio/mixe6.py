#!/usr/bin/env python3
"""english-06 episode 01 audio (coconut-shell charcoal briquettes, English): accepted voice-forward mix (subtle pad, no loops), copied from feedback-05 mixf5.py: Kokoro English Meshline narration (voice upfront) + quiet original music bed + contact-only SFX
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
chords = [(0.0, ['D3', 'F3', 'A3', 'E4']), (7.75, ['A#2', 'D3', 'F3', 'A3']), (13.15, ['F3', 'A3', 'C4', 'E4']), (19.2, ['C3', 'E3', 'G3', 'D4']), (26.0, ['F3', 'A3', 'C4', 'G4'])]
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
clack = lambda f=1100: S.mx((S.tap(f, 0.05), 0.6), (S.thud(260, 0.06), 0.4))     # dry shell on shell
clink = lambda f=2400: S.mx((S.tink(f, 0.18), 0.6), (S.tap(900, 0.04), 0.3))     # steel hole cover
crackle = lambda d=0.6: S.bandnoise(int(d * SR), 1500, 6000) * (np.random.default_rng(6).random(int(d * SR)) > 0.985) * 3.0 * np.hanning(int(d * SR))
pour = lambda d=0.4: S.sweep_noise(int(d * SR), 3000, 1200, 0.5) * np.hanning(int(d * SR))
cues = [(0.3, scan(1.0), 0.18, 0.3, 'X-ray turns the shell to charcoal'), (0.75, tick(), 0.2, 0.2, 'SHELLS chip'), (1.6, S.whoosh(0.35, 600, 1800), 0.08, 0.3, 'arrow to briquettes'),
        (2.7, pop(), 0.24, 0.0, "WHERE'S THE MONEY chip"),
        (3.85, paper(0.3), 0.05, 0.0, 'sack appears'), (4.45, clack(1100), 0.14, -0.2, 'shell into sack'), (4.61, clack(1250), 0.14, -0.2, 'shell into sack'), (4.77, clack(1000), 0.14, -0.2, 'shell into sack'), (4.93, clack(1180), 0.14, -0.2, 'shell into sack'),
        (5.62, clack(900), 0.12, 0.4, 'shells land on drying mat'), (5.8, clack(980), 0.12, 0.4, 'shells land on drying mat'), (6.1, pop(), 0.12, -0.3, 'wet-load inset'), (6.2, crackle(0.7), 0.08, -0.3, 'fire under a wet load'), (6.75, tick(), 0.14, -0.3, 'WET = MORE FUEL'),
        (8.0, tick(), 0.08, -0.3, 'DRUM KILN'), (8.3, scan(0.8), 0.12, -0.3, 'X-ray into the drum'), (9.3, clink(2400), 0.14, -0.3, 'air holes row 1 closed'), (9.55, clink(2200), 0.14, -0.3, 'air holes row 2 closed'), (9.8, clink(2000), 0.14, -0.3, 'air holes row 3 closed'),
        (10.2, S.whoosh(0.35, 500, 1800), 0.08, 0.3, 'charcoal to crusher'), (10.45, grind(0.8), 0.07, 0.3, 'crusher'), (11.3, pour(0.4), 0.08, 0.0, 'starch poured'),
        (12.42, S.mx((S.thud(90, 0.2), 0.8), (S.tap(500, 0.06), 0.4)), 0.18, 0.3, 'press stroke'), (12.85, clack(1500), 0.12, 0.2, 'briquettes out'),
        (13.32, paper(0.3), 0.05, 0.0, 'EXAMPLE tag'), (13.8, tick(), 0.14, -0.3, '10,000 shells'), (14.5, drop(), 0.08, 0.2, 'sacks'), (14.86, drop(), 0.08, 0.2, 'sacks'), (15.22, drop(), 0.08, 0.2, 'sacks'),
        (15.45, tick(), 0.14, 0.3, '350 kg'), (15.9, paper(0.25), 0.14, -0.3, 'buyer ticket'), (16.4, paper(0.25), 0.14, 0.3, 'sales ticket'),
        (19.22, S.whoosh(0.3, 300, 1500), 0.05, 0.0, 'sales bar rises'), (19.87, tick(), 0.1, 0.3, 'labour'), (20.56, tick(), 0.1, 0.3, 'energy'), (21.25, tick(), 0.1, 0.3, 'transport'), (22.06, tick(), 0.1, 0.3, 'equipment'),
        (22.85, ping(1800), 0.2, 0.3, 'LEFT 1,500'), (24.66, S.mx((S.thud(110, 0.18), 0.8), (S.tap(300, 0.08), 0.4)), 0.07, 0.0, 'market-price warning'),
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
