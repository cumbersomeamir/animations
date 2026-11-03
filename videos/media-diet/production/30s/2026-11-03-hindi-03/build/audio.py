"""Audio for the Hindi episode hindi-03 (same accepted recipe as the feedback round), all from code: committed Kokoro Hindi narration (hf_alpha 0.7 + hm_omega 0.3, 1.08, hi),
a subtle sustained pad (no repeating ostinato/loops, per feedback) and paper-world foley tied to on-screen events.
Usage: python build/audio.py -> audio/{narration,music,sfx,mix_prenorm}.wav (loudness normalised in build.sh). Seeded."""
import json, os, wave, math
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'))); E = TL['events']
SR = 48000; DUR = TL['duration']; NS = int(round(DUR * SR)); rng = np.random.default_rng(20261103 + 3)
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
def place_pan(buf, x, t, gain, p0, p1):
    s = int(round(t * SR)); e = min(len(buf), s + len(x)); n = e - s; pan = np.linspace(p0, p1, n)
    buf[s:e, 0] += x[:n] * gain * (1 - pan) * 2 ** 0.5; buf[s:e, 1] += x[:n] * gain * pan * 2 ** 0.5

# narration
narr = np.zeros(NS); lines = []
for ln in TL['narration']:
    with wave.open(os.path.join(ROOT, 'audio', 'narration', f"{ln['id']}.wav")) as w: a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
    s = int(round(ln['start'] * SR)); narr[s:s + len(a)] += a; lines.append((ln['id'], ln['start'], round(ln['start'] + len(a) / SR, 3)))
for (i1, s1, e1), (i2, s2, e2) in zip(lines, lines[1:]): assert e1 + 0.25 < s2, f'{i1} runs into {i2}'
assert lines[-1][2] < DUR - 0.5
narr *= 0.89 / np.max(np.abs(narr))
venv = lp(np.abs(narr), 8.0); venv = np.clip(venv / (np.max(venv) + 1e-9) * 2.5, 0, 1)

# subtle sustained pad: five long chords with overlapping fades (no rhythmic loop)
mus = np.zeros((NS, 2))
def pad(notes, t0, t1, gain, bright=1800):
    n = int((t1 - t0) * SR); tt = tax(n); e = np.minimum(1, tt / 1.2) * np.minimum(1, (t1 - t0 - tt) / 1.2)
    x = sum(np.sin(2 * np.pi * midi(m) * tt + 0.7 * k) + 0.35 * np.sin(2 * np.pi * midi(m) * 1.004 * tt) for k, m in enumerate(notes)) / len(notes)
    return lp(x * e, bright) * gain
for (t0, t1, notes) in [(0.0, 6.6, [50, 57, 62, 64]), (5.4, 12.6, [46, 53, 57, 62]), (11.4, 17.0, [41, 48, 57, 60]), (15.8, 23.4, [48, 55, 60, 64]), (22.2, 27.4, [43, 50, 59, 62]), (26.0, 30.0, [50, 57, 62, 64, 69])]:
    x = pad(notes, t0, t1, 0.11); place(mus, x, t0, 1.0, 0.45); place(mus, lp(x, 900), t0 + 0.02, 0.6, 0.6)
for i, m in enumerate([74, 78, 81]):          # one gentle bell figure on the brand sign (not a loop)
    n = int(1.6 * SR); tt = tax(n); f = midi(m); place(mus, (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt / 0.2)) * env(n, 0.004, 0.6), E['sign'] + 0.15 + i * 0.22, 0.05, 0.4 + 0.1 * i)
fade = np.ones(NS); fs = int(29.3 * SR); fade[fs:] = np.linspace(1, 0, NS - fs) ** 1.3
mus *= fade[:, None]; mus *= (1 - 0.6 * venv)[:, None]

