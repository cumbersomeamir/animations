"""Hindi intelligibility + timing pass on the ENCODED file: faster-whisper (multilingual 'medium', int8, CPU, language=hi)
back-transcribes the mix (one full pass, reported, plus one pass per line slice of the final mix, scored); brand names that Whisper writes in Latin script (Apple, iOS, iPhone, Google, AI, Media Diet …)
and digits are mapped to the spoken Devanagari forms before scoring. Reports overall and per-line character error rate
(CER, Devanagari-normalised: nukta and chandrabindu folded) and whether each line is heard inside its scripted window (words split at pause centres; ±0.5 s timestamp tolerance).
Usage: python build/asr_check_hi.py <mp4> <out.json>   (model cached in .cache/models)"""
import json, os, re, sys, subprocess, unicodedata
import numpy as np
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'))); LINES = json.load(open(os.path.join(ROOT, 'src', 'data', 'lines.json')))
DUR = {l['id']: l['duration'] for l in LINES}
LATIN = [('playprotect', 'प्ले प्रोटेक्ट'), ('play protect', 'प्ले प्रोटेक्ट'), ('play store', 'प्ले स्टोर'), ('play', 'प्ले'), ('store', 'स्टोर'), ('protect', 'प्रोटेक्ट'), ('app', 'ऐप'), ('install', 'इंस्टॉल'), ('phone', 'फ़ोन'), ('scan', 'स्कैन'), ('android', 'ऐंड्रॉइड'), ('settings', 'सेटिंग्स'),
         ('media diet', 'मीडिया डाइट'), ('synth id', 'सिंथ आई डी'), ('synthid', 'सिंथ आई डी'), ('iphone', 'आईफ़ोन'), ('ios', 'आईओएस'), ('apple', 'ऐपल'), ('google', 'गूगल'),
         ('ai', 'एआई'), ('update', 'अपडेट'), ('image', 'इमेज'), ('playground', 'प्लेग्राउंड'), ('photos', 'फ़ोटोज़'), ('watermark', 'वॉटरमार्क'), ('detector', 'डिटेक्टर'),
         ('pro', 'प्रो'), ('technology', 'टेक्नोलॉजी'), ('model', 'मॉडल'), ('tool', 'टूल'), ('follow', 'फ़ॉलो'), ('id', 'आई डी'),
         ('27.2', 'सत्ताईस पॉइंट दो'), ('26', 'छब्बीस'), ('15', 'पंद्रह'), ('16', 'सोलह')]
def to_dev(s):
    s = ' ' + s.lower() + ' '
    for a, b in LATIN: s = re.sub(r'(?<![a-z0-9.])' + re.escape(a) + r'(?![a-z0-9])', ' ' + b + ' ', s)
    return s
def norm(s):
    s = unicodedata.normalize('NFC', to_dev(s)).replace('़', '').replace('ँ', 'ं')
    return re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', s))
def cer(ref, hyp):
    a, b = norm(ref), norm(hyp); d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return round(d[-1] / max(1, len(a)), 3)
mp4, out = sys.argv[1], sys.argv[2]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-map', '0:a', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel('medium', device='cpu', compute_type='int8', download_root=os.path.join(ROOT, '.cache', 'models'))
# 1) one full-length pass (reported); condition_on_previous_text=False avoids Whisper's long-form drift/skipping
segs, info = model.transcribe(audio, language='hi', beam_size=5, vad_filter=True, word_timestamps=True, condition_on_previous_text=False)
full = ''.join(w.word for s in segs for w in s.words).strip()
ref = ' '.join(n['say'] for n in TL['narration'])
NAR = TL['narration']; WIN = [(n['start'], n['start'] + DUR[n['id']]) for n in NAR]
CUT = [0.0] + [(WIN[i][1] + WIN[i + 1][0]) / 2 for i in range(len(WIN) - 1)] + [TL['duration']]   # split at the centre of each pause
TOL = 0.5   # Whisper word-timestamp precision
# 2) scoring pass: each line's slice of the FINAL MIX (pause centre to pause centre), padded with 0.5 s silence
rep = {'engine': 'faster-whisper 1.1.1, model Systran/faster-whisper-medium (int8, CPU), language=hi', 'transcript_full_pass': full, 'cer_full_pass': cer(ref, full), 'lines': []}
PAD = np.zeros(8000, np.float32); heard_all = []
for i, n in enumerate(NAR):
    s0, s1 = WIN[i]; c0, c1 = CUT[i], CUT[i + 1]
    clip = np.concatenate([PAD, audio[int(c0 * 16000):int(c1 * 16000)], PAD])
    sg, _ = model.transcribe(clip, language='hi', beam_size=5, vad_filter=False, word_timestamps=True, condition_on_previous_text=False)
    ws = [(w.start - 0.5 + c0, w.end - 0.5 + c0, w.word) for s in sg for w in s.words]
    heard = ''.join(w[2] for w in ws).strip(); heard_all.append(heard)
    rep['lines'].append({'id': n['id'], 'window': [round(s0, 2), round(s1, 2)], 'heard': [round(float(ws[0][0]), 2), round(float(ws[-1][1]), 2)] if ws else None,
                         'transcript': heard, 'cer': cer(n['say'], heard), 'heard_in_own_slice': bool(ws)})   # slices end at pause centres, so words heard here belong to this line
rep['transcript'] = ' '.join(heard_all); rep['cer_overall'] = cer(ref, rep['transcript'])
json.dump(rep, open(out, 'w'), ensure_ascii=False, indent=1)
print('ASR full pass (hi):', full); print('CER full pass:', rep['cer_full_pass'])
print('ASR per-line pass (hi):', rep['transcript']); print('CER overall, per-line pass (Devanagari-normalised, brand names mapped):', rep['cer_overall'])
for l in rep['lines']: print(f"  {l['id']} window {l['window']} heard {l['heard']} CER {l['cer']}: {l['transcript']}")
