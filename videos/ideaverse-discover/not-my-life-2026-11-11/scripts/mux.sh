#!/usr/bin/env bash
# 1) one delivery encode of the CRF-16 master (build/video.mp4) -> build/video_delivery.mp4 (H.264 High@4.1, yuv420p, BT.709)
# 2) add each audio mix with the video stream copied (both deliverables share bit-identical picture)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out
V=build/video.mp4
[ -f "$V" ] || { echo "missing $V (run: node scripts/render.mjs)"; exit 1; }
ffmpeg -v error -y -i "$V" -an -c:v libx264 -preset slow -crf "${CRF:-20}" -maxrate 16M -bufsize 32M -profile:v high -level:v 4.1 \
  -pix_fmt yuv420p -x264-params keyint=60:min-keyint=1:aq-mode=3 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -movflags +faststart build/video_delivery.tmp.mp4
mv build/video_delivery.tmp.mp4 build/video_delivery.mp4
mux() { # wav out
  ffmpeg -v error -y -i build/video_delivery.mp4 -i "$1" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -ar 48000 -ac 2 \
    -t 25 -metadata title="Ideaverse Discover - Not My Life" -metadata comment="No voiceover. Original synthesized score/SFX." \
    -movflags +faststart "${2%.mp4}.tmp.mp4"
  mv "${2%.mp4}.tmp.mp4" "$2"
}
mux build/audio/mix_full.wav out/not-my-life-25s.mp4
mux build/audio/mix_nomusic.wav out/not-my-life-25s-no-music.mp4
ls -la out/*.mp4
