#!/usr/bin/env python3
"""Compose character/tinku-model-sheet.png from rendered sheet cells.
Usage: make_sheet.py <cells_dir> <out.png>"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont

cells_dir, out = sys.argv[1], sys.argv[2]
F = '/usr/share/fonts/opentype/inter/'
f_title = ImageFont.truetype(F + 'Inter-Bold.otf', 56)
f_h = ImageFont.truetype(F + 'Inter-Bold.otf', 30)
f_l = ImageFont.truetype(F + 'Inter-SemiBold.otf', 22)
f_s = ImageFont.truetype(F + 'Inter-Regular.otf', 22)
cells = sorted(glob.glob(os.path.join(cells_dir, '*.png')))
groups = {'turn': [], 'expr': [], 'pose': []}
for c in cells:
    name = os.path.basename(c)[3:-4]
    groups[name.split('-')[0]].append((name, c))

CW, CH = 300, 375
cols = 7
W = 60 + cols * (CW + 16) + 44
rows = [('TURNAROUND', groups['turn']), ('EXPRESSIONS', groups['expr']), ('POSES', groups['pose'])]
H = 200 + sum(80 + CH + 50 for _ in rows) + 330
S = Image.new('RGB', (W, H), (24, 17, 13))
d = ImageDraw.Draw(S)
d.text((60, 50), 'Tinku · model sheet', font=f_title, fill=(255, 243, 224))
d.text((60, 120), 'Recurring performer for the WastePaisa "Hidden materials" education series · original design · rig: src/rig/tinku.js',
       font=f_s, fill=(220, 200, 175))
y = 190
for title, items in rows:
    d.text((60, y), title, font=f_h, fill=(255, 154, 60)); y += 50
    for i, (name, path) in enumerate(items):
        im = Image.open(path).convert('RGB').resize((CW, CH), Image.LANCZOS)
        x = 60 + i * (CW + 16)
        S.paste(im, (x, y))
        label = name.split('-', 1)[1].replace('-', ' ')
        d.text((x + 4, y + CH + 8), label, font=f_l, fill=(255, 243, 224))
    y += CH + 70
# palette + construction notes
d.text((60, y), 'PALETTE (sampled from the WastePaisa icon + cream/brown/metallic direction)', font=f_h, fill=(255, 154, 60)); y += 50
pal = [('tin body', '#C4C9CF'), ('label cream', '#F4E7D2'), ('icon orange', '#E8741C'), ('icon green', '#1F6B3A'),
       ('cardboard', '#A8743F'), ('copper wire', '#C47A42'), ('glove orange', '#EE7A1E'), ('brass loupe', '#C9A14A'), ('ink', '#1D130E')]
for i, (n, hexv) in enumerate(pal):
    x = 60 + i * 238
    d.rounded_rectangle((x, y, x + 60, y + 60), 10, fill=hexv)
    d.text((x + 72, y + 6), n, font=f_l, fill=(255, 243, 224)); d.text((x + 72, y + 34), hexv, font=f_s, fill=(200, 180, 160))
y += 100
notes = ['Silhouette keys: flipped-up can lid crest · cardboard ear flaps · bead antenna · brass loupe on the right eye · bottle-cap feet.',
         'Keep consistent: tin body with cream label (orange + green stripes), copper wire limbs, orange lab-glove hands, green caps.',
         'Performs the mechanism: taps, cuts, pours, tugs, reacts. Never a static presenter standing beside text.',
         'Original character; not based on any existing character, mascot or reference account. Voice: processed public-domain-data TTS (see LICENSES.md).']
for n in notes:
    d.text((60, y), '•  ' + n, font=f_s, fill=(235, 220, 200)); y += 36
S = S.crop((0, 0, W, y + 40))
S.save(out)
print(out, S.size)
