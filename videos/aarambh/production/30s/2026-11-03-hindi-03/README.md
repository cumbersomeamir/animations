# Aarambh Hindi-03 30 s #01: Katherine Johnson and the hand-check behind John Glenn's orbital flight

**Final file:** `aarambh-30s-hindi03-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `86011cfc47afec81facec81b1fc356d19535a70ad9089dea0780b4cb74c1a383`
- **Language:** all narration and captions are Hindi (Devanagari).

**Records:**
- Script (Hindi + gloss), voice choice, sources, claim map, storyboard, QA: `../../../../context/16-production-30s-hindi03-01.md`
- Accepted recipe, CTA correction and Hindi-language note: `../../../../context/11-production-format.md`
- Post copy (Hindi) with sources: `publishing-caption.txt`

**Assets:**
- NASA photographs (NASA Image and Video Library, `images-assets.nasa.gov`). NASA media are generally not subject to U.S. copyright; NASA is credited as the source and no endorsement is implied (https://www.nasa.gov/nasa-brand-center/images-and-media/):

| file | NASA ID | date | credit |
|---|---|---|---|
| `assets/nasa-KSC-62PC-0011-friendship-7-launch.jpg` | KSC-62PC-0011 | 1962-02-20 | NASA |
| `assets/nasa-LRC-1966-B701_P-06717-katherine-johnson-at-desk.jpg` | LRC-1966-B701_P-06717 | 1966-09-08 | NASA/Bob Nye |
| `assets/nasa-LRC-1962-B701_P-09381-katherine-johnson-at-work.jpg` | LRC-1962-B701_P-09381 | 1962-12-07 | NASA/Bob Nye |
| `assets/nasa-S64-14854-glenn-friendship-7-decal.jpg` | S64-14854 | Feb 1962 | NASA |
| `assets/nasa-LRC-1971-B701_P-03033-katherine-johnson-portrait.jpg` | LRC-1971-B701_P-03033 | 1971-03-18 | NASA/Bob Nye |

- `assets/aarambh-icon.png` is copied from `videos/aarambh/assets/icon.png`.
- The printout, console, reels, ledger and check diagram are original Canvas2D illustrations, labelled "चित्रण" on screen. The ledger numbers are symbolic.
- **Fonts:** Noto Sans Devanagari, Noto Serif Devanagari, Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0 Hindi voice `hf_alpha`, `lang="hi"`, speed 0.98 (Apache-2.0 model, stock voice, no cloning).
- **Music and SFX:** original procedural (`audio/build_audio.py`).

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro_hi.py <kokoro-v1.0.onnx> <voices-v1.0.bin>      # Hindi narration -> audio/narration/S1..S6.wav (committed takes are canonical)
# word timings for captions/cues are committed in qa/asr_words_narration.json (Hindi ASR on the narration placed at script.json starts);
# to redo after new takes: place S1..S6 at their starts into build/vo_timing.wav (48 kHz mono), then
# python tools/asr_words_hi.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-hindi03-01.mp4
python tools/asr_words_hi.py aarambh-30s-hindi03-01.mp4 qa/asr_words_final.json --models <cache>  # Hindi ASR QA
```
