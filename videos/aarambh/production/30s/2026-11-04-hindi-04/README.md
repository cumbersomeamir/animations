# Aarambh Hindi-04 30 s #01: Louis Braille and why six raised dots read by touch

**Final file:** `aarambh-30s-hindi04-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `3319c7ebf55a0d391e5fcd0852dd5c43d287267a804f67bff7854fd3d32d8feb`
- **Language:** all narration and captions are Hindi (Devanagari).

**Records:**
- Script (Hindi + gloss), sources, claim map, storyboard, QA: `../../../../context/17-production-30s-hindi04-01.md`
- Accepted recipe, CTA correction and Hindi-language note: `../../../../context/11-production-format.md`
- Post copy (Hindi) with sources: `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/louis-braille-engraving-thiriat-1887.jpg` | Wikimedia Commons, "File:Engraving of Louis Braille by Henri Thiriat (cropped).jpg" (1280 px rendition); originally *La Nature* 15 (1887), p. 20 | Public domain |
| `assets/braille-1829-procede-title-page.jpg` | L. Braille, *Procédé…* (Paris, 1829), facsimile scan, APH M.C. Migel Library, Internet Archive `procdpourcrirele00loui`, page n0 (cropped and scaled) | Internet Archive item notes: "No Copyright" (1829 work) |
| `assets/braille-1829-procede-p5-ten-signs.jpg` | same scan, page n18 (book p. 5), crop of the table of ten basic signs | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- Cells, Barbier grid, fingertip, slate and stylus are original Canvas2D illustrations, labelled "चित्रण".
- **Fonts:** Noto Sans Devanagari, Noto Serif Devanagari, Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0 Hindi voice `hf_alpha`, `lang="hi"`, speed 1.02 (Apache-2.0 model, stock voice, no cloning).
- **Music and SFX:** original procedural (`audio/build_audio.py`).

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro_hi.py <kokoro-v1.0.onnx> <voices-v1.0.bin>      # Hindi narration -> audio/narration/S1..S6.wav (committed takes are canonical)
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words_hi.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-hindi04-01.mp4
python tools/asr_words_hi.py aarambh-30s-hindi04-01.mp4 qa/asr_words_final.json --models <cache>  # Hindi ASR QA
```
