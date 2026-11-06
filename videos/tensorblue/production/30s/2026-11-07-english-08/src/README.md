# Source — Tensorblue 30s english-08 · episode 01 (why a deleted photo is still there)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/sync_demo.py` | a fictional sync system made of real folders (phone, cloud, laptop, cloud trash, Monday backup) moved with rsync: device-only removal, synced delete with a trash copy, empty trash, remove the old backup; writes `demo/out/sync-demo.json` |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged): palette, Inter/Inter Display, kinetic words, pills, iso boxes, logo |
| `scene.mjs` | seven staged scenes + blue wipes (deleted here / still there, device-only delete, synced delete, trash for 30 days, older backup, permanent-removal checklist, CTA); reads `sync-demo.json` and stops if a result changes |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
sudo apt install rsync && python3.12 demo/sync_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english08-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english08-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
