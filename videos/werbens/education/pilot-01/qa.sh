#!/usr/bin/env bash
# QA for education pilot 01: metadata, full decode, exact duration/frames, audio loudness, contact sheets, shot-boundary frames.
set -euo pipefail
cd "$(dirname "$0")"
OUT=werbens-education-pilot-01.mp4
FONT=fonts/Inter-Bold.otf
mkdir -p qa/frames
ffprobe -v error -show_format -show_streams -of json "$OUT" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,duration -of default=nw=1 "$OUT" > qa/video-stream.txt
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,profile,sample_rate,channels,duration,bit_rate -of default=nw=1 "$OUT" > qa/audio-stream.txt
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT" > qa/format.txt
ffmpeg -v error -xerror -i "$OUT" -f null - > qa/decode.log 2>&1 && echo "full decode OK (0 errors, -xerror)" >> qa/decode.log
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af astats=measure_overall=Peak_level+RMS_level+Flat_factor+Peak_count:measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level|Flat factor|Peak count" > qa/astats.txt || true
# representative contact sheet: 30 frames, every 0.5 s (t = 0.25, 0.75, ...)
ffmpeg -v error -y -i "$OUT" -vf "fps=2:start_time=0.25,scale=216:384,drawtext=fontfile=$FONT:text='%{pts\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.55,tile=10x3:padding=4:color=white" -frames:v 1 qa/contact-sheet.png
# boundary contact sheet: last frame of each shot + first frame of the next, plus first/last frame of the video
B="0 77 78 176 177 278 279 347 348 449"
SEL=$(for f in $B; do printf "eq(n\\,%s)+" "$f"; done); SEL=${SEL%+}
ffmpeg -v error -y -i "$OUT" -vf "select='$SEL',scale=270:480,drawtext=fontfile=$FONT:text='f%{n} %{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.55,tile=10x1:padding=4:color=white" -vsync vfr -frames:v 1 qa/boundary-sheet.png
for f in $B 21 60 130 210 240 300 330 400; do ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$f)" -vsync vfr -frames:v 1 "qa/frames/f$(printf %03d $f).png"; done
ffmpeg -v error -y -i "$OUT" -filter_complex "[0:a]showspectrumpic=s=1500x300:legend=0:scale=log[s];[0:a]showwavespic=s=1500x160:colors=#6234FB[w];[s][w]vstack=inputs=2" -frames:v 1 qa/audio-spectrogram.png
cat qa/video-stream.txt qa/audio-stream.txt qa/format.txt; tail -1 qa/decode.log; grep -E "I:|Peak:" qa/loudness.txt
