# Aarambh english-10 30 s #01: Josephine Cochran and her 1886 hand-operated dish-washing machine

**Final file:** `aarambh-30s-english10-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `f001542cafcba4b5244ab060dac91fc0d369483581f4097ca1021754e7ca8eaf`
- **Language:** English narration and English captions.
- **Subject:** Cochran replaces the suggested Mary Anderson topic, which was already episode 08 (see context/23).

**Records:**
- Script, sources, claim map, storyboard, QA: `../../../../context/23-production-30s-english10-01.md`
- Accepted recipe, CTA correction and English notes: `../../../../context/11-production-format.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/josephine-cochran-portrait-pd.jpg` | Wikimedia Commons "File:Josephine Garis Cochrane.png" (500 px rendition); the same photo is on the USPTO story "I'll do it myself" | PD-US-expired, PD-old-70 (Commons) |
| `assets/us355139-sheet1-fig1-lever.png` | U.S. Patent 355,139, drawing sheet 1 (header + Fig. I), cropped from the USPTO full-image PDF | U.S. patent drawings are generally not subject to copyright |
| `assets/us355139-fig11-plate-rack.png` | U.S. Patent 355,139, Fig. XI (plate rack) | as above |
| `assets/us355139-fig13-glass-rack.png` | U.S. Patent 355,139, Fig. XIII (glass rack with springs) | as above |
| `assets/us355139-fig9-knife-rack.png` | U.S. Patent 355,139, Fig. IX (knife rack); a Fig. VIII fragment above the label masked white | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The plate/brush hook, the water-pressure vs scrubbers cards, the working-machine demo (after patent Figs. I–II) and the lesson cards are original Canvas2D illustrations, labelled "ILLUSTRATION".
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S6.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english10-01.mp4
python tools/asr_words.py aarambh-30s-english10-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
