# Aarambh english-14 30 s #01: Emily Warren Roebling and the Brooklyn Bridge

**Final file:** `aarambh-30s-english14-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `d589c52011444ee698a433bb5c6f67b56efbb2c8c5cbca93e575846273ae9b9e`

**Thumbnail:** `aarambh-30s-english14-01-thumbnail.png` (1080x1920, "SHE CARRIED THE PLANS")
- sha256 `18d1b1744d5981ca06c294bb1d6274b554a55b03f4f392cdcc3e2dd47effdd3a`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, QA: `../../../../context/28-production-30s-english14-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/emily-warren-roebling-carolus-duran-1896-pd.jpg` | Brooklyn Museum 1994.69.1, Carolus-Duran, 1896 (via Wikimedia Commons) | PD-Art |
| `assets/washington-roebling-chartran-1899-pd.jpg` | Brooklyn Museum 1994.69.2, Théobald Chartran, c. 1899 (via Wikimedia Commons) | PD-Art |
| `assets/ny-caisson-transverse-section-1867-pd.jpg` | "N.Y. Caisson, transverse section", 1867, RPI archives (via Wikimedia Commons) | PD-US-expired |
| `assets/east-river-bridge-1883-loc-pga09027.jpg` | "The great East River suspension bridge", 1883 lithograph, Library of Congress pga.09027 | PD; no known restrictions |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The window, tower, paths, note, figures, glow and bubbles, and the lesson diagram are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english14-01.mp4
node src/render.mjs --thumb aarambh-30s-english14-01-thumbnail.png   # separate vertical thumbnail
python tools/asr_words.py aarambh-30s-english14-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
