# Aarambh english-13 30 s #01: Elisha Otis, "cut the cable"

**Final file:** `aarambh-30s-english13-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `108d9fd89ce5f48b373e9b2b5f0d863cd3ab193ad1865cf5bb7aa4bf81fc7b61`

**Thumbnail:** `aarambh-30s-english13-01-thumbnail.png` (1080x1920, "CUT THE CABLE")
- sha256 `0402a68d6e08c9a33c338326d2d8a37354d30aea85b77859df8364a07ccc7d66`

- **Language:** English narration and English captions.
- **Subject:** Otis replaces the proposed Mary Anderson topic, which was already episode 08 (see context/27).
- **Rules:** made under the 2026-11-11 rules (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, QA: `../../../../context/27-production-30s-english13-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/elisha-otis-portrait-pd.jpg` | Wikimedia Commons "File:Otis.jpg" (Elisha Graves Otis) | PD-old |
| `assets/us31128-nara-305889-patent-drawing.jpg` | U.S. National Archives ARC 305889, Patent Office drawing for No. 31,128 (via Wikimedia Commons) | U.S. federal record, 1861, public domain |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The shaft, platform, figure, axe, hoist, schematic (after patent Figs. 1–2), 1854 stage, crowd and icons are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english13-01.mp4
node src/render.mjs --thumb aarambh-30s-english13-01-thumbnail.png   # separate vertical thumbnail
python tools/asr_words.py aarambh-30s-english13-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
