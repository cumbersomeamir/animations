# Source — Tensorblue 30s english-14 · episode 01 (how a feed scrolls 10,000 posts with 14 rows)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (from english-13, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/list_demo.mjs` | real test in the pre-installed Chromium (Playwright, `channel: 'chromium'`). A 390×844 page shows 10,000 posts as a plain list (one DOM row each) and as our own minimal recycling list (rows to fill the viewport + 1 spare each side, re-filled as they leave). It scrolls the whole feed and counts rows. Writes `demo/out/list-demo.json`. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | a phone with a 12-row feed. Each row that leaves the top flies round the side, spins and comes back in at the bottom with its next post — 14 cards in all, from the test. A 10,000-row tower stands for the plain list. 7 camera shots + one blue wipe into the accepted CTA. Reads the test result and stops if it changes; also draws the thumbnail. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
node demo/list_demo.mjs demo/out          # needs Playwright + Chromium (pre-installed in this environment)
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english14-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english14-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english14-01-thumbnail.png
```
