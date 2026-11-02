#!/usr/bin/env bash
# Reproducible build for Aarambh education pilot 01 (15 s portrait lockstitch lesson).
# Requirements: Node 22 + npm, Python 3.11+ with numpy/scipy (requirements-audio.txt), FFmpeg 6 with librubberband + libx264.
# Narration WAVs are committed (audio/narration/raw); TTS regeneration is optional (see audio/tts.py).
set -euo pipefail
cd "$(dirname "$0")"
PY="${PYTHON:-python3}"
npm ci --no-audit --no-fund
"$PY" audio/build_audio.py                      # voice processing, music, SFX, mix + lip-sync timing
node src/character-sheet.mjs                     # character/bindu-model-sheet.png
node src/render.mjs --out build/video.mp4        # 450 frames -> H.264 (video only)
ffmpeg -y -hide_banner -loglevel error -i build/video.mp4 -i audio/build/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t 15 -movflags +faststart aarambh-education-pilot-01.mp4
bash tools/qa.sh aarambh-education-pilot-01.mp4  # ffprobe, full decode, contact sheets
echo "done: $(pwd)/aarambh-education-pilot-01.mp4"
