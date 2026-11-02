#!/usr/bin/env python3
"""Offline intelligibility check: transcribe each narration window of an audio/video
file with Vosk (small en-US model) and compare to the script.
Usage: asr_check.py <media> <vosk_model_dir> [out.json]"""
import difflib, json, os, re, subprocess, sys
from vosk import Model, KaldiRecognizer, SetLogLevel
SetLogLevel(-1)
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
media, model_dir = sys.argv[1], sys.argv[2]
timing = json.load(open(os.path.join(ROOT, 'audio', 'narration', 'timing.json')))
m = Model(model_dir)
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower()).split()
res = []
for L in timing['lines']:
    a, b = L['start'] - 0.15, L['end'] + 0.2
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-ss', str(a), '-t', str(b - a), '-i', media, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    r = KaldiRecognizer(m, 16000)
    for i in range(0, len(pcm), 8000): r.AcceptWaveform(pcm[i:i + 8000])
    hyp = json.loads(r.FinalResult()).get('text', '')
    ref, h = norm(L['text']), norm(hyp)
    acc = sum(x.size for x in difflib.SequenceMatcher(None, ref, h).get_matching_blocks()) / max(len(ref), len(h), 1)
    res.append({'id': L['id'], 'window': [round(a, 2), round(b, 2)], 'script': L['text'], 'asr': hyp, 'word_accuracy': round(acc, 3)})
    print(f"{L['id']} acc={acc:.2f}  script='{L['text']}'  asr='{hyp}'")
mean = sum(r['word_accuracy'] for r in res) / len(res)
print(f'mean word accuracy {mean:.3f}')
if len(sys.argv) > 3:
    json.dump({'media': os.path.basename(media), 'mean_word_accuracy': round(mean, 3), 'lines': res}, open(sys.argv[3], 'w'), indent=2)
