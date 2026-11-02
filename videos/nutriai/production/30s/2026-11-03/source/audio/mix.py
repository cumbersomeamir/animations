"""CalMeter production 30 s (2026-11-03, pomegranate) audio: same accepted batch-02 sound design (guava #02). NEW soundtrack (user feedback: replace previous music completely):
voice-forward Kokoro narration (cached takes), a very quiet original warm ambient bed with no beat or repeating figure,
and subtle event-linked fruit-slicing / page / pencil foley. Everything synthesized here (no samples).
Output: build/mix.wav (exactly 30.000 s, 48 kHz stereo) and build/voice.wav. Loudness normalised afterwards (FFmpeg loudnorm)."""
import json, os, wave
import numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json')))
SR = 48000; DUR = TL['frames'] / TL['fps']; N = int(round(SR * DUR)); rng = np.random.default_rng(31)
E = TL['events']; fs = lambda fr: fr / TL['fps']; tt = lambda d: np.arange(int(d * SR)) / SR; db = lambda v: 10 ** (v / 20)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, btype='low', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def place(buf, x, t0, pan=0.0, g=1.0):
    i = int(round(t0 * SR)); x = x[: max(0, N - i)]
    buf[i:i + len(x), 0] += x * g * np.cos((pan + 1) * np.pi / 4) * 1.41; buf[i:i + len(x), 1] += x * g * np.sin((pan + 1) * np.pi / 4) * 1.41

# ---------------- ambient bed: slowly cross-fading warm chords (sine + soft detuned partials), low-passed air, no rhythm
bed = np.zeros((N, 2)); x = np.arange(N) / SR
TR = 2 ** (-2 / 12)   # same accepted chord bed, transposed down a whole step so this episode has its own bed
chords = [(0.0, [146.83, 220.0, 277.18, 329.63]),     # (C) maj9 colour
          (7.5, [123.47, 185.0, 246.94, 293.66]),     # (A) minor 7
          (15.0, [110.0, 164.81, 220.0, 277.18, 329.63]),  # (G) add9
          (22.5, [130.81, 196.0, 246.94, 329.63])]    # (Bb) maj7 warm resolve
chords = [(t, [n * TR for n in ns]) for t, ns in chords]
for ci, (t0, notes) in enumerate(chords):
    t1 = chords[ci + 1][0] if ci + 1 < len(chords) else DUR
    env = np.clip((x - (t0 - 2.5)) / 2.5, 0, 1) * np.clip(((t1 + 2.5) - x) / 2.5, 0, 1)
    for j, f in enumerate(notes):
        for det, pan in ((-0.0025, -0.5), (0.0025, 0.5)):
            ph = 2 * np.pi * f * (1 + det) * x + j
            tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
            trem = 0.85 + 0.15 * np.sin(2 * np.pi * (0.07 + 0.013 * j) * x + j)
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            bed[:, 0] += tone * env * trem * l / len(notes); bed[:, 1] += tone * env * trem * r / len(notes)
air = lp(noise(DUR), 900); air = air / np.max(np.abs(air))
bed += np.stack([air, np.roll(air, 2400)], 1) * 0.08
bed = np.stack([lp(bed[:, 0], 2200), lp(bed[:, 1], 2200)], 1)
fade = np.clip(x / 1.5, 0, 1) * np.clip((DUR - x) / 1.2, 0, 1); bed *= fade[:, None]
bed = bed / np.max(np.abs(bed)) * 0.09            # very quiet

