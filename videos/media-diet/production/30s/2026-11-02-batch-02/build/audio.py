"""All audio for production 30s-02, from code: committed Kokoro narration, original synthesized score + foley in the
Visual Investigation palette, plus an event-linked DEMONSTRATION layer (a quiet engine-like rumble that drops when
anti-noise engages, short bursts that stay, a leak hiss that stops when the seal closes) — always under the voice.
Usage: python build/audio.py -> audio/{narration,music,sfx,mix_prenorm}.wav (loudness normalised in build.sh). Seeded."""
import json, os, wave, math
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'))); E = TL['events']
SR = 48000; DUR = TL['duration']; NS = int(round(DUR * SR)); rng = np.random.default_rng(20261102 + 2)
def tax(n): return np.arange(n) / SR
def env(n, a, d): t = tax(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
def lp(x, fc): a = math.exp(-2 * math.pi * fc / SR); k = np.arange(min(len(x), int(SR * 0.08))); return np.convolve(x, (1 - a) * a ** k)[:len(x)]
def hp(x, fc): return x - lp(x, fc)
def noise(n): return rng.standard_normal(n)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def sweep(n, f0, f1): t = tax(n); T = n / SR; f = f0 * (f1 / f0) ** (t / T); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def write(path, x):
    x = np.asarray(x, dtype=np.float32); x = x[:, None] if x.ndim == 1 else x
    with wave.open(path, 'wb') as w: w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
def place(buf, x, t, gain=1.0, pan=0.5):
    s = int(round(t * SR)); e = min(len(buf), s + len(x))
    if e > s: buf[s:e, 0] += x[:e - s] * gain * (1 - pan) * 2 ** 0.5; buf[s:e, 1] += x[:e - s] * gain * pan * 2 ** 0.5
def ramp(points):  # piecewise-linear gain curve over the whole film
    ts = np.array([p[0] for p in points]); vs = np.array([p[1] for p in points]); return np.interp(tax(NS), ts, vs)

# narration
narr = np.zeros(NS); lines = []
for ln in TL['narration']:
    with wave.open(os.path.join(ROOT, 'audio', 'narration', f"{ln['id']}.wav")) as w: a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
    s = int(round(ln['start'] * SR)); narr[s:s + len(a)] += a; lines.append((ln['id'], ln['start'], round(ln['start'] + len(a) / SR, 3)))
for (i1, s1, e1), (i2, s2, e2) in zip(lines, lines[1:]): assert e1 + 0.25 < s2, f'{i1} runs into {i2}'
assert lines[-1][2] < DUR - 1.5
narr *= 0.89 / np.max(np.abs(narr))
venv = lp(np.abs(narr), 8.0); venv = np.clip(venv / (np.max(venv) + 1e-9) * 2.5, 0, 1)

# score: low D bed + room tone; quiet pizzicato Dm-Bb-Gm-A (rests during the demonstration chart so the rumble reads)
mus = np.zeros((NS, 2)); t = tax(NS)
bed = sum((0.5 ** k) * np.sin(2 * np.pi * midi(38) * (k + 1) * t + 0.3 * np.sin(2 * np.pi * 0.21 * t)) for k in range(5))
bed = lp(bed, 380) * 0.10 * np.minimum(1, t / 1.2) * ramp([(0, 1), (24.3, 1), (24.6, 0.35), (25.6, 0.35), (26.0, 1), (30, 1)])   # "QUIET": the bed drops
for ch in (0, 1): mus[:, ch] += bed + lp(hp(noise(NS), 120), 900) * 0.006
CH = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 46, 50, 55], [45, 49, 52, 57]]; eighth = 0.3; bar = 8 * eighth
def pluck(f, n=int(0.32 * SR)): x = (np.sin(2 * np.pi * f * tax(n)) + 0.35 * np.sin(2 * np.pi * 2 * f * tax(n)) + 0.12 * np.sin(2 * np.pi * 3 * f * tax(n))) * env(n, 0.003, 0.09); return lp(x, 2600)
x = 0.0; k = 0
while x < 23.0:
    nt = CH[int(x // bar) % 4][[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
    if x >= 0.6 and not (8.5 <= x < 18.5): place(mus, pluck(midi(nt)), x, 0.07, 0.35 + 0.3 * ((k * 5) % 7) / 6)
    x += eighth; k += 1
def pad(notes, t0, t1, gain):
    n = int((t1 - t0) * SR); tt = tax(n); e = np.minimum(1, tt / 0.5) * np.minimum(1, (t1 - t0 - tt) / 0.6)
    x = sum(np.sin(2 * np.pi * midi(m) * tt) + 0.4 * np.sin(2 * np.pi * midi(m) * 1.003 * tt + 1) for m in notes) / len(notes); return lp(x * e, 1800) * gain
place(mus, pad([50, 57, 62, 65], 21.5, 26.1, 0.15), 21.5)
place(mus, pad([38, 50, 57, 62, 64, 65], 28.0, 30.0, 0.2), 28.0)
for i, m in enumerate([74, 77, 81, 76]):
    n = int(1.6 * SR); tt = tax(n); f = midi(m)
    vib = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.2)) * env(n, 0.004, 0.7) * (1 + 0.15 * np.sin(2 * np.pi * 5.5 * tt))
    place(mus, vib, 28.1 + i * 0.3, 0.07, 0.4 + 0.07 * i)
