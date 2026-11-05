"""Build the fictional demo document and run the real OCR pipeline on it.

1. Render a tiny fictional printed slip as a 'scan' (image only, slight tilt + grain).
2. Wrap it in an image-only PDF (scan.pdf) and show pdftotext finds no text.
3. OCRmyPDF (Tesseract engine) adds the text layer -> searchable.pdf.
4. Tesseract TSV gives every recognised word with its box; pdftotext -bbox gives the
   positions of the words in the new PDF text layer (used for the search highlight).
Nothing here is private: the slip is invented for the video.
usage: python3 make_demo.py <out_dir>
"""
import json, subprocess, sys, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
W, H = 900, 1180
img = Image.new("L", (W, H), 247)
d = ImageDraw.Draw(img)
serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
serifb = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
F = lambda p, s: ImageFont.truetype(p, s)
lines = [
    ("CITY LIBRARY", F(serifb, 54), 90),
    ("Return Slip", F(serif, 40), 175),
    ("Member ID: 0042", F(serif, 38), 330),
    ("Book: Learning Python", F(serif, 38), 410),
    ("Issued: 04 Nov 2026", F(serif, 38), 490),
    ("Due date: 18 Nov 2026", F(serif, 38), 570),
    ("Thank you for reading!", F(serif, 36), 760),
]
for txt, font, y in lines:
    x = 80
    d.text((x, y), txt, fill=28, font=font)
d.line((80, 260, W - 80, 260), fill=60, width=3)
d.line((80, 690, W - 80, 690), fill=120, width=2)
# scan look: slight tilt, soft blur, grain
img = img.rotate(-0.7, resample=Image.BICUBIC, expand=False, fillcolor=247)
img = img.filter(ImageFilter.GaussianBlur(0.6))
rnd = random.Random(20261105)
px = img.load()
for yy in range(H):
    for xx in range(W):
        v = px[xx, yy] + rnd.randint(-9, 9)
        px[xx, yy] = max(0, min(255, v))
scan = os.path.join(out, "scan.png"); img.save(scan, dpi=(150, 150))
# image-only PDF
subprocess.run(["/usr/bin/python3.12", "-m", "img2pdf", scan, "-o", os.path.join(out, "scan.pdf")], check=True)
def run(cmd): return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout
before = run(["pdftotext", os.path.join(out, "scan.pdf"), "-"])
# OCRmyPDF (uses Tesseract) adds the text layer
subprocess.run(["/usr/bin/python3.12", "-m", "ocrmypdf", "--output-type", "pdf", "-l", "eng",
                os.path.join(out, "scan.pdf"), os.path.join(out, "searchable.pdf")], check=True)
after = run(["pdftotext", "-layout", os.path.join(out, "searchable.pdf"), "-"])
# Tesseract word boxes on the scan image (for the 'recognise' scene)
tsv = run(["tesseract", scan, "-", "-l", "eng", "tsv"])
words = []
for row in tsv.splitlines()[1:]:
    c = row.split("\t")
    if len(c) == 12 and c[0] == "5" and c[11].strip():
        words.append({"text": c[11], "x": int(c[6]), "y": int(c[7]), "w": int(c[8]), "h": int(c[9]), "conf": float(c[10]),
                      "line": f"{c[2]}.{c[3]}.{c[4]}"})
# positions of a searched word in the new PDF text layer
bbox = run(["pdftotext", "-bbox", os.path.join(out, "searchable.pdf"), "-"])
json.dump({"size": [W, H], "before_text": before, "after_text": after, "words": words}, open(os.path.join(out, "ocr.json"), "w"), indent=1)
open(os.path.join(out, "searchable_bbox.html"), "w").write(bbox)
print("before (scan.pdf) text chars:", len(before.strip()))
print("after (searchable.pdf):\n" + after)
print("words:", len(words), "min conf:", min(w["conf"] for w in words))
