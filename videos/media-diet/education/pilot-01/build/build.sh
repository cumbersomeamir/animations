#!/usr/bin/env bash
# Reproducible build for Media Diet educational pilot 01 (15.000 s, 1080x1920, 30 fps, H.264 + AAC).
# Run from anywhere:  bash videos/media-diet/education/pilot-01/build/build.sh
# Requirements: Node 22 + npm, Python 3.13, FFmpeg 6.1 (libx264, rubberband, aac), Chromium via the
# pre-installed Playwright (require('playwright')); no GPU, no paid APIs, no secrets.
# Env: REGEN_VOICE=1 re-synthesizes narration takes with Piper (default: use committed audio/narration/*.wav)
#      SKIP_FRAMES=1 reuses existing frames/ (audio-only iteration)
set -euo pipefail
cd "$(dirname "$0")/.."
PILOT="$(pwd)"
OUT="$PILOT/media-diet-education-pilot-01.mp4"
VENV="$PILOT/.cache/venv"

echo "== 1/6 dependencies"
[ -d node_modules/three ] || npm ci --no-audit --no-fund
if [ ! -x "$VENV/bin/python" ]; then python3 -m venv "$VENV"; fi
"$VENV/bin/pip" install -q -r build/requirements.txt

echo "== 2/6 narration (Piper, en_US-mike-medium)"
if [ "${REGEN_VOICE:-0}" = "1" ]; then
  mkdir -p .cache/voices
  V=.cache/voices/en_US-mike-medium.onnx
  if [ ! -f "$V" ]; then
    curl -sSL -o "$V" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/mike/medium/en_US-mike-medium.onnx"
    curl -sSL -o "$V.json" "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/mike/medium/en_US-mike-medium.onnx.json"
  fi
  echo "3157e69e2c580cab297483f4b301ee975a4590c17d35a9757e33347d0e90fae2  $V" | sha256sum -c -
  "$VENV/bin/python" build/narration.py src/timeline.json audio/narration
fi

echo "== 3/6 music, SFX, mix, lip-sync envelope"
"$VENV/bin/python" build/audio.py
# two-pass EBU R128 loudness normalisation to -16 LUFS / -1.5 dBTP, 48 kHz stereo
STATS=$(ffmpeg -hide_banner -nostats -i audio/mix_prenorm.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_i"])')
mtp=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_tp"])')
mlra=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_lra"])')
mth=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_thresh"])')
off=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["target_offset"])')
ffmpeg -hide_banner -v error -y -i audio/mix_prenorm.wav \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000,atrim=end_sample=720000,apad=whole_len=720000" \
  -ar 48000 -ac 2 -c:a pcm_s16le audio/mix.wav

echo "== 4/6 frames (headless Chromium + three.js, 450 frames)"
if [ "${SKIP_FRAMES:-0}" != "1" ]; then rm -rf frames; node build/render.mjs film frames; fi
test "$(ls frames/*.png | wc -l)" -eq 450

echo "== 5/6 encode"
ffmpeg -hide_banner -v error -y -framerate 30 -i frames/f%04d.png -i audio/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 17 -profile:v high -level:v 4.2 -pix_fmt yuv420p \
  -r 30 -g 30 -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15.000 -movflags +faststart \
  -metadata title="Media Diet · Nodo Explains 01 — What happens when you send a message" "$OUT"

echo "== 6/6 QA"
bash build/qa.sh
echo "done: $OUT"
