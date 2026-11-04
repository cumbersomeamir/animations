"""Hindi ASR check (faster-whisper multilingual, language forced to hi). Usage: asr_hi.py <model> <wav...>"""
import sys, os, subprocess, unicodedata, difflib
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device='cpu', compute_type='int8')
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()
for p in sys.argv[2:]:
    segs, info = m.transcribe(load(p), language='hi', word_timestamps=True, beam_size=5)
    words = [(w.word.strip(), round(w.start, 2), round(w.end, 2)) for s in segs for w in s.words]
    print(os.path.basename(p), '|', ' '.join(w for w, _, _ in words))
    print('   ', words)
