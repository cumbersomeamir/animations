#!/usr/bin/env bash
# QA for the 15 s test: metadata, full decode, duration/frames, audio stats, contact sheet, boundary frames.
set -euo pipefail
cd "$(dirname "$0")"
OUT=werbens-15s-test.mp4
mkdir -p qa/frames
ffprobe -v error -show_format -show_streams -of json "$OUT" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,r_frame_rate,width,height,pix_fmt,codec_name,profile -of default=nw=1 "$OUT" > qa/video-stream.txt
ffmpeg -v error -xerror -i "$OUT" -f null - > qa/decode.log 2>&1 && echo "full decode OK (0 errors)" >> qa/decode.log
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af astats -f null - 2>&1 | grep -E "Overall|Peak level dB|RMS level dB|Flat factor|Peak count" | tail -6 > qa/astats.txt || true
# contact sheet: 24 evenly spaced frames (every 0.625 s)
ffmpeg -v error -y -i "$OUT" -vf "fps=1.6,scale=270:480,drawtext=fontfile=../../project/fonts/Inter-Bold.otf:text='%{pts\:hms}':x=8:y=8:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.5,tile=6x4:padding=6:color=white" -frames:v 1 qa/contact-sheet.png
# shot boundaries (last frame of a shot, first of the next) + key moments, full resolution
for f in 0 30 74 75 96 133 150 194 195 230 280 314 315 330 345 360 380 449; do
  ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$f)" -frames:v 1 "qa/frames/f$(printf %03d $f).png"
done
ffmpeg -v error -y -i "$OUT" -filter_complex "[0:a]showspectrumpic=s=1500x300:legend=0:scale=log[s];[0:a]showwavespic=s=1500x160:colors=#6234FB[w];[s][w]vstack=inputs=2,drawgrid=w=100:h=0:color=red@0.35" -frames:v 1 qa/audio-spectrogram.png
cat qa/video-stream.txt; tail -1 qa/decode.log; grep -E "I:|Peak:" qa/loudness.txt
