"""Transcribe the delivered MP4 with offline Vosk ASR and compare against the scripted narration (word recall).
Usage: python build/asr_check.py <video.mp4> <vosk_model_dir> <out.json>"""
import sys, json, subprocess, re, os
from vosk import Model, KaldiRecognizer, SetLogLevel
SetLogLevel(-1)
mp4, model_dir, out = sys.argv[1:4]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(root, 'src', 'timeline.json')))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-map', '0:a', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
rec = KaldiRecognizer(Model(model_dir), 16000); rec.SetWords(True)
res = []
for i in range(0, len(raw), 8000):
    if rec.AcceptWaveform(raw[i:i + 8000]): res.append(json.loads(rec.Result()))
res.append(json.loads(rec.FinalResult()))
words = [w for r in res for w in r.get('result', [])]
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower().replace('-', ' ')).split()
script = [w.replace("'", '') for l in tl['narration'] for w in norm(l['text'])]
heard = [w['word'].replace("'", '') for w in words]
# word recall via LCS
n, m = len(script), len(heard)
dp = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(n):
    for j in range(m):
        dp[i + 1][j + 1] = dp[i][j] + 1 if script[i] == heard[j] else max(dp[i][j + 1], dp[i + 1][j])
recall = dp[n][m] / n
# per-line timing: words heard inside each scripted line window
lines = []
for l in tl['narration']:
    inwin = [w['word'] for w in words if w['start'] >= l['start'] - 0.15 and w['end'] <= l['start'] + 3.2]
    lines.append({'id': l['id'], 'start': l['start'], 'script': l['text'], 'heard_in_window': ' '.join(inwin)})
rep = {'engine': 'vosk 0.3.45 + vosk-model-small-en-us-0.15 (offline)', 'script_words': n, 'heard_words': m, 'word_recall_lcs': round(recall, 3),
       'transcript': ' '.join(heard), 'lines': lines, 'words': words}
json.dump(rep, open(out, 'w'), indent=1)
print('ASR transcript:', ' '.join(heard))
print('word recall vs script (LCS):', round(recall, 3))
