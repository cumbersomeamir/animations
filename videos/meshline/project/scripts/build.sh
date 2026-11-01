#!/usr/bin/env bash
# Reproducible build: narration (optional) -> cue sheet -> audio mix -> frames/video -> mux.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-python3}                     # python with audio/requirements.txt installed
KOKORO_DIR=${KOKORO_DIR:-.cache/kokoro}
WORKERS=${WORKERS:-4}
mkdir -p build ../output
if [ -f "$KOKORO_DIR/model.onnx" ] && [ "${REGEN_VO:-0}" = "1" ]; then
  "$PY" audio/tts.py "$KOKORO_DIR" af_heart audio/narration   # committed WAVs are used otherwise
fi
node src/render.mjs --events build/events.json
"$PY" audio/mix.py build/events.json audio/narration build/mix.wav
node src/render.mjs --video build/video.mp4 --workers "$WORKERS"
ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest -movflags +faststart \
  -metadata title="Meshline - 30s promo" ../output/meshline-30s.mp4
echo "built ../output/meshline-30s.mp4"
