# Recall — english-25: "Same slider, opposite jobs" (why a zipper locks one way and opens the other)

**Deliverables:**
- `recall-30s-english25-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english25-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("SAME SLIDER, / OPPOSITE JOBS") plus the Recall pill.

- **Episode record:** `../../../context/38-production-english-25.md` (request, topic check — kept, not covered before —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes). **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `make_timeline.py`, `timeline.json` | English lines and voice settings; timeline generator (caption groups split at measured word starts); shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/zip.js` | café zip pencil case; the giant zipper cut-away (staggered teeth with bumps and hollows on tapes that follow the slider's arms, slider with a Y channel, slanted walls, wedge, lifting cover, lime pull tab, lock catch, pull arrows) and the exploded nest demo |
| `web/choreo.js` | acting (zipping, the 'How?' look, smile), pencil-case zip state and tab, giant zipper state (chain scroll for closing/opening, cover, wall/wedge glow, strain, catch), nest gap, cameras, label timing |
| `web/main.js`, `web/overlay.js`, `web/lowpoly.js` | frame assembly; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill; the shared café/performer builders |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed sections), new foley (zipper ratchets, cover whoosh, ticks, nesting clacks, strain thunk, lock click), ducking, loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (topic change, quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

`audio/.venv` links to `videos/recall/project/.venv` (identical pinned packages); `audio/.cache/kokoro/model.onnx` links to the cached
model (sha256 8fbea51e…34cb); `node_modules` links to the E23 install (same pinned three.js / Fredoka). `build.sh` creates fresh ones if the links are missing.

```bash
cd videos/recall/production/30s/2026-11-27-english-25 && WORKERS=3 ./build.sh
```
