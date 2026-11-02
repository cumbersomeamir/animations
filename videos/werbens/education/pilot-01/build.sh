#!/usr/bin/env bash
# Reproducible build of videos/werbens/education/pilot-01/werbens-education-pilot-01.mp4
# Requires: Node >= 22, ffmpeg 6.x, the system Playwright + Chromium (pre-installed; not reinstalled). No GPU, no API keys.
set -euo pipefail
cd "$(dirname "$0")"
npm ci
node src/tts.mjs                 # Kokoro-82M narration (local, blended host voice) -> build/narration
node src/words.mjs               # Whisper base.en word timing + intelligibility -> src/words.json (captions, lip-sync)
node src/audio.mjs               # original score + SFX + narration, loudnorm -> build/audio/mix.wav
node src/render.mjs --video      # deterministic Three.js frames in headless Chromium -> build/video.mp4
ffmpeg -y -loglevel error -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart werbens-education-pilot-01.mp4
bash qa.sh
node src/asr_mix.mjs             # intelligibility of narration inside the final mix -> qa/asr-mix.json
node src/render.mjs --sheet && bash character/make-sheet.sh   # character model sheet
