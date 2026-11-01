#!/usr/bin/env bash
# Reproducible build for videos/mello/output/mello-30s.mp4
# Prereqs: run ./setup.sh once (venv, fonts, TTS model). Needs ffmpeg on PATH.
set -euo pipefail
cd "$(dirname "$0")"
PY="${MELLO_PY:-.venv/bin/python}"
OUT=../output
mkdir -p "$OUT" generated

# 1. narration (Kokoro-82M via kokoro-onnx, local CPU) -> generated/narration.wav + timeline.json
if [[ "${SKIP_TTS:-0}" != "1" ]]; then
  "$PY" -I src/narration.py
fi
# 2. score + SFX + mix -> generated/mix.wav
"$PY" -I src/audio.py
# 3. frames -> silent H.264
"$PY" -I src/render.py --video generated/video_silent.mp4
# 4. mux: H.264 + AAC 48 kHz
ffmpeg -y -loglevel error -i generated/video_silent.mp4 -i generated/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -t 30 -movflags +faststart "$OUT/mello-30s.mp4"
# 5. QA artefacts (contact sheet, boundary frames, ffprobe, decode, audio report)
"$PY" -I src/qa.py
echo "done: $OUT/mello-30s.mp4"
