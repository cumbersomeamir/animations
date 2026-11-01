#!/usr/bin/env bash
# Full reproducible build of the 15 s test (run from anywhere).
# Prereqs: ../../project/.venv (kokoro-onnx, faster-whisper, scipy) + ../../project/.cache/kokoro (tools/fetch_models.sh)
#          npm ci here (gsap, @fontsource/*); Playwright + Chromium preinstalled.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=../../project/.venv/bin/python
[ -f ../../project/.cache/kokoro/bf_emma.bin ] || curl -sSL -o ../../project/.cache/kokoro/bf_emma.bin https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/bf_emma.bin
echo "669fe0647f9dd04fcab92f1439a40eeb4c8b4ab1f82e4996fe3d918ce4a63b73  ../../project/.cache/kokoro/bf_emma.bin" | sha256sum -c -
mkdir -p build
$PY audio/narration.py                       # narration + ASR check (exit 2 on overlap / low similarity)
node tools/capture.js cues build/cues.json   # SFX cue sheet from the GSAP master timeline
$PY audio/score15.py                         # music + SFX + VO mix
node tools/capture.js video build/video_noaudio.mp4
ffmpeg -hide_banner -loglevel error -y -i build/video_noaudio.mp4 -i build/audio/mix.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -t 15 -movflags +faststart courtlens-15s-test.mp4
tools/qa.sh
../../project/.venv/bin/python tools/sync_check.py > qa/sync_check.txt
