"""Generate narration lines locally with Kokoro-82M (Apache-2.0) via kokoro-onnx.

No network calls at synthesis time. Model + voice files are downloaded once from
https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX (see scripts/setup.sh).

usage: python audio/tts.py <kokoro_dir> <voice> <out_dir>
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro

LINES = json.loads((Path(__file__).parent / "narration.json").read_text())


def main():
    kdir, voice, out = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
    out.mkdir(parents=True, exist_ok=True)
    # kokoro-onnx expects an .npz of voices; the HF release ships raw float32 .bin per voice.
    npz = kdir / f"voices_{voice}.npz"
    if not npz.exists():
        arr = np.fromfile(kdir / f"{voice}.bin", dtype=np.float32).reshape(-1, 1, 256)
        np.savez(npz, **{voice: arr})
    k = Kokoro(str(kdir / "model.onnx"), str(npz))
    meta = []
    for line in LINES:
        samples, sr = k.create(line["text"], voice=voice, speed=line.get("speed", 1.0), lang="en-us")
        samples = np.asarray(samples, dtype=np.float32)
        # trim leading/trailing near-silence so placement in the timeline is exact
        idx = np.where(np.abs(samples) > 0.01)[0]
        if len(idx):
            samples = samples[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
        pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
        path = out / f"{line['id']}.wav"
        with wave.open(str(path), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(pcm.tobytes())
        meta.append({**line, "file": path.name, "sr": sr, "duration": round(len(pcm) / sr, 3)})
        print(f"{line['id']}: {len(pcm) / sr:.2f}s  {line['text']}")
    (out / "narration_meta.json").write_text(json.dumps({"voice": voice, "lines": meta}, indent=2))


if __name__ == "__main__":
    main()
