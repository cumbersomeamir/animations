# Recall — round 02: "Why a microwave leaves cold patches in food"

**Deliverable:** `recall-30s-round02-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo, English VO.

- Episode record, sources, product-fact check and progress: `../../../context/16-production-round-02.md`.
- Format: `../../../context/11-production-format.md` (CTA corrected this round).
- Style: `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | narration lines and voice settings; shots, cues, captions and music sections |
| `web/lowpoly.js` | the F01 café + performer (unchanged), plus the microwave, bowl, spoon, steam and giant cutaway cavity |
| `web/heat.js` | illustrative field pattern, turntable surface heating, cross-section heat and colour map |
| `web/screen.js` | microwave display (words only, never a time) |
| `web/choreo.js`, `web/main.js`, `web/overlay.js` | acting, spoon path, states, cameras; frame assembly; captions/labels/brand (accepted F01 treatment) |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer, mux, full build |
| `audio/tts.py`, `audio/narration/` | Kokoro narration from the cached model (af_bella 0.7 + am_puck 0.3, 0.98, en-us) |
| `audio/mix.py` | accepted F01 score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/QA.md` | verification and results |
| `docs/` | `SOURCES.md` (quotes, claim map, product-fact check), `LICENSES.md`, `STORYBOARD.md` |
| `publishing-caption.txt` | post copy with sources |

Full build (mix → 900 frames → mux → QA → narration sync, about 16 min):

```bash
cd videos/recall/production/30s/2026-11-03-round-02 && WORKERS=3 ./build.sh
```

Also regenerate the narration from the cached Kokoro model:

```bash
cd videos/recall/production/30s/2026-11-03-round-02 && TTS=1 WORKERS=3 ./build.sh
```
