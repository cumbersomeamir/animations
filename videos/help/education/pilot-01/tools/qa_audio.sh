#!/usr/bin/env bash
# Audio QA for the final MP4: loudness (EBU R128), true peak, clipping, stream timing.
# Optional intelligibility check: set VOSK_PY (python with vosk) and VOSK_MODEL (vosk-model-small-en-us-0.15 dir).
set -euo pipefail
cd "$(dirname "$0")/.."
MP4=help-education-pilot-01.mp4
OUT=qa/audio-report.txt
{
  echo "# Audio QA — $MP4 — $(date -u +%Y-%m-%dT%H:%MZ)"
  echo "## EBU R128 (ffmpeg ebur128, true peak)"
  ffmpeg -hide_banner -nostats -i "$MP4" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p'
  echo "## astats (overall)"
  ffmpeg -hide_banner -nostats -i "$MP4" -map 0:a:0 -af astats=measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level|Number of samples|Flat factor|Peak count" || true
  echo "## silence > 0.6 s below -45 dB (expected: none inside narration)"
  ffmpeg -hide_banner -nostats -i "$MP4" -map 0:a:0 -af silencedetect=n=-45dB:d=0.6 -f null - 2>&1 | grep -E "silence_(start|end)" || echo "none"
} > "$OUT"
if [ -n "${VOSK_PY:-}" ] && [ -n "${VOSK_MODEL:-}" ]; then
  tmp=$(mktemp -d)
  ffmpeg -v error -y -i "$MP4" -map 0:a:0 -ac 1 -ar 16000 "$tmp/a.wav"
  { echo "## Offline ASR (Vosk small-en-us-0.15) on the final mix"; "$VOSK_PY" -I "$(dirname "$0")/asr_check.py" "$VOSK_MODEL" "$tmp/a.wav"; } >> "$OUT"
  rm -rf "$tmp"
fi
cat "$OUT"
