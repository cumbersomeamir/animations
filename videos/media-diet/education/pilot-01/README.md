# Media Diet · Nodo Explains 01 — What happens when you send a message across the internet

Educational pilot (not an ad). Final file: `media-diet-education-pilot-01.mp4` (15.000 s, 1080×1920, 30 fps, H.264 + AAC).

| path | what |
|---|---|
| `src/` | three.js scene: `film.js` (timeline, choreography, cameras, captions), `nodo.js` (character rig + pose library), `world.js` (phones, routers, server cutaway, packets), `timeline.json` (narration/caption/SFX cues — single source of truth for picture and sound) |
| `character/nodo-model-sheet.png` | turnaround, expressions and action poses rendered from the same rig (`?mode=sheet`) |
| `audio/narration/*.wav` | committed Piper narration takes (build inputs) |
| `build/build.sh` | full reproducible build (deps → audio → loudnorm → 450 frames → encode → QA) |
| `build/qa.sh` | ffprobe checks, full decode, loudness, contact sheets from the encoded MP4, ASR check |
| `qa/`, `QA.md` | verification evidence |
| `SOURCES.md`, `LICENSES.md` | dated sources + claim map; licenses/provenance |
| storyboard | `../../context/09-educational-pilot-01.md` |

Build: `bash build/build.sh` (≈6–9 min on 4 CPU cores, SwiftShader WebGL, no GPU).
Model sheet only: `node build/render.mjs sheet character/nodo-model-sheet.png`.
Spot frames: `node build/render.mjs stills <dir> 1.0,5.5,13.6`.
