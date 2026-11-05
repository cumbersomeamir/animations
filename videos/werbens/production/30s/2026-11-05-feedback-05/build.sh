#!/usr/bin/env bash
# Reproducible build of videos/werbens/production/30s/2026-11-05-feedback-05/werbens-30s-feedback05-01.mp4
# Requires Node >= 22, ffmpeg 6.x, espeak-ng 1.51 (Ubuntu package `espeak-ng`, Hindi G2P), the system Playwright + Chromium
# (pre-installed; not reinstalled). No GPU, no API keys, no Blender. Kokoro weights reused from the education/pilot-01 cache.
set -euo pipefail
cd "$(dirname "$0")"
npm ci
node src/tts_hi.mjs              # Kokoro-82M Hindi voice hf_alpha, speed 1.22, eSpeak NG hi G2P (+misaki mapping) -> build/narration
node src/words_hi.mjs            # Hindi word timing (voiced segments x eSpeak phoneme counts) -> src/words.json
node src/audio.mjs               # accepted non-looping score + foley + narration -> build/audio/mix.wav (-15 LUFS)
node src/render.mjs --video      # deterministic Three.js frames (SwiftShader WebGL2) in headless Chromium -> build/video.mp4
ffmpeg -y -loglevel error -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart werbens-30s-feedback05-01.mp4
bash qa.sh
node src/qa_dom.mjs 1            # caption + label bounds / overlaps on every frame -> qa/dom-bounds.json
node src/asr_hi.mjs werbens-30s-feedback05-01.mp4 --out qa/asr-hi-final.json   # Hindi ASR of the final mix (Whisper large-v3-turbo)
