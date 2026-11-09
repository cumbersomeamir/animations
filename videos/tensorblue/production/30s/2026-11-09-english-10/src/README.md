# Source — Tensorblue 30s english-10 · episode 01 (a private window is not invisibility)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/private_demo.mjs` | real Chromium run (Playwright 1.63, full Chromium build, new headless) on 127.0.0.1: a logging "website" for `shop.example`, a logging proxy as "your network", a normal window (`/shoes`) and a private off-the-record context (`/gift`); afterwards reads the profile's own History and Cookies files; writes `demo/out/private-demo.json` |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `scene.mjs` | eight staged scenes + blue wipes (who still sees, while open, after closing, what stays, website log, network log, takeaway, CTA); reads `private-demo.json` and stops if a result changes |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
node demo/private_demo.mjs demo/out        # needs Playwright + its Chromium build (channel 'chromium')
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english10-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english10-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
