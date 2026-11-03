"""Courtlens Hindi narration: Kokoro v1.0 (ONNX) native Hindi voices, blend hf_alpha 0.7 + hm_psi 0.3, lang "hi", speed 1.05.
(Hindi phonemes via espeak-ng "hi"; the English af_bella/am_puck voices are NOT used for Hindi.)

Usage:
  python tts.py --model-dir <dir with kokoro-v1.0.onnx + voices-v1.0.bin> --lines lines.json --out ../audio
Writes one WAV per line (24 kHz mono float) plus line_durations.json.
Model files (open weights, no API): https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
"""
import argparse, json, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICE_MIX = (("hf_alpha", 0.7), ("hm_psi", 0.3))
LANG, SPEED = "hi", 1.05

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-dir", required=True)
    ap.add_argument("--lines", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    k = Kokoro(os.path.join(a.model_dir, "kokoro-v1.0.onnx"), os.path.join(a.model_dir, "voices-v1.0.bin"))
    style = sum(w * k.get_voice_style(v) for v, w in VOICE_MIX)
    lines = json.load(open(a.lines))
    os.makedirs(a.out, exist_ok=True)
    durs = {}
    for item in lines:
        samples, sr = k.create(item["text"], voice=style, speed=SPEED, lang=LANG)
        samples = np.asarray(samples, dtype=np.float32)
        # trim leading/trailing near-silence so timeline placement is exact
        thr = 0.01 * np.max(np.abs(samples))
        nz = np.where(np.abs(samples) > thr)[0]
        pad = int(0.03 * sr)
        samples = samples[max(0, nz[0] - pad): min(len(samples), nz[-1] + pad)]
        path = os.path.join(a.out, f"{item['id']}.wav")
        sf.write(path, samples, sr)
        durs[item["id"]] = round(len(samples) / sr, 3)
        print(f"{item['id']}: {durs[item['id']]:.3f}s  {item['text']}")
    json.dump({"sample_rate": sr, "voice_mix": VOICE_MIX, "lang": LANG, "speed": SPEED, "durations": durs},
              open(os.path.join(a.out, "line_durations.json"), "w"), indent=2)
    print("total speech", round(sum(durs.values()), 3))

if __name__ == "__main__":
    main()
