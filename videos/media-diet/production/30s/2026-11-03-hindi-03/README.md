# Media Diet · 30 s Hindi episode (hindi-03) — iOS 27.2: iPhone AI images get Google's invisible SynthID watermark

Hindi narration + Devanagari captions. Style: **Layered Tech Cutaway**, accepted recipe unchanged (`../../../context/11-production-format.md`).
Brief/script/storyboard/citations: `BRIEF-SCRIPT-STORYBOARD.md` (copy of `../../../context/16-production-30s-hindi03-01.md`).

| path | what |
|---|---|
| `media-diet-30s-hindi03-01.mp4` | final film (30.000 s, 900 frames, 1080×1920, H.264 + AAC, audio language tagged `hin`) |
| `publishing-caption.txt` | Hindi post caption with eligibility details and sources |
| `SOURCES.md` · `LICENSES.md` · `QA.md` · `qa/` | facts file · provenance · verification |
| `src/film.js` | three.js paper diorama (mystery photo, calendar, phone update, AI picture + extended photo, stamp + magnifier, phone row, laptop detector, sign) + Devanagari caption overlay |
| `src/timeline.json` · `src/data/` | Hindi narration (spoken text) and caption cues (written text), shots, events · cues/lines |
| `audio/narration/` | committed Kokoro Hindi takes |
| `build/` | `build.sh`, `render.mjs` (parallel ranges), `merge_bounds.py`, `audio.py`, `voice.py`, `cues.py`, `qa.sh`, `bounds_check.py`, `asr_check_hi.py` (Hindi Whisper-medium pass), `contact.py` |

Rebuild: `bash build/build.sh` (`REGEN_VOICE=1` re-synthesises narration; `SKIP_FRAMES=1` reuses `frames/`).
`node_modules`: three (education/pilot-01) and Latin fonts (production/30s/2026-11-02) are links; Noto Sans Devanagari 5.3.0 is
installed with `npm install --prefix .cache/npmfont @fontsource/noto-sans-devanagari@5.3.0` and linked into `node_modules/@fontsource/`.
`.cache/{venv,models}` link to the existing caches (Whisper medium was added there for the Hindi QA pass).
