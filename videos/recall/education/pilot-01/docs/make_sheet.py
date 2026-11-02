"""Compose Kip's model sheet from poses rendered by `node render.mjs --sheet build/sheet`.

Usage: audio/.venv/bin/python docs/make_sheet.py   ->  docs/kip-model-sheet.png
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "build", "sheet")
OUT = os.path.join(ROOT, "docs", "kip-model-sheet.png")
F = "/usr/share/fonts/opentype/inter/"
POSES = [("front-neutral", "front · neutral"), ("three-quarter", "¾ view"), ("profile", "profile"), ("back", "back"),
         ("curious", "curious"), ("surprised", "surprised"), ("determined", "determined"), ("delighted", "delighted")]
PAL = [("#C7F36B", "lime  #C7F36B  (icon)"), ("#F8FAF3", "paper #F8FAF3  (icon)"), ("#20251B", "ink   #20251B  (icon)"),
       ("#F1F1E6", "clay body #F1F1E6"), ("#AEB5BA", "steel (props) #AEB5BA"), ("#8ED6C4", "water (props) #8ED6C4")]


def main():
    tw, th = 420, 560
    cols = 4
    W = cols * tw + 5 * 20
    H = 150 + 2 * (th + 50) + 260
    im = Image.new("RGB", (W, H), "#F8FAF3")
    d = ImageDraw.Draw(im)
    d.text((20, 22), "Kip — the clay explorer", fill="#20251B", font=ImageFont.truetype(F + "Inter-Bold.otf", 52))
    d.text((22, 92), "Recall educational series · original recurring performer · model sheet rendered from web/character.js",
           fill="#3A4232", font=ImageFont.truetype(F + "Inter-Medium.otf", 24))
    lf = ImageFont.truetype(F + "Inter-SemiBold.otf", 26)
    for i, (name, lab) in enumerate(POSES):
        src = Image.open(os.path.join(SRC, f"{name}.png")).convert("RGB")
        w, h = src.size
        # crop the central region around Kip (camera framing in __renderSheetPose)
        crop = src.crop((0, int(h * 0.125), w, int(h * 0.875))).resize((tw, th))
        x = 20 + (i % cols) * (tw + 20)
        y = 150 + (i // cols) * (th + 50)
        im.paste(crop, (x, y))
        d.text((x + 4, y + th + 8), lab, fill="#20251B", font=lf)
    y0 = 150 + 2 * (th + 50) + 10
    d.text((20, y0), "Palette (sampled from the Recall app icon) and functional prop colours", fill="#20251B", font=lf)
    sf = ImageFont.truetype(F + "Inter-Medium.otf", 22)
    for k, (c, lab) in enumerate(PAL):
        x = 20 + (k % 3) * 560
        y = y0 + 50 + (k // 3) * 80
        d.rounded_rectangle((x, y, x + 60, y + 60), 12, fill=c, outline="#20251B", width=3)
        d.text((x + 76, y + 16), lab, fill="#20251B", font=sf)
    d.text((20, H - 40), "Rules: lime helmet + scarf always; face/helmet slide for head turns; squash-stretch on actions; "
           "finger-twirl = rewind/pause; lime flag marks a finding.", fill="#3A4232", font=ImageFont.truetype(F + "Inter-Regular.otf", 20))
    im.save(OUT)
    print("wrote", OUT, im.size)


if __name__ == "__main__":
    main()
