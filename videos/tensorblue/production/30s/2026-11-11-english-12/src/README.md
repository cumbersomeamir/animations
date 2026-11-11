# Source — Tensorblue 30s english-12 · episode 01 (why an app can keep working offline)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus this round's own small 3D stage (`stage3d.mjs`). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/sync_demo.mjs` | real sync test with Automerge 3.5.0 (MIT): one shopping list copied to Phone A, Phone B and a server; both phones edit offline, then sync through the server; writes `demo/out/sync-demo.json` (offline lists, queued-change counts, merged lists, same-item conflict result) |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage: perspective camera, lit box faces, textured faces, soft contact shadows, cable tubes, floor with a spotlight pool (no external 3D library) |
| `scene.mjs` | the miniature workbench (two phones, a server, cables, a local-copy drawer, a queue tray, change cards, a RULE stamp), 8 camera shots + one blue wipe into the accepted CTA; reads the real demo result and stops if it changes; also draws the thumbnail |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
node demo/sync_demo.mjs demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english12-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english12-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english12-01-thumbnail.png
```