fade = np.ones(NS); fs = int(29.2 * SR); fade[fs:] = np.linspace(1, 0, NS - fs) ** 1.4
mus *= fade[:, None]; mus *= (1 - 0.645 * venv)[:, None]

# demonstration layer (event-linked, under the voice)
demo = np.zeros((NS, 2))
saw = sum(np.sin(2 * np.pi * 72 * h * t) / h for h in range(1, 7)) * (1 + 0.12 * np.sin(2 * np.pi * 9 * t))   # engine-like steady rumble
rumble = lp(saw, 420) * ramp([(0, 0), (3.6, 0), (4.2, 1), (9.2, 1), (9.7, 0.5), (11.5, 0.5), (11.6, 1), (11.9, 0.22), (15.0, 0.22), (18.5, 0.22), (18.7, 0)])
for ch in (0, 1): demo[:, ch] += rumble * 0.10
for tt_, dur_, f0 in ((15.1 + 2.6 * 0.28, 0.35, 900), (15.1 + 2.6 * 0.62, 0.25, 1300)):                         # voice-like bursts that stay
    n = int(dur_ * SR); b = hp(lp(noise(n), f0 * 2.2), f0 * 0.5) * np.sin(np.pi * tax(n) / dur_) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tax(n))); place(demo, b, tt_, 0.05, 0.4)
place(demo, hp(noise(int(0.04 * SR)), 2500) * env(int(0.04 * SR), 0.0005, 0.006), 15.1 + 2.6 * 0.82, 0.22, 0.6)      # sharp click that stays
hiss = hp(lp(noise(NS), 7000), 1500) * ramp([(0, 0), (26.05, 0), (26.25, 1), (26.75, 1), (27.15, 0), (30, 0)]); demo[:, 0] += hiss * 0.025; demo[:, 1] += hiss * 0.03
outside = hp(lp(noise(NS), 3000), 400) * ramp([(0, 0), (18.6, 0), (18.9, 1), (19.3, 1), (19.6, 0.25), (21.3, 0.25), (21.5, 0)]); demo[:, 0] += outside * 0.025; demo[:, 1] += outside * 0.025
demo *= (1 - 0.4 * venv)[:, None]

