# Source — Tensorblue 30s english-19 · episode 01 (blurry, not frozen: how adaptive streaming picks chunk quality)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/abr_demo.py` | our simulation (Python stdlib) of two streaming players on the same made-up network (8 → 1.2 → 8 Mb/s). Both use 4-second chunks and an SD/720p/HD ladder. One always fetches HD; the other uses a buffer-based rate map (BBA-0, Huang et al. 2014). A new quality is picked only when a chunk finishes. It records every chunk, the buffer every 0.1 s, frozen time and on-screen quality. Writes `demo/out/abr-demo.json`. Not any app's code. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s (hook audio at once), `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | phones playing an original little film (rendered small and scaled up for lower qualities). Each has a glass BUFFER tower of chunk tiles whose back wall shows the rate-map bands. A shelf holds the chunks in three qualities. Frame zero shows "BLURRY, NOT FROZEN." on a blurry-but-playing phone. From 10.1 s the test replays on a clock that lands the signal drop on "Weak": tiles fly in (crawling on the weak signal), the always-HD lane freezes with a live counter, and the adaptive lane keeps playing. Reads the test's result and stops if it changes. The thumbnail is frame zero + the wordmark. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail (frame zero) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

Colours: the Tensorblue palette plus tensorblue.com's own Tailwind tokens cyan-400 `#00D3F2` (HD), amber-400 `#FFB900` (SD, weak signal) and red-500 `#FB2C36` (the FROZEN counter); 720p is brand blue `#3B82F6`.

## Rebuild
```bash
npm ci
python3 demo/abr_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english19-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english19-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english19-01-thumbnail.png
```
