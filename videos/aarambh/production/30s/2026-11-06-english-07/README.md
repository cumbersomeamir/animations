# Aarambh english-07 30 s #01: Garrett Morgan's all-stop traffic signal

**Final file:** `aarambh-30s-english07-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `3eabf720bfdc3fa01913368adc6933044d2f718c99223a1754aa4525fec5362e`
- **Language:** English narration and English captions.

**Records:**
- Script, sources, claim map, storyboard, QA: `../../../../context/20-production-30s-english07-01.md`
- Accepted recipe, CTA correction and English notes: `../../../../context/11-production-format.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/garrett-morgan-portrait-commons.jpg` | Wikimedia Commons "File:Morgan5.jpg" (via a U.S. NHTSA page) | PD-old (Commons) |
| `assets/garrett-morgan-1916-rescue-newspaper.jpg` | Wikimedia Commons "File:Morgan rescue.jpg", newspaper photo, 1916 | PD-US (published before 1931) |
| `assets/us1475024-sheet1-fig1-fig2.png` | U.S. Patent 1,475,024 drawing sheet 1, cropped from the USPTO full-image PDF | U.S. patent drawings are generally not subject to copyright |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The intersection, cars, signal and lesson scenes are original Canvas2D illustrations, labelled "ILLUSTRATION".
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S7.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english07-01.mp4
python tools/asr_words.py aarambh-30s-english07-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
