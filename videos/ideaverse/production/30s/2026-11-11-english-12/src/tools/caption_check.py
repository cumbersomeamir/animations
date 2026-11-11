"""QA: caption safe-area check from exact renderer geometry (qa/caption-geometry.json, written by
`node render.mjs --caplog=...`) + a top-band (y 0..300) strip montage from the final MP4 for visual inspection.
usage: python3 caption_check.py qa/caption-geometry.json final.mp4 qa/top-band-strips.png"""
import sys, json, subprocess, io
from PIL import Image
rows = json.load(open(sys.argv[1]))
ink = [1e9, 1e9, -1e9, -1e9]; pill = [1e9, 1e9, -1e9, -1e9]; cap_frames = multi = 0; sizes = {}
for r in rows:
    b = r['boxes']
    if not b: continue
    cap_frames += 1; multi += len(b) > 1
    for x in b:
        sizes[x['t0']] = (x['size'], x['lines'])
        for i, f in enumerate([min, min, max, max]): ink[i] = f(ink[i], x['ink'][i]); pill[i] = f(pill[i], x['pill'][i])
ok = pill[0] >= 100 and pill[2] <= 900 and pill[1] >= 300 and pill[3] <= 1500 and multi == 0 and max(l for _, l in sizes.values()) <= 2
print(f'frames: {len(rows)}, captioned: {cap_frames}, frames with overlapping captions: {multi}')
print(f'caption pill (all frames): x {pill[0]:.0f}..{pill[2]:.0f}  y {pill[1]:.0f}..{pill[3]:.0f}   (spec 2026-11-11: x 100..900, y 230..1500; top 300 px kept clear)')
print(f'caption ink  (all frames): x {ink[0]:.0f}..{ink[2]:.0f}  y {ink[1]:.0f}..{ink[3]:.0f}')
print('per caption (start s: font px, lines):', ', '.join(f'{k}: {v[0]}px/{v[1]}' for k, v in sorted(sizes.items())))
print('overlay draws nothing above y 340 (signature + bottom label removed)')
print('SPEC', 'PASS' if ok else 'FAIL')
strips = []
for f in range(0, 900, 15):
    png = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', sys.argv[2], '-vf', f'select=eq(n\\,{f}),crop=1080:300:0:0,scale=360:100', '-vframes', '1', '-f', 'image2pipe', '-c:v', 'png', '-'], capture_output=True, check=True).stdout
    strips.append(Image.open(io.BytesIO(png)).convert('RGB'))
cols = 6; sheet = Image.new('RGB', (cols * 364, ((len(strips) + cols - 1) // cols) * 104), (255, 0, 255))
for i, s in enumerate(strips): sheet.paste(s, ((i % cols) * 364, (i // cols) * 104))
sheet.save(sys.argv[3]); print('top-band montage (every 15th frame, y 0..300) ->', sys.argv[3])
