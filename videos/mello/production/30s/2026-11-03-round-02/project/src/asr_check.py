"""Optional intelligibility check: transcribe the final MP4 with faster-whisper (local CPU) and compare
with the script, word by word, and report word start times against the planned line starts.

  <venv-with-faster-whisper>/bin/python -I src/asr_check.py ../mello-30s-round02-01.mp4 [model]
Writes ../qa/asr.json. The model (default base.en) is downloaded to the Hugging Face cache on first use.
"""
import difflib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
QA = os.path.join(os.path.dirname(PROJECT), "qa")


def words(s):
    s = s.lower().replace("’", "'").replace("mellow", "mello")
    return re.findall(r"[a-z']+", s)


def main():
    from faster_whisper import WhisperModel
    video = sys.argv[1]
    model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "base.en", device="cpu", compute_type="int8")
    import subprocess
    import numpy as np
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout   # decode with ffmpeg (avoids PyAV version issues)
    audio = np.frombuffer(pcm, np.float32)
    got, word_level = [], True
    try:
        segs, _ = model.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
        for s in segs:
            for w in s.words:
                got.append({"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)})
    except IndexError:
        # faster-whisper 1.1.1 word alignment can fail on a near-empty segment (e.g. a one-word take);
        # fall back to segment timestamps: every word of a segment gets the segment start.
        got, word_level = [], False
        segs, _ = model.transcribe(audio, word_timestamps=False, beam_size=5, vad_filter=False)
        for s in segs:
            for w in s.text.split():
                got.append({"w": w, "start": round(s.start, 2), "end": round(s.end, 2)})
    with open(os.path.join(PROJECT, "generated", "timeline.json")) as fh:
        tl = json.load(fh)
    ref = [w for ln in tl["lines"] for w in words(ln["text"])]
    hyp = [w for g in got for w in words(g["w"])]
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    matched = sum(b.size for b in sm.get_matching_blocks())
    # first recognised word time for each line (by order of matching)
    line_starts = []
    flat = [(w, g["start"]) for g in got for w in words(g["w"])]
    for ln in tl["lines"]:
        first = words(ln["text"])[0]
        cand = [t for w, t in flat if w == first and abs(t - ln["start"]) < 1.0]
        line_starts.append({"id": ln["id"], "planned": ln["start"], "asr_first_word": cand[0] if cand else None})
    out = {"model": sys.argv[2] if len(sys.argv) > 2 else "base.en", "word_level_timestamps": word_level, "transcript": " ".join(g["w"] for g in got),
           "ref_words": len(ref), "matched_words": matched, "recall": round(matched / len(ref), 3),
           "missing": [ref[i] for op, i1, i2, j1, j2 in sm.get_opcodes() if op in ("delete", "replace") for i in range(i1, i2)],
           "line_starts": line_starts, "words": got}
    with open(os.path.join(QA, "asr.json"), "w") as fh:
        json.dump(out, fh, indent=2)
    print(json.dumps({k: out[k] for k in ("transcript", "recall", "missing")}, indent=1))
    print("\n".join(f"{x['id']:9s} planned {x['planned']:6.2f}  asr {x['asr_first_word']}" for x in line_starts))


if __name__ == "__main__":
    main()
