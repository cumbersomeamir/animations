# Recall — Hindi 04: "इंडक्शन पर बर्तन गर्म कैसे होता है?" (why only the pot heats on an induction cooktop)

**Deliverable:** `recall-30s-hindi04-01.mp4` — 30.000 s, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo. Hindi narration (Devanagari captions).

- **Episode record:** `../../../context/18-production-hindi-04.md` (sources, Hindi voice, font, product-fact check, progress).
- **Format:** `../../../context/11-production-format.md`; the Hindi-language correction is recorded there.
- **Style:** `../../../context/15-style-low-poly-everyday-discovery.md` (unchanged).

| path | what |
|---|---|
| `script.json`, `timeline.json` | Hindi lines and voice settings; shots, cues, Devanagari captions, music sections |
| `web/lowpoly.js` | the F01 café and performer (unchanged), plus the induction plate, steel pot, aluminium pan, magnet, steam and giant induction cutaway |
| `web/choreo.js`, `web/main.js`, `web/overlay.js` | acting, vessel/magnet paths, giant states, cameras; frame assembly; captions/labels (Baloo 2 for Devanagari) |
| `render.mjs`, `mux.sh`, `build.sh` | deterministic Chromium frame renderer, mux, full build |
| `audio/fetch_models.sh`, `audio/tts.py`, `audio/narration/` | official Kokoro Hindi voice packs (sha256-checked) + cached model; Hindi narration WAVs |
| `audio/asr_words.py` | Hindi ASR intelligibility check per line (Whisper medium, CER) |
| `audio/mix.py` | accepted score engine (retimed), new foley, ducking, BS.1770 loudness + true-peak limiter |
| `qa/qa.py`, `qa/narration_sync.py`, `qa/QA.md` | verification (incl. Hindi ASR CER, Devanagari-captions check, caption↔speech alignment) and results |
| `docs/` | `SOURCES.md` (quotes, claim map), `LICENSES.md`, `STORYBOARD.md` |
| `publishing-caption.txt` | Hindi post copy with sources |

Full build (mix → 900 frames → mux → QA → narration sync):

```bash
cd videos/recall/production/30s/2026-11-04-hindi-04 && WORKERS=3 ./build.sh
```

Fetch the Hindi voices, then regenerate the narration and its ASR check:

```bash
cd videos/recall/production/30s/2026-11-04-hindi-04 && audio/fetch_models.sh && TTS=1 WORKERS=3 ./build.sh
```
