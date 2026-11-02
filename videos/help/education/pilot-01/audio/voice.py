"""Synthesize Tally's narration lines with Piper (offline, local ONNX model).

Voice source: Piper en_US-ljspeech-medium (dataset: LJ Speech, public domain).
Character processing (done afterwards in mix.py via FFmpeg rubberband) makes
Tally's timbre distinct from the stock model. No cloud API, no secrets.

Usage: .venv/bin/python audio/voice.py
Writes build/voice/line_XX.wav (raw, trimmed) and build/voice/lines.json
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "models" / "en_US-ljspeech-medium.onnx"
OUT = ROOT / "audio" / "generated" / "voice"  # committed: Piper sampling is stochastic, so the takes used are kept
SCRIPT = json.loads((ROOT / "src" / "script.json").read_text())


def trim(x, sr, thresh=0.012, pad=0.03):
    """Trim leading/trailing silence, keep a small pad."""
    env = np.abs(x)
    idx = np.where(env > thresh)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def main():
    """--only L1,L3 re-takes just those lines and keeps the other committed takes."""
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    OUT.mkdir(parents=True, exist_ok=True)
    old = {}
    if (OUT / "lines.json").exists():
        old = {m["id"]: m for m in json.loads((OUT / "lines.json").read_text())}
    voice = PiperVoice.load(str(MODEL))
    sr = voice.config.sample_rate
    meta = []
    for i, line in enumerate(SCRIPT["lines"]):
        if only is not None and line["id"] not in only and line["id"] in old and old[line["id"]]["say"] == line["say"]:
            meta.append(old[line["id"]])
            print(f"{line['id']}: kept {old[line['id']]['dur']:.2f}s")
            continue
        cfg = SynthesisConfig(
            length_scale=line.get("length_scale", SCRIPT["length_scale"]),
            noise_scale=0.55,
            noise_w_scale=0.7,
            normalize_audio=True,
        )
        chunks = list(voice.synthesize(line["say"], syn_config=cfg))
        pcm = np.concatenate([c.audio_float_array for c in chunks]).astype(np.float32)
        pcm = trim(pcm, sr)
        path = OUT / f"line_{i:02d}.wav"
        with wave.open(str(path), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes((np.clip(pcm, -1, 1) * 32767).astype("<i2").tobytes())
        dur = len(pcm) / sr
        meta.append({"id": line["id"], "say": line["say"], "file": str(path.relative_to(ROOT)), "dur": round(dur, 3), "sr": sr})
        print(f"{line['id']}: {dur:.2f}s  {line['say']}")
    (OUT / "lines.json").write_text(json.dumps(meta, indent=2))
    gen = ROOT / "src" / "generated"
    gen.mkdir(parents=True, exist_ok=True)
    (gen / "lines.json").write_text(json.dumps(meta, indent=2))
    print("total speech", round(sum(m["dur"] for m in meta), 2), "s")


if __name__ == "__main__":
    sys.exit(main())
