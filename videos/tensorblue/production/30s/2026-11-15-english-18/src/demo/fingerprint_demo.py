"""Audio-fingerprint test for Tensorblue english-18 — our own small implementation of the method described in
Avery Li-Chun Wang, "An Industrial-Strength Audio Search Algorithm" (Shazam Entertainment, ISMIR 2003).
OUR code and OUR made-up music, not Shazam's code or catalogue.

Method as the paper describes it:
  * spectrogram -> keep only local peaks ("constellation map", it "often resemble[s] a star field");
  * pair each anchor peak with a few peaks in a target zone after it; a hash = (freq 1, freq 2, time gap);
    each hash keeps the time of its anchor ("the time offset from the beginning of the respective file");
  * look the sample's hashes up in the database index; for each track, histogram dt = t_db - t_sample and
    score the track by "the number of matching points in the histogram peak".
Test: 6 synthetic 60-s tracks (8 kHz mono, as in the paper's tests). A 10-s clip of track 3 starting at 37.0 s is
buried in synthetic cafe noise (babble of six voices, room noise, cup clinks) at 0 dB SNR and band-limited like a
phone microphone. A "hummed" version of the same melody (pure tone, 2 semitones lower, 8 % slower, same noise) is
also searched. Music, noise and hum are generated here from fixed seeds; the matching is real.
usage: python3 fingerprint_demo.py <out_dir>
"""
import json
import os
import sys
from collections import Counter, defaultdict

import numpy as np
from scipy.ndimage import maximum_filter
from scipy.signal import lfilter

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
SR, NFFT, HOP = 8000, 1024, 256
TRACK_S, N_TRACKS, TRUE_TRACK, CLIP_AT, CLIP_S = 60.0, 6, 2, 37.0, 10.0
SNR_DB = 0.0
F_FAN, DT_MIN, DT_MAX, DF_MAX = 10, 2, 63, 120         # fan-out 10 (the paper's example F=10); target zone: 64 ms to ~2 s after the anchor, +-940 Hz


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def note(f, dur, amps=(1, .5, .32, .2, .12), vib=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * t + (vib * np.sin(2 * np.pi * 5.2 * t) if vib else 0)
    x = sum(a * np.sin((k + 1) * ph) for k, a in enumerate(amps) if (k + 1) * f < SR / 2)
    env = np.minimum(1, t / 0.015) * np.exp(-t * 2.2)
    return x * env


def make_track(seed):
    """A made-up instrumental: melody with harmonics, bass, soft chords, hi-hat ticks. Returns audio + the melody."""
    rng = np.random.default_rng(seed)
    bpm = rng.uniform(96, 132); beat = 60 / bpm
    root = int(rng.integers(55, 66)); scale = [0, 2, 4, 5, 7, 9, 11, 12, 14]
    x = np.zeros(int(TRACK_S * SR)); melody = []
    t = 0.0
    while t < TRACK_S - 1:
        dur = beat * rng.choice([0.5, 0.5, 1, 1, 1.5, 2])
        m = root + 12 + scale[int(rng.integers(0, len(scale)))]
        seg = note(midi_hz(m), dur * 1.1) * 0.5
        i = int(t * SR); x[i:i + len(seg)] += seg[: len(x) - i]
        melody.append((round(t, 4), round(dur, 4), int(m)))
        t += dur
    for b in range(int(TRACK_S / beat)):                                  # bass + chord on each bar, ticks on beats
        i = int(b * beat * SR)
        if b % 4 == 0:
            m = root - 12 + [0, 5, 7, 9][(b // 4) % 4]
            for seg in (note(midi_hz(m), beat * 4, (1, .6, .3)) * 0.35, note(midi_hz(m + 24), beat * 4, (1, .2)) * 0.12, note(midi_hz(m + 28), beat * 4, (1, .2)) * 0.10):
                x[i:i + len(seg)] += seg[: len(x) - i]
        tick = rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / 60) * 0.12
        tick = np.diff(tick, prepend=0)
        x[i:i + len(tick)] += tick[: len(x) - i]
    return x / np.sqrt(np.mean(x ** 2)), melody


def cafe_noise(n, seed):
    """Six talkers (buzzy glottal pulses through moving formants, syllable rhythm), room noise and cup clinks."""
    rng = np.random.default_rng(seed); t = np.arange(n) / SR; out = np.zeros(n)
    for _ in range(6):
        f0 = rng.uniform(95, 230) * (1 + 0.08 * np.sin(2 * np.pi * rng.uniform(0.2, 0.6) * t + rng.uniform(0, 6)))
        ph = np.cumsum(f0 / SR); src = np.diff(np.floor(ph), prepend=0) * 1.0          # pulse train
        v = np.zeros(n); seg = int(SR * 0.22)
        for s0 in range(0, n, seg):                                                     # new vowel every syllable
            s1 = min(n, s0 + seg)
            for fc, bw in ((rng.uniform(300, 850), 90), (rng.uniform(850, 2300), 120), (rng.uniform(2300, 3200), 180)):
                r = np.exp(-np.pi * bw / SR); a = [1, -2 * r * np.cos(2 * np.pi * fc / SR), r * r]
                v[s0:s1] += lfilter([1 - r], a, src[s0:s1])
        syl = np.clip(np.sin(2 * np.pi * rng.uniform(3.5, 5.5) * t + rng.uniform(0, 6)), 0, None) ** 0.7
        pause = (np.sin(2 * np.pi * rng.uniform(0.15, 0.4) * t + rng.uniform(0, 6)) > -0.4)
        out += v * syl * pause * rng.uniform(0.6, 1.0)
    room = lfilter([1], [1, -0.97], rng.standard_normal(n)) * 0.05                     # dull room rumble
    out = out / np.sqrt(np.mean(out ** 2)) + room / np.sqrt(np.mean(room ** 2)) * 0.3
    for _ in range(int(n / SR * 0.8)):                                                  # cup and spoon clinks
        i = int(rng.integers(0, n - 2000)); f = rng.uniform(2200, 3600); k = np.arange(2000)
        out[i:i + 2000] += 2.5 * np.sin(2 * np.pi * f * k / SR) * np.exp(-k / 300)
    return out / np.sqrt(np.mean(out ** 2))


def phone_band(x):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < 300) | (f > 3400)] *= 0.05
    return np.fft.irfft(X, len(x))


