#!/usr/bin/env python3
"""Vertical 1080x1920 thumbnail: a real frame of the 6-of-30 Discover video result + "NOT MY LIFE."
Source pixels: superhook-motion slot frame 72 (= clip frame 867, 00:00:28.900), crop of the viewer
image region only (no UI chrome). Only scaling, a gentle vignette/gradient and type are applied."""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
FRAME = int(sys.argv[1]) if len(sys.argv) > 1 else 72
src = Image.open(f'cache/frames/superhook-motion/{FRAME:05d}.jpg').convert('RGB')
W, H = 1080, 1920
s = max(W / src.width, H / src.height)
im = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS)
im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=40, threshold=2))

a = np.asarray(im, dtype=np.float32) / 255.0
yy, xx = np.mgrid[0:H, 0:W]
q = ((xx - W / 2) / W * 0.9) ** 2 + ((yy - H / 2) / H) ** 2
a *= (1 - 0.32 * np.clip((q - 0.06) / 0.25, 0, 1))[..., None]
grad = np.clip((yy - 1050) / 700, 0, 1) ** 1.4 * 0.55
a *= (1 - grad)[..., None]
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))

font_path = 'assets/fonts/InterDisplay-Bold.otf'
lines = ['NOT MY', 'LIFE.']
size = 240
while True:
    f = ImageFont.truetype(font_path, size)
    if max(f.getlength(l) for l in lines) <= 770: break
    size -= 4
f = ImageFont.truetype(font_path, size)
lh = int(size * 0.95)
cy = 1300
shadow = Image.new('L', (W, H), 0)
sd = ImageDraw.Draw(shadow)
txt = Image.new('L', (W, H), 0)
td = ImageDraw.Draw(txt)
for i, l in enumerate(lines):
    y = cy + (i - (len(lines) - 1) / 2) * lh
    td.text((500, y), l, font=f, fill=255, anchor='mm')
    sd.text((500, y + size * 0.04), l, font=f, fill=150, anchor='mm')
shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.18))
im = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), im, shadow)
im = Image.composite(Image.new('RGB', (W, H), (255, 255, 255)), im, txt)
os.makedirs('out', exist_ok=True)
im.save('out/thumbnail.png', optimize=True)
im.save('out/thumbnail.jpg', quality=92)
print('thumbnail', im.size, 'font', size, 'text box y', cy - lh, cy + lh)
