#!/usr/bin/env bash
# Hindi narration needs: the cached Kokoro-82M v1.0 ONNX model (education/pilot-01/audio/.cache/kokoro/model.onnx,
# fetched by that folder's fetch_models.sh) + Kokoro v1.0's official Hindi voice packs (Apache-2.0, onnx-community).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .cache/kokoro-hi && cd .cache/kokoro-hi
B=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
VOICES="hf_alpha hf_beta hm_omega hm_psi"
for v in $VOICES; do [ -f $v.bin ] || curl -sSL --fail -o $v.bin "$B/voices/$v.bin"; done
sha256sum -c <<'SUMS'
040be6a4425411cc01fda5fd06693c76bfa78572632852bc8cda9c99232ffb56  hf_alpha.bin
cd83ae0bb9b2e4e4fb92b4973bd8d1822ca0036d3c498bf4fc89aa8e33917cc7  hf_beta.bin
b02d9222d9ed00ce26b302173a862c2c93f96cc40b5c422b8d14910b9ff34137  hm_omega.bin
644daf88ba8aeb7bd08950bbdcd4453bb280864e49dc4df93fabc6be32e03f37  hm_psi.bin
SUMS
python3 -c "
import numpy as np
names='$VOICES'.split()
np.savez('voices_hi.npz',**{n:np.fromfile(n+'.bin',dtype=np.float32).reshape(-1,1,256) for n in names})"
sha256sum ../../../../../../education/pilot-01/audio/.cache/kokoro/model.onnx | grep -q 8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb && echo "model.onnx ok"
