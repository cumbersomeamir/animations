"""Bix's voice: local Kokoro-82M (Apache-2.0) via kokoro-onnx, with an original blended style vector.
usage: python audio/voice.py <kokoro_dir> audio/narration.json audio/narration
"""
import json, sys, wave
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro

kdir, spec_path, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
spec = json.loads(spec_path.read_text()); v = spec["voice"]
out.mkdir(parents=True, exist_ok=True)
style = sum(w * np.fromfile(kdir / f"{name}.bin", dtype=np.float32).reshape(-1, 1, 256) for name, w in v["blend"].items())
npz = kdir / "voices_bix.npz"; np.savez(npz, bix=style.astype(np.float32))
k = Kokoro(str(kdir / "model.onnx"), str(npz))
meta = []
for ln in spec["lines"]:
    x, sr = k.create(ln["text"], voice="bix", speed=v.get("speed", 1.0), lang="en-us")
    x = np.asarray(x, dtype=np.float32); idx = np.where(np.abs(x) > 0.01)[0]
    x = x[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
    with wave.open(str(out / f"{ln['id']}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    meta.append({**ln, "file": f"{ln['id']}.wav", "sr": sr, "duration": round(len(x) / sr, 3), "end": round(ln["start"] + len(x) / sr, 3)})
    print(f"{ln['id']} {ln['start']:5.2f}-{meta[-1]['end']:5.2f}s ({len(x) / sr:.2f}s)  {ln['text']}")
(out / "narration_meta.json").write_text(json.dumps({"voice": v, "lines": meta}, indent=2))
