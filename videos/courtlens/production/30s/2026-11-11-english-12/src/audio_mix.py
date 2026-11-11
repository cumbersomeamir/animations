"""Courtlens 30s audio: narration placed on the shared timeline + original synthesized score/SFX.

Everything except the narration is synthesized here with numpy (no samples, no loops):
  * a soft pad whose chord changes follow the scenes (no repeating bar loop),
  * event-synced paper/card SFX and a few soft plucks at moments of resolution,
  * music ducked under the voice.
Usage: python audio_mix.py <timeline.json> <lines_dir> <out_raw.wav>
Output: 48 kHz stereo float WAV, exactly timeline.duration seconds (loudness is normalised later by ffmpeg).
"""
import json, sys
import numpy as np
import soundfile as sf

SR = 48000
rng = np.random.default_rng(20261102)


def fft_resample(x, sr_in, sr_out):
    n_out = int(round(len(x) * sr_out / sr_in))
    X = np.fft.rfft(x)
    Y = np.zeros(n_out // 2 + 1, dtype=complex)
    m = min(len(X), len(Y))
    Y[:m] = X[:m]
    return np.fft.irfft(Y, n_out) * (n_out / len(x))


def lp(x, fc):  # one-pole low-pass (plain recursion; fast enough for 30 s)
    a = np.exp(-2 * np.pi * fc / SR)
    b = 1 - a
    y = np.empty_like(x)
    acc = 0.0
    xs = x.astype(np.float64)
    for i in range(len(xs)):
        acc = b * xs[i] + a * acc
        y[i] = acc
    return y


def bandnoise(n, lo, hi):
    w = rng.standard_normal(n)
    return lp(w, hi) - lp(w, lo)


def env_ar(n, att, rel_shape='exp', tau=0.1):
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-4), 0, 1)
    if rel_shape == 'exp':
        return a * np.exp(-np.maximum(t - att, 0) / tau)
    return a


def place(buf, sig, t0, gain=1.0, pan=0.0):
    i0 = int(round(t0 * SR))
    if i0 < 0:
        sig = sig[-i0:]; i0 = 0
    i1 = min(buf.shape[0], i0 + len(sig))
    if i1 <= i0:
        return
    s = sig[: i1 - i0] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i0:i1, 0] += s * l * np.sqrt(2)
    buf[i0:i1, 1] += s * r * np.sqrt(2)


# ---------- SFX ----------
def whoosh(dur=0.45, lo=300, hi=2600):
    n = int(dur * SR); t = np.arange(n) / n
    return bandnoise(n, lo, hi) * np.sin(np.pi * t) ** 2


def paper(dur=0.5):
    n = int(dur * SR); t = np.arange(n) / n
    e = np.sin(np.pi * np.clip(t * 1.4, 0, 1)) ** 1.5
    grain = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 23.3 * t * dur + 1.3 * np.sin(2 * np.pi * 7.1 * t * dur)))
    return bandnoise(n, 900, 5200) * e * grain


def thud():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 55 + 95 * np.exp(-t / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
    s[: int(0.02 * SR)] += bandnoise(int(0.02 * SR), 80, 1500) * 0.6
    return s


def crack():
    n = int(0.45 * SR); s = np.zeros(n)
    for dt, a in [(0, 1.0), (0.011, 0.7), (0.027, 0.85), (0.05, 0.5), (0.078, 0.6), (0.11, 0.35)]:
        m = int(0.004 * SR); i = int(dt * SR)
        s[i:i + m] += bandnoise(m, 2200, 9000) * a * np.hanning(m)
    t = np.arange(n) / SR
    for f, a in [(2350, 0.25), (3720, 0.18), (5110, 0.12)]:
        s += a * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.07)
    return s


def ping(f, tau=0.06, dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / tau) * np.clip(t / 0.002, 0, 1)


