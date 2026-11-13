"""Targeted ASR checks (faster-whisper base.en): count window 6.8-12.8 s, final 3.5 s, and the isolated VO stem.
Usage: <venv>/bin/python -I qa/asr_windows.py <model-cache> <audio files...>"""
import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("base.en", device="cpu", compute_type="int8", download_root=sys.argv[1])
for f in sys.argv[2:]:
    pcm = subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True,check=True).stdout
    segs,_ = m.transcribe(np.frombuffer(pcm,dtype=np.float32), word_timestamps=True, beam_size=5)
    print(f.split('/')[-1], '->', ' | '.join(f"{w.word.strip()}@{w.start:.2f}" for s in segs for w in s.words))
