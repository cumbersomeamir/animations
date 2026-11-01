#!/usr/bin/env bash
# Reproducible build: venv -> (optional TTS) -> audio mix -> frames -> mux -> verify.
#   ./build.sh            # uses committed narration WAVs
#   TTS=1 ./build.sh      # regenerate narration with Kokoro (needs ./fetch_models.sh)
set -euo pipefail
cd "$(dirname "$0")"
[ -x .venv/bin/python ] || { python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt; }
PY=.venv/bin/python
mkdir -p build ../output ../qa
if [ "${TTS:-0}" = "1" ]; then ./fetch_models.sh && $PY tts.py; fi
$PY audio.py
$PY render.py --video build/video_silent.mp4
ffmpeg -y -loglevel error -i build/video_silent.mp4 -i build/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t 30 -movflags +faststart ../output/recall-30s.mp4
$PY qa.py