def tap(f=210):
    n = int(0.25 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.045)
    m = int(0.012 * SR); s[:m] += bandnoise(m, 200, 2500) * np.hanning(m) * 0.8
    return s


def click():
    n = int(0.06 * SR); s = np.zeros(n)
    for i in (0, int(0.024 * SR)):
        m = int(0.003 * SR); s[i:i + m] += bandnoise(m, 2500, 9000) * np.hanning(m)
    return s


def pluck(freqs, tau=0.55, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        s += (np.sin(2 * np.pi * f * t) + 0.22 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.12)
              + 0.07 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.06))
    return s * np.exp(-t / tau) * np.clip(t / 0.004, 0, 1) / max(1, len(freqs)) ** 0.5


def pen(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    mod = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 6.3 * t) * np.sin(2 * np.pi * 2.17 * t + 0.7))
    return bandnoise(n, 2800, 8000) * mod * np.sin(np.pi * t / dur) ** 0.5


def pop():
    n = int(0.18 * SR); t = np.arange(n) / SR
    f = 520 + 420 * (t / t[-1])
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)


# ---------- pad (chords follow scenes; nothing loops) ----------
N = {'G2': 98.0, 'A2': 110.0, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F2': 87.31, 'F3': 174.61, 'G3': 196.0,
     'A3': 220.0, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.0,
     'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'A5': 880.0, 'C6': 1046.5}
VOICINGS = [['A2', 'E3', 'G3', 'B3', 'C4'], ['F2', 'C3', 'E3', 'A3'], ['C3', 'G3', 'D4', 'E4'], ['G2', 'D3', 'B3', 'E4'],
            ['A2', 'E3', 'G3', 'C4'], ['F2', 'C3', 'E3', 'G3'], ['D3', 'F3', 'A3', 'E4'], ['G2', 'D3', 'G3', 'C4'],
            ['C3', 'G3', 'B3', 'D4', 'E4']]
CHORD_EVENTS = ['v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v7b', 'v8']  # chord changes ride the scenes
CHORDS = []  # (start, end, notes) — filled from the timeline in main()


def pad(total):
    out = np.zeros((total, 2))
    xf = 0.7
    for i, (a, b, notes) in enumerate(CHORDS):
        a0 = max(0.0, a - xf / 2); b0 = min(total / SR, b + xf / 2)
        n = int((b0 - a0) * SR); t = np.arange(n) / SR
        env = np.minimum(np.clip(t / (0.9 if i == 0 else xf), 0, 1), np.clip((b0 - a0 - t) / xf, 0, 1))
        env = np.sin(env * np.pi / 2) ** 2
        for k, nm in enumerate(notes):
            f = N[nm]
            for side, det in ((0, 0.9985), (1, 1.0015)):
                ph = rng.uniform(0, 2 * np.pi)
                s = np.sin(2 * np.pi * f * det * t + ph) + 0.18 * np.sin(4 * np.pi * f * det * t + ph)
                i0 = int(a0 * SR)
                out[i0:i0 + n, side] += s * env * (0.9 if f < 140 else 0.6)
    for c in range(2):
        out[:, c] = lp(lp(out[:, c], 1400), 1400)
    return out


def main():
    tl_path, lines_dir, out_path = sys.argv[1:4]
    tl = json.load(open(tl_path))
    E = tl['events']
    total = int(round(tl['duration'] * SR))
    bounds = [0.0] + [E[k] for k in CHORD_EVENTS] + [tl['duration']]
    CHORDS[:] = [(bounds[i], bounds[i + 1], VOICINGS[i]) for i in range(len(VOICINGS))]
    voice = np.zeros(total)
    for item in tl['narration']:
        x, sr = sf.read(f"{lines_dir}/{item['id']}.wav")
        x = fft_resample(x.astype(np.float64), sr, SR)
        i0 = int(round(item['start'] * SR))
        voice[i0:i0 + len(x)] += x[: total - i0]
    voice *= 0.5 / np.max(np.abs(voice))  # pre-gain; final loudness via ffmpeg loudnorm

    # ducking envelope from the voice
    a = np.abs(voice)
    k = int(0.03 * SR)
    sm = np.convolve(a, np.ones(k) / k, mode='same')
    rel = int(0.35 * SR)
    sm = np.convolve(sm, np.hanning(rel) / np.hanning(rel).sum(), mode='same')
    duck = 1.0 - 0.5 * np.clip(sm / (np.percentile(sm, 95) + 1e-9), 0, 1)

    music = pad(total) * 0.010
    music[:, 0] *= duck; music[:, 1] *= duck
    tail = np.clip((tl['duration'] - np.arange(total) / SR) / 1.2, 0, 1)
    music[:, 0] *= tail; music[:, 1] *= tail

    fx = np.zeros((total, 2))
    place(fx, whoosh(0.35, 400, 3000), E['keyIn'], 0.03, 0.4)          # key slides in
    place(fx, click(), E['keyTurn'] + 0.25, 0.10, 0.3)                  # lock turns
    place(fx, tap(140), E['keyTurn'] + 0.28, 0.05, 0.3)
    place(fx, whoosh(1.1, 120, 900), E['doorOpen'], 0.05, -0.2)         # door swings open (low creak-air)
    place(fx, whoosh(0.6, 250, 1800), E['v2'], 0.03, 0.0)               # push through the doorway
    place(fx, whoosh(0.9, 150, 900), E['shadow'], 0.03, -0.5)           # shadow slides across the floor
    place(fx, pop(), E['qmark'], 0.05, 0.3)
    place(fx, whoosh(0.4, 300, 2200), E['v3'], 0.025, 0.0)
    place(fx, thud(), E['stamp'], 0.08, 0.0)                            # TAMIL NADU stamp lands
    place(fx, paper(0.5), E['line'], 0.03, 0.0)                         # the line is drawn
    for k in ('r1', 'r2', 'r3'):
        place(fx, tap(230), E[k], 0.06, 0.4)
    place(fx, paper(0.7), E['slide'], 0.05, -0.4)                      # notice slides under the door
    k = 0
    while E['ring'] + k * 0.1 < E['ring'] + 1.1:                       # soft ticks while the 24-hour ring fills
        place(fx, click(), E['ring'] + k * 0.1, 0.018, 0.4); k += 1
    for k in ('f1', 'f2', 'f3'):
        place(fx, pluck([N['G4']], 0.35), E[k] + 0.1, 0.035, -0.2)
    place(fx, paper(0.4), E['dialIn'], 0.03, 0.4)
    place(fx, whoosh(0.6, 250, 2000), E['v7'], 0.03, 0.0)
    place(fx, click(), E['noNotice'] + 0.05, 0.08, 0.5)
    place(fx, whoosh(0.5, 300, 2000), E['keyBack'], 0.025, 0.5)       # key withdraws
    place(fx, whoosh(0.5, 250, 1800), E['v7b'], 0.03, 0.0)
    place(fx, thud(), E['gavel'], 0.07, 0.3)                            # gavel
    place(fx, tap(260), E['gavel'] + 0.02, 0.06, 0.3)
    place(fx, pluck([N['C5'], N['E5'], N['G5']], 0.9, 2.5), E['v8'] + 0.1, 0.05, 0.0)

    mix = music + fx
    mix[:, 0] += voice; mix[:, 1] += voice
    fade_in = np.clip(np.arange(total) / (0.01 * SR), 0, 1)
    mix *= fade_in[:, None]
    sf.write(out_path, mix.astype(np.float32), SR, subtype='FLOAT')
    stems = out_path.replace('.wav', '')
    sf.write(stems + '_voice.wav', voice.astype(np.float32), SR, subtype='FLOAT')
    print('wrote', out_path, mix.shape, 'peak', float(np.max(np.abs(mix))))


if __name__ == '__main__':
    main()
