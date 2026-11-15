#!/usr/bin/env bash
# Render frames in 60-frame chunks; a chunk with its own bounds log is done and skipped (resumable after restarts).
cd "$(dirname "$0")/.."
TOTAL=$(python3 -c "import json;T=json.load(open('src/timeline.json'));print(round(T['duration']*T['fps']))")
for s in "$@"; do e=$((s+59)); [ $e -gt $((TOTAL-1)) ] && e=$((TOTAL-1)); tag=$(printf "_bounds_%04d_%04d_" $s $e)
  if ls frames/${tag}* >/dev/null 2>&1; then echo "chunk $s-$e done"; continue; fi
  node build/render.mjs film frames $s $e || exit 1
done
