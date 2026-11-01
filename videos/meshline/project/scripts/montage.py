"""Tile PNG frames into a labelled contact sheet. usage: montage.py out.png cols width img1 img2 ..."""
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in files]
th = int(ims[0].height * tw / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 40) + 8), (40, 40, 40))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", 22)
except Exception:
    font = ImageFont.load_default()
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 40)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 32))
    label = f.split("/")[-1].rsplit(".", 1)[0]
    d.text((x + 4, y + 4), label, fill=(255, 255, 255), font=font)
sheet.save(out)
print(out, sheet.size)
