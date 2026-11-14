#!/usr/bin/env bash
# Mux PNG frames + mix into the deliverable (exact 30.000 s).
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -loglevel error -framerate 30 -i build/frames/f%03d.png -i build/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -level 4.1 -r 30 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart recall-30s-english14-01.mp4
