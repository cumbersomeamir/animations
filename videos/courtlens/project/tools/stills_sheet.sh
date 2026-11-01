#!/usr/bin/env bash
# Render stills at the given times and tile them: tools/stills_sheet.sh out.png cols t1,t2,...
set -euo pipefail
cd "$(dirname "$0")/.."
out=$1; cols=$2; times=$3
d=$(mktemp -d build/st.XXXX)
node src/render.js stills "$d" "$times" >/dev/null
n=$(ls "$d"/*.png | wc -l); rows=$(( (n + cols - 1) / cols ))
ffmpeg -loglevel error -y -pattern_type glob -i "$d/t*.png" -vf "scale=270:480,tile=${cols}x${rows}:padding=4:color=white" -frames:v 1 "$out"
rm -rf "$d"
echo "$out"
