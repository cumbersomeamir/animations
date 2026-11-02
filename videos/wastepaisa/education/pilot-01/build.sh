#!/usr/bin/env bash
# Reproducible build for WastePaisa education pilot 01.
#   ./build.sh            render video + audio from source and mux the final MP4, then run QA
#   REGEN_TTS=1 ./build.sh  also re-synthesise narration (needs PIPER_BIN, PIPER_VOICE_DIR, VOSK_MODEL)
# Requirements: node 22 + npm, python3 with numpy + Pillow, ffmpeg/ffprobe 6.x,
# Playwright with Chromium (preinstalled here; otherwise `npm i -g playwright@1.63 && npx playwright install chromium`).
set -euo pipefail
cd "$(dirname "$0")"
OUT=wastepaisa-education-pilot-01.mp4
mkdir -p build

npm ci --no-audit --no-fund

if [[ "${REGEN_TTS:-0}" == "1" ]]; then
  # piper-tts==1.8.0 in a venv; voice: see script.json (url + sha256); Vosk model picks the clearest take
  "${PYTHON_TTS:-python3}" -I audio/tts.py --regen ${TTS_ONLY:+--only $TTS_ONLY}
else
  python3 audio/tts.py            # re-treat committed raw takes, re-measure timing
fi
python3 audio/synth.py             # original music + SFX stems
python3 audio/mix.py build         # ducked mix, two-pass loudnorm -> build/mix.wav (720000 samples)

node src/render.js video build/video-only.mp4   # 450 frames, lossless PNG capture -> x264 CRF 14

# mux: copy video, AAC 192k; exact 15.000 s
ffmpeg -v error -y -i build/video-only.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart "$OUT"
cp build/video-only.text-bounds.json qa/text-bounds.json

python3 tools/qa.py "$OUT"
