# Recall — english-22: "Your phone has springs" (how a phone knows which way is down)

**Deliverables:**
- `recall-30s-english22-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english22-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("YOUR PHONE / HAS SPRINGS") plus the Recall pill.

- **Episode record:** `../../../context/35-production-english-22.md` (request, topic change — the suggested QR topic was F01 —, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes).
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/lowpoly.js` | the F01 café, performer and lime phone, plus the giant MEMS accelerometer die (`buildMems`: proof mass, springs re-drawn as it moves, two-axis combs whose approached plates glow) and the bedroom (`buildBedroom`) |
| `web/choreo.js` | acting (raised brow), phone rotation and screen-content angle (auto-rotate, lock), die rotation and proof-mass offset from gravity, cameras (incl. the rolled lying-down POV), label timing |
| `web/main.js`, `web/overlay.js`, `web/screen.js` | frame assembly (legs at runtime, phone in the hand), gravity arrows, pillow; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill; the phone's reading app and lock icon |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley (spring boings, swishes, UI clicks, blips), ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

`audio/.venv` is a link to the english-20 environment (same pinned packages), so no second copy is kept on disk; `build.sh`
creates a fresh one if it is missing.

Full build (mix → 900 frames → mux → thumbnail → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-19-english-22 && WORKERS=3 ./build.sh
```
