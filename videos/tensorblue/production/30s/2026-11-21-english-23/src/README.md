# Source — Tensorblue 30s english-23 · episode 01 (LEAKED. NEVER SENT. checking a password against breaches without sending it)

Original code. Format: Blue Receipt Theatre (`brt.mjs`, unchanged), `stage3d.mjs` (unchanged) and `toy3d.mjs` (from english-20, unchanged). English narration and captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/breach_check.py` | Real queries (Python stdlib) to the public HIBP range API `api.pwnedpasswords.com/range/{5 chars}` with `Add-Padding: true`. Uses only public sample passwords: `password123` and a fresh random 20-character password that is discarded. Writes `demo/out/breach-check.json`; the renderer reads every number from it. Re-running gives newer counts, because the data set grows. |
| `script.json` | English lines; voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s. `tts` fields say "One Password" / "password one two three"; override `[Tensorblue](/tˈɛnsəɹblˌu/)`. |
| `scene.mjs` | The toy world and its graphics. **Props:** phone in a glass case, HASH press, 40 hash tiles (the first five blue), the `CBFDA`/`DE4AD` capsule, the BREACH LIST vault with its drawer, look-alike cards, red match strip. **Screen:** a generic "Password check" phone screen with no buttons. **Text and output:** one headline at a time (centred x 500, ≤ 700 px), captions at y 280–460, CTA, SFX list, thumbnail. |
| `qa.mjs` | 1) Caption ink inside x 100–900 / y 280–460. 2) Clean top 0–280. 3) No stage pixels in y 280–479. 4) **Headline vs props:** every 2nd frame before the CTA, nothing from the world inside a headline's box. `QA_HEAD_ONLY=1` runs only check 4; `HEAD_THR` sets its threshold (default 90). |
| `mix.py` | SFX plus a quiet per-shot score (seed 20261126); true-peak ceiling −3.0 dBTP |
| `render.mjs`, `export-qa.sh`, `transitions.mjs`, `asr.py`, `thumb.mjs`, `dump-events.mjs`, `tts.py` | as in earlier rounds |

## Rebuild
```bash
npm ci
python3 demo/breach_check.py demo/out      # optional: refreshes the counts (network); the committed JSON is what the video shows
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4      # check: 900 frames before muxing
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english23-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english23-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english23-01.mp4 ../qa/transitions.png && node thumb.mjs ../tensorblue-30s-english23-01-thumbnail.png
```
