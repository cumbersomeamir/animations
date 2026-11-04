"""QA (Hindi): transcribe each narration window of the final MP4 with faster-whisper `medium` (language=hi, word
timestamps), score it against the Devanagari script, and check every heard word lies inside a caption that shows it.
Whisper writes common loanwords in Latin and drops nukta/chandrabindu variably, so both sides are normalised
(nukta → base letter, chandrabindu → anusvara, punctuation removed, a small loanword map) and scored by character
error rate (CER). usage: python asr_check_hi.py final.mp4 src/narration/lines.json src/stage/cues.js"""
import sys, re, json, subprocess, wave, difflib, unicodedata, numpy as np
from faster_whisper import WhisperModel
mp4, lines_f, cues_f = sys.argv[1:4]
LOAN = {'google': 'गूगल', 'photos': 'फोटोज', 'photo': 'फोटो', 'magic': 'मैजिक', 'eraser': 'इरेजर', 'ai': 'एआई', 'ideaverse': 'आइडियावर्स',
        'idea': 'आइडिया', 'verse': 'वर्स', 'app': 'ऐप', 'download': 'डाउनलोड', 'subscription': 'सब्सक्रिप्शन', 'phone': 'फोन', 'zoom': 'जूम', 'list': 'लिस्ट', '50': 'पचास', '20': 'बीस', '600': 'छह सौ', 'kg': 'किलो', '2': 'दो', '3': 'तीन', 'रुप्ये': 'रुपये', 'रूपये': 'रुपये'}
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()).replace('़', '')          # drop nukta
    s = s.replace('ँ', 'ं')                                          # chandrabindu → anusvara
    s = re.sub(r'₹\s*(\d+)', r'\1 रुपये', s)                                 # ₹600 → 600 रुपये
    s = ' '.join(LOAN.get(w, w) for w in re.findall(r"[\wऀ-ॿ]+", s))
    return unicodedata.normalize('NFC', s)
def cer(a, b):
    a, b = a.replace(' ', ''), b.replace(' ', '')
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)] / max(1, len(a))
lines = {l['id']: l['text'] for l in json.load(open(lines_f))}
cues = open(cues_f).read()
narr = [(m.group(1), float(m.group(2))) for m in re.finditer(r"\{ id: '(h\d)', t: ([\d.]+) \}", cues)]
caps = []
for m in re.finditer(r"\{ t0: ([\d.]+), t1: ([\d.]+), lines: (\[.*?\]\]\]),?", cues):
    caps.append((float(m.group(1)), float(m.group(2)), norm(' '.join(re.findall(r"\['([^']*)', \d\]", m.group(3))).replace('@icon', ''))))
dur = lambda i: (lambda w: w.getnframes() / w.getframerate())(wave.open(f'src/narration/wav/{i}.wav'))
x = np.frombuffer(subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
m = WhisperModel('medium', device='cpu', compute_type='int8')
bad, worst = [], 0
for i, t in narr:
    a, b = max(0, t - 0.15), t + dur(i) + 0.45
    segs, _ = m.transcribe(x[int(a * 16000):int(b * 16000)], language='hi', beam_size=5, word_timestamps=True)
    ws = [w for s in segs for w in s.words]
    heard = ' '.join(w.word.strip() for w in ws); c = cer(norm(lines[i]), norm(heard)); worst = max(worst, c)
    print(f'{i} placed {t:5.2f}s heard [{a + ws[0].start:5.2f}..{a + ws[-1].end:5.2f}] CER {c:.2f}\n   script: {lines[i]}\n   heard : {heard}')
    for w in ws:
        mid = a + (w.start + w.end) / 2; cap = [cc for cc in caps if cc[0] <= mid < cc[1]]
        nw = norm(w.word)
        if not nw: continue
        ok = bool(cap) and max((difflib.SequenceMatcher(None, nw, tok).ratio() for tok in cap[0][2].split()), default=0) >= 0.5
        if not ok: bad.append((round(mid, 2), w.word.strip(), cap[0][2] if cap else None))
print(f'worst line CER: {worst:.2f}  (spelling-normalised; ASR proxy for intelligibility)')
print('words outside a caption that shows them:', bad if bad else 'none')
