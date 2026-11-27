# caption ink bounds (navy text, luma<70) in band y Y0..Y1 (default 230..546) over every 3rd frame; frame0 vs thumbnail diff
import subprocess, sys, numpy as np
from PIL import Image
mp4, thumb, out = sys.argv[1:4]
Y0, Y1, C0, C1 = (int(v) for v in (sys.argv[4:8] if len(sys.argv) >= 8 else (230, 546, 540, 615)))  # caption band, chip band
buf = subprocess.run(['ffmpeg','-v','error','-i',mp4,'-vf',"select='not(mod(n\\,3))',format=gray",'-vsync','0','-f','rawvideo','-'],capture_output=True).stdout
fr = np.frombuffer(buf,np.uint8).reshape(-1,1920,1080)
band = fr[:,Y0:Y1,:] < 70
ys, xs = [], []
for b in band:
    yy, xx = np.nonzero(b)
    if len(xx): xs += [xx.min(), xx.max()]; ys += [yy.min()+Y0, yy.max()+Y0]
f0 = subprocess.run(['ffmpeg','-v','error','-i',mp4,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
a = np.frombuffer(f0,np.uint8).reshape(1920,1080,3).astype(float)
t = np.asarray(Image.open(thumb).convert('RGB')).astype(float)
m = np.ones((1920,1080),bool); m[C0:C1,:] = False          # exclude the chip band (thumbnail only)
d = np.abs(a-t).mean(axis=2)[m]
Image.fromarray(a.astype(np.uint8)).save(out)
print(f"caption ink x {min(xs)}..{max(xs)}, y {min(ys)}..{max(ys)} over {len(fr)} frames")
print(f"frame0 vs thumbnail mean abs diff {d.mean():.2f}/255, p99 {np.percentile(d,99):.1f}; frame0 mean luma {a.mean():.0f}")
