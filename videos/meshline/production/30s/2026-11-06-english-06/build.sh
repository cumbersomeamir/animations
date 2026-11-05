#!/usr/bin/env bash
# Reproducible build: captions (from ASR word timings) -> cue sheet -> audio -> 900 frames -> mux.
set -euo pipefail
cd "$(dirname "$0")"
PY=${PY:-python3}                  # numpy + scipy
mkdir -p build
python3 scripts_captions.py > /dev/null
node src/render.mjs --cues build/cues.json
"$PY" audio/mix_e6.py build/cues.json audio/narration build/mix.wav
node src/render.mjs --video build/video.mp4 --workers "${WORKERS:-4}"
ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 \
  -movflags +faststart -metadata title="One tick, but not two: where is your message?" meshline-30s-english06-01.mp4
echo "built meshline-30s-english06-01.mp4"
