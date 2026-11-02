"""All audio for production 30s-01, from code: narration placement (committed Kokoro takes), original synthesized
score + foley following the Visual Investigation sound palette (adapted), ducking, pre-master mix.
Usage: python build/audio.py   -> audio/{narration,music,sfx,mix_prenorm}.wav ; loudness is normalised in build.sh.
No samples or third-party audio. Fixed RNG seed => reproducible."""
import json, os, wave, math
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
E = TL['events']; SR = 48000; DUR = TL['duration']; NS = int(round(DUR * SR))
rng = np.random.default_rng(20261102)
def tax(n): return np.arange(n) / SR
def env(n, a, d): t = tax(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
def lp(x, fc):
    a = math.exp(-2 * math.pi * fc / SR); k = np.arange(min(len(x), int(SR * 0.08))); return np.convolve(x, (1 - a) * a ** k)[:len(x)]
def hp(x, fc): return x - lp(x, fc)
def noise(n): return rng.standard_normal(n)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def sweep(n, f0, f1): t = tax(n); T = n / SR; f = f0 * (f1 / f0) ** (t / T); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def write(path, x):
    x = np.asarray(x, dtype=np.float32); x = x[:, None] if x.ndim == 1 else x
    with wave.open(path, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
def place(buf, x, t, gain=1.0, pan=0.5):
    s = int(round(t * SR)); e = min(len(buf), s + len(x))
    if e <= s: return
    buf[s:e, 0] += x[:e - s] * gain * (1 - pan) * 2 ** 0.5; buf[s:e, 1] += x[:e - s] * gain * pan * 2 ** 0.5

# ---------------- narration (committed Kokoro takes)
narr = np.zeros(NS); lines = []
for ln in TL['narration']:
    with wave.open(os.path.join(ROOT, 'audio', 'narration', f"{ln['id']}.wav")) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
    s = int(round(ln['start'] * SR)); narr[s:s + len(a)] += a
    lines.append((ln['id'], ln['start'], round(ln['start'] + len(a) / SR, 3)))
for (i1, s1, e1), (i2, s2, e2) in zip(lines, lines[1:]): assert e1 + 0.25 < s2, f'{i1} runs into {i2}'
assert lines[-1][2] < DUR - 1.5, 'narration must leave the ending clear'
narr *= 0.89 / np.max(np.abs(narr))
venv = lp(np.abs(narr), 8.0); venv = np.clip(venv / (np.max(venv) + 1e-9) * 2.5, 0, 1)

# ---------------- score: low D bed + room tone, quiet pizzicato ostinato, verdict chords, resolving Dm add9 + vibraphone
mus = np.zeros((NS, 2)); t = tax(NS)
bed = sum((0.5 ** k) * np.sin(2 * np.pi * midi(38) * (k + 1) * t + 0.3 * np.sin(2 * np.pi * 0.21 * t)) for k in range(5))
bed = lp(bed, 380) * 0.11 * np.minimum(1, t / 1.2)
room = lp(hp(noise(NS), 120), 900) * 0.006
for ch in (0, 1): mus[:, ch] += bed + room
CH = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 46, 50, 55], [45, 49, 52, 57]]      # Dm  Bb  Gm  A
eighth = 0.3; bar = 8 * eighth
def pluck(f, n=int(0.32 * SR)):
    x = (np.sin(2 * np.pi * f * tax(n)) + 0.35 * np.sin(2 * np.pi * 2 * f * tax(n)) + 0.12 * np.sin(2 * np.pi * 3 * f * tax(n))) * env(n, 0.003, 0.09)
    return lp(x, 2600)
