#!/usr/bin/env bash
# Reproducible build of videos/werbens/production/30s/2026-11-02/werbens-30s-production-01.mp4
# Requires Node >= 22, ffmpeg 6.x, the system Playwright + Chromium (pre-installed; not reinstalled). No GPU, no API keys.
# Kokoro / Whisper weights are reused from education/pilot-01's cache when present (else downloaded once from Hugging Face).
set -euo pipefail
cd "$(dirname "$0")"
npm ci
node src/tts.mjs                 # Kokoro-82M, voice blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us -> build/narration
node src/words.mjs               # one Whisper base.en word-timing pass -> src/words.json (captions, beats)
node src/audio.mjs               # original score + foley + 8-bit mascot voice + narration -> build/audio/mix.wav (-15 LUFS)
node src/render.mjs --video      # deterministic DOM/SVG frames in headless Chromium -> build/video.mp4 (900 frames)
ffmpeg -y -loglevel error -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart werbens-30s-production-01.mp4
bash qa.sh
node src/qa_dom.mjs              # caption bounds / mascot vs caption / safe area -> qa/dom-bounds.json
node src/asr_mix.mjs             # intelligibility of the final mix -> qa/asr-mix.json
