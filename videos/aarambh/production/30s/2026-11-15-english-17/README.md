# Aarambh english-17 30 s #01: Stephanie Kwolek and Kevlar, "A THREAD THAT SAVED LIVES"

**Final file:** `aarambh-30s-english17-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `b2b0f2bd7d411d9a4f3400aa2e4e7f07ac84c266d20a16e60e3ba10818a8c2b0`

**Thumbnail:** `aarambh-30s-english17-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `d7a5453a8ae716db09ebaab300e328b1461859c9b146f45a34f1e1a1cc2d0e03`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules plus the 2026-11-15 first-frame addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, scope notes, QA: `../../../../context/31-production-30s-english17-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/stephanie-kwolek-harry-kalish-shi-cc-by-sa-3.jpg` | Stephanie Kwolek, photograph by Harry Kalish (Science History Institute; via Wikimedia Commons) | CC BY-SA 3.0 |
| `assets/us-patent-3671542-kwolek-1972-p1-pd.jpg` | U.S. Patent 3,671,542, first page (1972) | public domain |
| `assets/kevlar-yarn-sample-industriemuseum-gent-cc0.jpg` | sample of 100% Kevlar yarn (Industriemuseum Gent; via Wikimedia Commons) | CC0 |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- The thread and weight, beaker, spinneret, chains, tangle, clamps, bars, vest and tag are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english17-01.mp4
node src/render.mjs --thumb aarambh-30s-english17-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english17-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
