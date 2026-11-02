#!/usr/bin/env bash
# Reproducible build for Help — Education Pilot 01.
#   ./build.sh            full build (deps, mix, frames, mux, QA artefacts)
#   SKIP_VOICE=1 default  uses the committed Piper takes in audio/generated/voice (Piper is stochastic)
#   REVOICE=1 ./build.sh  re-synthesizes all narration takes (needs the 63.5 MB voice model download)
set -euo pipefail
cd "$(dirname "$0")"

# 1) dependencies (official registries only)
[ -d node_modules/three ] || npm ci --no-audit --no-fund
if [ "${REVOICE:-0}" = "1" ]; then
  [ -x .venv/bin/python ] || { python3 -m venv --system-site-packages .venv && .venv/bin/pip install -q -r requirements.txt; }
  mkdir -p models
  for f in en_US-ljspeech-medium.onnx en_US-ljspeech-medium.onnx.json MODEL_CARD; do
    [ -f "models/$f" ] || curl -sSL -o "models/$f" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium/$f"
  done
  echo "6f52a751e2349abe7a76735eb09dc1875298c77ea2342ffd2fef79ff81b87f22  models/en_US-ljspeech-medium.onnx" | sha256sum -c -
  .venv/bin/python audio/voice.py
fi

# 2) soundtrack (voice processing, original music + SFX, ducking, loudness) + lip-sync curve
python3 audio/mix.py

# 3) frames -> H.264 (headless Chromium + three.js, PNG piped to ffmpeg)
node tools/render.mjs --out build/video.mp4

# 4) mux: copy video, AAC audio, exact 15.000 s
ffmpeg -v error -y -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart help-education-pilot-01.mp4

# 5) QA artefacts
node tools/render.mjs --sheet
ffprobe -v error -show_format -show_streams -of json help-education-pilot-01.mp4 > qa/ffprobe.json
ffmpeg -v error -i help-education-pilot-01.mp4 -f null - 2> qa/full-decode.log && echo "full decode: OK (no errors)" >> qa/full-decode.log
python3 tools/contact_sheet.py video help-education-pilot-01.mp4 qa/contact-sheet.png \
  0.2,1.0,1.8,2.6,3.4,4.2,5.0,5.5,6.2,6.6,7.0,7.6,8.4,9.0,9.6,10.4,11.3,11.9,12.6,13.3,14.0,14.9 6 "Representative frames"
python3 tools/contact_sheet.py video help-education-pilot-01.mp4 qa/boundary-sheet.png \
  0.0,2.8,2.8333,5.6,5.6333,8.1,8.1333,10.9333,10.9667,14.9667 5 "Shot boundaries (last frame / first frame)"
echo "done: $(pwd)/help-education-pilot-01.mp4"
