"""Optional QA: transcribe the final MP4 with faster-whisper (MIT) and compare to the script.

Run with a separate venv that has faster-whisper installed:
  python asr_check.py <path-to-mp4> <model_dir>
Writes videos/mello/output/qa/asr.json.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import OUTPUT, load_timeline  # noqa: E402


def norm(s):
    return re.sub(r"[^a-z' ]", " ", s.lower().replace("mellow", "mello")).split()


def main():
    from faster_whisper import WhisperModel
    video, model_dir = sys.argv[1], sys.argv[2]
    m = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=model_dir)
    import subprocess
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, np.float32)
    segs, _ = m.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
    words = []
    for s in segs:
        for w in s.words:
            words.append(dict(w=w.word.strip(), start=round(w.start, 2), end=round(w.end, 2)))
    tl = load_timeline()
    script = []
    for ln in tl.values():
        script += norm(ln["text"])
    heard = norm(" ".join(w["w"] for w in words))
    # word-level match via longest common subsequence
    n, k = len(script), len(heard)
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    for i in range(n):
        for j in range(k):
            dp[i + 1][j + 1] = dp[i][j] + 1 if script[i] == heard[j] else max(dp[i][j + 1], dp[i + 1][j])
    lcs = dp[n][k]
    per_line = []
    for ln in tl.values():
        got = [w["w"] for w in words if ln["start"] - 0.3 <= w["start"] <= ln["end"] + 0.3]
        per_line.append(dict(id=ln["id"], script=ln["text"], heard=" ".join(got), vo_start=ln["start"], vo_end=ln["end"]))
    out = dict(model="faster-whisper base.en (int8, CPU)", script_words=n, heard_words=k, matched_words=lcs,
               word_recall=round(lcs / n, 3), lines=per_line, words=words)
    with open(os.path.join(OUTPUT, "qa", "asr.json"), "w") as fh:
        json.dump(out, fh, indent=2)
    print(f"word recall {lcs}/{n} = {lcs / n:.1%}")
    for pl in per_line:
        print(f"  {pl['vo_start']:5.2f}  {pl['script']:<62s} | {pl['heard']}")


if __name__ == "__main__":
    main()
