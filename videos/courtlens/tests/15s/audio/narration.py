"""Local narration for the 15 s test (Kokoro-82M v1.0 ONNX, Apache-2.0).
Reuses the sha256-verified model cached by ../../project/tools/fetch_models.sh (no new download).
Writes build/vo/<id>.wav + build/vo/manifest.json, then checks intelligibility with faster-whisper."""
import difflib, json, os, re, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CACHE = os.path.abspath(os.path.join(ROOT, "..", "..", "project", ".cache", "kokoro"))
OUT = os.path.join(ROOT, "build", "vo"); os.makedirs(OUT, exist_ok=True)
tl = json.load(open(os.path.join(ROOT, "timeline.json")))
voice = tl["voice"]["id"]
npz = os.path.join(CACHE, f"voices-{voice}.npz")
if not os.path.exists(npz):
    np.savez(npz, **{voice: np.fromfile(os.path.join(CACHE, f"{voice}.bin"), dtype=np.float32).reshape(-1, 1, 256)})
tts = Kokoro(os.path.join(CACHE, "model.onnx"), npz)

def trim(x, sr, th=0.008, pad=0.04):
    idx = np.where(np.abs(x) > th)[0]
    a, b = max(0, idx[0] - int(pad * sr)), min(len(x), idx[-1] + int(pad * sr))
    y = x[a:b].copy(); f = int(0.01 * sr)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

man = []
for ln in tl["narration"]:
    s, sr = tts.create(ln.get("say", ln["text"]), voice=voice, speed=ln.get("speed", tl["voice"]["speed"]), lang="en-us")
    y = trim(np.asarray(s, np.float32), sr)
    p = os.path.join(OUT, ln["id"] + ".wav"); sf.write(p, y, sr, subtype="PCM_16")
    man.append({**ln, "file": os.path.relpath(p, ROOT), "duration": round(len(y) / sr, 3), "end": round(ln["start"] + len(y) / sr, 3), "sr": sr})
# ASR intelligibility + word timings (faster-whisper base.en, cached locally)
from faster_whisper import WhisperModel
wm = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=os.path.abspath(os.path.join(ROOT, "..", "..", "project", ".cache", "whisper")))
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ")).split()
ok = True
for m in man:
    x, sr = sf.read(os.path.join(ROOT, m["file"]), dtype="float32")
    t16 = np.arange(0, len(x) / sr, 1 / 16000); x16 = np.interp(t16, np.arange(len(x)) / sr, x).astype(np.float32)
    segs, _ = wm.transcribe(x16, word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for sg in segs for w in sg.words]
    heard = " ".join(w[0] for w in words)
    sim = difflib.SequenceMatcher(None, norm(m.get("say", m["text"])), norm(heard)).ratio()
    m["asr"] = {"heard": heard, "similarity": round(sim, 3), "words": words}
    print(f"{m['id']} {m['duration']:.2f}s [{m['start']:.2f}->{m['end']:.2f}] sim={sim:.2f} | {heard}")
    ok &= sim >= 0.85
for a, b in zip(man, man[1:]):
    if a["end"] + 0.1 > b["start"]: print("WARN overlap", a["id"], b["id"]); ok = False
if man[-1]["end"] > tl["duration"] - 0.25: print("WARN last line too late"); ok = False
json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
sys.exit(0 if ok else 2)
