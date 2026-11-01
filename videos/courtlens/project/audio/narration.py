"""Generate the timed narration locally with Kokoro-82M (Apache-2.0, ONNX).

Reads ../timeline.json (narration lines + start times), synthesises each line,
trims silence and writes build/vo/<id>.wav plus build/vo/manifest.json with
measured durations. No network access or paid API is used at synthesis time.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(ROOT, ".cache", "kokoro")
OUT = os.path.join(ROOT, "build", "vo")


def voices_npz(voice):
    path = os.path.join(CACHE, f"voices-{voice}.npz")
    if not os.path.exists(path):
        raw = np.fromfile(os.path.join(CACHE, f"{voice}.bin"), dtype=np.float32)
        np.savez(path, **{voice: raw.reshape(-1, 1, 256)})
    return path


def trim(x, sr, thresh=0.008, pad=0.04):
    env = np.abs(x)
    idx = np.where(env > thresh)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    y = x[a:b].copy()
    f = int(0.01 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


def main():
    tl = json.load(open(os.path.join(ROOT, "timeline.json")))
    voice = tl["voice"]["id"]
    speed = tl["voice"]["speed"]
    tts = Kokoro(os.path.join(CACHE, "model.onnx"), voices_npz(voice))
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    for line in tl["narration"]:
        samples, sr = tts.create(line.get("say", line["text"]), voice=voice, speed=line.get("speed", speed), lang="en-us")
        y = trim(np.asarray(samples, dtype=np.float32), sr)
        p = os.path.join(OUT, f"{line['id']}.wav")
        sf.write(p, y, sr, subtype="PCM_16")
        dur = len(y) / sr
        end = line["start"] + dur
        manifest.append({**line, "file": os.path.relpath(p, ROOT), "duration": round(dur, 3), "end": round(end, 3), "sr": sr})
        print(f"{line['id']}: {dur:5.2f}s  [{line['start']:5.2f} -> {end:5.2f}]  {line['text']}")
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=2)
    # overlap / bounds check
    ok = True
    for a, b in zip(manifest, manifest[1:]):
        if a["end"] + 0.12 > b["start"]:
            print(f"WARN overlap: {a['id']} ends {a['end']} but {b['id']} starts {b['start']}")
            ok = False
    if manifest[-1]["end"] > tl["duration"] - 0.3:
        print("WARN last line runs too close to the end")
        ok = False
    sys.exit(0 if ok else 2)


if __name__ == "__main__":
    main()
