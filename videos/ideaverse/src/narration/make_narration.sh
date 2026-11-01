#!/usr/bin/env bash
# Synthesizes each narration line with Piper TTS (piper-tts 1.8.0, PyPI) using the
# en_US-ljspeech-high voice (rhasspy/piper-voices on Hugging Face; LJ Speech dataset = public domain).
# Usage: PIPER=/path/to/piper VOICE=/path/to/en_US-ljspeech-high.onnx ./narration/make_narration.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${PIPER:?set PIPER to the piper executable}"
: "${VOICE:?set VOICE to en_US-ljspeech-high.onnx}"
LENGTH_SCALE="${LENGTH_SCALE:-0.92}"
mkdir -p wav
python3 - <<'PY' > /tmp/ideaverse_lines.tsv
import json
for l in json.load(open('lines.json')):
    print(l['id'] + '\t' + l['say'])
PY
while IFS=$'\t' read -r id text; do
  echo "$text" | "$PIPER" -m "$VOICE" --length-scale "$LENGTH_SCALE" --sentence-silence 0 -f "wav/$id.raw.wav" 2>/dev/null
  # trim leading/trailing silence, resample to 48 kHz mono
  ffmpeg -nostdin -v error -y -i "wav/$id.raw.wav" -af "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,aresample=48000" -ac 1 "wav/$id.wav"
  rm "wav/$id.raw.wav"
  printf '%s\t%s\t%s\n' "$id" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "wav/$id.wav")" "$text"
done < /tmp/ideaverse_lines.tsv
