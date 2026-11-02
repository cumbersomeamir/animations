"""Draw a QA timeline image of the audio stems (narration / music / SFX / final mix) with narration windows,
SFX cue ticks and picture cuts. Usage: python build/audio_plot.py <out.png> <final_mix.wav>"""
import sys, json, wave, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
lines = json.load(open(os.path.join(ROOT, 'src', 'data', 'lines.json')))
def rd(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels()).mean(axis=1), w.getframerate()
W, rowH, pad = 1800, 150, 60
stems = [('narration', os.path.join(ROOT, 'audio', 'narration.wav')), ('music (ducked)', os.path.join(ROOT, 'audio', 'music.wav')),
         ('sfx', os.path.join(ROOT, 'audio', 'sfx.wav')), ('final mix (loudnorm, AAC source)', sys.argv[2])]
img = Image.new('RGB', (W + 2 * pad, len(stems) * (rowH + 30) + 120), (8, 10, 36)); d = ImageDraw.Draw(img)
font = ImageFont.load_default()
dur = TL['duration']
X = lambda t: pad + int(t / dur * W)
for c in (2.65, 6.32, 8.75, 10.7): d.line([(X(c), 30), (X(c), img.height - 40)], fill=(90, 90, 140), width=1)
for i, (name, p) in enumerate(stems):
    a, sr = rd(p); y0 = 40 + i * (rowH + 30)
    d.text((pad, y0 - 14), name, fill=(220, 225, 255), font=font)
    if i == 0:
        for l in lines: d.rectangle([X(l['start']), y0, X(l['end']), y0 + rowH], fill=(30, 40, 90))
    if i == 2:
        for c in TL['sfx']: d.line([(X(c['t']), y0), (X(c['t']), y0 + 8)], fill=(254, 64, 146), width=2)
    n = len(a); step = n / W
    for x in range(W):
        seg = a[int(x * step): int((x + 1) * step)]
        if len(seg) == 0: continue
        pk = float(np.max(np.abs(seg))); rms = float(np.sqrt(np.mean(seg ** 2)))
        cy = y0 + rowH // 2
        d.line([(pad + x, cy - pk * rowH / 2), (pad + x, cy + pk * rowH / 2)], fill=(42, 221, 250))
        d.line([(pad + x, cy - rms * rowH / 2), (pad + x, cy + rms * rowH / 2)], fill=(163, 89, 250))
for s in range(16): d.text((X(s) - 4, img.height - 34), f'{s}s', fill=(180, 185, 230), font=font)
img.save(sys.argv[1]); print('wrote', sys.argv[1])
