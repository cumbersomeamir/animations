# Source — Tensorblue 30s english-15 · episode 01 (was it really saved? write-ahead logs)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (from english-14, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/wal_demo.py` | real crash test with SQLite (Python stdlib `sqlite3`, SQLite 3.53.1): WAL mode, `synchronous=FULL`, automatic checkpoints off. A child process commits two notes, starts a third without committing, and is killed with SIGKILL. It then checks which notes are in the main file vs the `-wal` log, reopens the database, and checkpoints. Writes `demo/out/wal-demo.json`. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s (hook audio at once). Overrides: `[Tensorblue](/tˈɛnsəɹblˌu/)` (accepted CTA), `[SQLite](/ˌɛskjuˌɛlˈIt/)` ("ess-cue-ell-ite"; not in the misaki lexicon). |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | frame zero is a phone glowing "Saved ✓" at 1% in a blacked-out room with "WAS IT REALLY SAVED?". Then a LOG notebook where each save lands as a physical slip, stamped COMMIT once on disk; a MAIN FILE cabinet that is updated later; crash → replay; our SQLite test; a FULL/FAST sync switch. 7 camera shots + one blue wipe into the accepted CTA. Reads the test result and stops if it changes. The thumbnail is frame zero + the wordmark. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail (frame zero) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA (the reference background includes the same uniform blackout tint); mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
python3 demo/wal_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english15-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english15-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english15-01-thumbnail.png
```
