#!/usr/bin/env bash
# Piper TTS (piper-tts 1.8.0 from PyPI), voice en_US-ljspeech-high (rhasspy/piper-voices; LJ Speech = public domain).
# Piper is stochastic: TAKES candidates per line are generated; the committed wav/<id>.wav are the takes that a local
# ASR check (faster-whisper base.en) transcribed correctly. Usage: PIPER=... VOICE=... TAKES=3 ./make_narration.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${PIPER:?}"; : "${VOICE:?}"; TAKES="${TAKES:-1}"; LS="${LENGTH_SCALE:-0.9}"
mkdir -p wav takes
python3 -c "import json;[print(l['id']+'\t'+l['say']) for l in json.load(open('lines.json'))]" > /tmp/iv15_lines.tsv
while IFS=$'\t' read -r id say; do
  for k in $(seq 1 "$TAKES"); do
    echo "$say" | "$PIPER" -m "$VOICE" --length-scale "$LS" --sentence-silence 0 -f "takes/$id.$k.raw.wav" 2>/dev/null
    ffmpeg -nostdin -v error -y -i "takes/$id.$k.raw.wav" -af "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,highpass=f=80,aresample=48000" -ac 1 -c:a pcm_s16le "takes/$id.$k.wav"
    rm "takes/$id.$k.raw.wav"
  done
done < /tmp/iv15_lines.tsv
