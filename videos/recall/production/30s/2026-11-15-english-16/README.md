# Recall — english-16: "That is my voice?" (why your voice sounds different in a recording)

**Deliverables:**
- `recall-30s-english16-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. English narration and English captions. Frame 0 is the thumbnail composition.
- `recall-30s-english16-01-thumbnail.png` — vertical thumbnail (1080x1920): frame 0 ("THAT IS / MY VOICE?") plus the Recall pill.

- **Episode record:** `../../../context/29-production-english-16.md` (request, topic check, sources, CTA, progress, QA).
- **Format:** `../../../context/11-production-format.md` (with the 2026-11-13 and 2026-11-15 batch notes).
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | English lines and voice settings; shots, cues, captions (the first group is the frame-0 title), music sections |
| `web/lowpoly.js` | the F01 café, performer and phone, plus the head cross-section, wave-front crescents and the voice-note / recorder screen |
| `web/choreo.js` | acting (gasp, deadpan, ear plugging, hum), sound paths, cameras, label timing |
| `web/main.js`, `web/overlay.js` | frame assembly (legs and index fingers at runtime), wave-fronts and bone pulses; captions (x 100–900) incl. the frame-0 title, brief labels, the thumbnail pill |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer (explicit 3D + overlay composite), mux, thumbnail (`--sheet`), full build |
| `audio/tts.py`, `audio/asr_words.py`, `audio/narration/` | English narration (cached Kokoro model) and its per-line ASR check |
| `audio/mix.py` | accepted score engine (retimed), new foley (incl. a synthesised hum), ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, `qa/QA.md` | verification and results (caption area x 100–900, y 230–1500) |
| `docs/` | `SOURCES.md` (quotes, claim map, facts vs assumptions), `LICENSES.md`, `STORYBOARD.md` |
| `make_caption.py`, `publishing-caption.txt` | post copy generated from `script.json` (exact final transcript) with sources |

Full build (mix → 900 frames → mux → thumbnail → QA → narration sync → caption sync):

```bash
cd videos/recall/production/30s/2026-11-15-english-16 && WORKERS=3 ./build.sh
```
