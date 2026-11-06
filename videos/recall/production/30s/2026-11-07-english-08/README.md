# Recall — english-08: "Your eyes can't see this remote's light. So why can your phone camera?"

**Deliverable:** `recall-30s-english08-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions.

- **Episode record:** `../../../context/22-production-english-08.md` (request, sources, product-fact check, progress, QA).
- **Format:** `../../../context/11-production-format.md`.
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions (one on-screen-only takeaway), music sections |
| `web/lowpoly.js` | the F01 café, performer and phone (unchanged), plus a TV remote with batteries, a counter TV and the giant infrared set (spectrum column, giant remote, pulse rings, TV receiver, camera sensor, eye) |
| `web/choreo.js` | acting, infrared burst code, battery swap, TV volume, giant states, cameras |
| `web/main.js`, `web/screen.js`, `web/overlay.js` | frame assembly; the phone's camera preview and the TV picture; captions and labels (Fredoka) |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer, mux, full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results |
| `docs/` | `SOURCES.md` (quotes, claim map), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

Full build (mix → 900 frames → mux → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-07-english-08 && WORKERS=3 ./build.sh
```

Regenerate the narration and its ASR check (reuses the cached Kokoro model):

```bash
cd videos/recall/production/30s/2026-11-07-english-08 && TTS=1 WORKERS=3 ./build.sh
```
