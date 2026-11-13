"""One ASR + timing pass on the final exported audio (faster-whisper, local, CPU).

usage: python asr.py <final.mp4|wav> <voice-timing.json> <out.json>
Reports the transcript, word error rate against the final script, and how far the
heard word starts drift from the Kokoro word timings used for captions and cues.
"""
import json
import re
import subprocess
import sys
import tempfile

import soundfile as sf
from faster_whisper import WhisperModel

MODEL = "base.en"  # official Systran conversion of OpenAI whisper base.en on Hugging Face


def norm(s):
    return re.sub(r"[^a-z0-9' ]+", " ", s.lower().replace("’", "'")).split()


def wer(ref, hyp):
    r, h = ref, hyp
    d = [[0] * (len(h) + 1) for _ in range(len(r) + 1)]
    for i in range(len(r) + 1):
        d[i][0] = i
    for j in range(len(h) + 1):
        d[0][j] = j
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1][-1] / max(1, len(r))


def main():
    src, timing_path, out = sys.argv[1:4]
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", tmp.name], check=True)
        model = WhisperModel(MODEL, device="cpu", compute_type="int8")
        audio, _ = sf.read(tmp.name, dtype="float32")  # pass samples (avoids a PyAV version mismatch)
        span_end = max(l["t1"] for l in json.load(open(timing_path))["lines"]) + 0.7
        span_end = min(span_end, len(audio) / 16000 - 0.15)  # english-12: the CTA ends at 29.55 s, keep the window inside the file
        # only the narration span: on the music-only tail Whisper hallucinates "." segments past the end of
        # the file, which crash faster-whisper 1.2.1's word alignment
        segs, info = model.transcribe(audio, language="en", word_timestamps=True, beam_size=5, vad_filter=False,
                                      condition_on_previous_text=False, clip_timestamps=[0.0, span_end])
        words = []
        text = []
        for s in segs:
            text.append(s.text.strip())
            for w in s.words:
                words.append({"w": w.word.strip(), "t0": round(w.start, 3), "t1": round(w.end, 3), "p": round(w.probability, 3)})
    timing = json.load(open(timing_path))
    ref_text = " ".join(l["text"] for l in timing["lines"])
    hyp_text = " ".join(text)
    ref_w, hyp_w = norm(ref_text), norm(hyp_text)
    # align heard words to scripted words in order (greedy on equal tokens) for timing drift
    ref_words = [w for l in timing["lines"] for w in l["words"]]
    drift, j = [], 0
    for rw in ref_words:
        key = norm(rw["w"])
        if not key:
            continue
        for k in range(j, min(j + 4, len(words))):
            if norm(words[k]["w"]) == key:
                drift.append(abs(words[k]["t0"] - rw["t0"]))
                j = k + 1
                break
    res = {
        "model": MODEL,
        "transcript": hyp_text,
        "reference": ref_text,
        "wer": round(wer(ref_w, hyp_w), 4),
        "matched_words": len(drift),
        "scripted_words": len(ref_words),
        "mean_abs_start_drift_s": round(sum(drift) / max(1, len(drift)), 3),
        "max_abs_start_drift_s": round(max(drift) if drift else 0, 3),
        "low_confidence_words": [w for w in words if w["p"] < 0.6],
        "words": words,
    }
    json.dump(res, open(out, "w"), indent=1)
    print(json.dumps({k: res[k] for k in ["wer", "matched_words", "scripted_words", "mean_abs_start_drift_s", "max_abs_start_drift_s", "transcript"]}, indent=1))
    print("low confidence:", [(w["w"], w["p"]) for w in res["low_confidence_words"]])


if __name__ == "__main__":
    main()
