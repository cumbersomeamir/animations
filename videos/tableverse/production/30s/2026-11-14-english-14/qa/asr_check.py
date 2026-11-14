"""Transcribe the delivered MP4 locally (faster-whisper base.en, cached model) with word timestamps and
compare each planned narration clip window (build/vo_spans.json) with the words heard inside it.
Usage: <venv-with-faster-whisper>/bin/python -I qa/asr_check.py <mp4> <vo_spans.json>"""
import json
import os
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

mp4, spans_path = sys.argv[1], sys.argv[2]
cache = os.environ.get("ASR_CACHE", "/tmp/claude-0/-home-user-animations/5d68f7a4-a9c7-5742-833b-d048f6d79bdb/scratchpad/asr/models")
model = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=cache)
# decode with ffmpeg (16 kHz mono float32) instead of PyAV to avoid a PyAV/faster-whisper API mismatch
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
segs, _ = model.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
words = [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]
spans = json.load(open(spans_path))
print("FULL TRANSCRIPT:")
print(" ".join(w for _, _, w in words))
print()
print(f"{'clip':5s} {'planned':>15s}  heard (words whose midpoint falls in the planned window +/-0.15 s)")
for s in spans:
    heard = [w for a, b, w in words if s["start"] - 0.15 <= (a + b) / 2 <= s["end"] + 0.15]
    first = next(((a, b) for a, b, w in words if s["start"] - 0.15 <= (a + b) / 2 <= s["end"] + 0.15), None)
    off = f"first word @ {first[0]:5.2f}s (offset {first[0] - s['start']:+.2f}s)" if first else "NO WORDS"
    print(f"{s['id']:5s} {s['start']:6.2f}-{s['end']:6.2f}s  {' '.join(heard)}   [{off}]")
