# Source — Tensorblue 30s english-16 · episode 01 (how a maps app reroutes before the jam)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (from english-15, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/route_demo.py` | real shortest-time routing test (Python stdlib `heapq`, Dijkstra). A made-up miniature city graph (intersections = nodes, street segments = edges costing minutes). It routes from the car before and after a live-traffic update raises one avenue segment from 2 to 7 minutes, and records both routes, their times and the order the search settled intersections. Writes `demo/out/route-demo.json`. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s (hook audio at once), `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | the miniature 3D city. Frame zero shows "YOUR ROUTE JUST CHANGED." with the red jam, the old blue route and the new cyan detour. Then: streets → graph with minute costs; the jam raises one cost 2 → 7; the search lights intersections in the real order; old 14 vs detour 10; live + predicted; the car drives the detour. 7 camera shots + one blue wipe into the accepted CTA. Reads the test result and stops if it changes. The thumbnail is frame zero + the wordmark. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail (frame zero) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

Colours: the Tensorblue palette plus three Tailwind tokens that tensorblue.com's own stylesheet defines and uses (read 2026-11-15): red-500 `#FB2C36` (jam), cyan-400 `#00D3F2` (new route), green-400 `#05DF72` ("DETOUR: 10 MIN").

## Rebuild
```bash
npm ci
python3 demo/route_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english16-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english16-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english16-01-thumbnail.png
```
