#!/usr/bin/env bash
# Downloads the local TTS model (Kokoro-82M v1.0 ONNX, Apache-2.0) from HuggingFace
# and verifies SHA-256. Files are cached in project/.cache (not committed).
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
mkdir -p .cache/kokoro
fetch() { # url dest sha
  if [ ! -f "$2" ] || ! echo "$3  $2" | sha256sum -c --quiet - 2>/dev/null; then
    curl -sSL --retry 4 -o "$2" "$1"
  fi
  echo "$3  $2" | sha256sum -c -
}
fetch $BASE/onnx/model.onnx .cache/kokoro/model.onnx 8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb
fetch $BASE/voices/af_heart.bin .cache/kokoro/af_heart.bin d583ccff3cdca2f7fae535cb998ac07e9fcb90f09737b9a41fa2734ec44a8f0b
