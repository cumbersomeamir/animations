"""Listening proxy on the FINAL mixed MP4 audio (voice + music + SFX), local faster-whisper 'medium', language=en.
Usage: python asr_check.py <mp4> <narration.json> <timeline.json> <asr_model_dir> <out.json>
Reports: full-transcript word error rate against the script (spelled letters/digits and number words normalised),
per-line transcripts, and caption/speech alignment, meaning every recognised word must fall inside a caption
window that is on screen."""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textnorm import wer

mp4, narr, tlp, model_dir, out = sys.argv[1:6]
tl = json.load(open(tlp)); lines = json.load(open(narr))
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
asr = WhisperModel("medium", device="cpu", compute_type="int8", download_root=model_dir)
starts = {n["id"]: n["start"] for n in tl["narration"]}
ids = [l["id"] for l in lines]
words, per_heard = [], {}
for i, l in enumerate(lines):          # per-line windows of the FINAL mix (music + SFX included)
    a = max(0.0, starts[l["id"]] - 0.2); b = min(30.0, (starts[ids[i + 1]] - 0.05) if i + 1 < len(ids) else 30.0)
    seg = x[int(a * 16000): int(b * 16000)]
    ss, _ = asr.transcribe(seg, language="en", beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    ws = [(w.word.strip(), a + float(w.start), a + float(w.end)) for s_ in ss for w in s_.words]
    words += ws; per_heard[l["id"]] = " ".join(w for w, _, _ in ws)
script = " ".join(l["text"] for l in lines)
heard = " ".join(per_heard[i] for i in ids)
per_line = [{"id": l["id"], "script": l["text"], "heard": per_heard[l["id"]], "wer": round(wer(l["text"], per_heard[l["id"]]), 3)}
            for l in lines]
caps = tl["captions"]
outside = [(w, round(s, 2), round(e, 2)) for w, s, e in words
           if not any(c["start"] <= (s + e) / 2 < c["end"] for c in caps)]
rep = {"full_wer": round(wer(script, heard), 3), "heard": heard, "per_line": per_line,
       "words": [(w, round(s, 2), round(e, 2)) for w, s, e in words],
       "words_outside_captions": outside, "caption_alignment_pass": len(outside) == 0}
json.dump(rep, open(out, "w"), ensure_ascii=False, indent=1)
print("full WER", rep["full_wer"]); [print(f"{p['id']} wer={p['wer']} | {p['heard']}") for p in per_line]
print("words outside caption windows:", outside)
