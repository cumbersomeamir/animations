#!/usr/bin/env bash
# QA evidence for the final MP4: metadata, full decode, frame count, loudness, black/freeze detection,
# contact sheet (1 frame / s), scene-boundary frames and an audio waveform/spectrogram.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=../output/meshline-30s.mp4
Q=../qa
PY=${PY:-python3}
rm -rf "$Q/frames" "$Q/boundaries"; mkdir -p "$Q/frames" "$Q/boundaries"
ffprobe -v error -show_format -show_streams -of json "$OUT" > "$Q/ffprobe.json"
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,r_frame_rate,width,height,codec_name,pix_fmt -of default=nw=1 "$OUT" > "$Q/frames.txt"
{ ffmpeg -v error -i "$OUT" -f null - 2>&1 && echo "FULL DECODE OK (no errors)"; } > "$Q/decode.log"
ffmpeg -hide_banner -nostats -i "$OUT" -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > "$Q/loudness.txt"
ffmpeg -hide_banner -nostats -i "$OUT" -vf "blackdetect=d=0.25:pix_th=0.05,freezedetect=n=0.001:d=1.2" -map 0:v -f null - 2>&1 | grep -E "black_|freeze_" > "$Q/black_freeze.txt" || echo "no black segments >=0.25s, no freezes >=1.2s" > "$Q/black_freeze.txt"
ffmpeg -hide_banner -nostats -i "$OUT" -map 0:a -af astats=metadata=0:reset=0 -f null - 2>&1 | grep -E "Peak level dB|RMS level dB|Number of samples|Flat factor" | tail -4 > "$Q/astats.txt"
for s in $(seq 0 29); do ffmpeg -v error -ss "$s.5" -i "$OUT" -frames:v 1 -y "$Q/frames/t$(printf %04.1f $s.5)s.png"; done
$PY scripts/montage.py "$Q/contact-sheet.png" 6 270 $(ls "$Q"/frames/*.png)
for s in 0.00 0.60 1.15 3.50 4.60 6.70 8.00 10.95 11.50 13.45 18.00 18.40 20.80 22.30 23.15 23.60 23.93 24.00 24.45 25.30 26.10 29.95; do
  ffmpeg -v error -ss "$s" -i "$OUT" -frames:v 1 -y "$Q/boundaries/b${s}s.png"; done
$PY scripts/montage.py "$Q/boundary-sheet.png" 6 270 $(ls "$Q"/boundaries/*.png | sort -V)
ffmpeg -v error -y -i "$OUT" -filter_complex "[0:a]showwavespic=s=1800x300:split_channels=1:colors=0x8EA2FF|0xFF6A5C[w]" -map "[w]" -frames:v 1 "$Q/waveform.png"
ffmpeg -v error -y -i "$OUT" -lavfi "showspectrumpic=s=1800x500:legend=1" "$Q/spectrogram.png"
sha256sum "$OUT" > "$Q/sha256.txt"
cat "$Q/frames.txt" "$Q/decode.log" "$Q/black_freeze.txt" "$Q/astats.txt" "$Q/sha256.txt"; grep -E "I:|LRA:|Peak:" "$Q/loudness.txt"
