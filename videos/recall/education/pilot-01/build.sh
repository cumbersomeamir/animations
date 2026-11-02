#!/usr/bin/env bash
# Reproducible build: Recall education pilot 01 (15.000 s, 1080x1920, 30 fps, H.264 + AAC).
#   ./build.sh               # uses committed narration WAVs
#   TTS=1 ./build.sh         # regenerate narration with Kokoro first (downloads ~325 MB model once)
#   WORKERS=3 ./build.sh     # parallel headless-Chromium render workers
# Requires: Node 22 + Playwright 1.63 with Chromium (preinstalled), Python 3.13, ffmpeg 6.1.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules/three ] || npm ci --no-audit --no-fund
[ -x audio/.venv/bin/python ] || { python3 -m venv audio/.venv && audio/.venv/bin/pip install -q -r audio/requirements.txt; }
PY=audio/.venv/bin/python
mkdir -p build
if [ "${TTS:-0}" = "1" ]; then audio/fetch_models.sh && $PY audio/tts.py; fi
$PY audio/mix.py                                   # -> build/mix.wav, build/mouth.json, build/audio_report.json
WORKERS=${WORKERS:-3}
rm -rf build/frames && mkdir -p build/frames
per=$(( (450 + WORKERS - 1) / WORKERS ))
for i in $(seq 0 $((WORKERS - 1))); do
  from=$((i * per)); to=$(( (i + 1) * per - 1 )); [ "$to" -gt 449 ] && to=449
  node render.mjs --pngdir build/frames --from "$from" --to "$to" --physics build/physics.json > "build/render_$i.log" 2>&1 &
done
wait
n=$(ls build/frames/f*.png | wc -l)
[ "$n" -eq 450 ] || { echo "expected 450 frames, got $n (see build/render_*.log)"; exit 1; }
ffmpeg -y -loglevel error -framerate 30 -i build/frames/f%03d.png -i build/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -level 4.1 -r 30 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart recall-education-pilot-01.mp4
$PY qa/qa.py                                       # ffprobe, full decode, loudness, ASR, contact sheets
