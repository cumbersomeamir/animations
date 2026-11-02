# Help — 10 s style test (batch 2026-11-02-pre-reset) — S03 Shadow Puppetry

**Output:** `help-10s-test.mp4` — 10.000 s · 1080×1920 · H.264 High · 30 fps (300 frames; puppets step at 15 fps, each source frame shown twice) · AAC-LC 48 kHz stereo.
SHA-256 `6cd2db7e489e7f40373334335036d5044a9d543fd5d0d938edf24eded1c6bc1d`.

**Lesson (illustrative, practical guidance):** a donor offers a coat → it's too small → asks the size ("?" plaque; neighbour shows "L") → offers one that fits (✓).
Narration: "Donating a coat? Ask the size first. Useful help starts with what the person actually needs." (candidate used verbatim; 5.0 s of speech, no speed-up).
No real recipient, testimonial, statistic or impact claim; "Illustrative scene" label; tiny app signature (icon + "Help") from 8.5 s. No new factual claims requiring citation.

**Art direction:** read `lemomo-ai/lemo-opuscar/styles/shadow-puppet/STYLE.md` (art direction only; nothing cloned/installed/executed).
Adopted: warm cream cloth with procedural weave, two independently flickering lamps, translucent dyed pieces with dark carved outlines,
carved holes, rivets at joints, visible thin rods to the bottom edge, two-bone IK arms, larger heads, fuller lower bodies, open-cut faces,
held objects as separate pieces, nothing morphs (pieces slide/rotate/swap), static cloth & frame, warm brown vignette, percussion accents.
Adapted per the user's brief: app icon palette (green `#2DB37D`, yellow `#F2C230`, cream, ink) instead of the style's dye set; app font Inter
(from `education/pilot-01/fonts`) instead of a serif; captions upper-centre on the dark surround instead of a placard.

**Voice:** local Kokoro-82M ONNX via `kokoro-onnx==0.6.1` (PyPI) with `kokoro-v1.0.onnx` + `voices-v1.0.bin` from the
kokoro-onnx GitHub release `model-files-v1.0` (downloaded this session; not committed). Meshline blend `af_bella*0.7 + am_puck*0.3`,
speed 0.98, `en-us`. One take per phrase (`audio/voice/`, committed).

**Build:** `python3 -m venv --system-site-packages .venv && .venv/bin/pip install kokoro-onnx==0.6.1` → download the two model files into `models/` →
`.venv/bin/python audio/voice_kokoro.py` → `python3 audio/mix10.py` → `node render.mjs` (≈76 s) →
`ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 10 -movflags +faststart help-10s-test.mp4`

## QA (on the final MP4)
- ffprobe: container 10.000000 s; video h264 High 1080×1920 yuv420p 30/1, 300 frames, 10.000000 s; audio aac LC 48 kHz 2 ch 10.000000 s (`qa/ffprobe.json`).
- Full decode `ffmpeg -v error -i help-10s-test.mp4 -f null -`: exit 0, 0 error bytes; 300 frames counted (`qa/full-decode.log`).
- Loudness −16.3 LUFS integrated, −1.9 dBTP (`qa/loudness.txt`).
- Frames + caption handoffs: `qa/frames.png` (f55 and f116 are caption-free gaps → no overlapping handoffs).
- Caption ink bounds measured: 1-line x 265–810, y 354–415; 2-line x 101–980, y 354–492 (x margins ≥ 101).
- One ASR pass (Vosk small-en, QA only): "donating a coat asked the size first useful help starts with what the person actually needs" — 14/15 words; "Ask the" heard as "asked the".

## Honest limits
- Two-line caption bottom sits at y≈492, slightly below the requested ~460 (1-line captions are within 354–415).
- Faces are minimal open-cut heads; carving density lighter than the style's "denser openwork" (time-boxed). Puppet arms are simple and the coat "fit" is an overlay, not dressed.
- I did not listen to the audio; evidence is ASR + loudness only.
