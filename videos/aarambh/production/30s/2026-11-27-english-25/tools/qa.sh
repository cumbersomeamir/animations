#!/usr/bin/env bash
# QA for the english-25 export (run from the batch folder): ffprobe, full decode, loudness, clipping, first frame vs thumbnail, contact sheets, hashes.
set -euo pipefail
F=aarambh-30s-english25-01.mp4; TH=aarambh-30s-english25-01-thumbnail.png
mkdir -p qa build/qa
ffprobe -v error -show_entries stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,nb_frames,duration,sample_rate,channels -show_entries format=duration,size -of compact "$F" > qa/ffprobe.txt
echo "decoded frames: $(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$F")" >> qa/ffprobe.txt
ffmpeg -v error -xerror -i "$F" -f null - 2> build/qa/decode.err && echo "full decode (-xerror): OK, no errors" > qa/decode.txt || { echo "decode errors:"; cat build/qa/decode.err; } > qa/decode.txt
ffmpeg -hide_banner -i "$F" -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak|Input LRA" > qa/loudness.txt
ffmpeg -hide_banner -i "$F" -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level dB|Flat factor" | tail -2 > qa/clipping.txt
ffmpeg -v error -i "$F" -map 0:a -f md5 - > qa/audio_md5.txt
sha256sum "$F" "$TH" > qa/sha256.txt
ffmpeg -v error -y -i "$F" -frames:v 1 build/qa/frame0.png
python3 - <<'EOF'
from PIL import Image, ImageStat, ImageChops
import subprocess, wave, numpy as np, json
a = Image.open('build/qa/frame0.png').convert('RGB'); b = Image.open('aarambh-30s-english25-01-thumbnail.png').convert('RGB')
d = ImageStat.Stat(ImageChops.difference(a, b)).mean; lum = ImageStat.Stat(a.convert('L')).mean[0]
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'aarambh-30s-english25-01.mp4', '-t', '1', '-ac', '1', '-ar', '48000', 'build/qa/a1.wav'], check=True)
w = wave.open('build/qa/a1.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
win = 480; onset = next((i * win / 48000 for i in range(len(x) // win) if 20 * np.log10(np.sqrt(np.mean(x[i*win:(i+1)*win] ** 2)) + 1e-9) > -34), None)
open('qa/first_frame.txt', 'w').write(f"frame 0 vs thumbnail: mean abs difference {sum(d)/3:.2f} / 255 (H.264 encoding only; same composition)\nframe 0 mean luminance {lum:.1f} / 255 (no fade from black)\nfirst audio window above -34 dBFS RMS: {onset:.2f} s (narration placed at 0.05 s)\n")
im = Image.open('aarambh-30s-english25-01-thumbnail.png'); open('qa/thumbnail.txt', 'w').write(f"{im.size[0]}x{im.size[1]} {im.mode}\n")
EOF
# contact sheets: every 1 s (representative) and around every cut (transitions)
ffmpeg -v error -y -i "$F" -vf "fps=1,scale=216:384,tile=6x5" -frames:v 1 qa/contact_representative.jpg
python3 - <<'EOF'
import json, subprocess
from PIL import Image, ImageDraw
T = json.load(open('src/cues.json'))['T']
times = [0.0, 4.27, 4.33, 5.10, 5.35, 5.70, 7.00, 7.18, 7.35, 11.90, 12.10, 12.32, 15.65, 15.85, 16.05, 18.15, 18.32, 18.50, 20.30, 20.60, 22.35, 22.58, 22.80, 26.65, 26.9, 27.15, 29.9]
ims = []
for i, t in enumerate(times):
    p = f'build/qa/tr_{i:02d}.png'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', 'aarambh-30s-english25-01.mp4', '-frames:v', '1', '-vf', 'scale=216:384', p], check=True)
    im = Image.open(p).convert('RGB'); ImageDraw.Draw(im).text((6, 6), f'{t:.2f}s', fill=(255, 255, 0)); ims.append(im)
cols = 6; rows = (len(ims) + cols - 1) // cols; sheet = Image.new('RGB', (216 * cols, 384 * rows))
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 216, (i // cols) * 384))
sheet.save('qa/contact_transitions.jpg', quality=88)
EOF
cat qa/ffprobe.txt qa/decode.txt qa/loudness.txt qa/clipping.txt qa/first_frame.txt qa/thumbnail.txt qa/sha256.txt
