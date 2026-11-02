"""Original sound for the NutriAI 15 s shader test: synthesized music bed + SFX + Piper narration.

Everything is generated here from numpy/scipy oscillators and filtered noise (no samples).
Narration: Piper TTS (piper-tts 1.8.0) with the en_US-ljspeech-high voice (LJ Speech dataset is
public domain; rhasspy/piper-voices repo is MIT). Timing comes from ../timeline.json.

Usage: python build_audio.py <piper_model.onnx> <out_dir>
Writes: narration.wav, music.wav, sfx.wav, mix.wav (48 kHz stereo, exactly 15.000 s) and cues.json.
"""
import json, os, subprocess, sys, wave
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json')))
SR = 48000
FPS = TL['fps']
DUR = TL['frames'] / FPS
N = int(round(DUR * SR))
E = TL['events']
rng = np.random.default_rng(7)

def t_of(frame): return frame / FPS
def db(x): return 10 ** (x / 20)
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def tt(d): return np.arange(int(d * SR)) / SR

def place(buf, x, t0, pan=0.0, gain=1.0):
    i = int(round(t0 * SR))
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: buf[i:j] += x[: j - i] * gain

def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)
def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype='low', fs=SR, output='sos'), x)
def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, btype='high', fs=SR, output='sos'), x)
def sweep(f0, f1, d, curve='exp'):
    n = int(d * SR)
    f = f0 * (f1 / f0) ** np.linspace(0, 1, n) if curve == 'exp' else np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bell(freq, d, partials=((1, 1.0), (2.76, 0.45), (5.4, 0.22), (8.9, 0.08)), tau=0.5):
    x = tt(d)
    return sum(a * np.sin(2 * np.pi * freq * k * x) * np.exp(-x / (tau / (1 + 0.6 * k))) for k, a in partials)
def noise(d): return rng.standard_normal(int(d * SR))

# ---------------------------------------------------------------- SFX palette
def sfx(kind, pitch=1.0, dur=None):
    if kind == 'fall':
        d = 0.42; x = sweep(1500 * pitch, 520, d) * np.linspace(0.2, 1, int(d * SR)) ** 2 * 0.5
        return x + bp(noise(d), 2000, 6000) * 0.05 * np.linspace(0, 1, int(d * SR))
    if kind == 'impact':
        d = 0.9; s = sweep(95, 30, d) * env_exp(int(d * SR), 0.28)
        thump = lp(noise(d), 180) * env_exp(int(d * SR), 0.05) * 3.0
        click = hp(noise(0.012), 2000) * 0.6
        out = s + thump; out[: len(click)] += click
        return out
    if kind == 'splash':
        d = 0.55; x = bp(noise(d), 700, 6000) * env_exp(int(d * SR), 0.11)
        for _ in range(9):
            o = int(rng.uniform(0.03, 0.4) * SR); b = sweep(rng.uniform(500, 1100), rng.uniform(1300, 2600), 0.05) * env_exp(int(0.05 * SR), 0.015)
            x[o:o + len(b)] += b * 0.25
        return x
    if kind == 'bubbles':
        d = dur or 2.0; x = np.zeros(int(d * SR))
        for i in range(34):
            tpos = rng.uniform(0, d) ** 1.4 / d ** 0.4
            o = int(min(tpos, d - 0.1) * SR); L = rng.uniform(0.03, 0.08)
            b = sweep(rng.uniform(220, 520), rng.uniform(700, 1400), L) * env_exp(int(L * SR), L / 3)
            x[o:o + len(b)] += b * rng.uniform(0.15, 0.4) * (1 - tpos / d * 0.7)
        return x
    if kind == 'suck':
        d = dur or 0.8; n = int(d * SR); ramp = np.linspace(0, 1, n) ** 3
        x = bp(noise(d), 300, 3000) * ramp + sweep(180, 620, d) * ramp * 0.35
        x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
        return x
    if kind == 'tock':
        d = 0.25; x = tt(d)
        return (np.sin(2 * np.pi * 520 * x) + 0.5 * np.sin(2 * np.pi * 1310 * x)) * np.exp(-x / 0.045) + lp(noise(d), 900) * np.exp(-x / 0.01) * 0.5
    if kind == 'plop':
        d = 0.22; b = sweep(160 * pitch, 460 * pitch, d) * env_exp(int(d * SR), 0.06)
        return b + lp(noise(d), 1200) * env_exp(int(d * SR), 0.015) * 0.4
    if kind == 'chime':
        return bell(880 * pitch, 1.4, tau=0.7) * 0.5
    if kind == 'melt':
        d = dur or 1.1; n = int(d * SR); x = tt(d)
        glide = sweep(620, 140, d) * (1 + 0.3 * np.sin(2 * np.pi * 7 * x)) * np.exp(-x / 0.7)
        drip = bp(noise(d), 400, 2400) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * x)) * np.exp(-x / 0.5) * 0.4
        return (glide * 0.6 + drip) * np.minimum(1, x / 0.05)
    if kind == 'pour':
        d = dur or 0.8; x = tt(d)
        g = bp(noise(d), 300, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * x + 3 * np.sin(2 * np.pi * 3 * x)))
        return g * np.sin(np.pi * x / d)
    if kind == 'plink':
        d = 0.32; b = sweep(650 * pitch, 1750 * pitch, 0.03)
        body = np.concatenate([b, np.sin(2 * np.pi * 1750 * pitch * tt(d - 0.03)) * env_exp(int((d - 0.03) * SR), 0.05)])
        return body * 0.7 + bell(1320 * pitch, d, tau=0.25)[: len(body)] * 0.18
    if kind == 'swirl':
        d = dur or 1.2; n = int(d * SR); x = tt(d)
        # time-varying band: crossfade a stack of fixed bands from low to high
        out = np.zeros(n); bands = [(200, 500), (400, 1000), (800, 2000), (1600, 4000), (3000, 7000)]
        src = noise(d)
        for i, (lo, hi) in enumerate(bands):
            c = (i + 0.5) / len(bands); w = np.exp(-((x / d - c) ** 2) / 0.03)
            out += bp(src, lo, hi) * w
        return (out + sweep(200, 900, d) * 0.25) * np.linspace(0.3, 1, n) * (1 - np.linspace(0, 1, n) ** 8)
    if kind == 'bloom':
        d = 2.6; x = tt(d)
        notes = [220.0, 329.63, 440.0, 554.37, 659.25]
        pad = sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * 2 * f * x) for f in notes) / len(notes)
        pad *= np.minimum(1, x / 0.02) * np.exp(-x / 1.1)
        return pad * 0.9 + bell(1760, d, tau=0.9) * 0.25 + bp(noise(d), 4000, 12000) * np.exp(-x / 0.4) * 0.12
    if kind == 'pop':
        d = 0.12; return sweep(900, 360, d) * env_exp(int(d * SR), 0.03)
    if kind == 'click':
        d = 0.06; x = hp(noise(d), 1800) * env_exp(int(d * SR), 0.004)
        x[int(0.022 * SR):] += hp(noise(d - 0.022), 1500) * env_exp(int((d - 0.022) * SR), 0.003) * 0.7
        return x + sweep(1400, 900, d) * env_exp(int(d * SR), 0.01) * 0.3
    raise ValueError(kind)

