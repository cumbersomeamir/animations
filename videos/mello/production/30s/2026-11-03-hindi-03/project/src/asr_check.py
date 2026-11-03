"""Hindi intelligibility check: transcribe the narration (or the final MP4) with faster-whisper
large-v3-turbo forced to Hindi, then compare with the Devanagari script.

  <venv-with-faster-whisper>/bin/python -I src/asr_check.py ../mello-30s-hindi03-01.mp4 [model]

Reports character error rate (CER) and word error rate (WER) after a light normalisation:
NFC, nukta-insensitive (ज़ = ज, a common ASR spelling variant), punctuation removed, and digits
spelled the way the narration says them. Also lists per-line ASR text by segment time.
Writes ../qa/asr.json.
"""
import json
import os
import re
import subprocess
import sys
import unicodedata

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
QA = os.path.join(os.path.dirname(PROJECT), "qa")
DIGITS = {"2000": "दो हज़ार"}


LATIN_LOANS = {"spotlight effect": "स्पॉटलाइट इफ़ेक्ट", "spotlight": "स्पॉटलाइट", "mindful": "माइंडफुल"}   # Whisper may write English loanwords in Latin


def norm(s):
    s = unicodedata.normalize("NFC", s)
    low = s.lower()
    for k, v in LATIN_LOANS.items():
        low = low.replace(k, v)
    s = unicodedata.normalize("NFC", low)
    for k, v in DIGITS.items():
        s = s.replace(k, v)
    s = s.replace("़", "")                      # nukta-insensitive
    s = re.sub(r"[^ऀ-ॿ0-9a-zA-Z ]", " ", s)
    s = s.replace("।", " ").replace("॥", " ")
    return re.sub(r"\s+", " ", s).strip()


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[-1]


def main():
    from faster_whisper import WhisperModel
    src = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else "large-v3-turbo"
    model = WhisperModel(name, device="cpu", compute_type="int8")
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.float32)
    with open(os.path.join(PROJECT, "generated", "timeline.json")) as fh:
        tl = json.load(fh)
    # transcribe each placed line on its own window (one 30 s window truncates long Hindi decodes)
    segs = []
    for ln in tl["lines"]:
        a, b = int(max(0, ln["start"] - 0.15) * 16000), int(min(30, ln["end"] + 0.25) * 16000)
        part, _ = model.transcribe(audio[a:b], language="hi", beam_size=5, vad_filter=False, condition_on_previous_text=False)
        text = " ".join(p.text.strip() for p in part)
        r, h = norm(ln["text"]), norm(text)
        segs.append({"id": ln["id"], "start": ln["start"], "end": ln["end"], "text": text,
                     "cer": round(lev(r.replace(" ", ""), h.replace(" ", "")) / max(1, len(r.replace(" ", ""))), 3)})
    ref = norm(" ".join(l["text"] for l in tl["lines"]))
    hyp = norm(" ".join(s["text"] for s in segs))
    cer = lev(ref.replace(" ", ""), hyp.replace(" ", "")) / len(ref.replace(" ", ""))
    wer = lev(ref.split(), hyp.split()) / len(ref.split())
    out = {"model": name, "language": "hi", "cer": round(cer, 3), "wer": round(wer, 3),
           "reference": " ".join(l["text"] for l in tl["lines"]), "transcript": " ".join(s["text"] for s in segs),
           "segments": segs}
    os.makedirs(QA, exist_ok=True)
    with open(os.path.join(QA, "asr.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=2, ensure_ascii=False)
    print(json.dumps({k: out[k] for k in ("cer", "wer", "transcript")}, ensure_ascii=False, indent=1))
    for s in segs:
        print(f"{s['id']:6s} {s['start']:6.2f}-{s['end']:6.2f}  CER {s['cer']:.3f}  {s['text']}")


if __name__ == "__main__":
    main()
