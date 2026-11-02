# WastePaisa 10 s style test: S11 paper-cut motion (batch 2026-11-02-pre-reset)
One continuous scrap-shop scene in 3 beats: Tinku taps a torn paper cup ("This cup looks like paper.") → pulls its paper and
plastic layers apart and pins them to a sorting board ("Many have a plastic lining.") → points as "CHECK LOCALLY" is stamped
on the counter ("Check whether your local recycler accepts them."). Art direction: the public paper-cut-motion SKILL.md was read
only (12 fps stepped cadence, one light, pins/stamps/wire connectors, print labels); none of its code was used.

Build (from this folder; uses pilot-01's node_modules, rig and fonts, plus preinstalled Playwright/FFmpeg):
```bash
node src/make_sprites.js                      # 5 Tinku pose sprites from education/pilot-01/src/rig/tinku.js (transparent PNG + hand coords)
<venv-python> -I audio/tts_kokoro.py kokoro-v1.0.onnx voices-v1.0.bin   # kokoro-onnx 0.6.1; approved takes committed in audio/narration
python3 audio/mix10.py                        # original music + contact SFX + narration -> audio/mix.wav (480000 samples)
node src/render.js video video-only.mp4       # 120 stepped frames -> 300 frames @ 30 fps, x264 veryfast
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 10 -movflags +faststart wastepaisa-10s-test.mp4
```
Claims reuse `education/pilot-01/sources.md` (S1–S3: many paper cups have a plastic lining; S2/S4: acceptance depends on local facilities).
On-screen note: "Illustration · many cups, not all · acceptance varies by area". No payout, allowance or app claims; small signature only.
Licenses: code, sprites, music and SFX are original. Kokoro-82M is Apache-2.0 (hexgrad); kokoro-onnx is MIT. Baloo 2 is OFL. App icon from the approved assets.
