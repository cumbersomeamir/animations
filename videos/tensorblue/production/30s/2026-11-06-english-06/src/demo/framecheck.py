import sys, json, subprocess, cv2, numpy as np
F, D, out = sys.argv[1], sys.argv[2], sys.argv[3]
want = "https://example.com/menu"
det = cv2.QRCodeDetector()
# (label, time s, crop x,y,w,h, expected)
checks = [("S1 torn corner, level H", 1.5, (180, 640, 720, 760), True),
          ("S1 torn corner, level H", 2.9, (180, 640, 720, 760), True),
          ("S2 intact, level H (small)", 6.5, (330, 590, 420, 400), True),
          ("S3 not a full code (zoom)", 11.0, (120, 580, 840, 650), None),
          ("S4 same tear, level L", 16.3, (90, 670, 395, 400), False),
          ("S4 same tear, level H", 16.3, (565, 670, 400, 400), True),
          ("S5 small tear on a corner square, H (before outlines)", 18.75, (240, 600, 600, 600), False),
          ("S5 same, with outlines + brackets", 20.8, (240, 600, 600, 600), False),
          ("S6 intact, level H (preview)", 25.0, (340, 1010, 400, 360), True)]
res = []
for label, t, (x, y, w, h), exp in checks:
    p = f"{D}/f{t:.2f}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t}", "-i", F, "-frames:v", "1", "-y", p], check=True)
    img = cv2.imread(p)[y:y + h, x:x + w]; cp = p.replace('.png', f'_{x}.png'); cv2.imwrite(cp, img)
    z = subprocess.run(["zbarimg", "--quiet", "--raw", cp], capture_output=True, text=True).stdout.strip() == want
    o = det.detectAndDecode(img)[0] == want
    ok = None if exp is None else (z == exp and o == exp)
    res.append({"check": label, "t": t, "crop": [x, y, w, h], "zbar": z, "opencv": o, "expected": exp, "pass": ok})
    print(f"{label:38s} t={t:5.2f}  zbar={'ok' if z else '--'} opencv={'ok' if o else '--'}  expected={exp}  {'PASS' if ok else ('n/a' if ok is None else 'FAIL')}")
json.dump(res, open(out, "w"), indent=1)
