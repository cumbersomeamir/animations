"""Word timing + intelligibility check for the English narration lines (local faster-whisper 'medium', language=en).
Usage: python align.py <lines_dir> <narration.json> <asr_model_dir>  -> <lines_dir>/word_times.json
Used as a listening proxy: prints what the recogniser hears for each line next to the script, with a word error
rate (spelled letters/digits and number words normalised), and stores per-word start/end times used to place
captions and scene events."""
import json, os, sys
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textnorm import wer

lines_dir, narr, model_dir = sys.argv[1:4]
asr = WhisperModel("medium", device="cpu", compute_type="int8", download_root=model_dir)
out = {}
for item in json.load(open(narr)):
    x, sr = sf.read(f"{lines_dir}/{item['id']}.wav"); x = np.asarray(x, np.float64)
    n16 = int(len(x) * 16000 / sr); x16 = np.fft.irfft(np.fft.rfft(x)[: n16 // 2 + 1], n16) * (16000 / sr)
    segs, _ = asr.transcribe(x16.astype(np.float32), language="en", beam_size=5, word_timestamps=True)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    hyp = " ".join(w for w, _, _ in words)
    out[item["id"]] = {"script": item["text"], "heard": hyp, "wer": round(wer(item["text"], hyp), 3), "words": words}
    print(f"{item['id']} wer={out[item['id']]['wer']:.3f}\n  script: {item['text']}\n  heard : {hyp}\n  words : {words}")
json.dump(out, open(f"{lines_dir}/word_times.json", "w"), ensure_ascii=False, indent=1)
print("mean WER", round(float(np.mean([v["wer"] for v in out.values()])), 3))
