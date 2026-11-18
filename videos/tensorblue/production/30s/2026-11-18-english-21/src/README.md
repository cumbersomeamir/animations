# Source — Tensorblue 30s english-21 · episode 01 (why stuck? a progress bar races to 99% and then waits)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the 3D stage `stage3d.mjs` (unchanged) + `toy3d.mjs` (from english-20, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/stages_demo.py` | real four-stage update on this machine (Python stdlib): download a 37.7 MB zip over HTTP from a local server capped at 100 Mb/s, SHA-256 verify, unzip 2,401 files, install each with fsync. Two bars watch it: bytes-only and staged (shares from a calibration run). Writes `demo/out/stages-demo.json`. Not any app's installer. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s, overrides `[Microsoft's](/mˈIkɹəsˌɔfts/)` and `[Tensorblue](/tˈɛnsəɹblˌu/)` |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs`, `stage3d.mjs`, `toy3d.mjs` | accepted kit, 3D stage and toy module (unchanged) |
| `scene.mjs` | the parcel pipeline (DOWNLOAD hopper → VERIFY gate → UNPACK → INSTALL into a phone) under a scoreboard progress bar; the test bench replaying the measured run; the quote card; the staged-bar payoff; captions, CTA, SFX list, thumbnail |
| `thumb.mjs` | the separate 1080×1920 thumbnail (frame zero + wordmark) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `transitions.mjs` | QA sheet: frame 0 + frames around every shot change, decoded from the exported MP4 |
| `asr.py` | one faster-whisper `base.en` pass over the narration span |
| `proj-check.mjs` | dev helper: projected positions of key points for candidate cameras (not used by the render) |

Colours: the Tensorblue palette plus tensorblue.com's own tokens amber-400 `#FFB900` (verify), cyan-400 `#00D3F2` (unpack), green-400 `#05DF72` (install / done), red-500 `#FB2C36` (stuck).

## Rebuild
```bash
npm ci
python3 demo/stages_demo.py demo/out        # timings are machine-specific; the committed JSON drives the render
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english21-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english21-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english21-01.mp4 ../qa/transitions.png
node thumb.mjs ../tensorblue-30s-english21-01-thumbnail.png
```
Re-running `stages_demo.py` on another machine gives different timings; the renderer stops if the headline results drift outside the narrated values (99 % at ≈ 3 s, stuck 1.6–2.0 s).
