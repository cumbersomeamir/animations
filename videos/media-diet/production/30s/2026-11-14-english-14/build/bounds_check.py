"""Caption + safe-area check over all 900 frames from qa/text-bounds-raw.json (overlay text ink boxes).
Rules (approved feedback rules, context/26, 11 Nov 2026): caption ink inside x 100–900, y 230–1500, max 2 lines;
every overlay label also inside x 100–900, y 230–1500 (clear of platform overlays); labels never enter the caption band
(y 300–560) while a caption is on screen, so caption and label never compete; at most one large label (≥ 60 px) at a time."""
import json
raw = json.load(open('qa/text-bounds-raw.json')); viol = []; capf = 0
for fr in raw:
    caps = [i for i in fr['items'] if i['kind'] == 'caption']; capf += bool(caps)
    if len(caps) > 2: viol.append({'f': fr['f'], 'rule': 'max 2 caption lines'})
    bigs = [i for i in fr['items'] if i['kind'] == 'label' and i['y1'] - i['y0'] >= 44]
    if len(bigs) > 1: viol.append({'f': fr['f'], 'rule': 'one large label at a time', 'n': len(bigs)})
    for i in fr['items']:
        if i['x0'] < 100 or i['x1'] > 900 or i['y0'] < 230 or i['y1'] > 1500: viol.append({'f': fr['f'], 'rule': 'safe area x100-900 y230-1500', **i})
        if caps and i['kind'] == 'label' and i['y0'] < 560 and i['y1'] > 300: viol.append({'f': fr['f'], 'rule': 'label in caption band', **i})
caps = [i for fr in raw for i in fr['items'] if i['kind'] == 'caption']; labs = [i for fr in raw for i in fr['items'] if i['kind'] == 'label']
rep = {'frames': len(raw), 'frames_with_captions': capf, 'caption_ink_y_min': min(i['y0'] for i in caps), 'caption_ink_y_max': max(i['y1'] for i in caps),
       'caption_x_min': min(i['x0'] for i in caps), 'caption_x_max': max(i['x1'] for i in caps),
       'label_x_min': min(i['x0'] for i in labs), 'label_x_max': max(i['x1'] for i in labs), 'label_y_min': min(i['y0'] for i in labs), 'label_y_max': max(i['y1'] for i in labs), 'violations': viol}
json.dump(rep, open('qa/text-bounds.json', 'w'), indent=1)
print(f"bounds: {len(raw)} frames, caption ink y {rep['caption_ink_y_min']}–{rep['caption_ink_y_max']}, x {rep['caption_x_min']}–{rep['caption_x_max']}; "
      f"labels x {rep['label_x_min']}–{rep['label_x_max']}, y {rep['label_y_min']}–{rep['label_y_max']}; violations {len(viol)}")
for v in viol[:10]: print(' ', v)
