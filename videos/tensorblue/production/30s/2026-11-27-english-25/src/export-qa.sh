#!/usr/bin/env bash
# Mux the silent render with the mix, then run the export gates on the final MP4.
# usage: export-qa.sh <silent.mp4> <mix.wav> <out.mp4> <qa_dir>
set -euo pipefail
SILENT=$1; MIX=$2; OUT=$3; QA=$4
mkdir -p "$QA"
ffmpeg -v error -y -i "$SILENT" -i "$MIX" -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart "$OUT"
{
  echo "== ffprobe streams"
  ffprobe -v error -show_entries stream=index,codec_type,codec_name,profile,pix_fmt,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels,channel_layout,duration,nb_frames,bit_rate -of default=nw=1 "$OUT"
  echo "== container"
  ffprobe -v error -show_entries format=duration,size,bit_rate,format_name -of default=nw=1 "$OUT"
  echo "== counted video frames"
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1 "$OUT"
  echo "== full decode errors (empty = none)"
  ffmpeg -v error -i "$OUT" -f null - 2>&1 | head -20
  echo "== decode exit ok"
  echo "== loudness (ebur128, exported AAC)"
  ffmpeg -nostats -i "$OUT" -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p'
  echo "== sha256"
  sha256sum "$OUT"
} | tee "$QA/export-report.txt"
# contact sheet: one frame per second (30 tiles)
ffmpeg -v error -y -i "$OUT" -vf "fps=1,scale=216:384,tile=10x3:padding=6:margin=6:color=0x222222" -frames:v 1 "$QA/contact-sheet-1fps.png"
