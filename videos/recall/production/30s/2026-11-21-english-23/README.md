# Recall — english-23: "How does it see smoke?" (how a smoke alarm detects smoke)

**Deliverables:**
- `recall-30s-english23-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english23-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("HOW DOES IT / SEE SMOKE?") plus the Recall pill.

- **Episode record:** `../../../context/36-production-english-23.md` (request, topic change — the suggested induction topic was H04 —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes). **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `make_timeline.py`, `timeline.json` | English lines and voice settings; timeline generator (caption groups split at measured word starts); shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/smoke.js` | ceiling + smoke alarm (LED, rings, test button), toaster, kettle, broom, and the giant cut-away optical chamber (cover, vanes, LED beam, light trap, sensor, smoke/steam particles, scattered and hit rays) |
| `web/choreo.js` | acting (flinch, squint, deadpan, smile), broom kinematics, toaster pop, alarm states, café smoke/steam puffs, chamber state (particles crossing the beam, rays, sensor level), cameras, label timing |
| `web/main.js`, `web/overlay.js`, `web/lowpoly.js` | frame assembly; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill; the shared café/performer builders |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed sections), new foley (softened alarm beeps, toaster, hiss, shimmer, pings, test beeps), ducking, loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (topic change, quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

`audio/.venv` links to `videos/recall/project/.venv` (identical pinned packages); `audio/.cache/kokoro/model.onnx` links to the cached
model (sha256 8fbea51e…34cb). `build.sh` creates a fresh venv if the link is missing.

```bash
cd videos/recall/production/30s/2026-11-21-english-23 && WORKERS=3 ./build.sh
```
