"""One ASR + timing pass on the delivered MP4 (faster-whisper base.en, offline, CPU int8) against the final script.
Reports word recall (LCS) and, per narration line, the first/last recognised word times vs the scripted window.
Usage: python build/asr_check.py <video.mp4> <out.json>"""
import sys, json, os, re, subprocess
import numpy as np
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4, out = sys.argv[1], sys.argv[2]
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'))); lines = json.load(open(os.path.join(ROOT, 'src', 'data', 'lines.json')))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-map', '0:a', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
wav = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0   # decoded samples (avoids PyAV API differences)
model = WhisperModel(os.path.join(ROOT, '.cache', 'models', 'faster-whisper-base.en'), device='cpu', compute_type='int8')
segs, _ = model.transcribe(wav, language='en', word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=True, vad_parameters={'min_silence_duration_ms': 250})
words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)} for s in segs for w in s.words]
norm = lambda x: re.sub(r"[^a-z0-9 ]", ' ', x.lower().replace('-', ' ').replace("'", '').replace('’', '')).split()
script = [w for l in TL['narration'] for w in norm(l['say'])]; heard = [w for x in words for w in norm(x['w'])]
n, m = len(script), len(heard); dp = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(n):
    for j in range(m): dp[i + 1][j + 1] = dp[i][j] + 1 if script[i] == heard[j] else max(dp[i][j + 1], dp[i + 1][j])
per = []
for l in TL['narration']:
    d = next(x['duration'] for x in lines if x['id'] == l['id']); ws = [x for x in words if x['s'] >= l['start'] - 0.3 and x['e'] <= l['start'] + d + 0.3]
    per.append({'id': l['id'], 'script': l['say'], 'window': [l['start'], round(l['start'] + d, 2)], 'heard': ' '.join(x['w'] for x in ws),
                'first_word_s': ws[0]['s'] if ws else None, 'last_word_e': ws[-1]['e'] if ws else None})
rep = {'engine': 'faster-whisper 1.1.1, model Systran/faster-whisper-base.en (int8, CPU)', 'word_recall_lcs': round(dp[n][m] / n, 3), 'script_words': n, 'heard_words': m,
       'transcript': ' '.join(x['w'] for x in words), 'lines': per, 'words': words}
json.dump(rep, open(out, 'w'), indent=1)
print('ASR:', rep['transcript']); print('word recall (LCS):', rep['word_recall_lcs'])
for p in per: print(f"  {p['id']} window {p['window']} heard {p['first_word_s']}–{p['last_word_e']}: {p['heard']}")
