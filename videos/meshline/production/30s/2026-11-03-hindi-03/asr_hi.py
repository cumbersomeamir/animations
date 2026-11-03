"""Hindi intelligibility + timing pass (faster-whisper small, multilingual, local CPU; MIT code / Systran model).
lines <model_dir> <narration_dir> [out.json]: per-line ASR (language=hi) with word timestamps and character error rate.
final <model_dir> <mp4> <out.json>: transcribe the final MP4 audio and score CER against the script."""
import json, sys, re, subprocess, difflib, unicodedata
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2], device='cpu', compute_type='int8')
def pcm16k(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
LOAN = {'wi-fi': 'वाईफाई', 'wifi': 'वाईफाई', 'wi fi': 'वाईफाई', 'bluetooth': 'ब्लूटूथ', 'ear buds': 'ईयरबड्स', 'earbuds': 'ईयरबड्स', 'phone': 'फोन',
        'radio': 'रेडियो', 'offline': 'ऑफलाइन', 'meshline': 'मेशलाइन', 'mesh line': 'मेशलाइन', 'pass': 'पास', 'link': 'लिंक', 'internet': 'इंटरनेट',
        'network': 'नेटवर्क', 'mobile': 'मोबाइल', 'tower': 'टावर', 'download': 'डाउनलोड', 'airplane': 'एयरप्लेन', 'aeroplane': 'एयरप्लेन', 'mode': 'मोड', 'on': 'ऑन'}
def deloan(s):  # whisper often writes English loanwords in Latin script; map them back to the script's Devanagari spelling
    s = s.lower()
    for k in sorted(LOAN, key=len, reverse=True): s = re.sub(r'(?<![a-z])' + re.escape(k) + r'(?![a-z])', LOAN[k], s)
    return s
def norm(s):  # compare letters only: drop punctuation/space, unify nukta forms (फ़→फ etc.) and chandrabindu/anusvara spelling variants
    s = unicodedata.normalize('NFD', s).replace('़', '')
    s = s.replace('ँ', 'ं')
    s = s.translate({0x940: 0x93f, 0x942: 0x941, 0x908: 0x907, 0x90a: 0x909})  # long/short i and u are spelled inconsistently in loanwords
    return re.sub(r"[^ऀ-ॿa-z]", '', s.lower().replace('।', ''))
def cer(ref, hyp):
    r, h = norm(ref), norm(deloan(hyp)); sm = difflib.SequenceMatcher(a=r, b=h, autojunk=False)
    return sum(max(i2 - i1, j2 - j1) for t, i1, i2, j1, j2 in sm.get_opcodes() if t != 'equal') / max(1, len(r))
if sys.argv[1] == 'lines':
    nd = sys.argv[3]; meta = json.load(open(f'{nd}/narration_meta.json'))['lines']; out = {}; tot = []
    for ln in meta:
        segs, _ = m.transcribe(pcm16k(f"{nd}/{ln['file']}"), language='hi', word_timestamps=True, beam_size=5)
        words = [{'w': w.word.strip(), 'start': round(w.start, 3), 'end': round(w.end, 3)} for s in segs for w in s.words]
        hyp = ' '.join(w['w'] for w in words); c = cer(ln['text'], hyp); tot.append((c, len(norm(ln['text']))))
        out[ln['id']] = words; print(f"{ln['id']} CER {c:.3f} | {hyp}")
    print('weighted CER', round(sum(c * n for c, n in tot) / sum(n for _, n in tot), 3))
    if len(sys.argv) > 4: json.dump(out, open(sys.argv[4], 'w'), indent=1, ensure_ascii=False)
else:
    segs, _ = m.transcribe(pcm16k(sys.argv[3]), language='hi', word_timestamps=True, beam_size=5)
    segs = list(segs); hyp = ' '.join(s.text.strip() for s in segs)
    ref = ' '.join(l['text'] for l in json.load(open('audio/narration/narration_meta.json'))['lines'])
    res = {'reference': ref, 'asr': hyp, 'cer': round(cer(ref, hyp), 3), 'segments': [[round(s.start, 2), round(s.end, 2), s.text.strip()] for s in segs]}
    json.dump(res, open(sys.argv[4], 'w'), indent=1, ensure_ascii=False); print('CER', res['cer']); print(hyp)
    for s in res['segments']: print(s)
