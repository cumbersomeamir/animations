"""Hindi ASR check of each narration line (faster-whisper medium, multilingual, language='hi').

Writes narration/words.json (word timings) and narration/asr.json (transcript + character error rate per line).
CER is computed on Devanagari after normalising: nukta and chandrabindu/anusvara variants are unified, and the
three English loanwords that Whisper writes in Latin script (AI, Recall, download) are mapped back to Devanagari.
This is an intelligibility proxy for a reviewer who cannot listen; it is not a substitute for a native listener.
"""
import json
import os
import re
import unicodedata

import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
NAR = os.path.join(HERE, "narration")
LATIN = {"ai": "एआई", "recall": "रिकॉल", "download": "डाउनलोड", "touch": "टच", "screen": "स्क्रीन", "phone": "फ़ोन"}


def norm(s):
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"[A-Za-z]+", lambda m: LATIN.get(m.group(0).lower(), m.group(0)), s)
    s = s.replace("़", "").replace("ँ", "ं")
    return re.sub(r"[^ऀ-ॿ]", "", s)


def cer(ref, hyp):
    a, b = norm(ref), norm(hyp)
    D = np.arange(len(b) + 1)
    for i in range(1, len(a) + 1):
        prev, D[0] = D.copy(), i
        for j in range(1, len(b) + 1):
            D[j] = min(prev[j] + 1, D[j - 1] + 1, prev[j - 1] + (a[i - 1] != b[j - 1]))
    return float(D[-1]) / max(1, len(a))


def main():
    meta = json.load(open(os.path.join(NAR, "lines.json")))
    m = WhisperModel("medium", device="cpu", compute_type="int8")
    out, words = [], {"model": "faster-whisper medium (multilingual) int8", "lines": []}
    for ln in meta["lines"]:
        x, sr = sf.read(os.path.join(NAR, ln["file"]), dtype="float32")
        x = resample_poly(x, 16000, sr).astype(np.float32)
        segs, _ = m.transcribe(x, language="hi", beam_size=5, word_timestamps=True)
        segs = list(segs)
        hyp = " ".join(s.text.strip() for s in segs)
        out.append({"id": ln["id"], "text": ln["text"], "asr": hyp, "cer": round(cer(ln["text"], hyp), 3)})
        words["lines"].append({"id": ln["id"], "text": ln["text"], "asr": hyp, "duration": ln["duration"],
                               "words": [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for s in segs for w in (s.words or [])]})
        print(f"{ln['id']} CER {out[-1]['cer']:.3f} | {hyp}")
    json.dump(out, open(os.path.join(NAR, "asr.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(words, open(os.path.join(NAR, "words.json"), "w"), ensure_ascii=False, indent=1)
    print("mean CER", round(float(np.mean([o["cer"] for o in out])), 3))


if __name__ == "__main__":
    main()
