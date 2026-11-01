"""Derive the Meshline wave centerline from the approved icon asset (assets/icon.png).

Column-mean of the blue stroke = centerline of the slanted band. Output is in icon
pixel space (512x512) and is used both for the on-screen phone-to-phone 'mesh line'
and for the end-card logo build, so the drawn line matches the real brand mark.
usage: python3 scripts/extract_icon_path.py ../assets/icon.png src/iconPath.json
"""
import json, sys
import numpy as np
from PIL import Image

a = np.array(Image.open(sys.argv[1]).convert("RGB")).astype(int)
blue = (a[:, :, 2] > 200) & (a[:, :, 0] < 120)
white = (a[:, :, 0] > 200) & (a[:, :, 1] > 200) & (a[:, :, 2] > 200)
wy, wx = np.where(white)
node = [float(wx.mean()), float(wy.mean())]
node_r = float((wx.max() - wx.min() + 1) / 2)
xs = np.where(blue.any(axis=0))[0]
x0, x1 = int(xs.min()), int(xs.max())
# stroke thickness on the flat end sections
flat = np.where(blue[:, x0 + 30])[0]
width = float(flat.max() - flat.min() + 1)
cap = width / 2
pts = []
for x in range(int(x0 + cap), int(x1 - cap) + 1, 3):
    if abs(x - node[0]) < node_r + 10:
        pts.append([float(x), node[1]])
        continue
    col = np.where(blue[:, x])[0]
    pts.append([float(x), float(col.mean())])
# light smoothing
p = np.array(pts)
for _ in range(3):
    p[1:-1, 1] = (p[:-2, 1] + 2 * p[1:-1, 1] + p[2:, 1]) / 4
out = {"size": a.shape[1], "node": node, "nodeR": node_r, "width": width,
       "points": [[round(x, 2), round(y, 2)] for x, y in p.tolist()]}
json.dump(out, open(sys.argv[2], "w"))
print("points", len(p), "node", node, "nodeR", node_r, "width", width, "ends", p[0].tolist(), p[-1].tolist())
