# Aarambh english-20 30 s #01: Alice Ball and chaulmoogra oil, "HER METHOD. HIS NAME."

**Final file:** `aarambh-30s-english20-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `4725b3937de045c986a7fefc0a589447021a0087d9883f78c0613e284c3f4d4a`

**Thumbnail:** `aarambh-30s-english20-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `a7c3cc4815f8e74648797c9ad213c4021702f72f180bea104d24f93cf98c2747`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, scope notes, QA: `../../../../context/34-production-30s-english20-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets** (public domain):

| file | source |
|---|---|
| `assets/alice-ball-1915-pd.jpg` | photograph of Alice Augusta Ball, 1915 (via Wikimedia Commons; 269x381 original) |
| `assets/alice-ball-1915-pd-2x-lanczos.jpg` | the same image scaled 2x (Lanczos and a mild unsharp mask; no added detail), used in the video |
| `assets/hollmann-1922-archives-of-dermatology-p95-pd.jpg` | H. T. Hollmann, "The fatty acids of chaulmoogra oil in the treatment of leprosy and other diseases", Archives of Dermatology and Syphilology, 1922, p. 95 (download stamp cropped) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) |

- The drop, syringe, spoon, tissue layers, molecule, ethyl caps, droplets, pages, plates and cards are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english20-01.mp4
node src/render.mjs --thumb aarambh-30s-english20-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english20-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
