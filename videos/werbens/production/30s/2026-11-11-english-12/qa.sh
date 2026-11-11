#!/usr/bin/env bash
# QA for English-12 30 s #01: metadata, full decode, exact duration/frames, loudness/true peak, contact + transition sheets.
set -euo pipefail
cd "$(dirname "$0")"
OUT=werbens-30s-english12-01.mp4
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
# transitions + key object beats (frame numbers @30 fps): frame 0 (tubs falling), "=", sleeve on "New perception", spotlight,
# "?", swap, "1960", sleeve 2, plinth on "luxury", name writing, lid off, scoop, move to cups, Coke/Pepsi hops, "≈", brand
# sleeve, branded cup rises, back to the tub, aura, spoon bite, SIGNAL IT, DELIVER IT, CTA clear, tile, lockup, last
B="0 13 45 52 66 110 130 140 160 208 220 285 290 330 357 370 395 432 480 563 595 640 660 718 752 785 793 800 830 899"
SEL=$(for f in $B; do printf "eq(n\\,%s)+" "$f"; done); SEL=${SEL%+}
ffmpeg -v error -y -i "$OUT" -vf "select='$SEL',scale=216:384,drawtext=fontfile=$FONT:text='f%{n} %{pts\:hms}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.55,tile=10x3:padding=4:color=white" -vsync vfr -frames:v 1 qa/transition-sheet.png
for f in 0 13 52 110 160 250 290 330 357 395 432 480 563 610 655 718 760 785 800 840 899; do ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$f)" -vsync vfr -frames:v 1 -q:v 3 "qa/frames/f$(printf %03d $f).jpg"; done
ffmpeg -v error -y -i "$OUT" -filter_complex "[0:a]showspectrumpic=s=1800x300:legend=0:scale=log[s];[0:a]showwavespic=s=1800x160:colors=#316879[w];[s][w]vstack=inputs=2" -frames:v 1 qa/audio-spectrogram.png
cat qa/video-stream.txt qa/audio-stream.txt qa/format.txt; tail -1 qa/decode.log; grep -E "I:|Peak:" qa/loudness.txt
