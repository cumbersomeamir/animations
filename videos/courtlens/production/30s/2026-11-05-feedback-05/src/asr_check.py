"""Listening proxy on the FINAL mixed MP4 audio (voice + music + SFX), local faster-whisper 'medium', language=hi.
Usage: python asr_check.py <mp4> <narration.json> <timeline.json> <asr_model_dir> <out.json>
Reports: full-transcript character error rate against the script (nukta-insensitive), per-line transcripts, and
caption/speech alignment, meaning every recognised word must fall inside a caption window that is on screen."""
import json, re, subprocess, sys, unicodedata
import numpy as np
from faster_whisper import WhisperModel

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
    ss, _ = asr.transcribe(seg, language="hi", beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
    ws = [(w.word.strip(), a + float(w.start), a + float(w.end)) for s_ in ss for w in s_.words]
    words += ws; per_heard[l["id"]] = " ".join(w for w, _, _ in ws)
# Whisper sometimes writes English loanwords in Latin script; map them back before scoring
LATIN = {"supreme": "सुप्रीम", "court": "कोर्ट", "recording": "रिकॉर्डिंग", "record": "रिकॉर्ड", "call": "कॉल",
         "phone": "फ़ोन", "deposit": "डिपॉज़िट", "post": "पोस्ट", "edit": "एडिट", "file": "फ़ाइल", "follow": "फ़ॉलो",
         "courtlens": "कोर्टलेंस"}
def devan(h): return " ".join(LATIN.get(re.sub(r"[^a-z]", "", t.lower()), t) for t in h.split())
def norm(s): s = unicodedata.normalize("NFC", s).replace("़", ""); return re.sub(r"[^ऀ-ॿ0-9]", "", s)
def cer(a, b):
    a, b = norm(a), norm(b); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p = d[:]; d[0] = i
        for j, cb in enumerate(b, 1): d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (ca != cb))
    return d[len(b)] / max(1, len(a))

script = " ".join(l["text"] for l in lines)
heard = " ".join(devan(per_heard[i]) for i in ids)
per_line = [{"id": l["id"], "script": l["text"], "heard_raw": per_heard[l["id"]], "heard": devan(per_heard[l["id"]]),
             "cer": round(cer(l["text"], devan(per_heard[l["id"]])), 3)} for l in lines]
caps = tl["captions"]
outside = [(w, round(s, 2), round(e, 2)) for w, s, e in words
           if not any(c["start"] <= (s + e) / 2 < c["end"] for c in caps)]
rep = {"full_cer": round(cer(script, heard), 3), "heard": heard, "per_line": per_line,
       "words": [(w, round(s, 2), round(e, 2)) for w, s, e in words],
       "words_outside_captions": outside, "caption_alignment_pass": len(outside) == 0}
json.dump(rep, open(out, "w"), ensure_ascii=False, indent=1)
print("full CER", rep["full_cer"]); [print(f"{p['id']} cer={p['cer']} | {p['heard_raw']}") for p in per_line]
print("words outside caption windows:", outside)
