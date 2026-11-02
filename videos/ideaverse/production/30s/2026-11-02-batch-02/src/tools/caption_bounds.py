"""Measure printed caption ink bounds (and the top 0-300 band) on every captioned frame of the final MP4.
Caption ink = dark pixels (luma < 120) in y 300..500 (props may pass y 500..530; the press housing starts at y 538). A row/column counts as
ink only with >= 8 / >= 3 dark pixels, so isolated 1-2 px noise specks (encoder/paper) are ignored."""
import sys, subprocess, numpy as np
CAPS = [(0.25, 3.85), (3.9, 6.55), (6.55, 9.75), (9.8, 12.0), (12.0, 14.75), (14.8, 17.7), (17.7, 19.85), (19.9, 22.35), (22.35, 23.95), (24.0, 28.8)]
W, H = 1080, 1920
p = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-i', sys.argv[1], '-vf', 'crop=1080:530:0:0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
f, ys, xs, top, worst = 0, [], [], [], None
while True:
    b = p.stdout.read(W * 530 * 3)
    if len(b) < W * 530 * 3: break
    a = np.frombuffer(b, np.uint8).reshape(530, W, 3).astype(np.float32)
    l = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    top.append(int((l[:300] < 150).sum()))
    t = f / 30
    if any(x + 0.2 <= t < y - 0.15 for x, y in CAPS):
        d = l[300:500] < 120
        r = np.where(d.sum(1) >= 8)[0]; c = np.where(d.sum(0) >= 3)[0]
        if len(r): ys += [r.min() + 300, r.max() + 300]; xs += [c.min(), c.max()]
    f += 1
print(f'frames decoded: {f}')
print(f'caption ink rows over all captioned frames: y {min(ys)}..{max(ys)}  (spec 350..470)')
print(f'caption ink columns over all captioned frames: x {min(xs)}..{max(xs)}  (spec >= 80 and <= 1000)')
print(f'top band 0..300: max dark (luma<150) pixels in any frame: {max(top)} of {W*300} (field dots only)')
