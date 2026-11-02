"""Original music + gesture SFX (synthesized, no samples) + Kokoro narration -> build/mix.wav (exactly 10.000 s, 48 kHz stereo)."""
import wave, numpy as np
from scipy import signal
SR, DUR = 48000, 10.0; N = int(SR * DUR); rng = np.random.default_rng(5)
tt = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi): return signal.sosfilt(signal.butter(2, [lo, hi], btype='band', fs=SR, output='sos'), x)
def place(buf, x, t0, pan=0.0, g=1.0):
    i = int(t0 * SR); x = x[: max(0, N - i)]
    buf[i:i + len(x), 0] += x * g * np.cos((pan + 1) * np.pi / 4) * 1.41; buf[i:i + len(x), 1] += x * g * np.sin((pan + 1) * np.pi / 4) * 1.41
def bell(f, d, tau): x = tt(d); return sum(a * np.sin(2 * np.pi * f * k * x) * np.exp(-x / (tau / (1 + 0.6 * k))) for k, a in ((1, 1), (2.76, 0.35), (5.4, 0.12)))
def pluck(f, d=0.6):  # harpsichord-like: bright decaying partials
    x = tt(d); return sum((1 / k) * np.sin(2 * np.pi * f * k * x) * np.exp(-x / (0.35 / k ** 0.5)) for k in range(1, 7)) * np.minimum(1, x / 0.003)
mus = np.zeros((N, 2)); fx = np.zeros((N, 2))
notes = [293.66, 369.99, 440.0, 554.37, 440.0, 369.99, 329.63, 392.0, 493.88, 392.0, 329.63, 277.18]  # D major / A arpeggios
step = 0.32
for i, t in enumerate(np.arange(0.2, DUR - 0.5, step)):
    place(mus, pluck(notes[i % len(notes)]), t, pan=0.3 if i % 2 else -0.3, g=0.05)
    if i % 4 == 0: place(mus, pluck(notes[(i // 4) % 3 * 2] / 2, 1.2), t, g=0.05)
place(mus, sum(pluck(f, 2.4) for f in (293.66, 369.99, 440.0, 587.33)) / 4, 7.3, g=0.12)   # resolve after the takeaway
fade = np.ones(N); fade[-int(0.4 * SR):] = np.linspace(1, 0, int(0.4 * SR)); mus *= fade[:, None]
# burin scratches while the plate is cut (frames 0-76)
for k in range(28):
    t0 = 0.05 + k * 0.09 + rng.uniform(0, 0.03); d = rng.uniform(0.05, 0.12)
    s = bp(rng.standard_normal(int(d * SR)), 2500, 7000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2
    place(fx, s, t0, pan=rng.uniform(-0.3, 0.3), g=0.06)
place(fx, bp(rng.standard_normal(int(1.0 * SR)), 1500, 6000) * np.hanning(int(1.0 * SR)) * 0.6, 62 / 30, g=0.05)   # wash bloom
place(fx, bp(rng.standard_normal(int(0.7 * SR)), 400, 2500) * np.hanning(int(0.7 * SR)), 70 / 30, pan=0.4, g=0.10)  # lens glide
place(fx, bell(2093, 0.4, 0.08), 92 / 30, g=0.12)                       # lens lands / 60 kcal
place(fx, bell(1568, 0.8, 0.3), 92 / 30, g=0.10)
place(fx, bell(2349, 0.8, 0.3), 137 / 30, g=0.10)                      # 36 mg
with wave.open('audio/voice-take.wav') as w:
    vsr = w.getframerate(); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32768
v = signal.resample_poly(v, SR, vsr); vo = np.zeros((N, 2)); place(vo, v, 0.6, g=0.75)
env = signal.sosfilt(signal.butter(1, 6, fs=SR, output='sos'), np.abs(vo[:, 0])); env = np.clip(env / env.max() * 3, 0, 1)
mix = vo + mus * (1 - 0.6 * env)[:, None] + fx * (1 - 0.3 * env)[:, None]
mix = mix / np.max(np.abs(mix)) * 10 ** (-3 / 20)
with wave.open('build/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', N / SR)
