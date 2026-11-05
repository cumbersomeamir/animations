"""Hindi ASR + timing check (faster-whisper multilingual `medium`, language='hi', local CPU).

usage: python asr_hi.py <audio-or-mp4> <voice-timing.json> <out.json>
Reports the Devanagari transcript, word and character error rates against the script (after
normalising punctuation and nukta, which Whisper often drops or adds), and the drift between
heard word starts and the estimated word times used for captions.
"""
import json
import re
import subprocess
import sys
import tempfile
import unicodedata

import soundfile as sf
from faster_whisper import WhisperModel

MODEL = "medium"  # official Systran/faster-whisper-medium (multilingual) on Hugging Face


def norm_text(s):
    s = unicodedata.normalize("NFC", s)
    s = s.replace("़", "")                       # nukta: फ़ == फ for scoring
    s = re.sub(r"[।॥,.?!:;\"'“”‘’—\-]", " ", s)
    return s.split()


def edit(a, b):
    d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            cur = d[j]
            d[j] = min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))
            prev = cur
    return d[-1]


def main():
    src, timing_path, out = sys.argv[1:4]
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", tmp.name], check=True)
        audio, _ = sf.read(tmp.name, dtype="float32")
    model = WhisperModel(MODEL, device="cpu", compute_type="int8")
    timing = json.load(open(timing_path))
    # Transcribe sentence by sentence (each narration line +/- 0.25 s, cut from the final audio):
    # a single 30 s pass with music/SFX and pauses made Whisper hallucinate and drop sentences.
    words, text, per_line = [], [], []
    for l in timing["lines"]:
        a0 = max(0.0, l["t0"] - 0.25); a1 = min(len(audio) / 16000, l["t1"] + 0.25)
        clip = audio[int(a0 * 16000):int(a1 * 16000)]
        segs, info = model.transcribe(clip, language="hi", word_timestamps=True, beam_size=5, vad_filter=False,
                                      condition_on_previous_text=False, initial_prompt="नमस्ते, यह एक हिंदी वीडियो है।")
        lt = []
        for sg in segs:
            lt.append(sg.text.strip())
            for w in sg.words:
                words.append({"w": w.word.strip(), "t0": round(a0 + w.start, 3), "t1": round(a0 + w.end, 3), "p": round(w.probability, 3)})
        hyp_l = " ".join(lt); text.append(hyp_l)
        rl, hl = "".join(norm_text(l["text"])), "".join(norm_text(hyp_l))
        per_line.append({"id": l["id"], "ref": l["text"], "hyp": hyp_l, "cer": round(edit(rl, hl) / max(1, len(rl)), 3)})
    ref = " ".join(l["text"] for l in timing["lines"])
    hyp = " ".join(text)
    rw, hw = norm_text(ref), norm_text(hyp)
    rc, hc = "".join(rw), "".join(hw)
    # drift: heard word starts vs the estimated script word starts, matched in order
    ref_words = [w for l in timing["lines"] for w in l["words"]]
    drift, j = [], 0
    for r in ref_words:
        key = "".join(norm_text(r["w"]))
        for k in range(j, min(j + 4, len(words))):
            if "".join(norm_text(words[k]["w"])) == key:
                drift.append(words[k]["t0"] - r["t0"]); j = k + 1; break
    res = {
        "model": MODEL, "language": info.language, "language_probability": round(info.language_probability, 3), "per_line": per_line,
        "transcript": hyp, "reference": ref,
        "wer": round(edit(rw, hw) / max(1, len(rw)), 4), "cer": round(edit(rc, hc) / max(1, len(rc)), 4),
        "matched_words": len(drift), "scripted_words": len(ref_words),
        "mean_abs_start_drift_s": round(sum(abs(d) for d in drift) / max(1, len(drift)), 3),
        "max_abs_start_drift_s": round(max((abs(d) for d in drift), default=0), 3),
        "low_confidence_words": [w for w in words if w["p"] < 0.5], "words": words,
    }
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
    print(json.dumps({k: res[k] for k in ["language", "language_probability", "wer", "cer", "matched_words", "scripted_words", "mean_abs_start_drift_s", "max_abs_start_drift_s"]}, ensure_ascii=False))
    for p in per_line: print(p["id"], "CER", p["cer"], "|", p["hyp"])
    print("low confidence:", [(w["w"], w["p"]) for w in res["low_confidence_words"]])


if __name__ == "__main__":
    main()
