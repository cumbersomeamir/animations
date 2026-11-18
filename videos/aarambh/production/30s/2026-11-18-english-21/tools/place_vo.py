"""Timing track (QA/cue input only): place audio/narration/S*.wav at their script.json starts -> build/vo_timing.wav (48 kHz mono, 30 s).
Usage: python tools/place_vo.py"""
import json, subprocess, wave, numpy as np
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SR, N = 48000, 48000 * 30
V = np.zeros(N, np.float32)
for s in json.loads((ROOT / "audio/script.json").read_text())["sentences"]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / f"audio/narration/{s['id']}.wav"), "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    i = int(round(s["start"] * SR)); m = min(len(x), N - i); V[i:i + m] += x[:m]
    print(s["id"], s["start"], "->", round(s["start"] + len(x) / SR, 2))
(ROOT / "build").mkdir(exist_ok=True)
with wave.open(str(ROOT / "build/vo_timing.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(V, -1, 1) * 32767).astype(np.int16).tobytes())
