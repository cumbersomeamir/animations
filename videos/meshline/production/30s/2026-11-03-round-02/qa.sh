#!/usr/bin/env bash
# QA on the exported MP4: streams/duration/frames, full decode, loudness + true peak, black/freeze,
# full contact sheet (1 frame/s), transition sheet, waveform, sha256, caption bounds, final ASR.
set -euo pipefail
cd "$(dirname "$0")"
OUT=meshline-30s-round02-01.mp4; Q=qa; MONT=../../../project/scripts/montage.py
rm -rf $Q/frames $Q/boundaries; mkdir -p $Q/frames $Q/boundaries
ffprobe -v error -show_format -show_streams -of json $OUT > $Q/ffprobe.json
ffprobe -v error -show_entries format=duration,size,bit_rate:stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,sample_rate,channels,duration -of default=nw=1 $OUT > $Q/ffprobe-summary.txt
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1 $OUT > $Q/frames.txt
{ ffmpeg -v error -i $OUT -f null - 2>&1 && echo "FULL DECODE OK (no errors)"; } > $Q/decode.log
ffmpeg -hide_banner -nostats -i $OUT -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > $Q/loudness.txt
ffmpeg -hide_banner -nostats -i $OUT -map 0:v -vf "blackdetect=d=0.25:pix_th=0.05,freezedetect=n=0.0005:d=2" -f null - 2>&1 | grep -E "black_|freeze_" > $Q/black_freeze.txt || echo "no black >=0.25s, no freeze >=2s" > $Q/black_freeze.txt
for s in $(seq 0.5 1 29.5); do ffmpeg -v error -ss $s -i $OUT -frames:v 1 -y $Q/frames/t$(printf %05.2f $s).png; done
python3 $MONT $Q/contact-sheet.png 10 180 $(ls $Q/frames/*.png) > /dev/null
for s in 0.00 1.97 2.95 3.60 4.40 4.90 5.90 7.30 8.10 8.60 10.40 11.00 12.20 13.10 13.90 14.60 15.30 15.90 16.80 18.60 19.50 20.50 21.40 22.55 23.00 24.70 26.90 29.95; do ffmpeg -v error -ss $s -i $OUT -frames:v 1 -y $Q/boundaries/b$(printf %05.2f $s).png; done
python3 $MONT $Q/boundary-sheet.png 8 220 $(ls $Q/boundaries/*.png | sort -V) > /dev/null
ffmpeg -v error -y -i $OUT -filter_complex "[0:a]showwavespic=s=1600x260:split_channels=1:colors=0x8EA2FF|0xFF6A5C[w]" -map "[w]" -frames:v 1 $Q/waveform.png
sha256sum $OUT > $Q/sha256.txt
node captions_check.mjs > /dev/null
cat $Q/ffprobe-summary.txt | tr '\n' ' '; echo; cat $Q/frames.txt $Q/decode.log $Q/black_freeze.txt $Q/sha256.txt; grep -E "I:|LRA:|Peak:" $Q/loudness.txt
