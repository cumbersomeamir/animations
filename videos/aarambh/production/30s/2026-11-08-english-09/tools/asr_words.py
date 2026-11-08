"""One ASR + timing pass (QA/timing only): faster-whisper tiny.en word timestamps on a media file.
Usage: python tools/asr_words.py <media> <out.json> [--models DIR]"""
import sys, json, re, subprocess, tempfile, wave, numpy as np
from faster_whisper import WhisperModel
media, out = sys.argv[1], sys.argv[2]
models = sys.argv[sys.argv.index("--models") + 1] if "--models" in sys.argv else None
with tempfile.TemporaryDirectory() as td:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", media, "-ac", "1", "-ar", "16000", f"{td}/a.wav"], check=True)
    w = wave.open(f"{td}/a.wav"); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
m = WhisperModel("tiny.en", device="cpu", compute_type="int8", download_root=models)
segs, _ = m.transcribe(a, beam_size=5, word_timestamps=True)
words = [{"w": x.word.strip(), "start": round(x.start, 2), "end": round(x.end, 2)} for s in segs for x in s.words]
json.dump({"model": "faster-whisper tiny.en int8", "words": words, "text": " ".join(x["w"] for x in words)}, open(out, "w"), indent=1)
print(" ".join(x["w"] for x in words))
