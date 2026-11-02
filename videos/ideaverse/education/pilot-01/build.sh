#!/usr/bin/env bash
# Reproducible build: Ideaverse AI Literacy · Pilot 01. Needs node 22, ffmpeg, preinstalled Playwright + Chromium, python3 + Pillow.
set -euo pipefail
cd "$(dirname "$0")/src"
npm ci
node render.mjs --sheet                                              # character/docket-model-sheet.png
node render.mjs --frames --workers=3                                 # build/frames/f0000..f0449.png (pure function of t)
node music/score.mjs                                                 # build/mix.wav (music + SFX + DOCKET voice, 15.000 s)
ffmpeg -nostdin -v error -y -i ../build/mix.wav -af "highpass=f=35,alimiter=limit=0.84:attack=2:release=60:level=disabled" -c:a pcm_s16le ../build/mix_master.wav
node render.mjs --encode --audio=../build/mix_master.wav --out=../ideaverse-education-pilot-01.mp4
cd .. && ./qa.sh
