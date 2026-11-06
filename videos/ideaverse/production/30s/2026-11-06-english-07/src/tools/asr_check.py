"""QA: transcribe each narration window of the final MP4 (faster-whisper base.en, word timestamps), compare with the
script, and check that every spoken word falls inside a caption that contains it.
usage: python asr_check.py final.mp4 src/narration/lines.json src/stage/cues.js"""
import sys, re, json, subprocess, wave, numpy as np
from faster_whisper import WhisperModel
mp4, lines_f, cues_f = sys.argv[1:4]
lines = {l['id']: l['text'] for l in json.load(open(lines_f))}
cues = open(cues_f).read()
narr = [(m.group(1), float(m.group(2))) for m in re.finditer(r"\{ id: '(s\d)', t: ([\d.]+) \}", cues)]
caps = []
for m in re.finditer(r"\{ t0: ([\d.]+), t1: ([\d.]+), lines: (\[.*?\]\]\]),?", cues):
    txt = ' '.join(re.findall(r"\['([^']*)', \d\]", m.group(3))).replace('@icon', '')
    caps.append((float(m.group(1)), float(m.group(2)), txt))
norm = lambda s: re.sub(r"[^a-z0-9 ]", '', s.lower().replace('-', ' ')).split()
dur = lambda i: (lambda w: w.getnframes() / w.getframerate())(wave.open(f'src/narration/wav/{i}.wav'))
x = np.frombuffer(subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
m = WhisperModel('base.en', device='cpu', compute_type='int8')
allok, bad = True, []
for i, t in narr:
    a, b = max(0, t - 0.15), t + dur(i) + 0.45
    segs, _ = m.transcribe(x[int(a * 16000):int(b * 16000)], beam_size=5, word_timestamps=True)
    ws = [w for s in segs for w in s.words]
    heard = ' '.join(w.word.strip() for w in ws); exp = lines[i]
    NUM = {'315': 'three fifteen', '350': 'three fifty', '3:15': 'three fifteen', '3:50': 'three fifty', '6': 'six', '8': 'eight', '8?': 'eight'}
    heard_w = ' '.join(NUM.get(w.strip('.,'), w) for w in heard.split())
    ok = norm(heard_w) == norm(exp); allok &= ok
    print(f'{i} placed {t:5.2f}s  heard [{a + ws[0].start:5.2f}..{a + ws[-1].end:5.2f}]  {"MATCH" if ok else "DIFF"}: {heard}')
    if not ok: print(f'   expected: {exp}')
    for w in ws:
        mid = a + (w.start + w.end) / 2; cap = [c for c in caps if c[0] <= mid < c[1]]
        tok = norm({'6': 'six', '8': 'eight', '8?': 'eight'}.get(w.word.strip(), w.word))
        if not cap or not all(k in norm(cap[0][2]) for k in tok): bad.append((round(mid, 2), w.word.strip(), cap[0][2] if cap else None))
print('all lines match script:', allok)
print('words outside a caption that shows them:', bad if bad else 'none')