# paper-world foley, each tied to an on-screen event
fx = np.zeros((NS, 2))
def tap(f=900): m = int(0.07 * SR); return lp(noise(m), f) * env(m, 0.001, 0.012) * 1.6 + 0.4 * np.sin(2 * np.pi * 160 * tax(m)) * env(m, 0.001, 0.02)
def rustle(d, f0=1200, f1=5000): m = int(d * SR); tt = tax(m); return lp(hp(noise(m), f0), f1) * np.sin(np.pi * tt / d) ** 1.5 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 11 * tt)))
def pop(): m = int(0.09 * SR); return sweep(m, 320, 820) * env(m, 0.002, 0.03)
def ping(f): m = int(0.5 * SR); tt = tax(m); return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * env(m, 0.002, 0.12)
def tick(f=2200): m = int(0.05 * SR); return np.sin(2 * np.pi * f * tax(m)) * env(m, 0.0008, 0.01)
def whir(d): m = int(d * SR); tt = tax(m); x = sum(np.sin(2 * np.pi * 95 * h * tt) / h for h in range(1, 5)) * (1 + 0.1 * np.sin(2 * np.pi * 23 * tt)); return lp(x, 600) * np.minimum(1, np.minimum(tt / 0.15, (d - tt) / 0.2))
def thread(f): m = int(0.4 * SR); tt = tax(m); return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2.01 * f * tt)) * env(m, 0.001, 0.09)
def thud(): m = int(0.25 * SR); return sweep(m, 150, 60) * env(m, 0.002, 0.07) + 0.3 * lp(noise(m), 400) * env(m, 0.001, 0.03)
def rise(d, f0, f1): m = int(d * SR); tt = tax(m); return sweep(m, f0, f1) * np.sin(np.pi * tt / d) ** 2 * 0.6
def whoosh(d): m = int(d * SR); tt = tax(m); return lp(hp(noise(m), 500), 3500) * np.sin(np.pi * tt / d) ** 2
place(fx, pop(), E['query'], 0.18, 0.6)
for c in [s['in'] for s in TL['shots'][1:]]: place(fx, tap(), c, 0.16, 0.5)
for i in range(2): place(fx, rustle(0.45, 900, 5000), E['calFlip'] + i * 0.5, 0.2, 0.35); place(fx, tap(1100), E['calFlip'] + i * 0.5 + 0.42, 0.1, 0.35)
place(fx, rise(E['updateEnd'] - E['update'], 520, 1100) * 0.8, E['update'], 0.045, 0.6); place(fx, ping(1318), E['updateOk'], 0.06, 0.6)
for i in range(7): place(fx, ping([2093, 2637, 3136][i % 3]) * 0.7, E['spark'] + i * 0.24, 0.025, 0.3 + 0.07 * i)   # sparkle bells (not a loop: 7 rising notes, once)
place(fx, rustle(0.6, 800, 4500), E['gen'], 0.2, 0.55); place(fx, pop(), E['genEnd'] - 0.2, 0.12, 0.55)
place(fx, rustle(0.5, 800, 4500), E['extend'], 0.18, 0.25); place(fx, rustle(0.5, 800, 4500), E['extend'] + 0.25, 0.18, 0.8)
place(fx, thud(), E['stamp'] + 0.2, 0.32, 0.45); place(fx, tap(900), E['stampUp'] + 0.1, 0.1, 0.4)
place_pan(fx, whoosh(E['lensEnd'] - E['lens']) * 0.6, E['lens'], 0.08, 0.2, 0.6)
for i, f in enumerate((1046, 1318, 1568)): place(fx, ping(f), E['reveal'] + 0.25 + i * 0.1, 0.04, 0.55)
for i in range(3): place(fx, tap(1600), E['phones'] + i * 0.32 + 0.3, 0.13, 0.4 + 0.15 * i); place(fx, ping(1568 + 200 * i), E['phones'] + i * 0.32 + 0.35, 0.025, 0.4 + 0.15 * i)
place_pan(fx, whoosh(E['scanInEnd'] - E['scanIn']), E['scanIn'], 0.12, 0.3, 0.7); place(fx, tap(1800), E['scanInEnd'], 0.12, 0.65)
place(fx, rise(E['scanEnd'] - E['scan'], 700, 1400) * 0.7, E['scan'], 0.04, 0.6); place(fx, ping(1318), E['found'], 0.065, 0.6); place(fx, ping(1760), E['found'] + 0.12, 0.05, 0.6)
place_pan(fx, whoosh(E['scanIn2End'] - E['scanIn2']), E['scanIn2'], 0.12, 0.2, 0.7); place(fx, tap(1800), E['scanIn2End'], 0.12, 0.65)
place(fx, rise(E['scan2End'] - E['scan2'], 700, 1400) * 0.7, E['scan2'], 0.04, 0.6)
m_ = int(0.5 * SR); place(fx, np.sin(2 * np.pi * 196 * tax(m_)) * env(m_, 0.004, 0.18), E['none'], 0.09, 0.6)   # soft low "nothing found"
place(fx, pop(), E['query2'], 0.18, 0.3)
place(fx, rustle(0.45, 900, 5000), E['sign'], 0.2, 0.55)
fx *= fade[:, None]
mix = np.stack([narr, narr], axis=1) + mus + fx
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
for name, x_ in (('narration', narr), ('music', mus), ('sfx', fx), ('mix_prenorm', mix)): write(os.path.join(ROOT, 'audio', f'{name}.wav'), x_)
print('narration windows', lines); print('mix peak', round(float(np.max(np.abs(mix))), 3))
