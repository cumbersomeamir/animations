#!/usr/bin/env bash
# Editable project ZIP: code, docs, manifest, genuine clip, all prepared slots/UI plates/plates/fonts, thumbnail, QA.
# Excluded: node_modules (npm install), cache/ (rebuilt by prepare_assets.py), build/ (renders), final MP4s (delivered separately),
# the 52 MB raw recording (scripts/fetch_sources.sh downloads + verifies it; only needed to rebuild placeholders).
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=not-my-life-2026-11-11
OUTZIP="$PWD/out/not-my-life-project.zip"
rm -f "$OUTZIP"
cd ..
zip -q -r -X "$OUTZIP" "$NAME" \
  -x "$NAME/node_modules/*" "$NAME/cache/*" "$NAME/build/*" "$NAME/out/*.mp4" "$NAME/out/*.zip" "$NAME/*.tmp.mp4"
ls -la "$OUTZIP"; unzip -l "$OUTZIP" | tail -1
