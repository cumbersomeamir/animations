# Recall — english-19: "Hotter than boiling water" (why a pressure cooker cooks faster)

**Deliverables:**
- `recall-30s-english19-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english19-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("HOTTER THAN / BOILING WATER") plus the Recall pill.

- **Episode record:** `../../../context/32-production-english-19.md` (request, topic change — the suggested induction topic was H04 —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes).
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/lowpoly.js` | the F01 café and performer, plus the giant pressure-cooker half-section with dials, the mountain set and the café cooker |
| `web/choreo.js` | acting (eyes on the valve, raised brow), cooker states (lid, pressure, temperature, boiling, food), cameras, label timing |
| `web/main.js`, `web/overlay.js` | frame assembly (legs at runtime), bubbles, steam dots, push arrows, dials; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley (valve hiss and rattle, bubbles, lid clunk, wind), ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

Full build (mix → 900 frames → mux → thumbnail → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-17-english-19 && WORKERS=3 ./build.sh
```
