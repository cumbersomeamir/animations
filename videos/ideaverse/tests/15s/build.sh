#!/usr/bin/env bash
# Reproducible build for the Ideaverse 15 s kinetic-reel test.
# Needs: node 22, ffmpeg, preinstalled Playwright + Chromium (require('playwright') resolvable), python3 + Pillow for the sheet.
set -euo pipefail
cd "$(dirname "$0")/src"
npm ci
node render.mjs --frames --workers=3                                   # build/frames/f0000..f0449.png
node music/score.mjs                                                   # build/score.wav (15.000 s, 48 kHz)
ffmpeg -nostdin -v error -y -i ../build/score.wav \
  -af "highpass=f=30,volume=2.6dB,alimiter=limit=0.80:attack=2:release=60:level=disabled" -c:a pcm_s16le ../build/score_master.wav
node render.mjs --encode --audio=../build/score_master.wav --out=../ideaverse-15s-test.mp4
python3 tools/contact_sheet.py ../qa/contact-sheet.png --video ../ideaverse-15s-test.mp4 \
  --frames 0,15,30,45,59,60,75,90,105,119,120,135,150,165,179,180,210,240,270,299,300,330,359,360,390,420,449 --cols 9 --width 200
