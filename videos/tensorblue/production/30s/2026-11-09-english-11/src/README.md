# Source — Tensorblue 30s english-11 · episode 01 (why a sent photo can lose tiny writing)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/photo_demo.py` | real image test (Pillow + Tesseract): a fictional ticket photo (3024 × 4032, JPEG q95), a lossy re-save (1280 px, JPEG q60 — our settings), the original copied as-is (same SHA-256), enlarged crops with the same filter, OCR on both; writes `demo/out/` |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `scene.mjs` | seven staged scenes + blue wipes (same photo / one unreadable, the shrink, lossy, the help-page quote + HD, result with OCR, takeaway, CTA); draws the real demo images and stops if a result changes |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
python3.12 -m venv demovenv && demovenv/bin/pip install pillow==13.0.0 && sudo apt install tesseract-ocr fonts-dejavu-core
demovenv/bin/python demo/photo_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english11-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english11-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
