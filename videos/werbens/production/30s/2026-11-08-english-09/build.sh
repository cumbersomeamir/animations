#!/usr/bin/env bash
# Reproducible build of videos/werbens/production/30s/2026-11-08-english-09/werbens-30s-english09-01.mp4
# Requires Node >= 22, ffmpeg 6.x and the system Playwright + Chromium (pre-installed; not reinstalled). No GPU, no API keys,
# no Blender. Kokoro + Whisper weights reused from the education/pilot-01 cache.
set -euo pipefail
cd "$(dirname "$0")"
npm ci
node src/tts.mjs                 # Kokoro-82M English, Meshline/Recall blend af_bella 0.7 + am_puck 0.3, speed 0.98 -> build/narration
node src/words.mjs               # Whisper base.en word timing + per-line intelligibility -> src/words.json
node src/words_fix.mjs           # pin drifted word onsets (WORD_FIX in src/narration.js, read from the voiced segments)
node src/audio.mjs               # accepted non-looping score + foley + narration -> build/audio/mix.wav (-15 LUFS)
node src/render.mjs --video      # deterministic Three.js frames (SwiftShader WebGL2) in headless Chromium -> build/video.mp4
ffmpeg -y -loglevel error -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart werbens-30s-english09-01.mp4
bash qa.sh
node src/qa_dom.mjs 1            # caption + label bounds / overlaps on every frame -> qa/dom-bounds.json
node src/asr_mix.mjs werbens-30s-english09-01.mp4   # English ASR of the final mix (Whisper base.en) -> qa/asr-mix.json
