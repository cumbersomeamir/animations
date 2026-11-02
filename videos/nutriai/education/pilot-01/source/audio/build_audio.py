"""Original sound for NutriAI Education Pilot 01 (mango): Gram's voice, music bed, action SFX.

Voice: Piper TTS (piper-tts 1.8.0) en_US-ljspeech-high (LJ Speech dataset, public domain;
rhasspy/piper-voices repo MIT), then FFmpeg rubberband pitch x1.14 with preserved formants to give
Gram an original, slightly brighter character voice. No named actor/character is imitated.
Music and SFX: synthesized here (numpy/scipy oscillators + filtered noise), no samples.

Usage: python build_audio.py <piper_model.onnx> <out_dir>
Writes: voice.wav, music.wav, sfx.wav, mix.wav (48 kHz stereo, exactly 15.000 s), mouth.json
(per-frame lip-sync envelope), cues.json.
"""
import json, os, subprocess, sys, wave
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, '..', 'timeline.json')))
SR, FPS = 48000, TL['fps']
DUR = TL['frames'] / FPS
N = int(round(DUR * SR))
E = TL['events']
rng = np.random.default_rng(23)
tf = lambda frame: frame / FPS
db = lambda x: 10 ** (x / 20)
tt = lambda d: np.arange(int(d * SR)) / SR
def env(d, tau): return np.exp(-tt(d) / tau)
def noise(d): return rng.standard_normal(int(d * SR))
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, btype='low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, btype='high', fs=SR, output='sos'), x)
def sweep(f0, f1, d):
    n = int(d * SR); f = f0 * (f1 / f0) ** np.linspace(0, 1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bell(freq, d, tau=0.5, parts=((1, 1), (2.76, 0.4), (5.4, 0.18))):
    x = tt(d); return sum(a * np.sin(2 * np.pi * freq * k * x) * np.exp(-x / (tau / (1 + 0.5 * k))) for k, a in parts)
def place(buf, x, t0, pan=0.0, gain=1.0):
    i = int(round(t0 * SR))
    if x.ndim == 1:
        x = np.stack([x * np.cos((pan + 1) * np.pi / 4) * 1.414, x * np.sin((pan + 1) * np.pi / 4) * 1.414], 1)
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: buf[i:j] += x[: j - i] * gain

# ---------------------------------------------------------------- SFX
def sfx(kind, pitch=1.0, dur=None):
    if kind == 'whoosh':
        d = dur or 0.35; n = int(d * SR); x = noise(d)
        bands = [(300, 900), (700, 2000), (1500, 4500)]
        out = sum(bp(x, lo, hi) * np.exp(-((np.linspace(0, 1, n) - (i + 0.5) / 3) ** 2) / 0.05) for i, (lo, hi) in enumerate(bands))
        return out * np.sin(np.pi * np.linspace(0, 1, n))
    if kind == 'thud':
        d = 0.5; return sweep(110, 42, d) * env(d, 0.13) + lp(noise(d), 220) * env(d, 0.03) * 2.5
    if kind == 'clang':
        d = 0.9; return bell(410, d, 0.5, ((1, 1), (2.3, 0.7), (3.9, 0.45), (5.7, 0.2))) * 0.6
    if kind == 'boing':
        d = 0.45; x = tt(d); f = 180 + 260 * np.exp(-x / 0.12) + 25 * np.sin(2 * np.pi * 14 * x)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.16)
    if kind == 'clank':
        d = 0.35; return (bell(620, d, 0.12, ((1, 1), (2.1, 0.6), (3.3, 0.3))) + lp(noise(d), 600) * env(d, 0.02) * 1.5)
    if kind == 'hop':
        d = 0.16; return sweep(300, 720, d) * env(d, 0.05)
    if kind == 'tick':
        d = 0.08; return hp(noise(d), 2500) * env(d, 0.006) + np.sin(2 * np.pi * 1800 * tt(d)) * env(d, 0.01) * 0.4
    if kind == 'swish':
        d = 0.18; return bp(noise(d), 2500, 9000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2
    if kind == 'slice':
        d = 0.32; x = bp(noise(d), 3000, 11000) * env(d, 0.05)
        juicy = lp(noise(d), 1500) * env(d, 0.08) * 0.8
        return x + juicy + sweep(900, 300, d) * env(d, 0.04) * 0.3
    if kind == 'patter':
        d = dur or 0.8; out = np.zeros(int(d * SR))
        for i in range(14):
            o = int((i / 14) * (d - 0.08) * SR + rng.uniform(0, 0.02) * SR); L = 0.07
            b = sweep(rng.uniform(260, 420), rng.uniform(120, 200), L) * env(L, 0.02) + lp(noise(L), 900) * env(L, 0.008) * 0.8
            out[o:o + len(b)] += b * rng.uniform(0.5, 1.0)
        return out
    if kind == 'creak':
        d = dur or 0.5; x = tt(d); f = 140 + 30 * np.sin(2 * np.pi * 3 * x)
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        return bp(saw, 300, 1800) * np.sin(np.pi * x / d) * 0.6
    if kind == 'ding':
        return bell(1046.5 * pitch, 1.2, 0.6) * 0.7
    if kind == 'click':
        d = 0.05; return hp(noise(d), 2000) * env(d, 0.004)
    if kind == 'pour':
        d = dur or 1.0; x = tt(d)
        g = bp(noise(d), 350, 2200) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * x + 2 * np.sin(2 * np.pi * 2.5 * x)))
        bub = np.zeros_like(x)
        for i in range(10):
            o = int(rng.uniform(0, d - 0.06) * SR); L = 0.05
            b = sweep(rng.uniform(300, 600), rng.uniform(800, 1400), L) * env(L, 0.015); bub[o:o + len(b)] += b * 0.3
        return (g + bub) * np.sin(np.pi * x / d)
    if kind == 'thunk':
        d = 0.4; return sweep(160, 70, d) * env(d, 0.09) + lp(noise(d), 500) * env(d, 0.02)
    if kind == 'zip':
        d = 0.25; return sweep(500, 2200, d) * env(d, 0.12) * 0.5 + bp(noise(d), 2000, 6000) * env(d, 0.08) * 0.3
    if kind == 'rise':
        d = dur or 0.35; n = int(d * SR); return (sweep(300, 1500, d) * 0.4 + bp(noise(d), 1000, 5000) * 0.3) * np.linspace(0, 1, n) ** 2
    if kind == 'stamp':
        d = 0.5; return sweep(140, 55, d) * env(d, 0.1) * 1.2 + lp(noise(d), 1200) * env(d, 0.025) * 2 + bell(820, d, 0.15) * 0.25
    if kind == 'sparkle':
        d = 0.9; out = np.zeros(int(d * SR))
        for i in range(9):
            o = int(i * 0.07 * SR); b = bell(rng.choice([1568, 1760, 2093, 2349, 2637]), 0.4, 0.12) * (1 - i / 12)
            out[o:o + len(b)] += b[: len(out) - o]
        return out * 0.5
    if kind == 'pop':
        d = 0.12; return sweep(900, 400, d) * env(d, 0.03)
    raise ValueError(kind)

