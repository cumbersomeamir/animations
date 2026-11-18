# Source — Tensorblue 30s english-20 · episode 01 (one tick, where is it? WhatsApp's ticks and store-and-forward)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the 3D stage `stage3d.mjs` (unchanged) + **new `toy3d.mjs`** (2026-11-18 feedback: more 3D depth, more fun). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/delivery_demo.py` | our model (Python stdlib, real UDP sockets on 127.0.0.1): 20 messages over a bad link (hash-decided drops, ~1/3) to a friend whose phone is off at first. Send-once vs store-and-forward with acknowledgments. Writes `demo/out/delivery-demo.json`. Not WhatsApp's code. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s, `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs`, `stage3d.mjs` | accepted kit and 3D stage (unchanged) |
| `toy3d.mjs` | extruded lit toys (speech bubble with tail, ticks, clock, padlock, rounded phones/server), distance fog, light pools, squash-and-stretch, hop arcs, blurred layers |
| `scene.mjs` | the relay world (phone → stepping pads → SERVER → friend's phone), the story keyed to word timings, the two-lane proof replaying the test log, captions, CTA, SFX list, thumbnail |
| `thumb.mjs` | the separate 1080×1920 thumbnail (frame zero + wordmark) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `transitions.mjs` | QA sheet: frame 0 + frames around every shot change, decoded from the exported MP4 |
| `asr.py` | one faster-whisper `base.en` pass over the narration span |
| `proj-check.mjs` | dev helper: prints projected positions of key points for candidate cameras (not used by the render) |

Colours: the Tensorblue palette plus tensorblue.com's own tokens amber-400 `#FFB900`, red-500 `#FB2C36`, cyan-400 `#00D3F2`, green-400 `#05DF72`.

## Rebuild
```bash
npm ci
python3 demo/delivery_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english20-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english20-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english20-01.mp4 ../qa/transitions.png
node thumb.mjs ../tensorblue-30s-english20-01-thumbnail.png
```
Offline note (new container): Kokoro was downloaded by pinned revision, so `refs/main` in the HF cache must point at `f3ff3571791e39611d31c381e3a41a3af07b4987` (and faster-whisper base.en at `3d3d5dee26484f91867d81cb899cfcf72b96be6c`) for `HF_HUB_OFFLINE=1`.
