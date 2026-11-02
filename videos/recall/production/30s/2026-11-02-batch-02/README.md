# Recall — 30 s production 02: "Which is heavier: a kilo of steel or feathers?"

**Deliverable:** `recall-30s-production-02.mp4` — 30.000 s, 1080×1920, 30 fps, 900 frames, H.264 High yuv420p +
AAC 48 kHz stereo. Knowledge challenge in the Microgame Frenzy grammar (Recall palette, clay medium): a kilogram-labelled
balance is loaded with 1 kg of steel and 1 kg of feathers; the viewer gets a 3 s think beat; WEIGH! shows a level balance
(same mass); dashed volume boxes and a density chip explain why the feathers take far more space; FLIP! swaps in two
boxes of the same size and the balance tips to steel; the recap toggles the two conditions. Post copy: `publishing-caption.txt`.

## Build
```bash
./build.sh            # mix audio -> render 900 frames (3 headless-Chromium workers) -> mux -> QA
TTS=1 ./build.sh      # also regenerate narration + word timings (reuses the cached Kokoro model)
node render.mjs --stills 0,240,600 --outdir build/stills    # inspect frames
```
Requires `npm ci` (three 0.186.1, @fontsource/fredoka 5.3.0, @fontsource/titan-one 5.3.0), preinstalled Playwright 1.63 +
Chromium, Python 3.13 venv (`audio/requirements*.txt`), ffmpeg 6.1.

## Files
| path | what |
|---|---|
| `script.json`, `timeline.json` | final script + voice config; 120 BPM cues, commands, captions split at ASR word times |
| `web/` | `balance.js` (kg balance, cube, sack, boxes, feathers), `physics.js` (true-size 1 kg steel cube, illustrative pile), `choreo.js`, `overlay.js`, `main.js`, `set.js` (stage); reused `anim.js`, `clay.js`, `character.js` |
| `audio/` | `tts.py`, `asr_words.py`, `mix.py`, `narration/*.wav`, `narration/words.json` |
| `qa/` | `QA.md`, `qa_report.json`, `ffprobe.json`, `contact_sheet.png`, `boundaries.png`, `audio_report.json`, `cue_table.json`, `physics.json` |
| `docs/` | `SOURCES.md` (claim map), `LICENSES.md`, `STYLE-ADAPTATION.md` |

Context: `videos/recall/context/11-production-format.md` (format, updated), `13-production-30s-02.md` (this round).
