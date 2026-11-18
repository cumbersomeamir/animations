# Aarambh english-21 30 s #01: Vivien Thomas and the blue-baby shunt, "THE HANDS THEY FORGOT"

**Final file:** `aarambh-30s-english21-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `e132744578a44a691b074beee86056e1ab6c1af4cc37b55e7dad911e3be78439`

**Thumbnail:** `aarambh-30s-english21-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `76aa5a36a80f243b3190d17970fce9f044c54ea02004eaa192b6ce7d17020021`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, portrait-licence caveat, QA: `../../../../context/35-production-30s-english21-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/vivien-thomas-commons-pd-claimed.jpg` | Wikimedia Commons "Vivien Thomas.jpg" (300x436) | Commons tag `PD-because` (source site says public domain). **Unconfirmed:** see the caveat in context/35 and confirm before release |
| `assets/vivien-thomas-commons-pd-claimed-2x.jpg` | the same image scaled 2x (0.6 px blur to soften halftone, Lanczos, mild unsharp; no added detail), used in the video | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- The heart, lungs, baby figure, vessels, blood beads, shunt, stepstool, surgeon silhouette, card, byline page, stamp and cards are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english21-01.mp4
node src/render.mjs --thumb aarambh-30s-english21-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english21-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
