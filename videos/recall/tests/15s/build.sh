#!/usr/bin/env bash
# Recall 15 s stickman-video style test — reproducible build.
#   ./build.sh          uses committed voice WAVs (audio/voice)
#   TTS=1 ./build.sh    regenerate the voice (needs ../../project/fetch_models.sh)
set -euo pipefail
cd "$(dirname "$0")"
PY=../../project/.venv/bin/python
[ -x "$PY" ] || { python3 -m venv ../../project/.venv && ../../project/.venv/bin/pip install -q -r ../../project/requirements.txt -r ../../project/requirements-qa.txt; }
mkdir -p ~/.local/share/fonts build qa && cp fonts/*.ttf ~/.local/share/fonts/ && fc-cache -f >/dev/null
if [ "${TTS:-0}" = "1" ]; then $PY src/tts15.py; fi
$PY src/audio15.py
$PY src/video15.py --video build/video15_silent.mp4
ffmpeg -y -loglevel error -i build/video15_silent.mp4 -i build/mix15.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart recall-15s-test.mp4
$PY src/check15.py
