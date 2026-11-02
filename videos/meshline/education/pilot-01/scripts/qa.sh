#!/usr/bin/env bash
# QA evidence for Educational Pilot 01: metadata, frame count, full decode, loudness, black/freeze,
# representative contact sheet (every 0.5 s), scene/transition boundary sheet, waveform, sha256.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=meshline-education-pilot-01.mp4; Q=qa; PY=${PY:-python3}; MONT=../../project/scripts/montage.py
rm -rf $Q/frames $Q/boundaries; mkdir -p $Q/frames $Q/boundaries
ffprobe -v error -show_format -show_streams -of json $OUT > $Q/ffprobe.json
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,sample_rate,channels,duration,nb_frames -of default=nw=1 $OUT > $Q/ffprobe-summary.txt
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1 $OUT > $Q/frames.txt
{ ffmpeg -v error -i $OUT -f null - 2>&1 && echo "FULL DECODE OK (no errors)"; } > $Q/decode.log
ffmpeg -hide_banner -nostats -i $OUT -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > $Q/loudness.txt
ffmpeg -hide_banner -nostats -i $OUT -map 0:v -vf "blackdetect=d=0.25:pix_th=0.05,freezedetect=n=0.0005:d=1.5" -f null - 2>&1 | grep -E "black_|freeze_" > $Q/black_freeze.txt || echo "no black >=0.25s, no freeze >=1.5s" > $Q/black_freeze.txt
for s in $(seq 0.25 0.5 14.75) 14.95; do ffmpeg -v error -ss $s -i $OUT -frames:v 1 -y $Q/frames/t$(printf %05.2f $s).png; done
$PY $MONT $Q/contact-sheet.png 8 220 $(ls $Q/frames/*.png)
for s in 0.00 0.30 0.50 1.20 1.80 2.40 2.85 3.20 4.60 5.50 6.25 6.90 7.70 9.00 10.75 11.00 11.50 12.00 12.40 12.70 13.40 14.96; do ffmpeg -v error -ss $s -i $OUT -frames:v 1 -y $Q/boundaries/b$(printf %05.2f $s).png; done
$PY $MONT $Q/boundary-sheet.png 8 220 $(ls $Q/boundaries/*.png | sort -V)
ffmpeg -v error -y -i $OUT -filter_complex "[0:a]showwavespic=s=1600x260:split_channels=1:colors=0x8EA2FF|0xFF6A5C[w]" -map "[w]" -frames:v 1 $Q/waveform.png
sha256sum $OUT > $Q/sha256.txt
cat $Q/ffprobe-summary.txt $Q/frames.txt $Q/decode.log $Q/black_freeze.txt $Q/sha256.txt; grep -E "I:|LRA:|Peak:" $Q/loudness.txt
