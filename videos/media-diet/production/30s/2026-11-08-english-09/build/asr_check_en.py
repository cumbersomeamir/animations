"""English intelligibility + timing pass on the ENCODED file: faster-whisper (multilingual 'medium', int8, CPU, language=en)
transcribes (1) the whole mix once (reported) and (2) each line's slice of the final mix, split at pause centres (scored).
Reports word recall (case/punctuation-insensitive LCS) overall and per line, and whether each line is heard in its own slice.
Usage: python build/asr_check_en.py <mp4> <out.json>   (model cached in .cache/models)"""
import json, os, re, sys, subprocess
import numpy as np
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'))); DUR = {l['id']: l['duration'] for l in json.load(open(os.path.join(ROOT, 'src', 'data', 'lines.json')))}
NUM = {'november fifth': 'november 5', 'november five': 'november 5', '5th': '5', 'wifi': 'wi fi', 'seatbacks': 'seatbacks'}
def words(s):
    s = s.lower().replace('u.s.', 'us').replace('’', "'")
    for a, b in NUM.items(): s = s.replace(a, b)
    return re.findall(r"[a-z0-9']+", s)
def recall(ref, hyp):
    a, b = words(ref), words(hyp); d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a)):
        for j in range(len(b)): d[i + 1][j + 1] = d[i][j] + 1 if a[i] == b[j] else max(d[i][j + 1], d[i + 1][j])
    return round(d[-1][-1] / max(1, len(a)), 3)
mp4, out = sys.argv[1], sys.argv[2]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-map', '0:a', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel('medium', device='cpu', compute_type='int8', download_root=os.path.join(ROOT, '.cache', 'models'))
segs, _ = model.transcribe(audio, language='en', beam_size=5, vad_filter=True, condition_on_previous_text=False)
full = ' '.join(s.text.strip() for s in segs)
ref = ' '.join(n['say'] for n in TL['narration'])
NAR = TL['narration']; WIN = [(n['start'], n['start'] + DUR[n['id']]) for n in NAR]
CUT = [0.0] + [(WIN[i][1] + WIN[i + 1][0]) / 2 for i in range(len(WIN) - 1)] + [TL['duration']]
rep = {'engine': 'faster-whisper 1.1.1, model Systran/faster-whisper-medium (int8, CPU), language=en', 'transcript_full_pass': full, 'recall_full_pass': recall(ref, full), 'lines': []}
PAD = np.zeros(8000, np.float32); heard_all = []
for i, n in enumerate(NAR):
    c0, c1 = CUT[i], CUT[i + 1]
    sg, _ = model.transcribe(np.concatenate([PAD, audio[int(c0 * 16000):int(c1 * 16000)], PAD]), language='en', beam_size=5, vad_filter=False, condition_on_previous_text=False)
    heard = ' '.join(s.text.strip() for s in sg); heard_all.append(heard)
    rep['lines'].append({'id': n['id'], 'window': [round(WIN[i][0], 2), round(WIN[i][1], 2)], 'transcript': heard, 'recall': recall(n['say'], heard), 'heard_in_own_slice': bool(words(heard))})
rep['transcript'] = ' '.join(heard_all); rep['recall_overall'] = recall(ref, rep['transcript'])
json.dump(rep, open(out, 'w'), indent=1)
print('ASR full pass:', full); print('word recall full pass:', rep['recall_full_pass'])
print('word recall per-line pass:', rep['recall_overall'])
for l in rep['lines']: print(f"  {l['id']} window {l['window']} recall {l['recall']}: {l['transcript']}")
