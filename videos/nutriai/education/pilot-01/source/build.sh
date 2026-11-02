#!/usr/bin/env bash
# Reproducible build: NutriAI Education Pilot 01 (mango).
#   PIPER_PY=/path/venv/bin/python PIPER_MODEL=/path/en_US-ljspeech-high.onnx ./build.sh
# Needs: node 22 + npm ci (three 0.180.0); Playwright 1.63 with Chromium (pre-installed here); ffmpeg 6.1 with
# librubberband; Python venv: see audio/requirements.txt.
set -euo pipefail
cd "$(dirname "$0")"
OUT=../nutriai-education-pilot-01.mp4
: "${PIPER_PY:?set PIPER_PY}"; : "${PIPER_MODEL:?set PIPER_MODEL}"
npm ci --silent
"$PIPER_PY" -I audio/build_audio.py "$PIPER_MODEL" build/audio      # voice + music + SFX + mouth.json (lip-sync)
node render.mjs                                                      # 450 frames -> build/video-noaudio.mp4 (+ build/textlog.json)
J=$(ffmpeg -hide_banner -i build/audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
read -r I TP LRA TH OFF <<<"$(echo "$J" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_i"],d["input_tp"],d["input_lra"],d["input_thresh"],d["target_offset"])')"
ffmpeg -y -v error -i build/audio/mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" -c:a pcm_s16le build/audio/mix-norm.wav
ffmpeg -y -v error -i build/video-noaudio.mp4 -i build/audio/mix-norm.wav -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart "$OUT"
node make_sheet.mjs                                                  # ../character/gram-model-sheet.png
python3 -I qa/qa.py "$OUT"
