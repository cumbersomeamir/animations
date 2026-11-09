#!/usr/bin/env bash
# Reproducible build: Media Diet · 30 s English episode (english-09) · "Log in to your own Spotify on United seatback screens with a QR code (Spotify, 5 Nov 2026)"
# Output: media-diet-30s-english09-01.mp4 (30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p, AAC 48 kHz stereo)
# Needs: Node 22 + npm, Python 3.13, FFmpeg 6.1 (libx264, aac, soxr), pre-installed Playwright Chromium. No GPU/paid API/secrets.
# Env: REGEN_VOICE=1 re-synthesises narration with Kokoro (needs .cache/models, see context/11-production-format.md)
#      SKIP_FRAMES=1 reuses frames/
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=media-diet-30s-english09-01.mp4
VENV=.cache/venv
echo "== 1/6 dependencies"
[ -e node_modules/three ] || { echo "node_modules: link three (education/pilot-01) and @fontsource fonts (production/30s/2026-11-02) or run npm ci"; npm ci --no-audit --no-fund; }
[ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
"$VENV/bin/pip" install -q -r build/requirements.txt
echo "== 2/6 narration (Kokoro-82M v1.0, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us)"
if [ "${REGEN_VOICE:-0}" = "1" ]; then
  mkdir -p .cache/models
  [ -f .cache/models/kokoro-v1.0.onnx ] || curl -sSL -o .cache/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  [ -f .cache/models/voices-v1.0.bin ] || curl -sSL -o .cache/models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  (cd .cache/models && printf '%s\n' "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5  kokoro-v1.0.onnx" "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d  voices-v1.0.bin" | sha256sum -c -)
  "$VENV/bin/python" build/voice.py src/timeline.json audio/narration
  cp audio/narration/lines.json src/data/lines.json
fi
"$VENV/bin/python" build/cues.py > /dev/null
echo "== 3/6 score, foley, mix, loudness (target -15 LUFS, true peak ceiling -2.0 dBTP pre-encode)"
"$VENV/bin/python" build/audio.py
J=$(ffmpeg -hide_banner -nostats -i audio/mix_prenorm.wav -af loudnorm=I=-15:TP=-2.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
v(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -v error -y -i audio/mix_prenorm.wav \
  -af "loudnorm=I=-15:TP=-2.0:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=48000,atrim=end_sample=1440000,apad=whole_len=1440000" \
  -ar 48000 -ac 2 -c:a pcm_s16le audio/mix.wav
echo "== 4/6 frames (three.js paper diorama, SwiftShader WebGL, 900 frames)"
if [ "${SKIP_FRAMES:-0}" != "1" ]; then rm -rf frames; node build/render.mjs film frames 0 449 & node build/render.mjs film frames 450 899; wait; fi
python3 build/merge_bounds.py
test "$(ls frames/*.png | wc -l)" -eq 900
echo "== 5/6 encode"
ffmpeg -hide_banner -v error -y -framerate 30 -i frames/f%04d.png -i audio/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level:v 4.2 -pix_fmt yuv420p -r 30 -g 30 \
  -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30.000 -movflags +faststart \
  -metadata title="Media Diet · Your own Spotify on a United seatback screen" -metadata language=eng -metadata:s:a:0 language=eng "$OUT"
echo "== 6/6 QA"
bash build/qa.sh
echo "done: $(pwd)/$OUT"