# foley
fx = np.zeros((NS, 2))
def click(n=0.03): m = int(n * SR); return hp(noise(m), 2500) * env(m, 0.0005, 0.004)
def shutter(): m = int(0.08 * SR); return hp(noise(m), 1800) * env(m, 0.0005, 0.012) + 0.4 * lp(noise(m), 500) * env(m, 0.001, 0.02)
def scratch(d=0.45): m = int(d * SR); tt = tax(m); return lp(hp(noise(m), 1800), 5000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * tt))) * np.sin(np.pi * tt / (m / SR)) * 0.3
def mallet(f): m = int(0.5 * SR); tt = tax(m); return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 3.9 * f * tt) * np.exp(-tt / 0.05)) * env(m, 0.001, 0.16)
def thock(): m = int(0.25 * SR); return sweep(m, 140, 70) * env(m, 0.002, 0.06) * 0.8
def blip(f): m = int(0.12 * SR); return np.sin(2 * np.pi * f * tax(m)) * env(m, 0.002, 0.03)
def lid(): m = int(0.45 * SR); tt = tax(m); return lp(hp(noise(m), 300), 2500) * np.sin(np.pi * tt / (m / SR)) ** 2 * 0.5 + 0.4 * sweep(m, 220, 120) * env(m, 0.01, 0.12)
def tick(): m = int(0.06 * SR); return np.sin(2 * np.pi * 1250 * tax(m)) * env(m, 0.001, 0.015) + 0.4 * click(0.06)
cues = [(click(0.05), E['latch'], 0.6, 0.5), (lid(), E['lidOpen'], 0.4, 0.5), (shutter(), E['wallGhost'], 0.3, 0.35), (scratch(0.4), E['micHint'], 0.22, 0.7), (scratch(0.4), E['micHint'] + 0.1, 0.22, 0.3),
        (shutter(), 3.5, 0.3, 0.5), (scratch(0.45), E['micOut'], 0.22, 0.35), (scratch(0.45), E['micIn'], 0.22, 0.65), (blip(1320), E['chip'], 0.12, 0.45), (blip(1760), E['chip'] + 0.09, 0.1, 0.45),
        (sweep(int(0.4 * SR), 300, 140) * env(int(0.4 * SR), 0.01, 0.15) * 0.6, E['antiOut'], 0.22, 0.6),
        (shutter(), 8.5, 0.3, 0.5), (scratch(0.5), E['ringA'], 0.22, 0.5), (shutter(), 11.5, 0.3, 0.5), (mallet(midi(81)), E['checkB'], 0.12, 0.7),
        (shutter(), 15.0, 0.3, 0.5), (scratch(0.45), E['ringC1'], 0.22, 0.4), (scratch(0.45), E['ringC2'], 0.22, 0.75),
        (shutter(), 18.5, 0.3, 0.5), (thock(), E['ringCushion'] - 0.05, 0.35, 0.6), (scratch(0.45), E['ringCushion'], 0.2, 0.7), (scratch(0.45), E['ringCushion'] + 0.12, 0.2, 0.7),
        (shutter(), 21.5, 0.3, 0.5), (mallet(midi(74)), E['colA'], 0.11, 0.35), (mallet(midi(77)), E['colA'] + 0.3, 0.11, 0.35), (shutter(), E['itemA3'], 0.18, 0.35),
        (mallet(midi(81)), E['colB'], 0.11, 0.65), (mallet(midi(84)), E['colB'] + 0.3, 0.11, 0.65), (scratch(0.6), E['brace'], 0.2, 0.5),
        (shutter(), 26.0, 0.3, 0.5), (scratch(0.4), E['leak'] + 0.1, 0.18, 0.7), (thock(), E['seal'] + 0.4, 0.4, 0.65), (mallet(midi(81)), E['fitChecks'], 0.12, 0.35), (mallet(midi(84)), E['fitChecks'] + 0.12, 0.12, 0.45),
        (shutter(), 28.0, 0.3, 0.5)]
for x_, tt_, gn, pn in cues: place(fx, x_, tt_, gn, pn)
for L0, L1_ in ((8.6, 11.2), (11.6, 14.2), (15.1, 17.7)):          # playhead clock: soft tick every 0.5 s while it runs
    x = L0
    while x < L1_: place(fx, tick(), x, 0.07, 0.62); x += 0.5
fx *= fade[:, None]
mix = np.stack([narr, narr], axis=1) + mus + demo + fx * 0.85
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
for name, x_ in (('narration', narr), ('music', mus), ('sfx', fx + demo), ('mix_prenorm', mix)): write(os.path.join(ROOT, 'audio', f'{name}.wav'), x_)
print('narration windows', lines); print('mix peak', round(float(np.max(np.abs(mix))), 3))
