# Source — Tensorblue 30s english-17 · episode 01 (two hands, one file: how Figma orders edits)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/multiplayer_demo.py` | our event simulation of the multiplayer rules Figma's co-founder described (2019): instant local edits, one server applying edits in arrival order, the latest value per property, different properties not conflicting, and discarding server changes that conflict with unacknowledged local edits. Two clients (illustrative latencies) edit one shape at once. It records the server's order, every client's log, the final copies and a flicker count with and without the discard rule. Writes `demo/out/multiplayer-demo.json`. Not Figma's code. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s (hook audio at once), overrides `[Figma](/fˈɪɡmə/)`, `[Figma's](/fˈɪɡməz/)`, `[Tensorblue](/tˈɛnsəɹblˌu/)` |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | the shared 3D canvas. Frame zero shows "TWO HANDS. ONE FILE." with one blue shape tugged both ways by Ana's and Ben's cursors. Then: a server pops up; Ana's own copy moves instantly; edit cards dock in the server in arrival order (1, 2); the last value for the same property wins everywhere; a move and a recolour both survive; "not a true CRDT", "ONE SERVER, ONE ORDER." 7 camera shots + one blue wipe into the accepted CTA. Reads the model's result and stops if it changes. The thumbnail is frame zero + the wordmark. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail (frame zero) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

Colours: the Tensorblue palette plus tensorblue.com's own Tailwind tokens (read 2026-11-15): cyan-400 `#00D3F2` (Ana), green-400 `#05DF72` (Ben), amber-400 `#FFB900` (the new colour).

## Rebuild
```bash
npm ci
python3 demo/multiplayer_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english17-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english17-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english17-01-thumbnail.png
```
