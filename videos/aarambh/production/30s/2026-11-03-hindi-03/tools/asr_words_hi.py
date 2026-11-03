"""Hindi ASR/timing check (QA only): faster-whisper multilingual 'small' (int8, CPU), language='hi', word timestamps.
Usage: python tools/asr_words_hi.py <media> <out.json> --models DIR"""
import sys, json, subprocess, tempfile, wave, numpy as np
from faster_whisper import WhisperModel
media, out = sys.argv[1], sys.argv[2]
models = sys.argv[sys.argv.index("--models") + 1] if "--models" in sys.argv else None
with tempfile.TemporaryDirectory() as td:
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", media, "-ac", "1", "-ar", "16000", f"{td}/a.wav"], check=True)
    w = wave.open(f"{td}/a.wav"); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
m = WhisperModel("small", device="cpu", compute_type="int8", download_root=models)
segs, info = m.transcribe(a, language="hi", beam_size=5, word_timestamps=True)
segs = list(segs)
words = [{"w": x.word.strip(), "start": round(x.start, 2), "end": round(x.end, 2)} for s in segs for x in s.words]
res = {"model": "faster-whisper small (multilingual) int8, language=hi", "segments": [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in segs], "words": words}
json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
for s in res["segments"]: print(f"{s['start']:6.2f}-{s['end']:6.2f}  {s['text']}")
