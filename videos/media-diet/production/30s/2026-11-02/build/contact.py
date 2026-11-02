"""Tile PNG/JPG frames into a labelled contact sheet.
Usage: python build/contact.py <out.png> <cols> <thumb_width> <img1> [img2 ...]   (label = file stem)"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
th = int(ims[0].height * tw / ims[0].width)
rows = (len(ims) + cols - 1) // cols
pad, lab = 8, 34
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (12, 14, 40))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype(os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-600-normal.woff2'), 22)
except Exception:
    font = ImageFont.load_default()
for i, (im, f) in enumerate(zip(ims, files)):
    r, c = divmod(i, cols)
    x, y = pad + c * (tw + pad), pad + r * (th + lab + pad)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    d.text((x + 4, y + 4), os.path.splitext(os.path.basename(f))[0], fill=(220, 225, 255), font=font)
sheet.save(out)
print('wrote', out, sheet.size)
