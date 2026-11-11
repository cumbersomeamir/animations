#!/usr/bin/env bash
# Reproducible build: courtlens-30s-english11-01.mp4 (1080x1920, 30 fps, exactly 900 frames / 30.000 s)
# Requirements: node 22 + pre-installed Playwright Chromium, ffmpeg 6, python with kokoro-onnx 0.6.1 + soundfile + numpy.
# Env:  KOKORO_DIR = folder holding kokoro-v1.0.onnx + voices-v1.0.bin (only needed when SKIP_TTS!=1)
#       PY        = python interpreter with the packages above (default python3)
#       WORK      = scratch folder for frames/intermediate audio (default /tmp/courtlens-30s-build)
#       SKIP_TTS=1 reuses audio/lines; SKIP_FRAMES=1 reuses $WORK/frames (900 PNGs)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(dirname "$HERE")"
PY="${PY:-python3}"; WORK="${WORK:-/tmp/courtlens-30s-build}"
OUT="$ROOT/courtlens-30s-english11-01.mp4"
mkdir -p "$WORK"
cd "$HERE"
if [ "${SKIP_TTS:-0}" != "1" ]; then
  "$PY" tts.py --model-dir "${KOKORO_DIR:?set KOKORO_DIR}" --lines narration.json --out ../audio/lines
fi
"$PY" audio_mix.py timeline.json ../audio/lines "$WORK/mix_raw.wav"
ffmpeg -hide_banner -loglevel error -y -i "$WORK/mix_raw.wav" \
  -af "volume=7.5dB,alimiter=limit=0.75:attack=3:release=60:level=disabled,aresample=48000" -c:a pcm_s16le "$WORK/mix.wav"
if [ "${SKIP_FRAMES:-0}" != "1" ]; then   # SKIP_FRAMES=1 re-muxes audio onto already rendered frames
  rm -rf "$WORK/frames"
  node render.cjs frames "$WORK/frames" "${WORKERS:-4}"
fi
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$WORK/frames/f_%04d.png" -i "$WORK/mix.wav" \
  -map 0:v:0 -map 1:a:0 \
  -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level:v 4.2 -pix_fmt yuv420p -g 60 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -t 30 "$OUT"
echo "built $OUT"
