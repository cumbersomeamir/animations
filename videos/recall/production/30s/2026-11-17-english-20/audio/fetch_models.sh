#!/usr/bin/env bash
# Fetch Kokoro-82M v1.0 ONNX (Apache-2.0, onnx-community on Hugging Face) into .cache/kokoro and build voices.npz.
# Only needed to regenerate narration; committed WAVs in narration/ are used otherwise.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .cache/kokoro && cd .cache/kokoro
B=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
[ -f model.onnx ] || curl -sSL -o model.onnx "$B/onnx/model.onnx"
VOICES="af_heart af_bella bf_emma am_puck"
for v in $VOICES; do [ -f $v.bin ] || curl -sSL -o $v.bin "$B/voices/$v.bin"; done
sha256sum -c <<'SUMS'
8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb  model.onnx
d583ccff3cdca2f7fae535cb998ac07e9fcb90f09737b9a41fa2734ec44a8f0b  af_heart.bin
SUMS
../../.venv/bin/python -c "
import numpy as np
names='$VOICES'.split()
np.savez('voices.npz',**{n:np.fromfile(n+'.bin',dtype=np.float32).reshape(-1,1,256) for n in names})"
