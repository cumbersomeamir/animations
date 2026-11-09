# Recall — english-11: "Why is the food steaming but the plate still cool?"

**Deliverable:** `recall-30s-english11-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions.

- **Episode record:** `../../../context/25-production-english-11.md` (request, topic check vs R02, sources, product-fact check, progress, QA).
- **Format:** `../../../context/11-production-format.md`.
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions, music sections |
| `web/lowpoly.js` | the F01 café and performer (unchanged), round 02's counter microwave and steam, a plate of food, a test dish, a glass measuring cup, wave ribbons, and the giant heat set (food and plate cross-sections with water molecules, a plate lattice and a heat glow; a cut-away porous mug with an iron-rich glaze) |
| `web/choreo.js` | acting, plate lift, microwave door and timer, giant states, thermal wipe, cameras |
| `web/main.js`, `web/screen.js`, `web/overlay.js` | frame assembly and the thermal pass (scissored second render with false-colour materials); the microwave display; captions, labels and the thermal legend (Fredoka) |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results |
| `docs/` | `SOURCES.md` (quotes, claim map), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

Full build (mix → 900 frames → mux → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-09-english-11 && WORKERS=3 ./build.sh
```

Regenerate the narration and its ASR check (reuses the cached Kokoro model):

```bash
cd videos/recall/production/30s/2026-11-09-english-11 && TTS=1 WORKERS=3 ./build.sh
```
