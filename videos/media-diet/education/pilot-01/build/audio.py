"""Build all audio for pilot 01 from code: narration placement, original synthesized music + SFX, mix, lip-sync envelope.

Usage: python build/audio.py            (run from the pilot-01 folder after build/narration.py)
Inputs : src/timeline.json, audio/narration/<id>.wav (committed Piper takes, see narration.py)
Outputs: audio/narration.wav, audio/music.wav, audio/sfx.wav, audio/mix_prenorm.wav,
         src/data/mouth.json (per-frame mouth openness), src/data/lines.json (line durations)
All music and SFX are synthesized here (no samples, no third-party audio).
"""
import json, os, wave, math
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
SR = 48000
DUR = TL['duration']
NS = int(round(DUR * SR))
FPS = TL['fps']
rng = np.random.default_rng(20261102)   # fixed seed => reproducible

def write_wav(path, x):
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 1: x = x[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(pcm.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def t_axis(n): return np.arange(n) / SR
def env_ad(n, a, d):
    """attack (s) then exponential decay with time-constant d (s)"""
    t = t_axis(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d); return e
def lowpass(x, fc):
    a = math.exp(-2 * math.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y
def lp_fast(x, fc):
    # vectorised one-pole via scipy-free recursion on blocks (good enough: uses cumulative trick with exp kernel)
    a = math.exp(-2 * math.pi * fc / SR)
    n = len(x); k = np.arange(min(n, int(SR * 0.05)))
    ker = (1 - a) * a ** k
    return np.convolve(x, ker)[:n]
def hp_fast(x, fc): return x - lp_fast(x, fc)
def bandnoise(n, f0, f1):
    """noise swept band (rough): highpass(lowpass(noise))"""
    w = rng.standard_normal(n)
    return hp_fast(lp_fast(w, f1), f0)
def sweep(n, f0, f1, shape='exp'):
    t = t_axis(n); T = n / SR
    f = f0 * (f1 / f0) ** (t / T) if shape == 'exp' else f0 + (f1 - f0) * t / T
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ SFX library (all synthesized)
def sfx(name, pitch=1.0):
    p = pitch
    if name == 'beamDraw':
        n = int(1.1 * SR); t = t_axis(n)
        s = sweep(n, 520 * p, 1500 * p) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)) * np.minimum(1, t / 0.05) * np.exp(-t / 0.7)
        return 0.22 * s
    if name == 'step':
        n = int(0.09 * SR); return 0.35 * lp_fast(rng.standard_normal(n), 300) * env_ad(n, 0.003, 0.03) * 3
    if name == 'cut':
        n = int(0.14 * SR); return 0.08 * bandnoise(n, 2000, 7000) * env_ad(n, 0.01, 0.04)
    if name == 'rise':
        n = int(0.75 * SR); t = t_axis(n)
        s = 0.5 * bandnoise(n, 150, 900) * np.minimum(1, t / 0.5) * np.exp(-np.maximum(0, t - 0.5) / 0.08)
        s += 0.35 * sweep(n, 55, 140) * np.minimum(1, t / 0.3) * np.exp(-np.maximum(0, t - 0.45) / 0.12)
        return 0.5 * s
    if name == 'shatter':
        n = int(0.7 * SR); out = np.zeros(n)
        for k in range(14):
            st = int(rng.uniform(0, 0.35) * SR); m = int(0.18 * SR); f = rng.uniform(2200, 5200)
            seg = np.sin(2 * np.pi * f * t_axis(m)) * env_ad(m, 0.001, 0.035)
            out[st:st + m] += seg[:max(0, min(m, n - st))] * rng.uniform(0.4, 1)
        return 0.13 * out
    if name == 'stomp':
        n = int(0.22 * SR); t = t_axis(n)
        s = sweep(n, 140, 45) * env_ad(n, 0.002, 0.07) + 0.6 * bandnoise(n, 1500, 6000) * env_ad(n, 0.001, 0.008)
        return 0.6 * s
    if name in ('whooshUp', 'whoosh'):
        n = int((0.45 if name == 'whooshUp' else 0.38) * SR); t = t_axis(n); T = n / SR
        s = bandnoise(n, 400, 3000) * np.sin(np.pi * t / T) ** 2
        return (0.32 if name == 'whoosh' else 0.26) * s
    if name == 'bloop':
        n = int(0.11 * SR); return 0.25 * sweep(n, 480 * p, 900 * p) * env_ad(n, 0.004, 0.045)
    if name == 'catch':
        n = int(0.12 * SR); return 0.35 * (np.sin(2 * np.pi * 190 * t_axis(n)) * env_ad(n, 0.002, 0.04) + 0.3 * lp_fast(rng.standard_normal(n), 900) * env_ad(n, 0.001, 0.02))
    if name == 'lampOn':
        n = int(0.05 * SR); return 0.22 * bandnoise(n, 3000, 9000) * env_ad(n, 0.0005, 0.006)
    if name == 'scan':
        n = int(0.32 * SR); t = t_axis(n); out = np.zeros(n)
        for st, f in ((0.0, 1320), (0.14, 1760)):
            a = int(st * SR); m = int(0.08 * SR); seg = np.sin(2 * np.pi * f * t_axis(m)) + 0.25 * np.sin(2 * np.pi * 3 * f * t_axis(m))
            out[a:a + m] += seg * env_ad(m, 0.003, 0.03)
        return 0.13 * out
    if name == 'hop':
        n = int(0.16 * SR); s = sweep(n, 380 * p, 1050 * p) * env_ad(n, 0.003, 0.055)
        return 0.24 * s + 0.08 * bandnoise(n, 2000, 8000) * env_ad(n, 0.001, 0.006)
    if name == 'slot':
        n = int(0.25 * SR); return 0.45 * (np.sin(2 * np.pi * 95 * t_axis(n)) * env_ad(n, 0.002, 0.06) + 0.5 * bandnoise(n, 600, 3000) * env_ad(n, 0.001, 0.03))
    if name == 'land':
        n = int(0.2 * SR); return 0.55 * (sweep(n, 110, 48) * env_ad(n, 0.002, 0.06) + 0.4 * lp_fast(rng.standard_normal(n), 500) * env_ad(n, 0.001, 0.03) * 2)
    if name == 'chatter':
        n = int(1.0 * SR); out = np.zeros(n)
        for k in range(26):
            st = int(rng.uniform(0, 0.9) * SR); m = int(0.03 * SR); f = rng.choice([1800, 2400, 2700, 3200])
            out[st:st + m] += np.sin(2 * np.pi * f * t_axis(m)) * env_ad(m, 0.002, 0.008)
        return 0.06 * out
    if name == 'stamp':
        n = int(0.5 * SR); out = np.zeros(n)
        for d in (0.0, 0.12, 0.24):
            a = int(d * SR); m = int(0.12 * SR)
            seg = 0.7 * bandnoise(m, 800, 5000) * env_ad(m, 0.001, 0.015) + np.sin(2 * np.pi * 160 * t_axis(m)) * env_ad(m, 0.001, 0.03)
            out[a:a + m] += seg
        return 0.32 * out
    if name == 'pop':
        n = int(0.09 * SR); return 0.28 * sweep(n, 300 * p, 760 * p) * env_ad(n, 0.002, 0.03)
    if name == 'zip':
        n = int(0.32 * SR); t = t_axis(n)
        return 0.22 * (bandnoise(n, 2500, 8000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * t))) * np.exp(-t / 0.18) + 0.5 * sweep(n, 600, 1800) * np.exp(-t / 0.15))
    if name == 'tap':
        n = int(0.08 * SR); return 0.22 * np.sin(2 * np.pi * 880 * p * t_axis(n)) * env_ad(n, 0.001, 0.02)
    if name == 'assemble':
        n = int(0.5 * SR); out = np.zeros(n)
        for k, m_ in enumerate((77, 81, 84, 89)):
            a = int(k * 0.06 * SR); m = int(0.3 * SR); f = midi(m_)
            out[a:a + m] += (np.sin(2 * np.pi * f * t_axis(m)) + 0.3 * np.sin(2 * np.pi * 2 * f * t_axis(m))) * env_ad(m, 0.002, 0.09)
        return 0.11 * out
    if name == 'chime':
        n = int(1.2 * SR); out = np.zeros(n)
        for st, m_ in ((0.0, 84), (0.13, 91)):
            a = int(st * SR); m = n - a; f = midi(m_); tt = t_axis(m)
            out[a:] += (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt / 0.15) + 0.2 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt / 0.06)) * env_ad(m, 0.002, 0.45)
        return 0.13 * out
    if name == 'tick':
        n = int(0.1 * SR); f = 1400 * p; return 0.12 * (np.sin(2 * np.pi * f * t_axis(n)) + 0.3 * np.sin(2 * np.pi * 2 * f * t_axis(n))) * env_ad(n, 0.001, 0.025)
    if name == 'sparkle':
        n = int(0.7 * SR); out = np.zeros(n)
        for k in range(9):
            a = int(k * 0.045 * SR); m = int(0.25 * SR); f = midi(84 + [0, 4, 7, 12, 16, 19, 24, 19, 24][k])
            out[a:a + m] += np.sin(2 * np.pi * f * t_axis(m)) * env_ad(m, 0.002, 0.06)
        return 0.07 * out
    raise ValueError(name)

