"""Synthesize narration lines with Piper and report internal pause boundaries.
Usage: python narration_probe.py <model.onnx> <out_dir> <lines.json>
"""
import json, subprocess, sys, wave, os
import numpy as np

model, out_dir, lines_path = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
lines = json.load(open(lines_path))
piper = os.path.join(os.path.dirname(sys.executable), 'piper')

def read_wav(p):
    with wave.open(p) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return sr, x

def segments(x, sr, thr_db=-38, min_gap=0.07):
    hop = int(sr * 0.01)
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2) + 1e-12) for i in range(n)])
    db = 20*np.log10(rms + 1e-9)
    voiced = db > thr_db
    segs = []; start = None; last_v = None
    for i, v in enumerate(voiced):
        if v:
            if start is None: start = i
            last_v = i
        elif start is not None and (i - last_v) * 0.01 >= min_gap:
            segs.append((start*0.01, (last_v+1)*0.01)); start = None
    if start is not None: segs.append((start*0.01, (last_v+1)*0.01))
    return segs

for ln in lines:
    p = os.path.join(out_dir, ln['id'] + '.wav')
    subprocess.run([piper, '-m', model, '--length-scale', str(ln.get('length_scale', 0.92)), '-f', p],
                   input=ln['text'].encode(), check=True, capture_output=True)
    sr, x = read_wav(p)
    s = segments(x, sr)
    print(f"{ln['id']:4s} {len(x)/sr:5.2f}s  {ln['text']!r}")
    print('      ' + '  '.join(f"[{a:.2f}-{b:.2f}]" for a, b in s))
