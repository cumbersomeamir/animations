"""Build a labelled contact sheet from PNG stills or from frames of an MP4.
usage: python3 contact_sheet.py OUT.png --cols 4 --width 270 IMG...
       python3 contact_sheet.py OUT.png --video in.mp4 --frames 0,30,60 --cols 6 --width 180
"""
import argparse, subprocess, io
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('out'); ap.add_argument('imgs', nargs='*')
ap.add_argument('--cols', type=int, default=4); ap.add_argument('--width', type=int, default=270)
ap.add_argument('--video'); ap.add_argument('--frames'); ap.add_argument('--fps', type=float, default=30)
a = ap.parse_args()

tiles = []
if a.video:
    for fr in [int(x) for x in a.frames.split(',')]:
        png = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', a.video, '-vf', f'select=eq(n\\,{fr})', '-vframes', '1', '-f', 'image2pipe', '-c:v', 'png', '-'], capture_output=True, check=True).stdout
        tiles.append((f'f{fr} {fr / a.fps:.2f}s', Image.open(io.BytesIO(png)).convert('RGB')))
else:
    for p in a.imgs:
        tiles.append((p.split('/')[-1].replace('.png', ''), Image.open(p).convert('RGB')))
w = a.width; h = int(w * 1920 / 1080); lab = 26
rows = (len(tiles) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * (w + 6) + 6, rows * (h + lab + 6) + 6), (10, 12, 20))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', 18)
except Exception: font = ImageFont.load_default()
for i, (name, im) in enumerate(tiles):
    r, c = divmod(i, a.cols); x = 6 + c * (w + 6); y = 6 + r * (h + lab + 6)
    sheet.paste(im.resize((w, h), Image.LANCZOS), (x, y + lab))
    d.text((x + 4, y + 3), name, fill=(220, 230, 240), font=font)
sheet.save(a.out)
print(a.out, sheet.size)
