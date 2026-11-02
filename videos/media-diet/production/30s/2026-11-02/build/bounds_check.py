"""Caption + safe-area check over all 900 frames from qa/text-bounds-raw.json (window.TEXTS ink boxes).
Rules: captions ink y 350–470, x 80–1000, max 2 lines; no text in y 0–300; nothing below y 1600 (bottom overlay);
all text x 80–1000."""
import json
raw = json.load(open('qa/text-bounds-raw.json')); viol = []; cap_frames = 0
for fr in raw:
    caps = [i for i in fr['items'] if i['kind'] == 'caption']
    if caps: cap_frames += 1
    if len(caps) > 2: viol.append({'f': fr['f'], 'rule': 'max 2 caption lines', 'n': len(caps)})
    for i in fr['items']:
        if i['kind'] == 'caption' and (i['y0'] < 350 or i['y1'] > 470 or i['x0'] < 80 or i['x1'] > 1000): viol.append({'f': fr['f'], 'rule': 'caption box', **i})
        if i['y0'] < 300: viol.append({'f': fr['f'], 'rule': 'top 0-300 clear', **i})
        if i['y1'] > 1600: viol.append({'f': fr['f'], 'rule': 'bottom overlay', **i})
        if i['x0'] < 80 or i['x1'] > 1000: viol.append({'f': fr['f'], 'rule': 'horizontal margin 80', **i})
ys = [(i['y0'], i['y1']) for fr in raw for i in fr['items'] if i['kind'] == 'caption']
rep = {'frames': len(raw), 'frames_with_captions': cap_frames, 'caption_ink_y_min': min(y[0] for y in ys), 'caption_ink_y_max': max(y[1] for y in ys),
       'caption_x_min': min(i['x0'] for fr in raw for i in fr['items'] if i['kind'] == 'caption'), 'caption_x_max': max(i['x1'] for fr in raw for i in fr['items'] if i['kind'] == 'caption'),
       'violations': viol}
json.dump(rep, open('qa/text-bounds.json', 'w'), indent=1)
print(f"bounds: {len(raw)} frames, caption ink y {rep['caption_ink_y_min']}–{rep['caption_ink_y_max']}, x {rep['caption_x_min']}–{rep['caption_x_max']}, violations {len(viol)}")
for v in viol[:10]: print(' ', v)
