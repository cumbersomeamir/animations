"""Build the episode's QR code and verify everything shown about it.

1. Encode a real QR code (segno): version 2, error-correction level H, alphanumeric "HELLO FROM RECALL".
   V2-H is a single Reed-Solomon block: 16 data codewords + 28 error-correction (EC) codewords + 7 remainder bits.
2. Map every module to its role (function pattern / data codeword / EC codeword) with the ISO/IEC 18004 zig-zag
   placement, then VERIFY the map: unmask the modules, read the codewords back, check the data header
   (mode 0010 + count 17) and recompute the 28 Reed-Solomon EC codewords from the 16 data codewords.
3. Decode test images with zxing-cpp: clean, small centre logo, big centre logo, one finder pattern covered.
   Results are written to qr.json and used by the video (the phone only shows a decoded text that really decodes).
Usage: audio/.venv/bin/python qrdata/make_qr.py
"""
import json
import os

import segno
import zxingcpp
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = "HELLO FROM RECALL"

qr = segno.make_qr(TEXT, error="h", version=2, mode="alphanumeric", boost_error=False)
assert qr.version == 2 and qr.error == "H", (qr.version, qr.error)
M = [list(row) for row in qr.matrix]
N = len(M)
assert N == 25

# ---------------- function-pattern mask (version 2)
func = [[False] * N for _ in range(N)]
kind = [["data"] * N for _ in range(N)]


def mark(r, c, k):
    if 0 <= r < N and 0 <= c < N:
        func[r][c] = True; kind[r][c] = k


for (r0, c0) in [(0, 0), (0, N - 7), (N - 7, 0)]:
    for r in range(-1, 8):
        for c in range(-1, 8):
            k = "finder" if 0 <= r < 7 and 0 <= c < 7 else "separator"
            mark(r0 + r, c0 + c, k)
for i in range(8, N - 8):
    mark(6, i, "timing"); mark(i, 6, "timing")
for r in range(16, 21):
    for c in range(16, 21):
        mark(r, c, "alignment")
for i in range(9):
    if not func[8][i] or kind[8][i] == "separator": pass
for i in list(range(0, 9)):
    if kind[8][i] not in ("finder",) and i != 6: mark(8, i, "format")
    if kind[i][8] not in ("finder",) and i != 6: mark(i, 8, "format")
for i in range(8):
    mark(8, N - 1 - i, "format")
for i in range(7):
    mark(N - 1 - i, 8, "format")
mark(4 * 2 + 9, 8, "dark")                      # dark module at (17, 8)
mark(6, 8, "timing") if False else None

# ---------------- zig-zag placement order
order = []
col, upward = N - 1, True
while col > 0:
    if col == 6:
        col -= 1
    rows = range(N - 1, -1, -1) if upward else range(N)
    for r in rows:
        for c in (col, col - 1):
            if not func[r][c]:
                order.append((r, c))
    upward = not upward
    col -= 2
assert len(order) == 44 * 8 + 7, len(order)

