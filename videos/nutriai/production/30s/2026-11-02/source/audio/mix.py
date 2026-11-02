"""Production 30 s #01 audio: Kokoro narration (cached takes) + original quiet harpsichord-like music + printmaking foley.
All music/SFX synthesized here (no samples). Voice placement from ../timeline.json. Output build/mix.wav (exactly 30.000 s,
48 kHz stereo) + build/voice.wav (stem for the ASR check). Loudness is normalised afterwards with FFmpeg loudnorm."""
import json, os, wave
import numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json')))
SR, DUR = 48000, TL['frames'] / TL['fps']; N = int(round(SR * DUR)); rng = np.random.default_rng(11)
E = TL['events']; fs = lambda fr: fr / TL['fps']
tt = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi): return signal.sosfilt(signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
def place(buf, x, t0, pan=0.0, g=1.0):
    i = int(round(t0 * SR)); x = x[: max(0, N - i)]
    buf[i:i + len(x), 0] += x * g * np.cos((pan + 1) * np.pi / 4) * 1.41; buf[i:i + len(x), 1] += x * g * np.sin((pan + 1) * np.pi / 4) * 1.41
def bell(f, d, tau): x = tt(d); return sum(a * np.sin(2 * np.pi * f * k * x) * np.exp(-x / (tau / (1 + 0.6 * k))) for k, a in ((1, 1), (2.76, 0.3), (5.4, 0.1)))
def pluck(f, d=0.7, tau=0.35):   # dry harpsichord-like pluck
    x = tt(d); return sum((1 / k) * np.sin(2 * np.pi * f * k * x) * np.exp(-x / (tau / k ** 0.5)) for k in range(1, 8)) * np.minimum(1, x / 0.002)
def noise(d): return rng.standard_normal(int(d * SR))
db = lambda v: 10 ** (v / 20)

def sfx(kind, dur=None, pitch=1.0):
    if kind == 'burin':      # micro-scratches, denser each pass
        d = dur or 2.0; out = np.zeros(int(d * SR))
        for k in range(int(d * 22)):
            t0 = rng.uniform(0, d - 0.1); L = rng.uniform(0.03, 0.09)
            s = bp(noise(L), 3000, 9000) * np.sin(np.pi * np.linspace(0, 1, int(L * SR))) ** 2
            i = int(t0 * SR); out[i:i + len(s)] += s * rng.uniform(0.4, 1.0)
        return out
    if kind == 'scrape':     # the long cut
        d = 0.45; return bp(noise(d), 2500, 8000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 0.7 + bell(3200, d, 0.15) * 0.15
    if kind == 'rub':        # burnisher
        d = dur or 0.6; x = tt(d); return bp(noise(d), 300, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x)) * np.sin(np.pi * x / d)
    if kind == 'plip':       # water plip as the wash blooms
        d = 0.35; f = 700 * np.exp(-tt(d) / 0.02) + 900; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt(d) / 0.06) * 0.6 + bp(noise(d), 1500, 5000) * np.exp(-tt(d) / 0.15) * 0.2
    if kind == 'ting':       # scribed ring
        return bell(1568 * pitch, 1.0, 0.35)
    if kind == 'clink':      # balance comes level
        return bell(1046.5, 0.8, 0.25) + bell(1318.5, 0.8, 0.2) * 0.5
    if kind == 'sheet':      # a sheet laid down
        d = 0.4; return bp(noise(d), 400, 3000) * np.hanning(int(d * SR))
    if kind == 'letters':    # letters cut: little ticks
        d = dur or 0.8; out = np.zeros(int(d * SR))
        for k in range(int(d * 14)):
            i = int((k / (d * 14)) * (d - 0.02) * SR); s = bp(noise(0.012), 3000, 9000) * np.hanning(int(0.012 * SR)); out[i:i + len(s)] += s
        return out
    raise ValueError(kind)

fx = np.zeros((N, 2))
for c in TL['sfx']:
    x = sfx(c['type'], c.get('dur'), c.get('pitch', 1.0)); x = x / (np.max(np.abs(x)) + 1e-9)
    place(fx, x, fs(E[c['ev']]), pan=0.15, g=db(c['gain']))
# music: dry plucked line while lines are cut; a soft held chord when the colour arrives; resolve at the end
mus = np.zeros((N, 2))
D = [293.66, 369.99, 440.0, 587.33, 554.37, 440.0, 369.99, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63, 277.18, 329.63]
step = 0.36
for i, t in enumerate(np.arange(0.15, DUR - 1.2, step)):
    place(mus, pluck(D[i % len(D)] * 2, 0.6), t, pan=0.35 if i % 2 else -0.35, g=0.035)
    if i % 4 == 0: place(mus, pluck(D[(i // 4) % 4] / 2, 1.4, 0.6), t, g=0.05)
for t0, chord in ((fs(E['washWhole']), (293.66, 369.99, 440.0)), (fs(E['washFlesh']), (329.63, 415.3, 493.88)), (fs(E['portionGlow']), (293.66, 369.99, 440.0, 587.33))):
    x = tt(3.0); pad = sum(np.sin(2 * np.pi * f * x) + 0.25 * np.sin(4 * np.pi * f * x) for f in chord) / len(chord)
    place(mus, pad * np.minimum(1, x / 0.6) * np.exp(-x / 1.6), t0, g=0.06)
place(mus, sum(pluck(f, 2.5, 0.9) for f in (293.66, 369.99, 440.0, 587.33)) / 4, fs(E['credits']) + 0.4, g=0.12)
fade = np.ones(N); fade[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)); mus *= fade[:, None]
# voice (cached Kokoro takes)
vo = np.zeros((N, 2))
for v in TL['voice']:
    with wave.open(os.path.join(HERE, 'voice-takes', v['id'] + '.wav')) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768
    x = signal.resample_poly(x, SR, sr)
    place(vo, x, v['at'], g=0.8)
env = signal.sosfilt(signal.butter(1, 5, fs=SR, output='sos'), np.abs(vo[:, 0])); env = np.clip(env / env.max() * 3, 0, 1)
mix = vo + mus * (1 - 0.55 * env)[:, None] + fx * (1 - 0.35 * env)[:, None]
pk = np.max(np.abs(mix)); mix = mix / pk * db(-3)
os.makedirs(os.path.join(HERE, '..', 'build'), exist_ok=True)
for name, sig in (('mix.wav', mix), ('voice.wav', vo / pk * db(-3))):
    with wave.open(os.path.join(HERE, '..', 'build', name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(sig, -1, 1) * 32767).astype(np.int16).tobytes())
print('ok', N / SR)
