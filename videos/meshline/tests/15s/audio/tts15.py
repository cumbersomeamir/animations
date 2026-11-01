"""Local narration for the 15s test: Kokoro-82M (Apache-2.0) via kokoro-onnx; no network at synthesis time.
usage: python audio/tts15.py <kokoro_dir> <voice> audio/narration.json audio/narration
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro

kdir, voice, lines_path, out = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4])
out.mkdir(parents=True, exist_ok=True)
npz = kdir / f"voices_{voice}.npz"
if not npz.exists():
    np.savez(npz, **{voice: np.fromfile(kdir / f"{voice}.bin", dtype=np.float32).reshape(-1, 1, 256)})
k = Kokoro(str(kdir / "model.onnx"), str(npz))
meta = []
for ln in json.loads(lines_path.read_text()):
    x, sr = k.create(ln["text"], voice=voice, speed=ln.get("speed", 1.0), lang="en-us")
    x = np.asarray(x, dtype=np.float32)
    idx = np.where(np.abs(x) > 0.01)[0]
    x = x[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
    with wave.open(str(out / f"{ln['id']}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    meta.append({**ln, "file": f"{ln['id']}.wav", "sr": sr, "duration": round(len(x) / sr, 3)})
    print(ln["id"], f"{len(x) / sr:.2f}s", ln["text"])
(out / "narration_meta.json").write_text(json.dumps({"voice": voice, "lines": meta}, indent=2))