# ---------------- unmask + read codewords back
masks = [lambda r, c: (r + c) % 2 == 0, lambda r, c: r % 2 == 0, lambda r, c: c % 3 == 0, lambda r, c: (r + c) % 3 == 0,
         lambda r, c: (r // 2 + c // 3) % 2 == 0, lambda r, c: (r * c) % 2 + (r * c) % 3 == 0,
         lambda r, c: ((r * c) % 2 + (r * c) % 3) % 2 == 0, lambda r, c: ((r + c) % 2 + (r * c) % 3) % 2 == 0]
mk = masks[qr.mask]
bits = [M[r][c] ^ (1 if mk(r, c) else 0) for (r, c) in order]
cw = [int("".join(map(str, bits[i * 8:(i + 1) * 8])), 2) for i in range(44)]
data, ec = cw[:16], cw[16:]
stream = "".join(f"{b:08b}" for b in data)
assert stream[:4] == "0010", stream[:4]                     # alphanumeric mode
assert int(stream[4:13], 2) == len(TEXT), int(stream[4:13], 2)


# Reed-Solomon over GF(256) with the QR polynomial 0x11D
EXP, LOG = [0] * 512, [0] * 256
x = 1
for i in range(255):
    EXP[i] = x; LOG[x] = i; x <<= 1
    if x & 0x100: x ^= 0x11D
for i in range(255, 512): EXP[i] = EXP[i - 255]


def gmul(a, b):
    return 0 if a == 0 or b == 0 else EXP[LOG[a] + LOG[b]]


def rs_ec(msg, n):
    gen = [1]
    for i in range(n):
        gen = [a ^ gmul(b, EXP[i]) for a, b in zip(gen + [0], [0] + gen)]
    rem = list(msg) + [0] * n
    for i in range(len(msg)):
        coef = rem[i]
        if coef:
            for j in range(1, len(gen)):
                rem[i + j] ^= gmul(gen[j], coef)
    return rem[len(msg):]


assert rs_ec(data, 28) == ec, "EC codewords do not match the module map"
role = [["" for _ in range(N)] for _ in range(N)]
cwid = [[-1] * N for _ in range(N)]
for r in range(N):
    for c in range(N):
        role[r][c] = kind[r][c] if func[r][c] else "remainder"
for i, (r, c) in enumerate(order):
    if i < 128: role[r][c] = "data"; cwid[r][c] = i // 8
    elif i < 352: role[r][c] = "ec"; cwid[r][c] = i // 8
    else: role[r][c] = "remainder"


# ---------------- decode tests (zxing-cpp) on flat renders
def render(cover=None, scale=12, quiet=4):
    size = (N + 2 * quiet) * scale
    im = Image.new("L", (size, size), 255)
    d = ImageDraw.Draw(im)
    for r in range(N):
        for c in range(N):
            if M[r][c]:
                d.rectangle([(c + quiet) * scale, (r + quiet) * scale, (c + quiet + 1) * scale - 1, (r + quiet + 1) * scale - 1], fill=0)
    if cover:
        for (r0, c0, r1, c1, fill) in cover:
            d.rectangle([(c0 + quiet) * scale, (r0 + quiet) * scale, (c1 + quiet) * scale - 1, (r1 + quiet) * scale - 1], fill=fill)
    return im


def cover_codewords(r0, c0, r1, c1):
    s = set()
    for r in range(r0, r1):
        for c in range(c0, c1):
            if cwid[r][c] >= 0: s.add(cwid[r][c])
    return sorted(s)


tests = {
    "clean": None,
    "small_logo": [(9, 9, 16, 16, 200)],          # 7x7 modules in the centre
    "big_logo": [(5, 5, 20, 20, 200)],            # 15x15 modules in the centre
    "finder_covered": [(0, 17, 8, 25, 200)],      # top-right position detection pattern + separator
}
results = {}
os.makedirs(os.path.join(HERE, "tests"), exist_ok=True)
for name, cov in tests.items():
    im = render(cov)
    im.save(os.path.join(HERE, "tests", f"{name}.png"))
    found = zxingcpp.read_barcodes(im)
    txt = found[0].text if found else None
    hit = cover_codewords(*cov[0][:4]) if cov else []
    results[name] = {"decoded": txt, "ok": txt == TEXT, "cover_modules": cov[0][:4] if cov else None,
                     "codewords_touched": len(hit), "ec_capacity_errors": 14}
    print(f"{name:15s} decoded={txt!r:22s} codewords touched={len(hit)}")

out = {"text": TEXT, "version": 2, "error": "H", "mask": qr.mask, "size": N, "matrix": M, "role": role, "codeword": cwid,
       "data_codewords": data, "ec_codewords": ec, "verified": {"header_ok": True, "rs_ok": True}, "decode_tests": results,
       "decoder": f"zxing-cpp {zxingcpp.__version__ if hasattr(zxingcpp, '__version__') else ''}".strip(), "encoder": f"segno {segno.__version__}"}
json.dump(out, open(os.path.join(HERE, "qr.json"), "w"))
print("roles:", {k: sum(row.count(k) for row in role) for k in ("finder", "separator", "timing", "alignment", "format", "dark", "data", "ec", "remainder")})
print("verified: mode header + Reed-Solomon EC recomputed match the module map")
