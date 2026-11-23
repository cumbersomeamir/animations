#!/bin/bash
# Master + mux (run from this source folder after `python audio/mix.py` and `node render.mjs`).
# Two-pass FFmpeg loudnorm to -15 LUFS integrated, true peak -1.5 dBTP (linear), AAC 192k 48 kHz, cut to exactly 30 s.
set -e
OUT=${1:-../nutriai-30s-english24-01.mp4}
J=$(ffmpeg -hide_banner -i build/mix.wav -af loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i build/mix.wav -af "loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -ar 48000 build/mix-norm.wav
ffmpeg -v error -y -i build/video-noaudio.mp4 -i build/mix-norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart "$OUT"
echo "muxed $OUT"
