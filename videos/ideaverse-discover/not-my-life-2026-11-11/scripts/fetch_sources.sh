#!/usr/bin/env bash
# Reproducible source retrieval for "Not My Life".
# The trimmed clip is committed in assets/sources/. The 52 MB raw device recording is
# fetched from the user's public Google Drive folder (raw/) and checked by SHA-256.
# Drive folder: https://drive.google.com/drive/folders/19R_Q_KgenFI-xJBa8gEi6DKMMOO35XEF
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p cache/sources

CLIP=assets/sources/01-discover-personalized-gallery.mp4
CLIP_SHA=3f3640166dc41de1008afb43dd15e7f397e45ca42bf4ad930fe11e393435cce2
CLIP_ID=1gtNpVQSGOlcl4guKfKfm56_UXtSiBBWX   # clips/01-discover-personalized-gallery.mp4
RAW=cache/sources/raw-01-discover-personalized-gallery.mp4
RAW_SHA=8f22d25ba9abfbd208ce0fdf1984a19f7bef37b3e29256a26ab46eecd412f9a2
RAW_ID=1XxbbWl8l17OgWZphjQYWOrp_KXzXytcy    # raw/01-discover-personalized-gallery.mp4

fetch() { # id dest
  curl -sSL --retry 4 -o "$2.part" "https://drive.usercontent.google.com/download?id=$1&export=download&confirm=t"
  mv "$2.part" "$2"
}
check() { echo "$2  $1" | sha256sum -c --status || { echo "SHA-256 mismatch for $1" >&2; return 1; }; }

[ -f "$CLIP" ] && check "$CLIP" "$CLIP_SHA" || { echo "fetching clip"; mkdir -p assets/sources; fetch "$CLIP_ID" "$CLIP"; check "$CLIP" "$CLIP_SHA"; }
[ -f "$RAW" ] && check "$RAW" "$RAW_SHA" || { echo "fetching raw recording (52 MB)"; fetch "$RAW_ID" "$RAW"; check "$RAW" "$RAW_SHA"; }
echo "sources OK"
