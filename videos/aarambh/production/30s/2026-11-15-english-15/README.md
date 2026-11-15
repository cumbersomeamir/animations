# Aarambh english-15 30 s #01: Frances Oldham Kelsey and thalidomide, "STOPPED AT THE DOOR"

**Final file:** `aarambh-30s-english15-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `86d5532a47693f9b085d26c0912653be425f364867108f2c3134034776764a29`

**Thumbnail:** `aarambh-30s-english15-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `9ac8544aecedc112a168aae2b6ef877046968574cb98af3a0b2b4cd6731014bb`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules plus the 2026-11-15 first-frame addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, scope notes, QA: `../../../../context/29-production-30s-english15-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets** (all U.S. government works, public domain):

| file | source |
|---|---|
| `assets/frances-kelsey-portrait-nlm-pd.png` | National Library of Medicine, Changing the Face of Medicine (via Wikimedia Commons) |
| `assets/kevadon-thalidomide-1960-fda-pd.jpg` | U.S. FDA history photo "Kevadon (thalidomide), 1960" (via Wikimedia Commons) |
| `assets/frances-kelsey-1960s-fda171-pd.jpg` | U.S. FDA history photo "Frances O. Kelsey (FDA 171)", 1960s (via Wikimedia Commons) |
| `assets/drug-detective-poster-fda113-pd.jpg` | U.S. FDA "Frances O. Kelsey (FDA 113)" Civil Service poster; candidate, not used in the video |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) |

- The "door" bar, evidence gauge, envelopes, building, timeline, stamps and scale are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english15-01.mp4
node src/render.mjs --thumb aarambh-30s-english15-01-thumbnail.png   # thumbnail = frame 0
python tools/asr_words.py aarambh-30s-english15-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
