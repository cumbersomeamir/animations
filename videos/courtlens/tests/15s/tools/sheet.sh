#!/usr/bin/env bash
# tools/sheet.sh out.png cols t1,t2,...  — freeze the master timeline at each t and tile the shots
set -euo pipefail
cd "$(dirname "$0")/.."
d=$(mktemp -d build/st.XXXX)
node tools/capture.js stills "$d" "$3" >/dev/null
n=$(ls "$d"/*.png | wc -l); rows=$(( (n + $2 - 1) / $2 ))
ffmpeg -loglevel error -y -pattern_type glob -i "$d/t*.png" -vf "scale=270:480,tile=${2}x${rows}:padding=4:color=white" -frames:v 1 "$1"
rm -rf "$d"; echo "$1"
