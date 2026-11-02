#!/usr/bin/env bash
# Reproducible build. Needs node 22, ffmpeg, python3 (+Pillow, numpy for QA).
# Narration (optional re-synthesis): PY=/path/venv/bin/python (kokoro-onnx==0.6.1) KOKORO_DIR=dir with onnx/model.onnx,
# voices/af_bella.bin, voices/am_puck.bin from onnx-community/Kokoro-82M-v1.0-ONNX@1939ad2a8e416c0acfeecc08a694d14ef25f2231.
set -euo pipefail
cd "$(dirname "$0")/src"
npm ci
if [ -n "${PY:-}" ] && [ -n "${KOKORO_DIR:-}" ]; then
  "$PY" -I narration/make_voice.py "$KOKORO_DIR"
  for i in 1 2 3 4 5 6; do ffmpeg -nostdin -v error -y -i narration/wav/s$i.24k.wav -af "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.08,areverse,aresample=48000:resampler=soxr" -ac 1 -c:a pcm_s16le narration/wav/s$i.wav; done
fi
node render.mjs --video=../build/video.mp4
node score.mjs
cd ../build
M=$(ffmpeg -nostdin -hide_banner -i mix.wav -af "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
II=$(echo "$M" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -nostdin -v error -y -i mix.wav -af "loudnorm=I=-15:TP=-1.5:LRA=11:$II:linear=true,aresample=48000" -ar 48000 -c:a pcm_s16le mix_master.wav
cd ..
ffmpeg -nostdin -v error -y -i build/video.mp4 -i build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart ideaverse-30s-production-01.mp4
./qa.sh
