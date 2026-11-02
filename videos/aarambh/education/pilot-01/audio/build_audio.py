"""Build the 15.000 s soundtrack for Aarambh education pilot 01.

Everything here is original and procedural (numpy/scipy) except the narration, which is
Piper TTS (public-domain LJSpeech voice model) processed into Bindu's character voice.

Inputs : src/timeline.json, audio/narration/raw/*.wav (committed TTS takes)
Outputs: audio/narration/*.wav (processed voice, committed)
         audio/build/narration_timing.json (line start/end + per-frame lip-sync envelope)
         audio/stems/{voice,music,sfx}.wav and audio/build/mix.wav (48 kHz stereo, exactly 15 s)
Usage  : python audio/build_audio.py
"""
import json, subprocess, wave, math
from pathlib import Path
import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
DUR = TL["duration"]
N = int(round(DUR * SR))
FPS = TL["fps"]
rng = np.random.default_rng(20261102)

def tt(t):
    return int(round(t * SR))

def read_wav(p):
    with wave.open(str(p)) as w:
        sr = w.getframerate(); ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr

def write_wav(p, x, sr=SR):
    p.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = x[:, None]
    with wave.open(str(p), "wb") as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

# ---------------- voice ----------------
VOICE_CHAIN = (
    "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.02,"
    "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse,"
    "aresample=48000,"
    "rubberband=pitch=1.08:formant=shifted:pitchq=quality,"
    "highpass=f=85,equalizer=f=220:t=q:w=1.2:g=-2,equalizer=f=3100:t=q:w=1.1:g=3,"
    "acompressor=threshold=-20dB:ratio=3:attack=4:release=80:makeup=2,"
    "alimiter=limit=0.89:level=false"
)

def process_voice():
    out = {}
    for ln in json.loads((ROOT / "audio/script.json").read_text())["lines"]:
        src = ROOT / f"audio/narration/raw/{ln['id']}.wav"
        dst = ROOT / f"audio/narration/{ln['id']}.wav"
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(src), "-af", VOICE_CHAIN,
                        "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", str(dst)], check=True)
        x, sr = read_wav(dst)
        assert sr == SR
        out[ln["id"]] = x
    return out

# ---------------- synthesis helpers ----------------
def env_adsr(n, a, d, s, r, sustain_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.zeros(n)
    idx = 0
    seg = min(a, n); e[:seg] = np.linspace(0, 1, seg, endpoint=False); idx = seg
    seg = min(d, n - idx); e[idx:idx + seg] = np.linspace(1, s, seg, endpoint=False); idx += seg
    seg = min(int(sustain_len * SR), n - idx); e[idx:idx + seg] = s; idx += seg
    seg = min(r, n - idx); e[idx:idx + seg] = np.linspace(s, 0, seg, endpoint=False)
    return e

def add(buf, t, x, gain=1.0):
    i = tt(t)
    if i >= len(buf):
        return
    if i < 0:
        x = x[-i:]; i = 0
    m = min(len(x), len(buf) - i)
    buf[i:i + m] += x[:m] * gain

def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def pluck(f, dur=1.2, bright=1.0):
    """Hammered-string pluck (original additive model): bright attack, inharmonic partials."""
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * (1 + 0.0009 * k * k)
        if fk > 16000: break
        amp = (1.0 / k ** (1.25 - 0.35 * bright)) * (1 if k % 2 else 0.8)
        dec = 2.2 + 1.3 * k
        x += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-dec * t)
    x += 0.5 * np.sin(2 * np.pi * f * 1.004 * t) * np.exp(-2.5 * t)  # gentle chorus
    att = np.minimum(1, t / 0.004)
    return x * att * 0.22

def bell(f, dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    parts = [(1, 1, 1.4), (2.76, 0.5, 2.6), (5.4, 0.28, 4.0), (8.93, 0.14, 6.0)]
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-d * t) for r, a, d in parts)
    return x * np.minimum(1, t / 0.002) * 0.2

