"""Real image demo for Tensorblue english-11: why a sent photo can lose tiny writing.

1. Make an original "phone photo" (3024 x 4032, camera-like JPEG quality 95) of a fictional
   event ticket on a table; its booking code 7KQ2XM is printed small.
2. Lossy re-save, as chat apps often do to save data (OUR test settings, not any app's):
   resize to 1280 px on the long edge, then JPEG quality 60 (Pillow / libjpeg).
3. "Sent as a document": the original file copied byte for byte (same SHA-256).
4. Readability: crop the booking-code area from each, enlarge both to the same size, and run
   Tesseract OCR on the crops. Also record file sizes and pixel dimensions.
Nothing here is real personal data. usage: python photo_demo.py <out_dir>
"""
import hashlib, json, os, random, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 3024, 4032
CODE = "7KQ2XM"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
TINY = int(os.environ.get("TINY", "20"))  # 20 px: the original crop reads; the re-saved one turns into a guess   # booking-code text size in the original photo (px)


def make_original(path):
    rnd = random.Random(20261109)
    img = Image.new("RGB", (W, H), (176, 186, 202))                 # cool grey table
    d = ImageDraw.Draw(img)
    for _ in range(9000):                                            # table texture
        x, y = rnd.randrange(W), rnd.randrange(H); v = rnd.randrange(-14, 14)
        d.point((x, y), fill=(176 + v, 186 + v, 202 + v))
    # the ticket (slightly rotated later)
    tk = Image.new("RGBA", (2200, 1300), (0, 0, 0, 0)); t = ImageDraw.Draw(tk)
    t.rounded_rectangle([0, 0, 2199, 1299], 60, fill=(250, 251, 253, 255))
    t.rectangle([0, 0, 2199, 260], fill=(59, 130, 246, 255))
    t.text((90, 70), "CITY HALL CONCERT", font=ImageFont.truetype(FONT_B, 110), fill="white")
    t.text((90, 340), "Friday 8 pm  ·  Row K  ·  Seat 12", font=ImageFont.truetype(FONT, 78), fill=(20, 24, 36))
    t.text((90, 470), "Doors open 7 pm. Bring this ticket.", font=ImageFont.truetype(FONT, 60), fill=(80, 88, 104))
    t.line([(90, 620), (2110, 620)], fill=(200, 208, 220), width=4)
    t.text((90, 690), "Booking code", font=ImageFont.truetype(FONT, TINY), fill=(70, 78, 96))
    t.text((90, 690 + int(TINY * 1.5)), CODE, font=ImageFont.truetype(MONO, TINY), fill=(10, 12, 20))
    t.text((90, 1150), "Non-transferable. Fictional ticket for a demo.", font=ImageFont.truetype(FONT, TINY), fill=(110, 118, 134))
    tk = tk.rotate(-2.5, resample=Image.BICUBIC, expand=True)
    img.paste(tk, (420, 1300), tk)
    img = img.filter(ImageFilter.GaussianBlur(0.8))                 # lens softness
    img.save(path, "JPEG", quality=95, subsampling=0)
    # where the code is, in original-photo pixels (box around "Booking code" + code)
    # locate the "Booking code / 7KQ2XM" text from its dark pixels, plus a margin
    g = img.convert("L"); px = g.load(); xs, ys = [], []
    for y in range(1300 + 600, 1300 + 820):
        for x in range(460, 1500):
            if px[x, y] < 120: xs.append(x); ys.append(y)
    m = 20
    return (min(xs) - m, min(ys) - m, max(xs) + m, max(ys) + m)


def ocr(path):
    r = subprocess.run(["tesseract", path, "-", "--psm", "6", "-l", "eng"], capture_output=True, text=True)
    return " ".join(r.stdout.split())


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def main():
    orig = os.path.join(OUT, "original.jpg"); box = make_original(orig)
    # lossy re-save: resize long edge to 1280, JPEG quality 60
    im = Image.open(orig); s = 1280 / max(im.size)
    small = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    sent = os.path.join(OUT, "resaved.jpg"); small.save(sent, "JPEG", quality=60)
    doc = os.path.join(OUT, "as-document.jpg"); shutil.copyfile(orig, doc)
    # enlarged crops of the same area, both enlarged to the same width with the same (Lanczos) filter
    cw = 860
    c1 = Image.open(orig).crop(box); c1 = c1.resize((cw, round(c1.height * cw / c1.width)), Image.LANCZOS)
    b2 = tuple(round(v * s) for v in box)
    c2 = Image.open(sent).crop(b2); c2 = c2.resize((cw, round(c2.height * cw / c2.width)), Image.LANCZOS)   # same enlargement as the original crop
    c1.save(os.path.join(OUT, "crop-original.png")); c2.save(os.path.join(OUT, "crop-resaved.png"))
    o1, o2 = ocr(os.path.join(OUT, "crop-original.png")), ocr(os.path.join(OUT, "crop-resaved.png"))
    data = {
        "code": CODE, "tiny_text_px": TINY,
        "original": {"pixels": list(Image.open(orig).size), "bytes": os.path.getsize(orig), "sha256": sha(orig), "jpeg_quality": 95},
        "resaved": {"pixels": list(Image.open(sent).size), "bytes": os.path.getsize(sent), "jpeg_quality": 60, "long_edge": 1280},
        "as_document": {"bytes": os.path.getsize(doc), "sha256": sha(doc), "identical_to_original": sha(doc) == sha(orig)},
        "crop_box_original": box, "crop_box_resaved": b2,
        "ocr": {"original_crop": o1, "resaved_crop": o2, "original_reads_code": CODE in o1.replace(" ", ""), "resaved_reads_code": CODE in o2.replace(" ", "")},
        "tools": {"pillow": Image.__version__, "tesseract": subprocess.run(["tesseract", "--version"], capture_output=True, text=True).stdout.splitlines()[0]},
    }
    json.dump(data, open(os.path.join(OUT, "photo-demo.json"), "w"), indent=1)
    print(json.dumps({k: data[k] for k in ("original", "resaved", "as_document", "ocr")}, indent=1))


if __name__ == "__main__":
    main()
