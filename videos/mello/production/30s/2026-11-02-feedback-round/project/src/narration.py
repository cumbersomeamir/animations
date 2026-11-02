"""Mello 30 s feedback-01 narration: Kokoro-82M (Apache-2.0) via kokoro-onnx, local CPU.

Voice = 0.7 * af_bella + 0.3 * am_puck (style-vector blend), lang en-us, speed 0.98.
Each line is synthesized separately, trimmed, faded and placed at a fixed start time so the
pauses (especially around the rephrasing) are deliberate. Writes generated/narration.wav
(48 kHz mono) and generated/timeline.json, which drives captions, animation and SFX.

  python -I src/narration.py            # synthesize + place
  python -I src/narration.py --measure  # print raw line durations only
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
GEN = os.path.join(PROJECT, "generated")
APP_PROJECT = os.path.abspath(os.path.join(PROJECT, "..", "..", "..", "..", "project"))
SR = 48000
DURATION = 30.0
VOICE_MIX = (("af_bella", 0.7), ("am_puck", 0.3))
LANG = "en-us"
SPEED = 0.98
# espeak-ng phonemizes "defusion" exactly like "diffusion" (dᵻfjˈuːʒən); force the clinical term's
# pronunciation /diːˈfjuːʒən/ ("dee-FYOO-zhun") by editing the phoneme string for that word only.
PHONEME_FIX = {"defusion": ("dᵻfjˈuːʒən", "diːfjˈuːʒən")}

# id, spoken text, start (s), latest allowed end (s)
LINES = [
    ("fact", "A thought can sound like a fact:", 0.35, 2.05),
    ("thought", "I'll mess this up.", 2.20, 3.40),
    ("try", "Try adding one phrase:", 4.10, 5.55),
    ("notice", "I'm noticing the thought that,", 5.80, 7.35),
    ("thought2", "I'll mess this up.", 7.60, 8.80),
    ("still", "The thought is still there,", 10.30, 11.55),
    ("observe", "but now you're observing it, instead of treating it as a prediction.", 11.65, 15.40),
    ("name", "This is a cognitive defusion technique.", 15.95, 18.40),
    ("argue", "You don't have to argue with the thought.", 18.95, 20.85),
    ("action", "Notice it, then choose one small, useful action.", 21.05, 24.10),
    ("cta", "Take a mindful break with Mello.", 26.20, 28.40),
]


def trim(x, sr, thresh_db=-42.0, pad=0.02):
    env = np.abs(x)
    win = int(sr * 0.01)
    env = np.convolve(env, np.ones(win) / win, mode="same")
    thr = 10 ** (thresh_db / 20) * max(env.max(), 1e-9)
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(idx[0] - int(pad * sr), 0)
    b = min(idx[-1] + int(pad * sr), len(x))
    return x[a:b]


def pauses(x, sr, start, min_gap=0.07, thresh_db=-32.0):
    """Internal silent gaps (absolute seconds) inside one placed line, for caption splits."""
    win = int(sr * 0.015)
    env = np.convolve(np.abs(x), np.ones(win) / win, mode="same")
    quiet = env < 10 ** (thresh_db / 20) * env.max()
    gaps, i, n = [], 0, len(x)
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if i > 0 and j < n and (j - i) / sr >= min_gap:
                gaps.append([round(start + i / sr, 3), round(start + j / sr, 3)])
            i = j
        else:
            i += 1
    return gaps


def resample(x, sr_in, sr_out):
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr_in, sr_out)
    return resample_poly(x, sr_out // g, sr_in // g).astype(np.float32)


def main():
    from kokoro_onnx import Kokoro

    model_dir = os.environ.get("MELLO_TTS_DIR", os.path.join(APP_PROJECT, ".cache", "tts"))
    k = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    style = sum(w * k.get_voice_style(v) for v, w in VOICE_MIX)
    measure = "--measure" in sys.argv
    out = np.zeros(int(SR * DURATION), dtype=np.float32)
    timeline = {"voice_mix": VOICE_MIX, "lang": LANG, "speed": SPEED, "lines": []}
    problems = []
    prev_end = 0.0
    for lid, text, start, latest_end in LINES:
        fixes = [v for w, v in PHONEME_FIX.items() if w in text.lower()]
        if fixes:
            ph = k.tokenizer.phonemize(text, LANG)
            for old, new in fixes:
                assert old in ph, (old, ph)
                ph = ph.replace(old, new)
            samples, sr = k.create(ph, voice=style, speed=SPEED, lang=LANG, is_phonemes=True)
        else:
            samples, sr = k.create(text, voice=style, speed=SPEED, lang=LANG)
        x = trim(np.asarray(samples, dtype=np.float32), sr)
        x = resample(x, sr, SR)
        f = int(0.008 * SR)
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
        dur = len(x) / SR
        end = start + dur
        if measure:
            print(f"{lid:9s} {dur:5.2f}s  {text}")
            continue
        if end > latest_end:
            problems.append(f"{lid}: ends {end:.2f}s > slot {latest_end:.2f}s")
        if start < prev_end + 0.08:
            problems.append(f"{lid}: starts {start:.2f}s before previous end {prev_end:.2f}s + 80 ms")
        prev_end = end
        a = int(start * SR)
        out[a:a + len(x)] += x[: len(out) - a]
        timeline["lines"].append({"id": lid, "text": text, "start": round(start, 3), "end": round(end, 3),
                                  "pauses": pauses(x, SR, start)})
        print(f"{lid:9s} {start:6.2f} -> {end:6.2f}  ({dur:.2f}s)  {text}")
    if measure:
        return
    out = out / np.abs(out).max() * 0.89
    os.makedirs(GEN, exist_ok=True)
    sf.write(os.path.join(GEN, "narration.wav"), out, SR, subtype="PCM_16")
    with open(os.path.join(GEN, "timeline.json"), "w") as fh:
        json.dump(timeline, fh, indent=2)
    if problems:
        print("TIMING PROBLEMS:\n  " + "\n  ".join(problems))
        sys.exit(1)


if __name__ == "__main__":
    main()
