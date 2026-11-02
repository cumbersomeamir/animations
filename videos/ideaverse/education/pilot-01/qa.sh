#!/usr/bin/env bash
# QA evidence: metadata, full decode, loudness, spectrum, representative + boundary contact sheets, transition strips.
set -euo pipefail
cd "$(dirname "$0")"
MP4=ideaverse-education-pilot-01.mp4
mkdir -p qa
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=index,codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,duration,sample_rate,channels,channel_layout,bit_rate -of json "$MP4" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$MP4" > qa/decoded-video-frames.txt
ffmpeg -nostdin -v error -i "$MP4" -f null - > qa/full-decode.log 2>&1 && echo "full decode: OK (no errors)" >> qa/full-decode.log
ffmpeg -nostdin -hide_banner -i "$MP4" -vn -af "ebur128=peak=true" -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -nostdin -v error -y -i "$MP4" -lavfi "showspectrumpic=s=1200x400:legend=1" qa/spectrum.png
python3 src/tools/contact_sheet.py qa/contact-sheet-representative.png --video "$MP4" --frames 0,15,30,45,60,75,90,105,120,135,150,165,180,195,210,225,240,255,270,285,300,315,330,345,360,375,390,405,420,449 --cols 10 --width 180
# scene boundaries (hook|fluent 2.4, |drawer 4.7, |check 7.8, |mark 10.4, |takeaway 12.6): frame before / at / after
python3 src/tools/contact_sheet.py qa/contact-sheet-boundaries.png --video "$MP4" --frames 71,72,73,140,141,142,233,234,235,311,312,313,377,378,379 --cols 3 --width 300
for t in 2.2 4.6 7.6 10.3 12.4; do ffmpeg -nostdin -v error -y -ss "$t" -t 0.8 -i "$MP4" -vf "fps=10,scale=216:-1,tile=8x1" -frames:v 1 "qa/transition-$t.png"; done
echo done
