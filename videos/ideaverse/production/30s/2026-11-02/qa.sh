#!/usr/bin/env bash
# QA evidence for ideaverse-30s-production-01.mp4
set -euo pipefail
cd "$(dirname "$0")"
MP4=ideaverse-30s-production-01.mp4
mkdir -p qa
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=index,codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_frames,duration,sample_rate,channels,channel_layout,bit_rate -of json "$MP4" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$MP4" > qa/decoded-video-frames.txt
ffmpeg -nostdin -v error -i "$MP4" -f null - > qa/full-decode.log 2>&1 && echo "full decode: OK (no errors)" >> qa/full-decode.log
ffmpeg -nostdin -hide_banner -i "$MP4" -vn -af "ebur128=peak=true" -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -nostdin -v error -y -i "$MP4" -lavfi "showspectrumpic=s=1200x400:legend=1" qa/spectrum.png
python3 src/tools/contact_sheet.py qa/contact-sheet-full.png --video "$MP4" --frames $(python3 -c "print(','.join(str(f) for f in range(0,900,30))+',899')") --cols 8 --width 200
python3 src/tools/contact_sheet.py qa/contact-sheet-boundaries.png --video "$MP4" --frames 88,90,92,238,240,242,688,690,692,868,870,872,898,899 --cols 7 --width 220
python3 src/tools/caption_bounds.py "$MP4" > qa/caption-bounds.txt
echo done
