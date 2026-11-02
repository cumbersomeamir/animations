# Recall — 30 s production 01: "Can you beat this fifth-grade science question?"

**Deliverable:** `recall-30s-production-01.mp4` — 30.000 s, 1080×1920, 30 fps, 900 frames, H.264 High yuv420p +
AAC 48 kHz stereo. Knowledge-challenge format (Microgame Frenzy grammar adapted to Recall's palette): a steel ball
sinks and a steel ship floats in a two-chamber challenge tank; the viewer gets a 2 s guess; the answer shows
displacement (1× vs ≈8× water-level marks), balanced forces, then flooding sinks the ship without the steel
getting any lighter. Post copy: `publishing-caption.txt`.

## Build
```bash
./build.sh            # mix audio -> render 900 frames (3 headless-Chromium workers) -> mux -> QA
TTS=1 ./build.sh      # also regenerate narration + word timings (reuses the cached Kokoro model)
node render.mjs --stills 0,255,600 --outdir build/stills    # inspect frames
./mux.sh              # re-mux after patching a frame range: node render.mjs --pngdir build/frames --from A --to B
```
Requires `npm ci` (three 0.186.1, @fontsource/fredoka 5.3.0, @fontsource/titan-one 5.3.0), preinstalled
Playwright 1.63 + Chromium, Python 3.13 venv (`audio/requirements*.txt`), ffmpeg 6.1.

## Files
| path | what |
|---|---|
| `script.json`, `timeline.json` | final script + voice config; 120 BPM cue grid, commands, captions (word-group splits from ASR) |
| `web/` | `set.js` (challenge tank, sunburst stage), `physics.js` (displacement, flooding), `choreo.js`, `overlay.js` (captions, slams, fuse, stamps, arrows, markers), `main.js`; reused `anim.js`, `clay.js`, `character.js`, `props.js` from pilot 01 |
| `audio/` | `tts.py`, `asr_words.py`, `mix.py`, `narration/*.wav`, `narration/words.json` |
| `qa/` | `QA.md`, `qa_report.json`, `ffprobe.json`, `contact_sheet.png`, `boundaries.png`, `audio_report.json`, `cue_table.json`, `physics.json` |
| `docs/` | `SOURCES.md` (claim map), `LICENSES.md`, `STYLE-ADAPTATION.md` |

Context: `videos/recall/context/11-production-format.md` (durable format), `12-production-30s-01.md` (this round).
