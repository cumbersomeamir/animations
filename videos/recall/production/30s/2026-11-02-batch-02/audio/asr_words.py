"""One ASR + timing pass over the narration WAVs: transcript check and word timestamps for caption splits.

Usage: .venv/bin/python asr_words.py   ->  narration/words.json
"""
import json
import os
from math import gcd

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
meta = json.load(open(os.path.join(HERE, "narration", "lines.json")))
m = WhisperModel("base.en", device="cpu", compute_type="int8")
out = []
for line in meta["lines"]:
    a, sr = sf.read(os.path.join(HERE, "narration", line["file"]), dtype="float32")
    if a.ndim > 1:
        a = a.mean(1)
    g = gcd(sr, 16000)
    a16 = resample_poly(a, 16000 // g, sr // g).astype(np.float32)
    segs, _ = m.transcribe(a16, beam_size=5, language="en", word_timestamps=True)
    segs = list(segs)
    words = [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    hyp = " ".join(s.text.strip() for s in segs)
    out.append({"id": line["id"], "text": line["text"], "asr": hyp, "duration": line["duration"], "words": words})
    print(line["id"], "|", hyp, "|", " ".join(f"{w['w']}@{w['start']}" for w in words))
json.dump({"model": "faster-whisper base.en int8", "lines": out}, open(os.path.join(HERE, "narration", "words.json"), "w"), indent=1)
