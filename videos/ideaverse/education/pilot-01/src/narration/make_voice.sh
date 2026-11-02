#!/usr/bin/env bash
# DOCKET's voice. Base: Piper TTS (piper-tts 1.8.0, PyPI) with en_US-ljspeech-high (rhasspy/piper-voices, MIT;
# trained on LJ Speech, public domain). Original character treatment: +1.6 semitone pitch with formants preserved
# (rubberband), a 3 ms metallic comb, band-limit 120 Hz-9 kHz, light compression. Piper is stochastic, so TAKES
# candidates are made per line; the committed wav/<id>.wav are takes a local ASR check transcribed correctly.
# Usage: PIPER=/path/piper VOICE=/path/en_US-ljspeech-high.onnx TAKES=3 ./make_voice.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${PIPER:?}"; : "${VOICE:?}"; TAKES="${TAKES:-1}"; LS="${LENGTH_SCALE:-1.0}"
mkdir -p takes
FX="silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,aresample=48000,rubberband=pitch=1.0968:formant=preserved,aecho=1.0:0.55:3:0.32,highpass=f=120,lowpass=f=9000,acompressor=threshold=-18dB:ratio=3:attack=5:release=80"
python3 -c "import json;[print(l['id']+'\t'+l['say']) for l in json.load(open('lines.json'))]" > /tmp/docket_lines.tsv
while IFS=$'\t' read -r id say; do
  for k in $(seq 1 "$TAKES"); do
    echo "$say" | "$PIPER" -m "$VOICE" --length-scale "$LS" --sentence-silence 0.25 -f "takes/$id.$k.raw.wav" 2>/dev/null
    ffmpeg -nostdin -v error -y -i "takes/$id.$k.raw.wav" -af "$FX" -ac 1 -c:a pcm_s16le "takes/$id.$k.wav"
    rm "takes/$id.$k.raw.wav"
  done
done < /tmp/docket_lines.tsv
