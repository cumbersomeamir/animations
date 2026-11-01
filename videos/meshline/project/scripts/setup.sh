#!/usr/bin/env bash
# One-time setup: pinned npm deps, python venv for audio, Kokoro-82M (Apache-2.0) model for local TTS.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-fund --no-audit
python3 -m venv .cache/venv
.cache/venv/bin/pip install -r audio/requirements.txt
mkdir -p .cache/kokoro
B=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
[ -f .cache/kokoro/model.onnx ] || curl -sSL -o .cache/kokoro/model.onnx $B/onnx/model.onnx
[ -f .cache/kokoro/af_heart.bin ] || curl -sSL -o .cache/kokoro/af_heart.bin $B/voices/af_heart.bin
echo "8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb  .cache/kokoro/model.onnx" | sha256sum -c -
echo "setup done. Build with: PY=.cache/venv/bin/python scripts/build.sh"
