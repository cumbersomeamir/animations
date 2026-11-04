# Source — Tensorblue 30s Hindi batch 04 · episode 01 (passkey login)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). Hindi narration + Devanagari captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `script.json` | final Hindi lines (`text` = caption, `tts` = spoken spelling), `lang_code: "h"`, voices `hf_alpha`×0.7 + `hm_omega`×0.3, speed 1.14 |
| `tts.py` | Kokoro-82M; reads language/voices/speed from `script.json` (English defaults unchanged); estimates Hindi word times inside each line |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged): palette, Inter/Inter Display, kinetic words, cards, key token, iso box, logo |
| `scene.mjs` | seven staged scenes + blue wipes (sign-in card, key pair, who keeps what, challenge + phone unlock, sign + verify, biometrics stay, CTA); Devanagari via Mukta |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr_hi.py` | Hindi ASR (faster-whisper `medium`, `language='hi'`, sentence by sentence): CER/WER + timing drift |

## Rebuild
```bash
npm ci
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio            # downloads hexgrad/Kokoro-82M + voices/hf_alpha.pt, hm_omega.pt once
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-hindi04-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr_hi.py ../tensorblue-30s-hindi04-01.mp4 ../audio/voice-timing.json ../qa/asr-hi.json
```
Hindi G2P uses the espeak-ng `hi` data bundled with `espeakng-loader` (installed by `misaki[en]`). ASR model: `Systran/faster-whisper-medium` (downloaded once).
