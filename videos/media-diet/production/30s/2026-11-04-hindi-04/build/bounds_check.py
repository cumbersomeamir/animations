"""Caption + safe-area check over all 900 frames from qa/text-bounds-raw.json (overlay text ink boxes).
Rules (feedback round): captions ink y 340–520, x 90–990, max 2 lines; no text at y < 300; no text below y 1600;
every text x 90–990."""
import json
raw = json.load(open('qa/text-bounds-raw.json')); viol = []; capf = 0
for fr in raw:
    caps = [i for i in fr['items'] if i['kind'] == 'caption']; capf += bool(caps)
    if len(caps) > 2: viol.append({'f': fr['f'], 'rule': 'max 2 caption lines'})
    for i in fr['items']:
        if i['kind'] == 'caption' and (i['y0'] < 340 or i['y1'] > 520 or i['x0'] < 90 or i['x1'] > 990): viol.append({'f': fr['f'], 'rule': 'caption box', **i})
        if i['y0'] < 300: viol.append({'f': fr['f'], 'rule': 'top 0-300 clear', **i})
        if i['y1'] > 1600: viol.append({'f': fr['f'], 'rule': 'bottom overlay', **i})
        if i['x0'] < 90 or i['x1'] > 990: viol.append({'f': fr['f'], 'rule': 'horizontal 90-990', **i})
caps = [i for fr in raw for i in fr['items'] if i['kind'] == 'caption']
rep = {'frames': len(raw), 'frames_with_captions': capf, 'caption_ink_y_min': min(i['y0'] for i in caps), 'caption_ink_y_max': max(i['y1'] for i in caps),
       'caption_x_min': min(i['x0'] for i in caps), 'caption_x_max': max(i['x1'] for i in caps), 'violations': viol}
json.dump(rep, open('qa/text-bounds.json', 'w'), indent=1)
print(f"bounds: {len(raw)} frames, caption ink y {rep['caption_ink_y_min']}–{rep['caption_ink_y_max']}, x {rep['caption_x_min']}–{rep['caption_x_max']}, violations {len(viol)}")
for v in viol[:10]: print(' ', v)
