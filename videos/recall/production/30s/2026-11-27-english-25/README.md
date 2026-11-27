# Recall — english-24: "This window is a metal net" (why a microwave door has a metal mesh you can see through)

**Deliverables:**
- `recall-30s-english24-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english24-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("THIS WINDOW / IS A METAL NET") plus the Recall pill.

- **Episode record:** `../../../context/37-production-english-24.md` (request, topic check — kept, not covered before —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes). **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `make_timeline.py`, `timeline.json` | English lines and voice settings; timeline generator (caption groups split at measured word starts); shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/door.js` | counter microwave (round 02 / E11 builder) with a perforated metal screen, mug and power strip; the giant door cut-away (perforated sheet at true hole-to-wavelength scale, wave + reflection ribbons, wavelength and hole rulers, the solid-metal tint, light rays, the bent-door gap) |
| `web/choreo.js` | acting (peer, head turn, frown, unplug, smile), microwave states (running, door ajar, display), plug, giant-door state (wave travel, reflection, tint, rays, gap), cameras, label timing |
| `web/main.js`, `web/overlay.js`, `web/lowpoly.js` | frame assembly; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill; the shared café/performer builders |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed sections), new foley (oven hum, ruler ticks, metal thunk, bounce, shimmer, creak, plug clunk), ducking, loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (topic change, quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

`audio/.venv` links to `videos/recall/project/.venv` (identical pinned packages); `audio/.cache/kokoro/model.onnx` links to the cached
model (sha256 8fbea51e…34cb); `node_modules` links to the E23 install (same pinned three.js / Fredoka). `build.sh` creates fresh ones if the links are missing.

```bash
cd videos/recall/production/30s/2026-11-23-english-24 && WORKERS=3 ./build.sh
```
