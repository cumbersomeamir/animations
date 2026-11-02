#!/usr/bin/env bash
# QA evidence for the 15 s test: metadata, full decode, loudness, spectrum, contact sheet, transition strips.
set -euo pipefail
cd "$(dirname "$0")"
MP4=ideaverse-15s-test.mp4
mkdir -p qa
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=index,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,duration,sample_rate,channels,channel_layout,bit_rate -of json "$MP4" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$MP4" > qa/decoded-video-frames.txt
ffmpeg -nostdin -v error -i "$MP4" -f null - > qa/full-decode.log 2>&1 && echo "full decode: OK (no errors)" >> qa/full-decode.log
ffmpeg -nostdin -hide_banner -i "$MP4" -vn -af "ebur128=peak=true" -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -nostdin -v error -y -i "$MP4" -lavfi "showspectrumpic=s=1200x400:legend=1" qa/spectrum.png
for s in "0 2" "2 4" "4 10" "10 12" "12 15"; do set -- $s
  printf "%5s-%-5s " "$1" "$2"; ffmpeg -nostdin -hide_banner -ss "$1" -to "$2" -i "$MP4" -vn -af volumedetect -f null - 2>&1 | grep -oE "(mean|max)_volume: [-0-9.]+ dB" | tr '\n' ' '; echo
done > qa/section-rms.txt
python3 src/tools/contact_sheet.py qa/contact-sheet.png --video "$MP4" \
  --frames 0,15,30,45,59,60,68,75,90,105,119,120,128,135,150,165,180,195,210,225,240,255,270,285,299,300,308,315,330,345,359,360,363,375,390,405,420,435,449 --cols 10 --width 180
# transition strips (from the encode): iris 2.0, zoom 4.0, slats 10.0, cut 12.0
for t in 1.90 3.90 9.90 11.90; do
  ffmpeg -nostdin -v error -y -ss "$t" -t 0.7 -i "$MP4" -vf "fps=10,scale=216:-1,tile=7x1" -frames:v 1 "qa/transition-$t.png"
done
echo done
