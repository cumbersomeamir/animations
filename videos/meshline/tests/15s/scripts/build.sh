#!/usr/bin/env bash
# Meshline 15s text-message test: cue sheet -> audio -> frames -> mux. Run from anywhere.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PY:-python3}          # needs numpy + scipy (see ../../project/audio/requirements.txt)
WORKERS=${WORKERS:-4}
mkdir -p build
if [ "${REGEN_VO:-0}" = "1" ]; then "$PY" audio/tts15.py "${KOKORO_DIR:?}" af_heart audio/narration.json audio/narration; fi
node src/render.mjs --cues build/cues.json
"$PY" audio/mix15.py build/cues.json audio/narration build/mix.wav
node src/render.mjs --video build/video.mp4 --workers "$WORKERS"
ffmpeg -y -loglevel error -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart -metadata title="Meshline - 15s text-message test" meshline-15s-test.mp4
echo "built tests/15s/meshline-15s-test.mp4"
