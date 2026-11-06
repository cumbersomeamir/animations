#!/usr/bin/env python3
"""english-08 episode 01 audio (glass cullet, English): accepted voice-forward mix (subtle pad, no loops), copied from english-07 mixe7.py: Kokoro English Meshline narration (voice upfront) + quiet original music bed + contact-only SFX
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
chords = [(0.0, ['D3', 'F3', 'A3', 'E4']), (8.8, ['A#2', 'D3', 'F3', 'A3']), (13.85, ['F3', 'A3', 'C4', 'E4']), (20.65, ['C3', 'E3', 'G3', 'D4']), (26.0, ['F3', 'A3', 'C4', 'G4'])]
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
clink = lambda f=2600: S.mx((S.tink(f, 0.25), 0.6), (S.tink(f * 1.5, 0.18), 0.3))   # glass on glass
rattle = lambda d=0.4: S.bandnoise(int(d * SR), 2500, 9000) * (np.random.default_rng(3).random(int(d * SR)) > 0.97) * 3.0 * np.hanning(int(d * SR))
crunch = lambda d=0.4: S.bandnoise(int(d * SR), 1200, 7000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 30 * np.arange(int(d * SR)) / SR))) * np.hanning(int(d * SR))
puff = lambda: S.sweep_noise(int(0.2 * SR), 6000, 2000, 0.5) * np.hanning(int(0.2 * SR))
roar = lambda d=0.8: S.bandnoise(int(d * SR), 60, 400) * np.hanning(int(d * SR))
cues = [(0.3, scan(1.0), 0.18, 0.3, 'X-ray over the cullet load'), (1.66, tick(), 0.1, 0.3, 'CERAMIC flagged'), (2.62, S.mx((S.thud(110, 0.18), 0.8), (S.tap(300, 0.08), 0.4)), 0.12, 0.3, 'price struck out'),
        (4.02, paper(0.3), 0.05, 0.0, 'crate and bins'), (4.85, clink(2600), 0.1, -0.4, 'clear bottles land'), (5.27, clink(2300), 0.1, 0.0, 'green bottles land'), (5.84, clink(2100), 0.1, 0.4, 'brown bottles land'), (6.97, tick(), 0.08, 0.0, 'colour limit chip'),
        (9.0, rattle(0.4), 0.06, -0.3, 'cullet tray'), (9.6, S.mx((S.tap(1800, 0.04), 0.5), (S.tink(3000, 0.1), 0.3)), 0.08, -0.4, 'caps out'), (10.1, clack := S.mx((S.tap(900, 0.05), 0.6), (S.thud(240, 0.06), 0.4)), 0.1, -0.3, 'ceramic out'),
        (10.62, roar(0.9), 0.06, 0.3, 'furnace'), (11.25, S.whoosh(0.4, 900, 300), 0.05, 0.3, 'ceramic sinks'), (13.75, tick(), 0.12, 0.0, 'flaw ring (after the word flaws)'),
        (14.05, paper(0.25), 0.05, 0.0, 'PROCESSING PLANT'), (14.95, crunch(0.6), 0.08, -0.4, 'crusher'), (15.62, rattle(0.8), 0.06, 0.0, 'screen'), (16.62, puff(), 0.1, 0.4, 'air jet ejects ceramic'), (17.0, rattle(0.4), 0.06, 0.0, 'cullet pile'),
        (18.05, paper(0.25), 0.05, 0.0, 'EXAMPLE tag'), (18.25, drop(), 0.07, -0.2, 'bags'), (18.5, drop(), 0.07, -0.2, 'bags'), (18.86, paper(0.25), 0.08, 0.3, 'buyer quote'), (19.34, paper(0.25), 0.06, -0.3, 'sales'),
        (20.68, S.whoosh(0.3, 300, 1500), 0.05, 0.0, 'sales bar rises'), (21.4, tick(), 0.08, 0.3, 'labour'), (22.12, tick(), 0.08, 0.3, 'transport'), (22.96, tick(), 0.08, 0.3, 'processing'), (24.2, ping(1800), 0.08, 0.3, 'LEFT 10,000'),
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
