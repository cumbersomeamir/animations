"""QA: transcribe each narration line with faster-whisper (base.en, local) and
report word timings + a similarity score against the script."""
import difflib, json, os, re, sys
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(os.path.join(ROOT, "build", "vo", "manifest.json")))
model = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.join(ROOT, ".cache", "whisper"))
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
out = []
for m in man:
    x, sr = sf.read(os.path.join(ROOT, m["file"]), dtype="float32")
    t16 = np.arange(0, len(x) / sr, 1 / 16000)
    x16 = np.interp(t16, np.arange(len(x)) / sr, x).astype(np.float32)
    segs, _ = model.transcribe(x16, word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    heard = " ".join(w[0] for w in words)
    sim = difflib.SequenceMatcher(None, norm(m["text"]), norm(heard)).ratio()
    out.append({"id": m["id"], "script": m["text"], "heard": heard, "similarity": round(sim, 3), "words": words})
    print(f"{m['id']} sim={sim:.2f} | {heard}")
json.dump(out, open(os.path.join(ROOT, "build", "vo", "asr.json"), "w"), indent=1)