# ------------------------------------------------------------------ narration
narr = np.zeros(NS)
lines_meta = []
for line in TL['narration']:
    with wave.open(os.path.join(ROOT, 'audio', 'narration', f"{line['id']}.wav")) as w:
        assert w.getframerate() == SR
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32767
    st = int(round(line['start'] * SR))
    end = min(NS, st + len(a))
    narr[st:end] += a[:end - st]
    lines_meta.append({'id': line['id'], 'start': line['start'], 'duration': round(len(a) / SR, 3), 'end': round(line['start'] + len(a) / SR, 3), 'text': line['text']})
    assert st + len(a) <= NS - int(0.3 * SR), f"line {line['id']} runs too close to the end"
for i in range(len(lines_meta) - 1):
    assert lines_meta[i]['end'] + 0.1 < lines_meta[i + 1]['start'], f"overlap {lines_meta[i]['id']}"
narr *= 0.89 / max(1e-6, np.max(np.abs(narr)))      # peak -1 dBFS before mixing

# per-frame mouth openness for lip-sync (RMS, fast attack / slower release)
win = int(SR / FPS)
nf = int(round(DUR * FPS))
rms = np.array([np.sqrt(np.mean(narr[max(0, int(f * SR / FPS) - win // 2): int(f * SR / FPS) + win // 2] ** 2) + 1e-12) for f in range(nf)])
ref = np.percentile(rms[rms > 1e-3], 92) if np.any(rms > 1e-3) else 1
m = np.clip((rms / ref - 0.06) / 0.94, 0, 1) ** 0.7
sm = np.zeros(nf); acc = 0
for f in range(nf):
    acc = m[f] if m[f] > acc else acc * 0.55 + m[f] * 0.45
    sm[f] = acc
os.makedirs(os.path.join(ROOT, 'src', 'data'), exist_ok=True)
json.dump([round(float(x), 3) for x in sm], open(os.path.join(ROOT, 'src', 'data', 'mouth.json'), 'w'))
json.dump(lines_meta, open(os.path.join(ROOT, 'src', 'data', 'lines.json'), 'w'), indent=1)

# voice envelope for ducking (smoothed)
venv = lp_fast(np.abs(narr), 6.0); venv = np.clip(venv / (np.max(venv) + 1e-9) * 2.2, 0, 1)

# ------------------------------------------------------------------ music (original, synthesized; 120 BPM)
BPM = 120; beat = 60 / BPM
t = t_axis(NS)
music = np.zeros((NS, 2))
chords = [  # (start, end, midi notes)  D dorian-ish, curious and light
    (0.0, 2.65, [50, 57, 60, 64, 69]),     # Dm9 (no 3rd doubled)
    (2.65, 4.65, [46, 53, 57, 62, 65]),    # Bbmaj7/add
    (4.65, 6.32, [45, 52, 57, 60, 64]),    # Am7
    (6.32, 8.32, [50, 57, 62, 65, 69]),    # Dm
    (8.32, 10.32, [46, 53, 58, 62, 65]),   # Bb
    (10.32, 12.25, [48, 55, 60, 64, 67]),  # C
    (12.25, 15.0, [41, 53, 57, 60, 67]),   # Fadd9 (resolve)
]
def pad_voice(f, n):
    tt = t_axis(n)
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.003 * tt + 1) + 0.25 * np.sin(2 * np.pi * 2 * f * tt) + 0.12 * np.sin(2 * np.pi * 3.01 * f * tt))
for (a, b, notes) in chords:
    s0, s1 = int(a * SR), int(min(DUR, b + 0.35) * SR)
    n = s1 - s0
    e = np.minimum(1, t_axis(n) / 0.25) * np.minimum(1, np.maximum(0, (n / SR - t_axis(n)) / 0.35))
    for k, nt in enumerate(notes):
        v = pad_voice(midi(nt), n) * e * (0.05 if k else 0.07)
        pan = 0.5 + (k - 2) * 0.12
        music[s0:s1, 0] += v * (1 - pan) * 1.2; music[s0:s1, 1] += v * pan * 1.2
# bass on beats 1 and 3 from the first cut
for (a, b, notes) in chords:
    x = max(a, 2.65)
    while x < min(b, 14.9):
        if x >= 2.65:
            n = int(0.45 * SR); s0 = int(x * SR); f = midi(notes[0] - 12 if notes[0] > 45 else notes[0])
            v = (np.sin(2 * np.pi * f * t_axis(n)) + 0.3 * np.sin(2 * np.pi * 2 * f * t_axis(n))) * env_ad(n, 0.005, 0.18) * 0.16
            e = min(NS, s0 + n); music[s0:e, 0] += v[:e - s0]; music[s0:e, 1] += v[:e - s0]
        x += 2 * beat
# plucked arpeggio (16ths) with section-dependent density
for (a, b, notes) in chords:
    step = beat / 4; x = a; k = 0
    while x < b - 1e-6:
        dens = 0 if x < 0.6 else (0.5 if x < 2.65 else (0.75 if x < 6.32 else (1.0 if x < 11.0 else (0.0 if x < 12.25 else 0.5))))
        if (k % 4 == 0 and dens >= 0.5) or (k % 2 == 0 and dens >= 0.75) or (dens >= 1.0):
            nt = notes[[1, 2, 3, 4, 3, 2][k % 6]] + 12
            n = int(0.22 * SR); s0 = int(x * SR); f = midi(nt)
            v = (np.sin(2 * np.pi * f * t_axis(n)) + 0.4 * np.sin(2 * np.pi * 2 * f * t_axis(n))) * env_ad(n, 0.002, 0.07) * 0.06
            pan = 0.3 + 0.4 * ((k * 7) % 5) / 4
            e = min(NS, s0 + n); music[s0:e, 0] += v[:e - s0] * (1 - pan) * 2; music[s0:e, 1] += v[:e - s0] * pan * 2
        x += step; k += 1
# soft kick + hats during the journey (6.32 - 11.0)
x = 6.32
while x < 11.0:
    n = int(0.18 * SR); s0 = int(x * SR)
    kick = sweep(n, 110, 42) * env_ad(n, 0.002, 0.06) * 0.22
    music[s0:s0 + n, 0] += kick; music[s0:s0 + n, 1] += kick
    for h in (0.5, ):
        hs = int((x + h * beat) * SR); m = int(0.05 * SR)
        hat = bandnoise(m, 6000, 12000) * env_ad(m, 0.001, 0.012) * 0.05
        music[hs:hs + m, 0] += hat * 0.8; music[hs:hs + m, 1] += hat * 1.2
    x += beat
# gentle fade at the very end
fade = np.ones(NS); fs = int(14.55 * SR); fade[fs:] = np.linspace(1, 0, NS - fs) ** 1.5
music *= fade[:, None]
# duck under narration
music *= (1 - 0.5 * venv)[:, None]

# ------------------------------------------------------------------ SFX track
sfxt = np.zeros((NS, 2))
pans = {'hop': 0.65, 'tick': 0.55, 'pop': 0.6, 'tap': 0.45, 'bloop': 0.4}
for cue in TL['sfx']:
    x = sfx(cue['name'], cue.get('pitch', 1.0))
    s0 = int(round(cue['t'] * SR)); e = min(NS, s0 + len(x))
    pan = pans.get(cue['name'], 0.5)
    sfxt[s0:e, 0] += x[:e - s0] * (1 - pan) * 2 * 0.9; sfxt[s0:e, 1] += x[:e - s0] * pan * 2 * 0.9
sfxt *= fade[:, None] * 0.999 + (1 - fade[:, None]) * 0.0

# ------------------------------------------------------------------ mix
voice = np.stack([narr, narr], axis=1)
mix = voice * 1.0 + music * 0.85 + sfxt * 0.9
# limit gently (soft clip near full scale; loudnorm in ffmpeg follows)
peak = np.max(np.abs(mix))
mix = mix / max(1.0, peak / 0.97)
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
write_wav(os.path.join(ROOT, 'audio', 'narration.wav'), narr)
write_wav(os.path.join(ROOT, 'audio', 'music.wav'), music)
write_wav(os.path.join(ROOT, 'audio', 'sfx.wav'), sfxt)
write_wav(os.path.join(ROOT, 'audio', 'mix_prenorm.wav'), mix)
print('narration lines:', [(l['id'], l['start'], l['end']) for l in lines_meta])
print('mix peak before norm:', round(float(peak), 3), 'samples:', NS, 'duration:', NS / SR)