x = 0.0; k = 0
while x < 23.0:
    ch = CH[int(x // bar) % 4]; nt = ch[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
    if x >= 0.6 and not (5.5 <= x < 9.5):         # rests while the clock is frozen in L2 (only bed + foley)
        place(mus, pluck(midi(nt)), x, 0.075, 0.35 + 0.3 * ((k * 5) % 7) / 6)
    x += eighth; k += 1
def pad(notes, t0, t1, gain):
    n = int((t1 - t0) * SR); tt = tax(n); e = np.minimum(1, tt / 0.5) * np.minimum(1, (t1 - t0 - tt) / 0.6)
    x = sum(np.sin(2 * np.pi * midi(m) * tt) + 0.4 * np.sin(2 * np.pi * midi(m) * 1.003 * tt + 1) for m in notes) / len(notes)
    return lp(x * e, 1800) * gain
place(mus, pad([50, 57, 62, 65], 23.0, 27.6, 0.16), 23.0)                            # verdict: slow sustained Dm
place(mus, pad([38, 50, 57, 62, 64, 65], 27.5, 30.0, 0.2), 27.5)                     # resolving D minor add9
for i, m in enumerate([74, 77, 81, 76]):                                              # vibraphone figure on the evidence map
    n = int(1.6 * SR); tt = tax(n); f = midi(m)
    vib = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt / 0.2)) * env(n, 0.004, 0.7) * (1 + 0.15 * np.sin(2 * np.pi * 5.5 * tt))
    place(mus, vib, 27.6 + i * 0.3, 0.07, 0.4 + 0.07 * i)
fade = np.ones(NS); fs = int(29.2 * SR); fade[fs:] = np.linspace(1, 0, NS - fs) ** 1.4
mus *= fade[:, None]
mus *= (1 - 0.645 * venv)[:, None]           # duck ≈ −9 dB under the voice

# ---------------- foley (procedural)
fx = np.zeros((NS, 2))
def click(n=0.03): m = int(n * SR); return hp(noise(m), 2500) * env(m, 0.0005, 0.004)
def tick(accent=False):
    m = int(0.09 * SR); f = 1650 if accent else 1250
    return (np.sin(2 * np.pi * f * tax(m)) * env(m, 0.001, 0.018) + 0.5 * click(0.09)) * (1.4 if accent else 1.0)
def toggle(): m = int(0.12 * SR); return click(0.12) * 1.2 + 0.6 * np.sin(2 * np.pi * 180 * tax(m)) * env(m, 0.001, 0.025)
def powerdown(): m = int(0.4 * SR); return sweep(m, 900, 160) * env(m, 0.005, 0.12) * 0.5
def powerup(f0=420): m = int(0.3 * SR); return sweep(m, f0, f0 * 2.4) * env(m, 0.004, 0.09) * 0.5
def shutter(): m = int(0.08 * SR); return (hp(noise(m), 1800) * env(m, 0.0005, 0.012) + 0.4 * lp(noise(m), 500) * env(m, 0.001, 0.02))
def paper(): m = int(0.32 * SR); tt = tax(m); return lp(hp(noise(m), 1200), 6000) * np.sin(np.pi * tt / (m / SR)) ** 2 * 0.5
def marker(): m = int(0.42 * SR); tt = tax(m); return lp(hp(noise(m), 2500), 7000) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt)) * np.sin(np.pi * tt / (m / SR)) * 0.25
def scratch(d=0.45): m = int(d * SR); tt = tax(m); return lp(hp(noise(m), 1800), 5000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * tt))) * np.sin(np.pi * tt / (m / SR)) * 0.3
def mallet(f): m = int(0.5 * SR); tt = tax(m); return (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 3.9 * f * tt) * np.exp(-tt / 0.05)) * env(m, 0.001, 0.16)
def thock(): m = int(0.25 * SR); return sweep(m, 140, 70) * env(m, 0.002, 0.06) * 0.8
# clock: one tick per event second while the clock runs (accent every 5); silent while frozen (L2) and after it stops
t0 = TL['clock']['t0']
for n in range(-1, 40):
    tt_ = t0 + n
    if tt_ < 0 or tt_ >= 18.5: continue
    if 5.5 <= tt_ < 9.5: continue
    if E['freezeCompare'] <= tt_ < 12.5: continue
    place(fx, tick(n % 5 == 0 and n > 0), tt_, 0.10, 0.62)
