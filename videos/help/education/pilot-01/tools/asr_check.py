"""QA-only: transcribe WAV(s) with an offline Vosk model to check narration intelligibility.
   usage: python -I tools/asr_check.py <vosk-model-dir> <16k-mono.wav> [...]"""
import json, sys, wave
from vosk import Model, KaldiRecognizer, SetLogLevel
SetLogLevel(-1)
model = Model(sys.argv[1])
for f in sys.argv[2:]:
    wf = wave.open(f); rec = KaldiRecognizer(model, wf.getframerate()); rec.SetWords(True)
    words = []
    while True:
        d = wf.readframes(4000)
        if not d: break
        if rec.AcceptWaveform(d): words += json.loads(rec.Result()).get('result', [])
    words += json.loads(rec.FinalResult()).get('result', [])
    print(f.split('/')[-1], '->', ' '.join(w['word'] for w in words))
    print('   timed:', ' '.join(f"{w['word']}@{w['start']:.2f}" for w in words))
