#!/usr/bin/env bash
# Reproducible build: Recall 30 s english-13 "why an elevator feels heavier as it starts rising" (English) (30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo) + a separate vertical thumbnail.
#   ./build.sh               # uses committed narration WAVs
#   TTS=1 ./build.sh         # regenerate narration (reuses the cached Kokoro model; see audio/tts.py)
#   WORKERS=3 ./build.sh     # parallel headless-Chromium render workers
# Requires Node 22 + Playwright 1.63 with Chromium (preinstalled), Python 3.13, ffmpeg 6.1.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/three ] || npm ci --no-audit --no-fund
[ -x audio/.venv/bin/python ] || { python3 -m venv audio/.venv && audio/.venv/bin/pip install -q -r audio/requirements.txt -r audio/requirements-qa.txt; }
PY=audio/.venv/bin/python
mkdir -p build
if [ "${TTS:-0}" = "1" ]; then $PY audio/tts.py && $PY audio/asr_words.py; fi
$PY audio/mix.py
FRAMES=$(python3 -c "import json;print(json.load(open('timeline.json'))['frames'])")
WORKERS=${WORKERS:-3}
rm -rf build/frames && mkdir -p build/frames
per=$(( (FRAMES + WORKERS - 1) / WORKERS ))
for i in $(seq 0 $((WORKERS - 1))); do
  from=$((i * per)); to=$(( (i + 1) * per - 1 )); [ "$to" -gt $((FRAMES - 1)) ] && to=$((FRAMES - 1))
  node render.mjs --pngdir build/frames --from "$from" --to "$to" --physics build/physics.json > "build/render_$i.log" 2>&1 &
done
wait
n=$(ls build/frames/f*.png | wc -l)
[ "$n" -eq "$FRAMES" ] || { echo "expected $FRAMES frames, got $n (see build/render_*.log)"; exit 1; }

./mux.sh
node render.mjs --sheet build/sheet > build/thumb.log 2>&1 && cp build/sheet/thumbnail.png recall-30s-english13-01-thumbnail.png   # separate vertical thumbnail
$PY qa/qa.py
$PY qa/narration_sync.py
$PY qa/caption_sync.py