def pad(freqs, dur, a=0.6, r=0.8):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            ff = f * 2 ** (det / 12)
            x += np.sin(2 * np.pi * ff * t) + 0.25 * np.sin(2 * np.pi * 2 * ff * t)
    e = env_adsr(n, a, 0.3, 0.8, r, max(0, dur - a - 0.3 - r))
    return x * e * (0.05 / len(freqs))

def bass(f, dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.exp(-3.5 * t) * np.minimum(1, t / 0.01) * 0.28

def noise(n):
    return rng.standard_normal(n)

def bandnoise(dur, f_lo, f_hi):
    n = int(dur * SR)
    sos = signal.butter(2, [f_lo, f_hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, noise(n))

def sweep_noise(dur, f0, f1, q=3.0, amp_env=None):
    """Noise with a moving band centre f0->f1 (STFT mask)."""
    n = int(dur * SR)
    x = noise(n + 2048)
    f, tseg, Z = signal.stft(x, fs=SR, nperseg=1024)
    centres = np.geomspace(max(f0, 20), max(f1, 20), Z.shape[1])
    bw = centres / q
    mask = np.exp(-0.5 * ((f[:, None] - centres[None, :]) / bw[None, :]) ** 2)
    _, y = signal.istft(Z * mask, fs=SR, nperseg=1024)
    y = y[:n]
    y /= (np.abs(y).max() + 1e-9)
    if amp_env is None:
        tt_ = np.linspace(0, 1, n)
        amp_env = np.sin(np.pi * tt_) ** 1.5
    return y * amp_env

def click(f=2500, dur=0.03, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return amp * (np.sin(2 * np.pi * f * t) * np.exp(-t / (dur / 5)) + 0.5 * noise(n) * np.exp(-t / (dur / 8)))

def thump(f0=110, f1=55, dur=0.18, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return amp * np.sin(ph) * np.exp(-t / (dur / 4)) + 0.15 * amp * bandnoise(dur, 200, 2000) * np.exp(-t / 0.01)

def chirp(f0, f1, dur, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    e = np.sin(np.pi * np.minimum(1, t / dur)) ** 0.7
    return amp * np.sin(ph) * e

def tink(amp=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(2400, 1, 22), (3720, 0.6, 30), (5150, 0.35, 40)])
    return amp * x * 0.5

# ---------------- choreography-derived cue times ----------------
def in_out_sine(u):
    return -(np.cos(np.pi * u) - 1) / 2

def crank_phi(t):
    c = TL["crank"]
    if t < c["rev1"][0]:
        return -0.28 * min(1, t / c["start"])
    if t < c["rev2"][0]:
        u = np.clip((t - c["rev1"][0]) / (c["rev1"][1] - c["rev1"][0]), 0, 1)
        return -0.28 + (2 * np.pi + 0.28) * in_out_sine(u)
    u = np.clip((t - c["rev2"][0]) / (c["rev2"][1] - c["rev2"][0]), 0, 1)
    return 2 * np.pi + 2 * np.pi * in_out_sine(u)

def music():
    L = np.zeros(N); R = np.zeros(N)
    beat = 0.6
    def note(t, m, g=1.0, pan=0.0, dur=1.2, bright=1.0):
        x = pluck(midi(m), dur, bright) * g
        add(L, t, x, 1 - max(0, pan)); add(R, t, x, 1 + min(0, pan))
    def both(t, x, g=1.0):
        add(L, t, x, g); add(R, t, x, g)
    D, Fs, A, B, G, E, Cs = 62, 66, 69, 71, 67, 64, 73  # D4 F#4 A4 B4 G4 E4 C#5
    # S1: D-major arpeggio in eighths, bass on beats
    arp = [D, A, Fs + 12, A, D + 12, A, Fs + 12, A]
    t = 0.05
    i = 0
    while t < 3.5:
        note(t, arp[i % len(arp)], 0.55 if i % 2 else 0.8, pan=(-0.3 if i % 2 else 0.3))
        i += 1; t += beat / 2
    for tb in np.arange(0.05, 3.5, beat * 2):
        both(tb, bass(midi(38)))
    both(0.0, pad([midi(50), midi(57), midi(62), midi(66)], 3.8, a=0.4, r=0.6))
    # dive riser
    both(3.45, sweep_noise(0.95, 300, 5000, q=2.5) * 0.05)
    both(3.5, chirp(220, 880, 0.9, 0.04))
    # mechanism: Bm -> G (clockwork eighths)
    sec = [(4.4, [59, 62, 66, 71], 35, [47, 54, 59, 62]), (6.8, [55, 59, 62, 67], 31, [43, 50, 55, 59])]
    for t0, chord, bm, padn in sec:
        t = t0; i = 0
        while t < t0 + 2.4 - 0.01:
            note(t, chord[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] + 12 * (i % 4 == 3), 0.45, pan=(0.35 if i % 2 else -0.35), dur=0.9, bright=0.7)
            add(L, t + 0.15, click(4200, 0.02, 0.025)); add(R, t + 0.15, click(4200, 0.02, 0.025))
            i += 1; t += beat / 2
        for tb in np.arange(t0, t0 + 2.4, beat * 2):
            both(tb, bass(midi(bm)))
        both(t0, pad([midi(m) for m in padn], 2.6, a=0.5, r=0.5))
    # pull: A sus4 -> A, rising repeated notes (tension)
    t = 9.2; k = 0
    while t < TL["mech"]["lockSnap"] - 0.05:
        note(t, [69, 71, 73, 74, 76][min(4, k // 2)], 0.4 + 0.05 * k, pan=0, dur=0.6, bright=1.2)
        k += 1; t += beat / 4
    both(9.2, pad([midi(57), midi(62), midi(64), midi(69)], 1.5, a=0.8, r=0.3))
    # lock resolution at lockSnap
    ls = TL["mech"]["lockSnap"]
    both(ls, bell(midi(86), 2.2) * 0.9)
    note(ls, 74, 0.9, 0, 1.6); note(ls, 78, 0.6, 0.3, 1.6); note(ls + 0.02, 81, 0.5, -0.3, 1.6)
    both(ls, bass(midi(38), 1.2) * 1.2)
    both(ls, pad([midi(50), midi(57), midi(62), midi(66)], 1.8, a=0.05, r=0.8))
    # gentle continuation
    for j, m in enumerate([74, 78, 81, 78]):
        note(ls + 0.6 + j * beat / 2, m, 0.35, (-0.2 if j % 2 else 0.2), 0.9)
    # T2 reverse whoosh handled in sfx; S5 cadence G - A - D
    s5 = 12.75
    for t0, chord, bm in [(s5, [55, 59, 62, 67], 43), (s5 + 0.6, [57, 61, 64, 69], 45), (s5 + 1.2, [62, 66, 69, 74], 38)]:
        for j, m in enumerate(chord):
            note(t0 + j * 0.075, m, 0.5, (j - 1.5) * 0.2, 1.4)
        both(t0, bass(midi(bm), 0.6))
    both(s5 + 1.2, pad([midi(50), midi(57), midi(62), midi(66)], 2.0, a=0.3, r=0.6))
    # final button
    fb = 14.45
    note(fb, 74, 0.8, 0, 0.6); note(fb, 86, 0.5, 0, 0.6); both(fb, bass(midi(38), 0.5) * 1.1); both(fb, bell(midi(98), 0.6) * 0.4)
    return np.stack([L, R], axis=1)

def sfx():
    L = np.zeros(N); R = np.zeros(N)
    def both(t, x, g=1.0, pan=0.0):
        add(L, t, x, g * (1 - max(0, pan))); add(R, t, x, g * (1 + min(0, pan)))
    # crank ratchet clicks: one click per 0.35 rad of travel; needle thunk when needle pierces cloth
    ts = np.arange(0, 2.2, 1 / 600)
    phis = np.array([crank_phi(x) for x in ts])
    nxt = 0.35
    for x, ph in zip(ts, phis):
        if ph >= nxt:
            both(x, click(1800 + rng.uniform(-200, 200), 0.025, 0.12), pan=0.45); nxt += 0.35
    dip = (1 - np.cos(phis)) / 2
    pierce = np.where((dip[1:] >= 0.79) & (dip[:-1] < 0.79))[0]
    for k in pierce:
        both(ts[k], thump(160, 70, 0.14, 0.5), pan=-0.3); both(ts[k], click(900, 0.03, 0.25), pan=-0.3)
    # hops
    for x, a in [(2.2, 0.15), (2.52, 0.35), (2.58, 0.12), (2.85, 0.35)]:
        both(x, thump(140, 80, 0.12, a), pan=0.2)
    # swatch pickup rustle + flip fwip + question pop
    both(2.95, sweep_noise(0.18, 2500, 4000, q=1.5) * 0.06)
    both(3.1, sweep_noise(0.22, 1500, 4500, q=1.8) * 0.12)
    both(3.22, chirp(500, 1300, 0.08, 0.18))
    # dive: whoosh + shrink "pew"
    both(3.5, sweep_noise(0.5, 600, 3500, q=2.0) * 0.18)
    both(3.58, chirp(1600, 420, 0.3, 0.10))
    both(3.86, chirp(900, 1800, 0.07, 0.12))  # plip into the needle hole
    # land in mechanism
    both(4.45, thump(220, 120, 0.08, 0.2), pan=0.4)
    # needle pierce in cutaway (tip crosses cloth top)
    both(4.61, click(700, 0.05, 0.3)); both(4.61, thump(180, 90, 0.1, 0.25))
    # loop forms: soft low pluck of thread
    both(5.0, pluck(midi(45), 0.6, 0.5) * 0.5)
    # hook catch tink + whirr during carry
    both(5.75, tink(0.5))
    c0, c1 = TL["mech"]["hookCarry"]
    n = tt(c1 + 0.6) - tt(c0)
    tw = np.arange(n) / SR
    rot = 0.5 + 0.5 * np.sin(2 * np.pi * (1.926 / (2 * np.pi)) * tw * 2)  # periodic swish
    whirr = bandnoise(n / SR, 500, 1800) * (0.35 + 0.65 * rot)
    fade = np.minimum(1, tw / 0.15) * np.clip((n / SR - tw) / 0.5, 0, 1)
    both(c0, whirr * fade * 0.05)
    hum = np.sin(2 * np.pi * 95 * tw) * 0.5 + np.sin(2 * np.pi * 190 * tw) * 0.2
    both(c0, hum * fade * 0.025)
    # cast off slip
    both(8.58, sweep_noise(0.2, 3000, 1200, q=2) * 0.08)
    # scurry steps
    for k in range(5):
        both(8.62 + k * 0.1, click(1200, 0.02, 0.08), pan=0.2 - k * 0.1)
    # take-up pull: thread zip rising (friction grains accelerate)
    t0, t1 = TL["mech"]["takeUp"]
    d = t1 - t0
    zip_ = sweep_noise(d, 900, 4200, q=4, amp_env=np.linspace(0.3, 1, int(d * SR)) ** 1.2)
    grains = np.zeros(int(d * SR))
    tg = 0.0
    while tg < d:
        i = int(tg * SR); g = click(3000, 0.012, 0.6)
        grains[i:i + len(g)] += g[:max(0, min(len(g), len(grains) - i))]
        tg += 0.07 * (1 - 0.75 * tg / d)
    both(t0, (zip_ * 0.12 + grains * 0.05))
    # lock: woodblock tock + sparkle
    ls = TL["mech"]["lockSnap"]
    nb = int(0.12 * SR); tb_ = np.arange(nb) / SR
    tock = (np.sin(2 * np.pi * 820 * tb_) + 0.5 * np.sin(2 * np.pi * 1640 * tb_)) * np.exp(-tb_ / 0.018)
    both(ls, tock * 0.45)
    for k, f in enumerate([2637, 3136, 3951]):
        both(ls + 0.05 + k * 0.05, bell(f, 0.5) * 0.25, pan=(k - 1) * 0.3)
    # Bindu drop + land, lens pop
    d0, d1 = TL["mech"]["drop"]
    both(d0, chirp(1400, 500, 0.3, 0.07))
    both(d1, thump(180, 90, 0.12, 0.3))
    both(TL["mech"]["lens"][0], tink(0.25))
    # feed shuffle
    both(TL["mech"]["feed"][0], bandnoise(0.35, 300, 1500) * np.hanning(int(0.35 * SR)) * 0.07)
    # T2 exit whoosh, pop back
    both(12.22, sweep_noise(0.5, 3500, 500, q=2) * 0.16)
    both(12.68, chirp(400, 1500, 0.1, 0.15))
    # banner unroll: paper flutter then settle
    b0, b1 = TL["s5"]["banner"]
    db = b1 - b0
    nf = int(db * SR); tf = np.arange(nf) / SR
    flutter = bandnoise(db, 1200, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * tf)) * np.exp(-tf * 2.5)
    both(b0, flutter * 0.1)
    both(b1 - 0.05, thump(120, 70, 0.1, 0.2))
    # swatch flips in S5
    for x in (TL["s5"]["flap"][0], TL["s5"]["flap"][1]):
        both(x, sweep_noise(0.22, 1500, 4500, q=1.8) * 0.1)
    # wink twinkle
    both(TL["s5"]["wink"], bell(midi(100), 0.4) * 0.35)
    return np.stack([L, R], axis=1)

def main():
    voices = process_voice()
    V = np.zeros(N)
    timing = {"lines": {}}
    for v in TL["vo"]:
        x = voices[v["id"]]
        add(V, v["start"], x)
        timing["lines"][v["id"]] = {"start": v["start"], "end": round(v["start"] + len(x) / SR, 3), "dur": round(len(x) / SR, 3)}
    # check no overlaps
    ids = [v["id"] for v in TL["vo"]]
    for a, b in zip(ids, ids[1:]):
        assert timing["lines"][a]["end"] <= timing["lines"][b]["start"] - 0.1, f"narration overlap {a}->{b}"
    assert timing["lines"][ids[-1]]["end"] <= DUR - 0.3, "last line too late"
    # lip-sync envelope per video frame
    hop = SR // FPS
    env = []
    for f in range(int(DUR * FPS)):
        seg = V[f * hop:(f + 1) * hop]
        rms = np.sqrt(np.mean(seg ** 2) + 1e-12)
        db = 20 * np.log10(rms)
        env.append(float(np.clip((db + 42) / 26, 0, 1)))
    timing["envelope"] = [round(e, 3) for e in env]
    # voice activity for ducking (smoothed)
    act = np.repeat(np.array(env) > 0.08, hop).astype(float)
    act = np.pad(act, (0, N - len(act)))
    k = np.hanning(int(0.25 * SR)); k /= k.sum()
    act = np.convolve(act, k, mode="same")

    M_ = music()
    S_ = sfx()
    duck = (1 - 0.55 * np.clip(act, 0, 1))[:, None]
    M_ = M_ * duck
    Vst = np.stack([V, V], axis=1) * 0.92
    mix = Vst + M_ * 0.9 + S_ * 0.85
    # 30 ms fade-in / 250 ms fade-out
    fi = np.minimum(1, np.arange(N) / (0.03 * SR)); fo = np.clip((N - np.arange(N)) / (0.25 * SR), 0, 1)
    mix *= (fi * fo)[:, None]
    peak = np.abs(mix).max()
    target = 10 ** (-1.5 / 20)
    if peak > target:
        mix *= target / peak
    for name, x in [("voice", Vst), ("music", M_), ("sfx", S_)]:
        write_wav(ROOT / f"audio/stems/{name}.wav", x)
    write_wav(ROOT / "audio/build/mix.wav", mix)
    (ROOT / "audio/build").mkdir(parents=True, exist_ok=True)
    (ROOT / "audio/build/narration_timing.json").write_text(json.dumps(timing, indent=1))
    print("lines:", json.dumps(timing["lines"]))
    print("mix peak dBFS: %.2f, samples %d (%.3fs)" % (20 * np.log10(np.abs(mix).max()), N, N / SR))

if __name__ == "__main__":
    main()
