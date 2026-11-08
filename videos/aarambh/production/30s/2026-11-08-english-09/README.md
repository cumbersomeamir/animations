# Aarambh english-09 30 s #01: Percy Spencer, radar magnetrons and microwave cooking

**Final file:** `aarambh-30s-english09-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `eaf06c952e37f760a356850b3b07af044db2d6bcb5e3e57599fc993cabfb06fc`
- **Language:** English narration and English captions.
- **Portrait:** no openly licensed portrait of Percy Spencer was found, so P1 uses a typeset name plate (see context/22).

**Records:**
- Script, sources, claim map, storyboard, QA: `../../../../context/22-production-30s-english09-01.md`
- Accepted recipe, CTA correction and English notes: `../../../../context/11-production-format.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/us2408235-sheet1-magnetron.png` | U.S. Patent 2,408,235 (High Efficiency Magnetron), sheet 1, Fig. 1, cropped from the USPTO full-image PDF | U.S. patent drawings are generally not subject to copyright |
| `assets/us2495429-header.png` | U.S. Patent 2,495,429 (Method of Treating Foodstuffs), drawing-sheet header | as above |
| `assets/us2495429-drawing-cooking.png` | U.S. Patent 2,495,429, the single figure (magnetrons, wave guide, food, conveyor) | as above |
| `assets/tappan-rl1-1956-nmah-cc0.jpg` | Smithsonian NMAH, Tappan Model RL-1 microwave oven (made 1956), media NMAH-RWS2012-04354, record nmah_1088040 | CC0 (Smithsonian Open Access) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The waves, pocket and candy bar, egg, bars and lesson cards are original Canvas2D illustrations, labelled "ILLUSTRATION".
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english09-01.mp4
python tools/asr_words.py aarambh-30s-english09-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