# ---------------------------------------------------------------- music bed (original)
def music():
    out = np.zeros((N, 2))
    x = np.arange(N) / SR
    # chord plan follows the story: A (impact) -> B meals -> C water -> D resolve
    plan = [  # (start_s, notes Hz)
        (t_of(E['dropHit']), [110.0, 164.81, 220.0, 261.63, 329.63, 493.88]),      # Am(add9)
        (t_of(E['condense']), [87.31, 130.81, 174.61, 220.0, 261.63, 329.63]),      # Fmaj7
        (t_of(E['melt']), [130.81, 196.0, 261.63, 329.63, 392.0, 587.33]),          # C(add9)
        (t_of(E['vortex']), [98.0, 146.83, 196.0, 246.94, 293.66, 329.63]),         # G6
        (t_of(E['logoSnap']), [110.0, 164.81, 220.0, 277.18, 329.63, 493.88]),      # A(add9) resolve
    ]
    pad = np.zeros(N)
    for i, (s, notes) in enumerate(plan):
        e = plan[i + 1][0] if i + 1 < len(plan) else DUR
        a, b = int(s * SR), int(min(DUR, e + 0.35) * SR)
        seg_t = np.arange(b - a) / SR
        voice = np.zeros(b - a)
        for f in notes:
            for det in (-0.12, 0.12):
                ph = 2 * np.pi * (f * (1 + det / 100)) * seg_t
                voice += (2 * (ph / (2 * np.pi) % 1) - 1) * 0.5 + np.sin(ph) * 0.5
        voice /= len(notes) * 2
        fade = np.minimum(1, seg_t / 0.25) * np.minimum(1, (b - a - np.arange(b - a)) / (0.35 * SR))
        pad[a:b] += voice * fade
    cutoff_low = lp(pad, 900, 4)
    cutoff_high = lp(pad, 2600, 2)
    open_amt = np.interp(x, [0, t_of(E['dropHit']), t_of(E['condense']), t_of(E['vortex']), t_of(E['logoSnap']), DUR], [0, 0.3, 0.55, 0.9, 0.6, 0.3])
    padm = cutoff_low * (1 - open_amt) + cutoff_high * open_amt
    out += np.stack([padm, np.roll(padm, int(0.012 * SR))], 1) * 0.33
    # liquid pluck arpeggio, 100 BPM eighths, from impact until the vortex, then again at the resolve
    step = 60 / 100 / 2
    k = 0
    tpos = t_of(E['dropHit']) + 0.6
    while tpos < DUR - 0.4:
        in_vortex = t_of(E['vortex']) <= tpos < t_of(E['logoSnap'])
        if not in_vortex:
            notes = [n for s, n in plan if s <= tpos][-1]
            f = notes[2 + (k * 3) % 4] * (2 if k % 8 in (3, 7) else 1)
            d = 0.35
            xx = tt(d)
            pl = (np.sin(2 * np.pi * f * xx) + 0.35 * np.sin(2 * np.pi * 4 * f * xx) * np.exp(-xx / 0.03)) * np.exp(-xx / 0.11)
            lvl = 0.10 if tpos < t_of(E['logoSnap']) else 0.07
            place(out, pl, tpos, pan=0.45 if k % 2 else -0.45, gain=lvl)
        k += 1
        tpos += step
    # soft sub pulse on beats through B and C
    beat = 60 / 100
    tpos = t_of(E['condense'])
    while tpos < t_of(E['vortex']) - 0.1:
        d = 0.4; xx = tt(d)
        kick = np.sin(2 * np.pi * np.cumsum(60 * (1 + 1.4 * np.exp(-xx / 0.03))) / SR) * np.exp(-xx / 0.16)
        place(out, kick, tpos, gain=0.22)
        tpos += beat
    # ending tail fade
    fade = np.ones(N); fl = int(0.45 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 1.5
    return out * fade[:, None]

# ---------------------------------------------------------------- narration
def read_wav(p):
    with wave.open(p) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return sr, x

def narration(model, out_dir):
    piper = os.path.join(os.path.dirname(sys.executable), 'piper')
    buf = np.zeros((N, 2)); cues = []
    for ln in TL['narration']:
        p = os.path.join(out_dir, f"{ln['id']}.wav")
        subprocess.run([piper, '-m', model, '--length-scale', '0.92', '-f', p], input=ln['text'].encode(), check=True, capture_output=True)
        sr, x = read_wav(p)
        x = signal.resample_poly(x, SR, sr)
        x = hp(x, 90)
        x = x / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * 0.11
        splits = [0] + [int(s * SR) for s in ln.get('split', [])] + [len(x)]
        ats = ln['at'] if isinstance(ln['at'], list) else [ln['at']]
        for i in range(len(splits) - 1):
            seg_ = x[splits[i]:splits[i + 1]].copy()
            r = int(0.006 * SR); seg_[:r] *= np.linspace(0, 1, r); seg_[-r:] *= np.linspace(1, 0, r)
            t0 = t_of(ats[i])
            place(buf, seg_, t0, gain=1.0)
            cues.append({'id': ln['id'], 'part': i, 'text': ln['text'], 'start_s': round(t0, 3), 'end_s': round(t0 + len(seg_) / SR, 3)})
    return buf, cues

def write(p, x):
    x = np.clip(x, -1, 1)
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def main():
    model, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    fx = np.zeros((N, 2))
    pans = {'plink': 0.0, 'plop': 0.35, 'chime': 0.3}
    for c in TL['sfx']:
        f = E[c['ev']] + c.get('off', 0)
        x = sfx(c['type'], c.get('pitch', 1.0), c.get('dur'))
        x = x / (np.max(np.abs(x)) + 1e-9)
        place(fx, x, t_of(f), pan=pans.get(c['type'], 0.0), gain=db(c['gain']))
    mus = music()
    vo, cues = narration(model, out_dir)
    # duck music under narration (smoothed envelope)
    venv = np.abs(vo[:, 0])
    venv = lp(venv, 6, 1)
    venv = np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    duck = 1 - 0.5 * venv
    mix = vo * 1.0 + mus * duck[:, None] + fx
    peak = np.max(np.abs(mix))
    mix = mix / peak * db(-3.0)
    write(os.path.join(out_dir, 'narration.wav'), vo / peak * db(-3.0))
    write(os.path.join(out_dir, 'music.wav'), mus * duck[:, None] / peak * db(-3.0))
    write(os.path.join(out_dir, 'sfx.wav'), fx / peak * db(-3.0))
    write(os.path.join(out_dir, 'mix.wav'), mix)
    sfx_cues = [{'type': c['type'], 'event': c['ev'], 'frame': E[c['ev']] + c.get('off', 0), 'time_s': round(t_of(E[c['ev']] + c.get('off', 0)), 3)} for c in TL['sfx']]
    json.dump({'narration': cues, 'sfx': sfx_cues, 'samples': N, 'sr': SR}, open(os.path.join(out_dir, 'cues.json'), 'w'), indent=1)
    print('narration cues:'); [print(' ', c) for c in cues]
    print('samples', N, 'duration', N / SR)

if __name__ == '__main__':
    main()
