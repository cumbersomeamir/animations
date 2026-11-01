"""Tile PNG stills (or video frames) into a labelled contact sheet.
Usage: python contact.py out.png img1.png img2.png ...  (labels from filenames)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

out, files = sys.argv[1], sys.argv[2:]
cols = int(os.environ.get("COLS", 6))
tw = int(os.environ.get("TW", 270))
th = int(tw * 1920 / 1080)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 26)), "white")
d = ImageDraw.Draw(sheet)
try:
    f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 18)
except OSError:
    f = None
for i, p in enumerate(files):
    im = Image.open(p).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 26)
    sheet.paste(im, (x, y + 26))
    d.text((x + 6, y + 3), os.path.splitext(os.path.basename(p))[0], fill="black", font=f)
sheet.save(out)
print(out, sheet.size)
