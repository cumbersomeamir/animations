# Aarambh — Educational Pilot 01: How a sewing machine forms a stitch

**Final video:** `aarambh-education-pilot-01.mp4`
- 15.000 s, 1080x1920, 30 fps (450 frames)
- H.264 High yuv420p video, AAC 48 kHz stereo audio

One lesson: a lockstitch forms when a hook carries the needle-thread loop around the bobbin, then the
take-up pulls it tight, so the two threads lock inside the cloth. Performer: **Bindu** (original recurring character).

## Layout
```
src/timeline.json          single source of truth for timing (render + audio)
src/render.mjs             frame renderer + choreography -> ffmpeg (also --stills mode)
src/character-sheet.mjs    character/bindu-model-sheet.png
src/lib/bindu.mjs          reusable Bindu rig (IK limbs, expressions, lip-sync input, props)
src/lib/workshop.mjs       painted workshop + oversized machine + swatch prop
src/lib/mechanism.mjs      simplified lockstitch cutaway (needle, loop, hook, bobbin, take-up, lock)
src/lib/ui.mjs             kicker/signature, captions, labels, banner
src/lib/paint.mjs, core.mjs  palette, painted textures, threads, easing, IK
audio/script.json, tts.py  narration text + optional Piper TTS regeneration
audio/narration/raw/*.wav  committed TTS takes; audio/narration/*.wav processed Bindu voice
audio/build_audio.py       voice chain, original music + SFX, ducked mix, lip-sync envelope
audio/stems/*.wav          voice / music / sfx stems
character/                 model sheet
qa/                        ffprobe, decode log, loudness, contact sheets, waveform, ASR report
tools/qa.sh, asr_check.py  QA scripts
build.sh                   full reproducible build
```

## Build
```bash
cd videos/aarambh/education/pilot-01
python3 -m venv .venv && .venv/bin/pip install numpy==2.5.4 scipy==1.16.3
PYTHON=.venv/bin/python ./build.sh
```
Needs Node 22 and FFmpeg 6 with libx264 and librubberband. The render takes about 60 s on a cloud container CPU.
Optional TTS regeneration: `pip install piper-tts==1.8.0`, download `en_US-ljspeech-medium.onnx`, then
`python audio/tts.py --model <path> [--only L4]`. Piper is stochastic, so each take is checked with `tools/asr_check.py`.

See `SOURCES.md` (facts and claim mapping), `LICENSES.md`, `QA.md`, `../../context/09-educational-pilot-01.md` (storyboard)
and `../../context/10-educational-progress.md` (status).
