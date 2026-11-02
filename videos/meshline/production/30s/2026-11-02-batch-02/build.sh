#!/usr/bin/env bash
# Reproducible build: captions (from ASR word timings) -> cue sheet -> audio -> 900 frames -> mux.
set -euo pipefail
cd "$(dirname "$0")"
PY=${PY:-python3}                  # numpy + scipy
mkdir -p build
python3 scripts_captions.py > /dev/null
node src/render.mjs --cues build/cues.json
"$PY" audio/mix_batch02.py build/cues.json audio/narration build/mix.wav
node src/render.mjs --video build/video.mp4 --workers "${WORKERS:-4}"
ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 \
  -movflags +faststart -metadata title="Why a walkie-talkie can work when the internet is down" meshline-30s-production-02.mp4
echo "built meshline-30s-production-02.mp4"
