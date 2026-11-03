"""One ASR + timing pass (faster-whisper base.en, local CPU, MIT code / Systran model). Mode 'lines' writes per-line
word timestamps to asr_words.json; mode 'final' transcribes the final MP4 audio and scores it against the script."""
import json, sys, re
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2], device='cpu', compute_type='int8')
import subprocess, numpy as np
def pcm16k(path):  # decode with system FFmpeg (avoids the PyAV version mismatch)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower().replace('’', "'")).split()
if sys.argv[1] == 'lines':
    meta = json.load(open('audio/narration/narration_meta.json'))['lines']; out = {}
    for ln in meta:
        segs, _ = m.transcribe(pcm16k(f"audio/narration/{ln['file']}"), language='en', word_timestamps=True, beam_size=5)
        words = [{'w': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)} for s in segs for w in s.words]
        out[ln['id']] = words; print(ln['id'], ' '.join(w['w'] for w in words))
    json.dump(out, open('asr_words.json', 'w'), indent=1)
else:
    import difflib
    segs, _ = m.transcribe(pcm16k(sys.argv[3]), language='en', word_timestamps=True, beam_size=5)
    segs = list(segs); hyp = ' '.join(s.text.strip() for s in segs)
    ref = ' '.join(l['text'] for l in json.load(open('audio/narration/narration_meta.json'))['lines'])
    r, h = norm(ref), norm(hyp); sm = difflib.SequenceMatcher(a=r, b=h)
    errs = sum(max(i2 - i1, j2 - j1) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != 'equal')
    res = {'reference': ref, 'asr': hyp, 'wer': round(errs / len(r), 3), 'segments': [[round(s.start, 2), round(s.end, 2), s.text.strip()] for s in segs]}
    json.dump(res, open(sys.argv[4], 'w'), indent=1); print('WER', res['wer']); print(hyp)
    for s in res['segments']: print(s)
