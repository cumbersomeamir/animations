"""Real QR demo for Tensorblue english-06: encode, tear, decode.

1. Encode one fictional URL (example.com is reserved for documentation) with segno at
   error-correction level L and level H (boost_error=False, so the level is exactly what we ask).
2. Draw each code the way the video does: a white sticker (4-module quiet zone) on a pale-blue
   menu card on the navy stage. A tear removes part of the sticker and exposes the pale card.
3. Decode every state with two independent open-source readers - zbar (zbarimg) and OpenCV's
   QRCodeDetector - at three module sizes. Results + matrices + tear polygons go to qr.json,
   which the renderer reads, so the video shows exactly the tested codes and tears.
Nothing here is private.
usage: python make_qr_demo.py <out_dir>
"""
import json, os, random, subprocess, sys, tempfile
import cv2, numpy as np, segno
from PIL import Image, ImageDraw

CONTENT = "https://example.com/menu"
QZ = 4                       # quiet zone, modules
NAVY, WHITE, PALE, EDGE = (3, 6, 16), (255, 255, 255), (216, 227, 245), (183, 199, 223)
TEARS = {"br": 0.50, "tl": 0.20}   # fraction of the symbol side cut along each edge at that corner
SCALES = [6, 10, 16]               # px per module tried for each state


def encode(level):
    q = segno.make(CONTENT, error=level, boost_error=False, micro=False)
    m = [[1 if v else 0 for v in row] for row in q.matrix_iter(border=0)]
    return q, m


def tear_poly(s, corner, seed=11):
    """Jagged cut crossing the symbol edges at 1-s (symbol units, 0..1), extended past the sticker."""
    rnd = random.Random(seed)
    a, b = (1.3, 1 - s - 0.3), (1 - s - 0.3, 1.3)
    k = 10; pts = []
    for i in range(k + 1):
        f = i / k; x = a[0] + (b[0] - a[0]) * f; y = a[1] + (b[1] - a[1]) * f
        if 0 < i < k:
            j = (rnd.random() - 0.5) * 0.045; x += j; y += j
        pts.append((round(x, 4), round(y, 4)))
    pts.append((1.6, 1.6))
    if corner == "tl":
        pts = [(round(1 - x, 4), round(1 - y, 4)) for x, y in pts]
    return pts


def render(m, px, poly=None):
    n = len(m); side = (n + 2 * QZ) * px; card = 3 * px; bg = 4 * px
    W = side + 2 * (card + bg)
    img = Image.new("RGB", (W, W), NAVY); d = ImageDraw.Draw(img)
    d.rectangle([bg, bg, W - bg - 1, W - bg - 1], fill=PALE)                 # menu card
    o = bg + card; d.rectangle([o, o, o + side - 1, o + side - 1], fill=WHITE)  # sticker
    for y in range(n):
        for x in range(n):
            if m[y][x]:
                X, Y = o + (QZ + x) * px, o + (QZ + y) * px
                d.rectangle([X, Y, X + px - 1, Y + px - 1], fill=NAVY)
    if poly:
        sx = lambda u: o + QZ * px + u * n * px
        P = [(sx(u), sx(v)) for u, v in poly]
        # the torn-away part exposes the pale card, but only inside the sticker
        mask = Image.new("L", img.size, 0); ImageDraw.Draw(mask).polygon(P, fill=255)
        box = Image.new("L", img.size, 0); ImageDraw.Draw(box).rectangle([o, o, o + side - 1, o + side - 1], fill=255)
        mask = Image.fromarray(np.minimum(np.array(mask), np.array(box)))
        img.paste(Image.new("RGB", img.size, PALE), (0, 0), mask)
        edge = Image.new("L", img.size, 0); ImageDraw.Draw(edge).line(P[:-1], fill=255, width=max(2, px // 4))
        img.paste(Image.new("RGB", img.size, EDGE), (0, 0), Image.fromarray(np.minimum(np.array(edge), np.array(box))))  # torn edge, on the sticker only
    return img


DET = cv2.QRCodeDetector()


def decode(img):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        img.save(f.name)
    z = subprocess.run(["zbarimg", "--quiet", "--raw", f.name], capture_output=True, text=True).stdout.strip()
    os.unlink(f.name)
    o, _, _ = DET.detectAndDecode(cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))
    return {"zbar": z == CONTENT, "opencv": o == CONTENT}


def main():
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    codes, results = {}, {}
    for lv in "LH":
        q, m = encode(lv)
        codes[lv] = {"version": q.version, "size": len(m), "mask": q.mask, "error": q.error,
                     "rows": ["".join(map(str, r)) for r in m]}
        for state, poly in [("intact", None), ("torn_br", tear_poly(TEARS["br"], "br")), ("torn_tl", tear_poly(TEARS["tl"], "tl"))]:
            res = {str(px): decode(render(m, px, poly)) for px in SCALES}
            results[f"{lv}_{state}"] = res
            render(m, 10, poly).save(os.path.join(out, f"{lv}_{state}.png"))
    zv = subprocess.run(["zbarimg", "--version"], capture_output=True, text=True).stdout.strip()
    data = {"content": CONTENT, "quiet_zone": QZ, "codes": codes,
            "tears": {k: {"s": s, "poly": tear_poly(s, k)} for k, s in TEARS.items()},
            "colors": {"module": "#030610", "sticker": "#FFFFFF", "card": "#D8E3F5", "edge": "#B7C7DF"},
            "scales_px_per_module": SCALES, "results": results,
            "tools": {"segno": segno.__version__, "opencv": cv2.__version__, "zbar": zv}}
    json.dump(data, open(os.path.join(out, "qr.json"), "w"), indent=1)
    for k, v in results.items():
        print(f"{k:10s}", " ".join(f"{px}px:{'Z' if r['zbar'] else '.'}{'O' if r['opencv'] else '.'}" for px, r in v.items()))


if __name__ == "__main__":
    main()