def spectrogram(x):
    w = np.hanning(NFFT); n = 1 + (len(x) - NFFT) // HOP
    frames = np.stack([x[i * HOP: i * HOP + NFFT] * w for i in range(n)])
    return 20 * np.log10(np.abs(np.fft.rfft(frames, axis=1)) + 1e-9).T             # (freq bins, frames)


def peaks(S):
    """Constellation: points louder than every neighbour in a region around them, above the local level."""
    loc = (S == maximum_filter(S, size=(25, 15))) & (S > np.median(S) + 18)
    f, t = np.nonzero(loc)
    order = np.argsort(t, kind="stable")
    return [(int(t[i]), int(f[i]), float(S[f[i], t[i]])) for i in order if 4 < f[i] < NFFT // 2 - 4]


def hashes(pk):
    out = []
    for i, (t1, f1, _) in enumerate(pk):
        k = 0
        for t2, f2, _ in pk[i + 1:]:
            dt = t2 - t1
            if dt > DT_MAX: break
            if dt >= DT_MIN and abs(f2 - f1) <= DF_MAX:
                out.append(((f1, f2, dt), t1)); k += 1
                if k == F_FAN: break
    return out


def search(index, q):
    hits = defaultdict(list)
    for key, tq in q:
        for tid, tdb in index.get(key, ()):
            hits[tid].append(tdb - tq)
    res = {}
    for tid in range(N_TRACKS):
        offs = hits.get(tid, [])
        c = Counter(offs)
        best, at = 0, None
        for o in c:                                                                     # cluster = 3 neighbouring frames
            s = c[o - 1] + c[o] + c[o + 1]
            if s > best: best, at = s, o
        res[tid] = {"hits": len(offs), "score": best, "offset_frames": at, "offsets": offs}
    return res


# ---- database ----
tracks, melodies, index = [], [], defaultdict(list)
track_peaks = []
for tid in range(N_TRACKS):
    x, mel = make_track(1000 + tid); tracks.append(x); melodies.append(mel)
    pk = peaks(spectrogram(x)); track_peaks.append(pk)
    for key, t1 in hashes(pk):
        index[key].append((tid, t1))

# ---- the noisy cafe sample ----
i0 = int(CLIP_AT * SR); clean = tracks[TRUE_TRACK][i0: i0 + int(CLIP_S * SR)]
noise = cafe_noise(len(clean), 77)
gain = 10 ** (-SNR_DB / 20)                                                             # both normalised to RMS 1
sample = phone_band(clean + noise * gain)
S = spectrogram(sample); qpk = peaks(S); q = hashes(qpk)
res = search(index, q)

# which sample peaks are the song's (also in the clean track at the found offset) and which are the cafe's
off = res[TRUE_TRACK]["offset_frames"]
tp = {(t, f) for t, f, _ in track_peaks[TRUE_TRACK]}
song_peak = [any((t + off + a, f + b) in tp for a in (-1, 0, 1) for b in (-2, -1, 0, 1, 2)) for t, f, _ in qpk]

# ---- a hummed version of the same melody: pure tone, 2 semitones lower, 8 % slower, same cafe ----
hum = np.zeros(len(clean))
for t0, dur, m in melodies[TRUE_TRACK]:
    if CLIP_AT <= t0 < CLIP_AT + CLIP_S:
        st = (t0 - CLIP_AT) * 1.08
        seg = note(midi_hz(m - 2), dur * 1.08, (1, .15), vib=0.6) * np.hanning(int(dur * 1.08 * SR) or 1)
        i = int(st * SR); hum[i:i + len(seg)] += seg[: len(hum) - i]
hum /= np.sqrt(np.mean(hum ** 2))
hpk = peaks(spectrogram(phone_band(hum + noise * gain)))
hres = search(index, hashes(hpk))

# ---- robustness sweep (same clip and noise, louder noise) ----
sweep = {}
for snr in (6, 3, 0, -3, -6, -9):
    r = search(index, hashes(peaks(spectrogram(phone_band(clean + noise * 10 ** (-snr / 20))))))
    rank = sorted(r, key=lambda k: -r[k]["score"])
    sweep[str(snr)] = {"top_track": rank[0] + 1, "score": r[rank[0]]["score"], "runner_up": r[rank[1]]["score"]}

sec = HOP / SR
rank = sorted(res, key=lambda k: -res[k]["score"])
hrank = sorted(hres, key=lambda k: -hres[k]["score"])
# one example hash from song peaks that also matched in track 3 (for the on-screen chip)
qset = {(k, t) for k, t in q}
ex = None
for key, t1 in q:
    hit = [tdb for tid, tdb in index.get(key, ()) if tid == TRUE_TRACK and abs(tdb - t1 - off) <= 1]
    if hit and 300 < key[0] * SR / NFFT < 1400 and key[2] >= 8:
        ex = {"f1_hz": round(key[0] * SR / NFFT), "f2_hz": round(key[1] * SR / NFFT), "gap_s": round(key[2] * sec, 2), "anchor_t_s": round(t1 * sec, 2)}
        break
# spectrogram terrain for the sample (coarse grid for the 3D shard), 0..1
fb = np.linspace(10, 440, 17).astype(int)                                               # ~80 Hz .. 3.4 kHz
tb = np.linspace(0, S.shape[1], 41).astype(int)
grid = np.array([[S[fb[j]:fb[j + 1], tb[i]:tb[i + 1]].max() for j in range(16)] for i in range(40)])
grid = np.clip((grid - np.percentile(grid, 20)) / (np.percentile(grid, 99) - np.percentile(grid, 20)), 0, 1)

data = {
    "model": "our implementation of the method in Wang (2003); made-up music and noise; not Shazam's code",
    "params": {"sr": SR, "nfft": NFFT, "hop": HOP, "fan_out": F_FAN, "target_zone_frames": [DT_MIN, DT_MAX], "target_zone_bins": DF_MAX, "snr_db": SNR_DB},
    "database": {"tracks": N_TRACKS, "seconds_each": TRACK_S, "hashes": sum(len(v) for v in index.values()), "peaks_per_track": [len(p) for p in track_peaks]},
    "sample": {"track": TRUE_TRACK + 1, "starts_at_s": CLIP_AT, "seconds": CLIP_S, "peaks": len(qpk), "song_peaks": int(sum(song_peak)), "cafe_peaks": int(len(qpk) - sum(song_peak)), "hashes": len(q)},
    "result": {
        "per_track": {str(t + 1): {"hits": res[t]["hits"], "score": res[t]["score"], "offset_s": None if res[t]["offset_frames"] is None else round(res[t]["offset_frames"] * sec, 2)} for t in range(N_TRACKS)},
        "best_track": rank[0] + 1, "best_score": res[rank[0]]["score"], "runner_up_score": res[rank[1]]["score"],
        "found_offset_s": round(off * sec, 2), "random_hits_outside_peak": int(sum(res[t]["hits"] for t in res) - res[TRUE_TRACK]["score"]),
    },
    "hum": {"best_track": hrank[0] + 1, "best_score": hres[hrank[0]]["score"], "true_track_score": hres[TRUE_TRACK]["score"],
            "per_track_scores": {str(t + 1): hres[t]["score"] for t in range(N_TRACKS)}, "per_track_hits": {str(t + 1): hres[t]["hits"] for t in range(N_TRACKS)}},
    "snr_sweep_db": sweep,
    "example_hash": ex,
    "visual": {
        "sample_peaks": [[round(t * sec, 3), round(f * SR / NFFT), bool(s)] for (t, f, _), s in zip(qpk, song_peak)],
        "track_offsets_s": {str(t + 1): [round(o * sec, 2) for o in res[t]["offsets"]] for t in range(N_TRACKS)},
        "hum_peaks": [[round(t * sec, 3), round(f * SR / NFFT)] for t, f, _ in hpk],
        "hum_offsets_s": {str(t + 1): [round(o * sec, 2) for o in hres[t]["offsets"]] for t in range(N_TRACKS)},
        "track_peaks": {str(t + 1): [[round(tt * sec, 2), round(ff * SR / NFFT)] for tt, ff, _ in track_peaks[t]] for t in range(N_TRACKS)},
        "terrain_40x16": np.round(grid, 3).tolist(),
    },
}
json.dump(data, open(os.path.join(OUT, "fingerprint-demo.json"), "w"))
print(json.dumps({k: data[k] for k in ("database", "sample", "result", "hum", "snr_sweep_db", "example_hash")}, indent=1))