# ---------------- foley
def sfx(kind, dur=None):
    if kind == 'slice':     # knife through firm fruit: short airy swish + wet crisp tear
        d = 0.5; n = int(d * SR); sw = bp(noise(d), 2500, 9000) * np.exp(-((np.linspace(0, 1, n) - 0.25) ** 2) / 0.02)
        tear = bp(noise(d), 900, 4000) * np.exp(-np.linspace(0, 1, n) * 9) * (np.linspace(0, 1, n) > 0.2)
        return sw * 0.8 + tear * 0.6
    if kind == 'juice':     # a couple of soft wet drips
        d = 0.6; out = np.zeros(int(d * SR))
        for t0 in (0.05, 0.27):
            i = int(t0 * SR); L = 0.08; fr = 650 + 500 * np.exp(-tt(L) / 0.015)
            b = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt(L) / 0.025); out[i:i + len(b)] += b
        return out
    if kind == 'page':      # paper sheet turned / laid
        d = 0.55; n = int(d * SR); env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
        return bp(noise(d), 600, 5000) * env * (0.7 + 0.3 * np.sin(np.linspace(0, 40, n)))
    if kind == 'pencil':    # graphite/burin micro-scratches
        d = dur or 1.5; out = np.zeros(int(d * SR))
        for k in range(int(d * 16)):
            i = int(rng.uniform(0, d - 0.08) * SR); L = rng.uniform(0.03, 0.07)
            s = bp(noise(L), 2500, 8000) * np.sin(np.pi * np.linspace(0, 1, int(L * SR))) ** 2; out[i:i + len(s)] += s * rng.uniform(0.4, 1)
        return out
    if kind == 'tick':      # a soft scribe tick as a roundel ring closes
        d = 0.12; return bp(noise(d), 2000, 7000) * np.exp(-tt(d) / 0.01) + np.sin(2 * np.pi * 2200 * tt(d)) * np.exp(-tt(d) / 0.03) * 0.3
    if kind == 'thud':      # fruit set down on the pan
        d = 0.35; fr = 140 * np.exp(-tt(d) / 0.08) + 60; return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt(d) / 0.07) + lp(noise(d), 600) * np.exp(-tt(d) / 0.02) * 0.6
    if kind == 'creak':     # beam tips
        d = 0.45; xx = tt(d); fr = 160 + 40 * np.sin(2 * np.pi * 2.5 * xx); saw = 2 * ((np.cumsum(fr) / SR) % 1) - 1
        return bp(saw, 300, 1600) * np.sin(np.pi * xx / d)
    if kind == 'tear':      # peel lifted away from the arils: soft fibrous tear
        d = 0.45; n = int(d * SR); env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
        crack = np.zeros(n); idx = rng.integers(0, n, 40); crack[idx] = rng.uniform(0.3, 1, 40)
        return bp(noise(d), 700, 3500) * env * 0.6 + bp(crack, 1500, 6000) * 3
    if kind == 'patter':    # arils landing on the pan: a run of tiny soft wet clicks
        d = dur or 1.0; out = np.zeros(int(d * SR))
        for k in range(int(d * 18)):
            i = int(rng.uniform(0, d - 0.05) * SR); L = 0.03; fr = 1300 + rng.uniform(-200, 300)
            b = np.sin(2 * np.pi * fr * tt(L)) * np.exp(-tt(L) / 0.006) + bp(noise(L), 2000, 6000) * np.exp(-tt(L) / 0.004) * 0.5; out[i:i + len(b)] += b * rng.uniform(0.4, 1)
        return out
    if kind == 'clink':     # small glass set down
        d = 0.6; xx = tt(d); return (np.sin(2 * np.pi * 2350 * xx) + 0.6 * np.sin(2 * np.pi * 3720 * xx) + 0.3 * np.sin(2 * np.pi * 5200 * xx)) * np.exp(-xx / 0.12) + bp(noise(d), 3000, 8000) * np.exp(-xx / 0.005)
    raise ValueError(kind)
fx = np.zeros((N, 2))
for c in TL['sfx']:
    s = sfx(c['type'], c.get('dur')); s = s / (np.max(np.abs(s)) + 1e-9)
    place(fx, s, fs(E[c['ev']]), pan=0.1, g=db(c['gain']))
# ---------------- voice
vo = np.zeros((N, 2))
for v in TL['voice']:
    with wave.open(os.path.join(HERE, 'voice-takes', v['id'] + '.wav')) as w:
        sr = w.getframerate(); s = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768
    place(vo, signal.resample_poly(s, SR, sr), v['at'], g=0.85)
env = signal.sosfilt(signal.butter(1, 4, fs=SR, output='sos'), np.abs(vo[:, 0])); env = np.clip(env / env.max() * 3, 0, 1)
mix = vo + bed * (1 - 0.5 * env)[:, None] + fx * (1 - 0.3 * env)[:, None]
pk = np.max(np.abs(mix)); mix = mix / pk * db(-3)
os.makedirs(os.path.join(HERE, '..', 'build'), exist_ok=True)
for name, sig in (('mix.wav', mix), ('voice.wav', vo / pk * db(-3))):
    with wave.open(os.path.join(HERE, '..', 'build', name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok', N / SR)
