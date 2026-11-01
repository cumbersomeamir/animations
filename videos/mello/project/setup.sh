#!/usr/bin/env bash
# One-time setup for the Mello video project (Linux/macOS, Python 3.13, ffmpeg on PATH).
# On minimal Linux images skia-python also needs libEGL:  apt-get install -y libegl1
set -euo pipefail
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/pip install -r requirements.lock.txt
# Kokoro-82M v1.0 ONNX model + voices (Apache-2.0), published by the kokoro-onnx project.
mkdir -p .cache/tts
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[[ -f .cache/tts/kokoro-v1.0.onnx ]] || curl -L -o .cache/tts/kokoro-v1.0.onnx "$base/kokoro-v1.0.onnx"
[[ -f .cache/tts/voices-v1.0.bin ]] || curl -L -o .cache/tts/voices-v1.0.bin "$base/voices-v1.0.bin"
sha256sum -c tts.sha256
# Fonts are committed in fonts/ (Nunito, OFL). To regenerate them from the npm registry:
if [[ "${REFETCH_FONTS:-0}" == "1" ]]; then
  tmp=$(mktemp -d); (cd "$tmp" && npm pack @fontsource/nunito@5.2.7 >/dev/null && tar xzf fontsource-nunito-5.2.7.tgz)
  for w in 600 800 900; do
    .venv/bin/python -c "import sys; from fontTools.ttLib import TTFont; f=TTFont(sys.argv[1]); f.flavor=None; f.save(sys.argv[2])" \
      "$tmp/package/files/nunito-latin-$w-normal.woff2" "fonts/Nunito-$w.ttf"
  done
fi
echo "setup ok"