# ---------------------------------------------------------------- music (original, 104 BPM, D major)
def music():
    out = np.zeros((N, 2))
    bpm = 104; beat = 60 / bpm; step = beat / 2
    D = {'D': 146.83, 'E': 164.81, 'F#': 185.0, 'G': 196.0, 'A': 220.0, 'B': 246.94, 'C#': 277.18}
    prog = [('D', ['D', 'F#', 'A']), ('B', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C#', 'E'])]
    def note(n, octv=1): return {**D, 'D': 146.83}[n] * octv
    t = 0.0; k = 0
    start = tf(E['mangoLand'])
    while t < DUR - 0.3:
        bar = int(t / (beat * 4)); root, triad = prog[bar % 4]
        if t >= start - 0.01:
            # pluck arpeggio (marimba-like)
            pat = [0, 1, 2, 1, 2, 0, 1, 2]
            f = note(triad[pat[k % 8]], 2) * (2 if k % 8 == 4 else 1)
            d = 0.32; x = tt(d)
            pl = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 4 * f * x) * np.exp(-x / 0.02)) * np.exp(-x / 0.12)
            quiet = 0.55 if tf(E['melt']) <= t < tf(E['cup']) else 1.0
            place(out, pl, t, pan=0.35 if k % 2 else -0.35, gain=0.09 * quiet)
            # bass on beats
            if k % 2 == 0:
                fb = note(root, 0.5)
                d = beat * 0.9; x = tt(d)
                bs = np.tanh(1.5 * (np.sin(2 * np.pi * fb * x) + 0.3 * np.sin(4 * np.pi * fb * x))) * np.exp(-x / 0.35)
                place(out, bs, t, gain=0.12)
            # soft shaker on off-beats, woodblock on beat 2/4
            if k % 2 == 1:
                d = 0.06; place(out, hp(noise(d), 6000) * env(d, 0.015), t, pan=0.2, gain=0.05)
            if k % 8 in (2, 6):
                d = 0.1; place(out, bp(sweep(900, 700, d), 500, 2000) * env(d, 0.02), t, pan=-0.2, gain=0.08)
        k += 1; t += step
    # intro: rising tension before the slam
    d = tf(E['mangoLand']); x = tt(d)
    if len(x):
        riser = (sweep(200, 800, d) * 0.25 + bp(noise(d), 800, 4000) * 0.15) * np.linspace(0, 1, len(x)) ** 2
        place(out, riser, 0.0, gain=0.35)
    # final resolve chord
    fc = tf(E['takeaway']); d = DUR - fc; x = tt(d)
    chord = sum(np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x) for f in (293.66, 369.99, 440.0, 587.33)) / 4
    place(out, chord * np.minimum(1, x / 0.03) * np.exp(-x / 1.4), fc, gain=0.10)
    fade = np.ones(N); fl = int(0.35 * SR); fade[-fl:] = np.linspace(1, 0, fl)
    return out * fade[:, None]

