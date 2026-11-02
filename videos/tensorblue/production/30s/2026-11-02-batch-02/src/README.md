# Source — Tensorblue 30s production 02 (optimistic updates)

Original code. Format: brand-aligned software cutaway (see `videos/tensorblue/context/11-production-format.md`); notes in `../production-notes.md`.

| file | role |
|---|---|
| `script.json` | final narration lines and placement |
| `tts.py` | Kokoro-82M narration (`af_bella`×0.7 + `am_puck`×0.3, speed 0.98, en-us) → `../audio/voice.wav`, `voice-timing.json` |
| `ui.mjs` | kit: Tensorblue palette, Inter type, rounded panels, **static** seeded crosshatch, heart / burst / badges / spinner, static background |
| `scene.mjs` | the continuous cutaway; every cue timed from narration word timings |
| `dump-events.mjs` | event-linked SFX list → `../audio/sfx-events.json` |
| `mix.py` | synthesized score (92 BPM, F major) + SFX, ducking, loudness normalisation → `../audio/mix.wav` |
| `render.mjs` | deterministic frames → raw RGBA → ffmpeg (`stills` / `video`) |
| `qa.mjs` | pixel QA: caption ink bounds, clean top, caption band free of world drawing |
| `export-qa.sh` | mux + ffprobe/decode/ebur128 gates + contact sheet |
| `asr.py` | one faster-whisper ASR + timing pass |

## Rebuild
```bash
npm ci
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio        # omit HF_HUB_OFFLINE on first run to download hexgrad/Kokoro-82M
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4                       # ~50 s on 4 cores
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-production-02.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-production-02.mp4 ../audio/voice-timing.json ../qa/asr.json
```
