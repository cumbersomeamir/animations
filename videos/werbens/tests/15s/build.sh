#!/usr/bin/env bash
# Reproducible build of videos/werbens/tests/15s/werbens-15s-test.mp4
# Requires: Node >= 22, ffmpeg 6.x, system Playwright Chromium (pre-installed; not reinstalled).
set -euo pipefail
cd "$(dirname "$0")"
npm ci
node src/tts.mjs                 # Kokoro-82M narration (local) -> build/narration
node src/audio.mjs               # original music + SFX + narration mix, loudnorm -> build/audio/mix.wav
node src/render.mjs --video      # deterministic Three.js frames in headless Chromium -> build/video.mp4
ffmpeg -y -loglevel error -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart werbens-15s-test.mp4
bash qa.sh
