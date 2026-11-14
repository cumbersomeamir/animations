# Recall — english-14: "Why an open fridge makes the kitchen warmer"

**Deliverables:**
- `recall-30s-english14-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions.
- `recall-30s-english14-01-thumbnail.png` — separate vertical thumbnail (1080x1920), "OPEN FRIDGE, / HOTTER ROOM?".

- **Episode record:** `../../../context/27-production-english-14.md` (request, topic change — the suggested ANC topic was F05 —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 batch note).
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions, music sections |
| `web/lowpoly.js` | the F01 café and performer (unchanged), plus the café fridge, window thermometer, giant cutaway fridge with its refrigerant loop, and the room cutaway with a split air conditioner |
| `web/choreo.js` | acting, fridge door, mist, thermometers, giant states, cameras, label timing |
| `web/main.js`, `web/overlay.js` | frame assembly (legs at runtime), refrigerant blobs and heat bits; captions (x 100–900), brief labels and the thumbnail |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption safe area x 100–900) |
| `docs/` | `SOURCES.md` (quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

Full build (mix → 900 frames → mux → thumbnail → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-14-english-14 && WORKERS=3 ./build.sh
```
