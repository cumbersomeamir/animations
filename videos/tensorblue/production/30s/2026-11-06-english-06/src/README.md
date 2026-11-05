# Source — Tensorblue 30s english-06 · episode 01 (why a torn QR code still scans)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/make_qr_demo.py` | encodes `https://example.com/menu` at levels L and H (segno), applies the tears, decodes every state with zbar and OpenCV at 6/10/16 px per module; writes `demo/out/qr.json` + the tested PNGs |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged): palette, Inter/Inter Display, kinetic words, pills, logo |
| `scene.mjs` | seven staged scenes + blue wipes (torn menu QR still scans, recovery bytes, rebuild, L vs H, corner-square limit, takeaway, CTA); draws the codes from `qr.json` and stops if a demo result changes |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score (7 chords), loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
python3.12 -m venv qrvenv && qrvenv/bin/pip install -r demo/requirements-demo.txt && sudo apt install zbar-tools
qrvenv/bin/python demo/make_qr_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english06-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english06-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
The frame-level decode check (`../qa/frame-decode.json`) runs zbar and OpenCV on crops of the final MP4's own frames.
