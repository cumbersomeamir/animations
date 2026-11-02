"""Prepare build inputs for the Manim test (outputs in build/, not committed):
1. Decompress the OFL Fredoka WOFF2 files from @fontsource/fredoka (pinned npm dependency of ../../source)
   into TTF so Pango/ManimPango can register them.
2. Rounded-corner copy of the verified app icon (assets/icon.png, sha256 0ad7f267...9561) for the end card.
Usage: <manim-venv>/bin/python -I src/prepare_assets.py
"""
import hashlib, os
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
APP = os.path.abspath(os.path.join(ROOT, "..", ".."))  # videos/tableverse
OUT = os.path.join(ROOT, "build")
os.makedirs(os.path.join(OUT, "fonts"), exist_ok=True)
src = os.path.join(APP, "source", "node_modules", "@fontsource", "fredoka", "files")
for w in (500, 600, 700):
    f = TTFont(os.path.join(src, f"fredoka-latin-{w}-normal.woff2"))
    f.flavor = None
    f.save(os.path.join(OUT, "fonts", f"Fredoka-{w}.ttf"))
icon_path = os.path.join(APP, "assets", "icon.png")
digest = hashlib.sha256(open(icon_path, "rb").read()).hexdigest()
assert digest.startswith("0ad7f267411e602c"), "icon.png does not match the approved asset hash"
im = Image.open(icon_path).convert("RGBA")
n, r, border = im.width, int(im.width * 0.22), 10
canvas = Image.new("RGBA", (n + 2 * border, n + 2 * border), (0, 0, 0, 0))
ImageDraw.Draw(canvas).rounded_rectangle((0, 0, n + 2 * border - 1, n + 2 * border - 1), r + border, fill=(255, 255, 255, 255))
mask = Image.new("L", (n, n), 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, n - 1, n - 1), r, fill=255)
canvas.paste(im, (border, border), mask)
canvas.save(os.path.join(OUT, "icon_rounded.png"))
print("fonts + icon_rounded.png written; icon sha256", digest)
