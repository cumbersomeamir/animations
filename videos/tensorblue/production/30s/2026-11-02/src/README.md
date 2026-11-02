# Source — Tensorblue 30s production 01 (CDN edge caches)

Original code written for this round. Art direction: Animate skill → Crosshatch `STYLE.md` (read-only, see `../production-notes.md`).

| file | role |
|---|---|
| `script.json` | final narration lines and placement |
| `tts.py` | Kokoro-82M narration: `af_bella`×0.7 + `am_puck`×0.3, speed 0.98, en-us → `../audio/voice.wav`, `../audio/voice-timing.json` |
| `lib.mjs` | the crosshatch-ink kit: boiling line on 2s, hatch / cross / pencil / stipple clipped inside shapes, paper grain, hand lettering (Patrick Hand, OFL) |
| `scene.mjs` | the one continuous scene; every cue is timed from narration word timings |
| `dump-events.mjs` | writes event-linked SFX list → `../audio/sfx-events.json` |
| `mix.py` | synthesized score + SFX, ducking, loudness normalisation → `../audio/mix.wav` |
| `render.mjs` | deterministic frames → raw RGBA → ffmpeg (`stills` for contact tiles, `video` for the MP4) |
| `qa.mjs` | pixel QA: caption ink bounds, clean top 0–300 px, caption band free of world drawing |
| `asr.py` | one faster-whisper ASR + timing pass on the final audio |

## Rebuild
```bash
npm ci                                                    # @napi-rs/canvas 1.1.0 from npm
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements-audio.txt                     # + en_core_web_sm wheel (see file)
python tts.py script.json ../audio                        # downloads hexgrad/Kokoro-82M once
node dump-events.mjs ../audio/sfx-events.json
python mix.py ../audio
node render.mjs video /tmp/silent.mp4
ffmpeg -i /tmp/silent.mp4 -i ../audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart ../tensorblue-30s-production-01.mp4
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-production-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
Rendering is deterministic (seeded randomness, no wall clock); ~0.12 s/frame on 4 CPU cores.
