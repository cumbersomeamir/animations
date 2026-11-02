# Recall — Educational Pilot 01: Why a steel ship floats but a small steel ball sinks

**Deliverable:** `recall-education-pilot-01.mp4` (15.000 s, 1080×1920, 30 fps, H.264 High + AAC 48 kHz stereo).
An educational short, not an app ad: Kip the clay explorer drops a steel ball (it sinks), rewinds and pauses it to
show how little water it pushes aside, reshapes the same steel into a hollow hull that floats, and ends on the
takeaway "Steel + air is, on average, less dense than water." Small Recall signature at the end only.

## Build
```bash
./build.sh                 # mix audio -> render 450 frames (3 headless-Chromium workers) -> mux -> QA
TTS=1 ./build.sh           # also regenerate narration (Kokoro model fetched by audio/fetch_models.sh)
node render.mjs --stills 0,150,300 --outdir build/stills     # inspect single frames
node render.mjs --sheet build/sheet && audio/.venv/bin/python docs/make_sheet.py   # model sheet
```
Dependencies: `npm ci` (three 0.186.1, @fontsource/fredoka 5.3.0), preinstalled Playwright 1.63 + Chromium,
Python 3.13 venv from `audio/requirements.txt` (+ `audio/requirements-qa.txt` for ASR), ffmpeg 6.1.

## Layout
| path | what |
|---|---|
| `script.json` | narration lines, voice blend, speed |
| `timeline.json` | narration starts, action cues, captions (shared by video and audio) |
| `web/` | Three.js scene: `set.js` (tabletop, tank, water, toy ship), `character.js` (Kip rig), `props.js` (ball↔hull morph, ghosts, splashes), `physics.js` (displacement model), `choreo.js` (time → pose/camera), `overlay.js` (captions, arrows, gauge, signature), `main.js` |
| `render.mjs` | local static server + Playwright frame capture |
| `audio/` | `tts.py` (Kokoro narration), `mix.py` (original music, SFX, ducking, BS.1770 loudness, lip-sync envelope), `narration/*.wav` |
| `qa/` | `qa.py`, `QA.md`, `qa_report.json`, `ffprobe.json`, `contact_sheet.png`, `boundaries.png` |
| `docs/` | `SOURCES.md` (sources + claim map), `LICENSES.md`, `CHARACTER.md`, `kip-model-sheet.png` |

Storyboard and brief: `videos/recall/context/09-educational-pilot-01.md`. Progress: `context/10-educational-progress.md`.
