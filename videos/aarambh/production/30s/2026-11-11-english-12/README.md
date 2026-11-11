# Aarambh english-12 30 s #01: Grace Hopper's "nanosecond you could hold"

**Final file:** `aarambh-30s-english12-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `2f84eccba3ab1c3c2f48b0a14a4b1c43da027a23da1214cdc0e58ab5c108ed53`

**Thumbnail:** `aarambh-30s-english12-01-thumbnail.png` (1080x1920, "HOLD A NANOSECOND")
- sha256 `b7346d3e44e9db761dd423380b32ed3fea4cd283b29865530c9bf29d76d93f51`

- **Language:** English narration and English captions.
- **Subject:** Hopper replaces the proposed Hedy Lamarr topic, which was already episodes 04 and 07 (see context/26).
- **Rules:** the first episode made under the 2026-11-11 rules (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map (measured / computed / illustrative), QA: `../../../../context/26-production-30s-english12-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/grace-hopper-navy-portrait-1984-pd.jpg` | official portrait of Commodore Grace M. Hopper, 1984, U.S. Navy photo by James S. Davis (Wikimedia Commons) | PD-USGov-Military-Navy |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The wire, ruler, bundle, globe, time cards, pepper grain, chips and paths are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english12-01.mp4
node src/render.mjs --thumb aarambh-30s-english12-01-thumbnail.png   # separate vertical thumbnail
python tools/asr_words.py aarambh-30s-english12-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
