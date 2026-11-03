# Recall — Hindi 03: "गीली स्क्रीन अजीब क्यों चलती है?" (why a wet touchscreen behaves strangely)

**Deliverable:** `recall-30s-hindi03-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. Hindi narration (Devanagari captions).

- **Episode record:** `../../../context/17-production-hindi-03.md` (sources, Hindi voice, font, product-fact check, progress).
- **Format:** `../../../context/11-production-format.md`; the Hindi-language correction is recorded there.
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | Hindi lines and voice settings; shots, cues, Devanagari captions, music sections |
| `web/lowpoly.js` | the F01 café, performer and lime phone (unchanged), plus the glass, napkin, drops, finger and giant touchscreen |
| `web/screen.js` | generic sketch-app screen (wet strokes, ghost dots, clean smiley) |
| `web/choreo.js`, `web/main.js`, `web/overlay.js` | acting, finger/napkin paths, giant states, cameras; frame assembly; captions/labels (Baloo 2 for Devanagari) |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer, mux, full build |
| `audio/fetch_models.sh`, `audio/tts.py`, `audio/narration/` | official Kokoro Hindi voice packs (sha256-checked) + cached model; Hindi narration WAVs |
| `audio/asr_words.py` | Hindi ASR intelligibility check per line (Whisper medium, CER) |
| `audio/mix.py` | accepted score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/QA.md` | verification (incl. Hindi ASR CER and a Devanagari-captions check) and results |
| `docs/` | `SOURCES.md` (quotes, claim map), `LICENSES.md`, `STORYBOARD.md` |
| `publishing-caption.txt` | Hindi post copy with sources |

Full build (mix → 900 frames → mux → QA → narration sync):

```bash
cd videos/recall/production/30s/2026-11-03-hindi-03 && WORKERS=3 ./build.sh
```

Fetch the Hindi voices, then regenerate the narration and its ASR check:

```bash
cd videos/recall/production/30s/2026-11-03-hindi-03 && audio/fetch_models.sh && TTS=1 WORKERS=3 ./build.sh
```