cues = [(toggle(), E['airplaneOn'], 0.55, 0.6), (powerdown(), E['airplaneOn'] + 0.03, 0.35, 0.45),
        (scratch(0.4), E['airplaneOn'] + 0.06, 0.18, 0.6), (shutter(), E['brickGhost'], 0.35, 0.5), (scratch(0.3), E['brickStrike'], 0.32, 0.5),
        (mallet(midi(81)), E['brickStrike'] + 0.35, 0.12, 0.6), (scratch(0.5), E['circleCell'], 0.25, 0.45),
        (shutter(), 5.5, 0.3, 0.5), (paper(), E['srcA'], 0.35, 0.4), (marker(), E['srcA'] + 0.35, 0.35, 0.4), (paper(), E['srcB'], 0.35, 0.6), (marker(), E['srcB'] + 0.35, 0.35, 0.6),
        (scratch(0.6), E['srcB'] + 0.6, 0.15, 0.3), (scratch(0.5), E['diffBracket'], 0.25, 0.65),
        (shutter(), 9.5, 0.3, 0.5), (toggle(), E['wifiOn'], 0.55, 0.6), (powerup(420), E['wifiOn'] + 0.03, 0.3, 0.6), (toggle(), E['btOn'], 0.55, 0.7), (powerup(560), E['btOn'] + 0.03, 0.3, 0.7),
        (thock(), E['freezeCompare'], 0.45, 0.5), (scratch(0.5), E['freezeCompare'] + 0.05, 0.25, 0.45),
        (shutter(), 12.5, 0.3, 0.5), (shutter(), E['phonesLink'] - 0.15, 0.25, 0.7), (powerup(500), E['phonesLink'], 0.22, 0.7),
        (shutter(), E['apLink'] - 0.15, 0.25, 0.7), (powerup(620), E['apLink'], 0.22, 0.7),
        (mallet(midi(81)), E['works'], 0.12, 0.7), (mallet(midi(84)), E['works'] + 0.12, 0.12, 0.7), (scratch(0.7), E['allowGate'], 0.22, 0.7),
        (paper(), E['allowGate'] + 0.15, 0.3, 0.45), (marker(), E['allowGate'] + 0.4, 0.35, 0.45),
        (shutter(), 18.5, 0.3, 0.5), (mallet(midi(74)), E['leaderCell'], 0.11, 0.4), (mallet(midi(77)), E['leaderWifi'], 0.11, 0.55), (mallet(midi(81)), E['leaderBt'], 0.11, 0.7),
        (scratch(0.7), E['leaderPlane'], 0.18, 0.35), (shutter(), E['ghostSwitch'], 0.3, 0.5), (scratch(0.3), E['strikeSwitch'], 0.32, 0.5),
        (shutter(), 23.0, 0.3, 0.5), (mallet(midi(81)), E['known1'], 0.12, 0.35), (mallet(midi(84)), E['known2'], 0.12, 0.4),
        (shutter(), E['dep1'], 0.18, 0.6), (shutter(), E['dep2'], 0.18, 0.6), (scratch(0.5), E['checkRing'], 0.25, 0.5),
        (shutter(), 27.5, 0.3, 0.5)]
for x_, tt_, gn, pn in cues: place(fx, x_, tt_, gn, pn)
fx *= fade[:, None]
voice = np.stack([narr, narr], axis=1)
mix = voice + mus * 1.0 + fx * 0.85
mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
for name, x_ in (('narration', narr), ('music', mus), ('sfx', fx), ('mix_prenorm', mix)): write(os.path.join(ROOT, 'audio', f'{name}.wav'), x_)
print('narration windows', lines); print('mix peak', round(float(np.max(np.abs(mix))), 3))
