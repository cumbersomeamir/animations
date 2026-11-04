"""Generate HINDI narration locally with Kokoro-82M v1.0 (Apache-2.0) via kokoro-onnx (lang "hi", espeak-ng Hindi G2P).

Usage (production 30s-01):
  .venv/bin/python tts.py                    # writes narration/<id>.wav + narration/lines.json
  .venv/bin/python tts.py --voice af_bella --out /tmp/test   # audition another voice/blend

Narrator voice (script.json): hf_beta 0.7 + hm_omega 0.3, speed 0.98, lang "hi" -- a blend of two of Kokoro v1.0's official
Hindi voice packs (same 0.7/0.3 female-led structure as the accepted English blend; no English voice is fed Hindi text).
It does not imitate any named person. Hindi voice packs: audio/.cache/kokoro-hi (fetch_models.sh, sha256-checked).
Model: reuses the cached, sha256-verified Kokoro files (pilot-01/audio/.cache/kokoro) or $KOKORO_CACHE.
"""
import argparse
import json
import os

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.environ.get("KOKORO_CACHE") or next((p for p in [os.path.join(HERE, ".cache", "kokoro"), os.path.join(ROOT, "..", "..", "..", "education", "pilot-01", "audio", ".cache", "kokoro")] if os.path.exists(os.path.join(p, "model.onnx"))), os.path.join(HERE, ".cache", "kokoro"))

SCRIPT = json.load(open(os.path.join(ROOT, "script.json")))
VOICES_HI = os.path.join(HERE, ".cache", "kokoro-hi", "voices_hi.npz")


def voice_vector(k, spec):
    """'af_heart:0.6+bf_emma:0.4' -> weighted style tensor; plain name -> that voice."""
    parts = [p.split(":") for p in spec.split("+")]
    if len(parts) == 1 and len(parts[0]) == 1:
        return parts[0][0]
    total = sum(float(w) for _, w in parts)
    return sum(k.get_voice_style(n) * (float(w) / total) for n, w in parts)


def trim(audio, sr, thresh=0.006, pad=0.025):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(audio), idx[-1] + int(pad * sr))
    out = audio[a:b].copy()
    f = int(0.008 * sr)  # 8 ms fades: no clicks at the trim points
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=SCRIPT["voice"])
    ap.add_argument("--speed", type=float, default=SCRIPT["speed"])
    ap.add_argument("--out", default=os.path.join(HERE, "narration"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    k = Kokoro(os.path.join(CACHE, "model.onnx"), VOICES_HI)
    style = voice_vector(k, a.voice)
    meta = []
    for line in SCRIPT["lines"]:
        audio, sr = k.create(line["text"], voice=style, speed=line.get("speed", a.speed), lang=SCRIPT.get("lang", "en-us"))
        audio = trim(np.asarray(audio, dtype=np.float32), sr)
        path = os.path.join(a.out, f"{line['id']}.wav")
        sf.write(path, audio, sr, subtype="PCM_16")
        dur = len(audio) / sr
        wps = len(line["text"].split()) / dur
        meta.append({"id": line["id"], "text": line["text"], "file": os.path.basename(path),
                     "duration": round(dur, 3), "sr": sr, "words_per_s": round(wps, 2)})
        print(f"{line['id']}: {dur:.2f}s  {wps:.2f} w/s  '{line['text']}'")
    with open(os.path.join(a.out, "lines.json"), "w") as f:
        json.dump({"voice": a.voice, "speed": a.speed,
                   "model": "Kokoro-82M v1.0 ONNX (onnx-community, Apache-2.0)", "lines": meta}, f, indent=2)


if __name__ == "__main__":
    main()
