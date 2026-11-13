# Source — Tensorblue 30s english-13 · episode 01 (how undo brings a mistake back)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (from english-12, with a bottom face added so tiles can flip). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/undo_demo.mjs` | our minimal undo model, built on the documented design (Apple UndoManager: register how to revert, undo the last, a level limit; Office's default of 100). It moves Invoice To do → Done, navigates away, undoes, then runs 101 changes with a cap of 100 and a 5 s send window. Writes `demo/out/undo-demo.json`. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98; overrides `[Tensorblue](/tˈɛnsəɹblˌu/)` (accepted CTA) and `[Gmail's](/ʤˈimˌAlz/)` (not in the misaki lexicon) |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | the "time-machine" bench: a phone with a generic Tasks board, the HISTORY machine where each change lands as a physical entry tile, an OUT door; 7 camera shots + one blue wipe into the accepted CTA; reads the demo result and stops if it changes; also draws the thumbnail |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
node demo/undo_demo.mjs demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english13-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english13-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english13-01-thumbnail.png
```
