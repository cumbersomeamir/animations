#!/usr/bin/env bash
# QA for Hindi-04 30 s #01: metadata, full decode, exact duration/frames, loudness/true peak, contact + transition sheets.
set -euo pipefail
cd "$(dirname "$0")"
OUT=werbens-30s-hindi04-01.mp4
FONT=fonts/Inter-Bold.otf
mkdir -p qa/frames
ffprobe -v error -show_format -show_streams -of json "$OUT" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,duration -of default=nw=1 "$OUT" > qa/video-stream.txt
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,profile,sample_rate,channels,duration,bit_rate -of default=nw=1 "$OUT" > qa/audio-stream.txt
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 "$OUT" > qa/format.txt
ffmpeg -v error -xerror -i "$OUT" -f null - > qa/decode.log 2>&1 && echo "full decode OK (0 errors, -xerror)" >> qa/decode.log
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -hide_banner -nostats -i "$OUT" -vn -af astats=measure_overall=Peak_level+RMS_level+Flat_factor+Peak_count:measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level|Flat factor|Peak count" > qa/astats.txt || true
# full contact sheet: one frame per second (t = 0.5, 1.5, … 29.5)
ffmpeg -v error -y -i "$OUT" -vf "fps=1:start_time=0.5,scale=216:384,drawtext=fontfile=$FONT:text='%{pts\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.55,tile=10x3:padding=4:color=white" -frames:v 1 qa/contact-sheet.png
# transitions + key object beats (frame numbers @30 fps): tile lands, tile slides in, lint puff, words off, roller in, before label,
# shutter, frame/light pulses, roller on, pass, pass end, roller off, divider, before/after labels, shutter, lift, proof, proof note,
# lower, rules 1-3, filter in/out, hold, CTA clear, tile lands, lockup, last
B="0 22 35 47 79 120 150 180 232 281 304 320 340 365 380 389 391 412 435 486 520 555 590 653 677 702 712 723 750 768 779 790 899"
SEL=$(for f in $B; do printf "eq(n\\,%s)+" "$f"; done); SEL=${SEL%+}
ffmpeg -v error -y -i "$OUT" -vf "select='$SEL',scale=216:384,drawtext=fontfile=$FONT:text='f%{n} %{pts\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.55,tile=12x3:padding=4:color=white" -vsync vfr -frames:v 1 qa/transition-sheet.png
for f in 0 22 79 150 232 340 389 412 520 555 653 712 723 779 840 899; do ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$f)" -vsync vfr -frames:v 1 -q:v 3 "qa/frames/f$(printf %03d $f).jpg"; done
ffmpeg -v error -y -i "$OUT" -filter_complex "[0:a]showspectrumpic=s=1800x300:legend=0:scale=log[s];[0:a]showwavespic=s=1800x160:colors=#6234FB[w];[s][w]vstack=inputs=2" -frames:v 1 qa/audio-spectrogram.png
cat qa/video-stream.txt qa/audio-stream.txt qa/format.txt; tail -1 qa/decode.log; grep -E "I:|Peak:" qa/loudness.txt