# ---------------------------------------------------------------- Gram's voice
def read_wav(p):
    with wave.open(p) as w:
        sr = w.getframerate(); ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return sr, x.reshape(-1, ch).mean(1)

def longest_gap(x, lo_frac=0.15, hi_frac=0.7):
    hop = int(0.01 * SR); n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    quiet = 20 * np.log10(rms + 1e-9) < -40
    best, cur, start, bs = 0, 0, 0, 0
    for i in range(int(n * lo_frac), int(n * hi_frac)):
        if quiet[i]:
            if cur == 0: start = i
            cur += 1
            if cur > best: best, bs = cur, start
        else: cur = 0
    return (bs + best / 2) * hop / SR, best * 0.01

def voice(model, out_dir):
    piper = os.path.join(os.path.dirname(sys.executable), 'piper')
    buf = np.zeros((N, 2)); cues = []
    for ln in TL['narration']:
        # Piper sampling is stochastic, so the canonical takes are cached in audio/voice-takes/ (committed) and
        # reused, which keeps audio and the lip-sync envelope identical between builds. Missing lines are synthesized.
        take = os.path.join(HERE, 'voice-takes', f"{ln['id']}.wav")
        raw = os.path.join(out_dir, f"{ln['id']}-raw.wav"); g = os.path.join(out_dir, f"{ln['id']}.wav")
        if os.path.exists(take):
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', take, '-c', 'copy', g], check=True)
        else:
            subprocess.run([piper, '-m', model, '--length-scale', '0.95', '-f', raw], input=ln['text'].encode(), check=True, capture_output=True)
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', raw, '-af', 'rubberband=pitch=1.14:formant=preserved,aresample=48000', '-ac', '1', g], check=True)
            os.makedirs(os.path.dirname(take), exist_ok=True)
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', g, '-c', 'copy', take], check=True)
        _, x = read_wav(g)
        x = hp(x, 90)
        x = x / (np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) + 1e-9) * 0.11
        if ln.get('split') == 'auto1':
            cut, gap = longest_gap(x)
            parts = [x[: int(cut * SR)], x[int(cut * SR):]]
        else:
            parts = [x]
        for i, seg_ in enumerate(parts):
            nz = np.where(np.abs(seg_) > 0.004)[0]
            seg_ = seg_[max(0, nz[0] - 240): nz[-1] + 2400] if len(nz) else seg_
            r = int(0.006 * SR); seg_[:r] *= np.linspace(0, 1, r); seg_[-r:] *= np.linspace(1, 0, r)
            t0 = tf(ln['at'][i])
            place(buf, seg_, t0)
            cues.append({'id': ln['id'], 'part': i, 'text': ln['text'], 'start_s': round(t0, 3), 'end_s': round(t0 + len(seg_) / SR, 3)})
    return buf, cues

def write(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

def main():
    model, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    fx = np.zeros((N, 2))
    for c in TL['sfx']:
        x = sfx(c['type'], c.get('pitch', 1.0), c.get('dur'))
        x = x / (np.max(np.abs(x)) + 1e-9)
        place(fx, x, tf(E[c['ev']] + c.get('off', 0)), pan=c.get('pan', 0.0), gain=db(c['gain']))
    mus = music()
    vo, cues = voice(model, out_dir)
    v = np.abs(vo[:, 0]); venv = lp(v, 6, 1); venv = np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    mus = mus * (1 - 0.68 * venv)[:, None]
    fx = fx * (1 - 0.35 * venv)[:, None]   # keep action SFX under the voice so every word stays intelligible
    mix = vo + mus + fx
    peak = np.max(np.abs(mix)); g = db(-3) / peak
    write(os.path.join(out_dir, 'voice.wav'), vo * g); write(os.path.join(out_dir, 'music.wav'), mus * g)
    write(os.path.join(out_dir, 'sfx.wav'), fx * g); write(os.path.join(out_dir, 'mix.wav'), mix * g)
    # lip-sync envelope per video frame
    spf = SR // FPS
    rms = np.array([np.sqrt(np.mean(vo[i * spf:(i + 1) * spf, 0] ** 2)) for i in range(TL['frames'])])
    mouth = np.clip(rms / (np.percentile(rms[rms > 1e-4], 90) + 1e-9), 0, 1)
    mouth = np.round(np.convolve(mouth, [0.25, 0.5, 0.25], mode='same'), 3)
    json.dump(mouth.tolist(), open(os.path.join(out_dir, 'mouth.json'), 'w'))
    sfxc = [{'type': c['type'], 'event': c['ev'], 'time_s': round(tf(E[c['ev']] + c.get('off', 0)), 3)} for c in TL['sfx']]
    json.dump({'voice': cues, 'sfx': sfxc, 'samples': N, 'sr': SR}, open(os.path.join(out_dir, 'cues.json'), 'w'), indent=1)
    for c in cues: print(c)
    print('samples', N, N / SR)

if __name__ == '__main__':
    main()
