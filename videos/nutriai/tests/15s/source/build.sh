#!/usr/bin/env bash
# Reproducible build for the NutriAI 15 s shader test.
#   PIPER_PY=/path/to/venv/bin/python PIPER_MODEL=/path/en_US-ljspeech-high.onnx ./build.sh
# Requirements: node 22 + `npm ci` (three 0.180.0), Playwright 1.63 with its Chromium (pre-installed here),
# ffmpeg 6.1, Python 3.13 venv with piper-tts 1.8.0, numpy, scipy (see audio/requirements.txt).
set -euo pipefail
cd "$(dirname "$0")"
OUT=../nutriai-15s-test.mp4
: "${PIPER_PY:?set PIPER_PY to the venv python that has piper-tts}"
: "${PIPER_MODEL:?set PIPER_MODEL to en_US-ljspeech-high.onnx}"

npm ci --silent
node render.mjs                                   # -> build/video-noaudio.mp4 (450 frames)
"$PIPER_PY" -I audio/build_audio.py "$PIPER_MODEL" build/audio   # -> build/audio/mix.wav (15.000 s)

# loudness: two-pass EBU R128 (linear gain) to -14 LUFS / -1.5 dBTP
J=$(ffmpeg -hide_banner -i build/audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$J" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_i"],d["input_tp"],d["input_lra"],d["input_thresh"],d["target_offset"])')
read -r I TP LRA TH OFF <<<"$mi"
ffmpeg -y -v error -i build/audio/mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" -c:a pcm_s16le build/audio/mix-norm.wav

ffmpeg -y -v error -i build/video-noaudio.mp4 -i build/audio/mix-norm.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart "$OUT"
python3 -I qa/qa.py "$OUT"
