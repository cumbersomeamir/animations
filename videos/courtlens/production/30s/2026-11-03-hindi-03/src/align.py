"""Word timing + intelligibility check for the Hindi narration lines (local faster-whisper 'medium', language=hi).
Usage: python align.py <lines_dir> <narration.json> <asr_model_dir>  -> <lines_dir>/word_times.json
Used as a listening proxy: prints what the recogniser hears for each line next to the script, with a character
error rate (nukta-insensitive), and stores per-word start/end times used to place captions and scene events."""
import json, re, sys, unicodedata
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel

lines_dir, narr, model_dir = sys.argv[1:4]
asr = WhisperModel("medium", device="cpu", compute_type="int8", download_root=model_dir)
def norm(s): s = unicodedata.normalize("NFC", s).replace("़", ""); return re.sub(r"[^ऀ-ॿ0-9]", "", s)
def cer(a, b):
    a, b = norm(a), norm(b); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p = d[:]; d[0] = i
        for j, cb in enumerate(b, 1): d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (ca != cb))
    return d[len(b)] / max(1, len(a))
out = {}
for item in json.load(open(narr)):
    x, sr = sf.read(f"{lines_dir}/{item['id']}.wav"); x = np.asarray(x, np.float64)
    n16 = int(len(x) * 16000 / sr); x16 = np.fft.irfft(np.fft.rfft(x)[: n16 // 2 + 1], n16) * (16000 / sr)
    segs, _ = asr.transcribe(x16.astype(np.float32), language="hi", beam_size=5, word_timestamps=True)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    hyp = " ".join(w for w, _, _ in words)
    out[item["id"]] = {"script": item["text"], "heard": hyp, "cer": round(cer(item["text"], hyp), 3), "words": words}
    print(f"{item['id']} cer={out[item['id']]['cer']:.3f}\n  script: {item['text']}\n  heard : {hyp}\n  words : {words}")
json.dump(out, open(f"{lines_dir}/word_times.json", "w"), ensure_ascii=False, indent=1)
print("mean CER", round(float(np.mean([v["cer"] for v in out.values()])), 3))
