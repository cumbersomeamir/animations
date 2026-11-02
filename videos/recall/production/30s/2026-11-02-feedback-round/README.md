# Recall — feedback round 01: "Why can a QR code still scan with a logo in the middle?"

**Deliverable:** `recall-30s-feedback-01.mp4`. It is 30.000 s long, 1080x1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo, with English voiceover.

- Format: `../../../context/11-production-format.md`. The quiz format is retired.
- Style: `../../../context/15-style-low-poly-everyday-discovery.md`.
- Episode brief and progress: `../../../context/14-production-feedback-01.md`.

| path | what |
|---|---|
| `script.json`, `timeline.json` | narration lines (voice settings) and the shot/cue/caption timeline |
| `qrdata/make_qr.py` → `qrdata/qr.json`, `qrdata/tests/*.png` | the real QR (segno), its verified module/codeword map, and zxing-cpp decode tests |
| `web/` | Three.js low-poly scene: `lowpoly.js` (café, person rig, phone, card, giant QR), `screen.js` (card + phone screen art), `choreo.js` (acting, cameras, timing), `overlay.js` (captions, labels, brand), `main.js` |
| `render.mjs` | deterministic frame renderer in headless Chromium (Playwright). `--stills`, `--pngdir`, `--cards` |
| `audio/tts.py`, `audio/narration/` | Kokoro narration from the cached model (af_bella 0.7 + am_puck 0.3, 0.98, en-us) |
| `audio/mix.py` | original pad/pluck score, SFX, ducking, BS.1770 loudness and true-peak limiter |
| `mux.sh`, `build.sh` | mux and full reproducible build |
| `qa/qa.py`, `qa/QA.md` | verification: streams, full decode, loudness, ASR timing, safe areas, QR decode, motion, sheets |
| `docs/SOURCES.md`, `docs/LICENSES.md`, `docs/STORYBOARD.md` | sources/claim map, provenance, storyboard |
| `publishing-caption.txt` | post copy with sources and the trademark sentence |

```bash
cd videos/recall/production/30s/2026-11-02-feedback-round
WORKERS=3 ./build.sh          # mix -> 900 frames -> card images -> mux -> QA (~20 min)
```

```bash
TTS=1 WORKERS=3 ./build.sh    # also regenerate narration from the cached Kokoro model
```

```bash
audio/.venv/bin/python qrdata/make_qr.py   # rebuild and re-verify the QR
```
