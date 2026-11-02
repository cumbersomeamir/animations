# Help — Education Pilot 01: What delivery video evidence proves (and what it doesn't)

**Final video:** [`help-education-pilot-01.mp4`](help-education-pilot-01.mp4) — 15.000 s · 1080×1920 · H.264 High · 30 fps · AAC 48 kHz stereo.
Brief/storyboard: `../../context/09-educational-pilot-01.md` · Strategy: `../../context/08-educational-strategy.md` ·
Progress/provenance: `../../context/10-educational-progress.md` · QA: [`QA.md`](QA.md) · Sources: [`SOURCES.md`](SOURCES.md) ·
Licenses: [`LICENSES.md`](LICENSES.md) · Character: [`character/TALLY.md`](character/TALLY.md)

## Layout
```
src/index.html, main.js     film: deterministic three.js scene + overlay + captions (window.__renderFrame(f))
src/rig/figure.js           reusable character rig (Tally + extras)
src/world.js                diorama + props (clip frame, date tag, pin, "?", story panels)
src/timeline.json           shot/line/cue times shared by picture AND sound
src/script.json             narration + captions
src/generated/              lipsync.json + lines.json (written by audio/mix.py)
src/sheet.html, sheet.js    character model sheet (same rig)
audio/voice.py              Piper narration takes -> audio/generated/voice (committed takes)
audio/mix.py                voice processing, original music + SFX, ducking, loudness, lip-sync
tools/render.mjs            headless Chromium frame capture -> ffmpeg (no frame files on disk)
tools/contact_sheet.py      QA contact sheets from the encoded MP4
qa/                         ffprobe.json, full-decode.log, audio-report.txt (loudness + ASR), text-bounds.json, contact sheets
```

## Build
Requirements: Node 22, Python 3 + numpy, FFmpeg (libx264, aac, rubberband), Playwright with Chromium (pre-installed here).
```bash
./build.sh            # uses committed voice takes; ~20 min on 4 vCPU (SwiftShader software WebGL, ~2.9 s/frame)
REVOICE=1 ./build.sh  # also re-synthesizes narration with Piper (downloads the 63.5 MB public-domain voice)
```
