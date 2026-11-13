#!/usr/bin/env bash
# Reproducible build for videos/mello/production/30s/2026-11-13-english-13/mello-30s-english13-01.mp4
# Prereqs (one time):
#   (cd ../../../../project && ./setup.sh)   # shared Mello venv + Kokoro-82M ONNX model (hash-checked), gitignored
#   npm ci                                   # three@0.170.0 + @fontsource fonts (package-lock.json)
#   Chromium + Playwright pre-installed (require('playwright')), ffmpeg on PATH. No paid API, no Blender.
set -euo pipefail
cd "$(dirname "$0")"
PY="${MELLO_PY:-../../../../project/.venv/bin/python}"
OUT=../mello-30s-english13-01.mp4
mkdir -p generated ../qa

# 1. narration (English): Kokoro 0.7 af_bella + 0.3 am_puck (accepted Mello voice), en-us, speed 0.98 -> generated/narration.wav + timeline.json
[[ "${SKIP_TTS:-0}" == "1" ]] || "$PY" -I src/narration.py
# 2. frames: three.js scene in headless Chromium (SwiftShader WebGL) -> PNG pipe -> libx264 yuv420p
#    (also writes generated/events.json, the scene beats used by the sound design)
node render.mjs --video generated/video_silent.mp4
# 3. score + SFX + ducking + -16 LUFS master -> generated/mix.wav
"$PY" -I src/audio.py
# 4. mux: copy video, AAC 48 kHz stereo, exactly 30.000 s
ffmpeg -y -loglevel error -i generated/video_silent.mp4 -i generated/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart "$OUT"
# 5. QA: safe-zone audit, then probe / decode / loudness / motion / frames / timing table
node render.mjs --layout ../qa/layout.json
# English intelligibility: faster-whisper==1.1.1 large-v3-turbo, language en, per line (writes ../qa/asr.json; run before qa.py)
[[ -z "${ASR_PY:-}" ]] || "$ASR_PY" -I src/asr_check.py "$OUT" large-v3-turbo
"$PY" -I src/qa.py "$OUT"
echo "done: $OUT"
