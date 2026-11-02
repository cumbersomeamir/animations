"""QA only (not part of rendering): transcribe the final MP4's audio with an open ASR model
(faster-whisper tiny.en, MIT; model weights from Systran on Hugging Face) and compare with the script.
Usage: python tools/asr_check.py aarambh-education-pilot-01.mp4 --models /path/to/model-cache
Writes qa/asr.json. A smaller model is a stricter intelligibility proxy."""
import argparse, json, re, subprocess, tempfile, wave
import numpy as np
from pathlib import Path
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument("media"); ap.add_argument("--models", default=None)
a = ap.parse_args()
with tempfile.TemporaryDirectory() as td:
    wav = Path(td) / "a.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.media, "-ac", "1", "-ar", "16000", str(wav)], check=True)
    m = WhisperModel("tiny.en", device="cpu", compute_type="int8", download_root=a.models)
    with wave.open(str(wav)) as w:
        audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    segs, _ = m.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
    words = [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for s in segs for w in s.words]
norm = lambda s: re.sub(r"[^a-z' ]", " ", s.lower().replace("lock stitch", "lockstitch")).split()
script = " ".join(l["tts_text"] for l in json.loads((ROOT / "audio/script.json").read_text())["lines"])
ref, hyp = norm(script), norm(" ".join(w["w"] for w in words))
# word error rate (Levenshtein on words)
d = [[0] * (len(hyp) + 1) for _ in range(len(ref) + 1)]
for i in range(len(ref) + 1): d[i][0] = i
for j in range(len(hyp) + 1): d[0][j] = j
for i in range(1, len(ref) + 1):
    for j in range(1, len(hyp) + 1):
        d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (ref[i-1] != hyp[j-1]))
wer = d[-1][-1] / len(ref)
out = {"model": "faster-whisper tiny.en (int8, CPU)", "reference": " ".join(ref), "hypothesis": " ".join(hyp), "wer": round(wer, 3), "words": words}
(ROOT / "qa/asr.json").write_text(json.dumps(out, indent=1))
print("REF:", " ".join(ref)); print("HYP:", " ".join(hyp)); print("WER: %.3f" % wer)
for w in words:
    if w["w"].lower().strip(".,!?") in ("down", "up", "loop", "hook", "bobbin", "lock", "lockstitch", "tight"):
        print("  key word %-12s %.2f-%.2f" % (w["w"], w["start"], w["end"]))
