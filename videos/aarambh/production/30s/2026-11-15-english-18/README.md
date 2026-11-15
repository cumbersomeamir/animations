# Aarambh english-18 30 s #01: John Snow and the Broad Street pump, "ONE HANDLE. MANY LIVES."

**Final file:** `aarambh-30s-english18-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `90166fbac1f41adbe3720210c343f1275c7508c393265f0eaf83d888eafe5586`

**Thumbnail:** `aarambh-30s-english18-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `37fffed7016208ef9190d2babec0a10b2e6709580c6c190d40ba80bb14670372`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules plus the 2026-11-15 first-frame addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, scope notes, QA: `../../../../context/32-production-30s-english18-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets** (public domain):

| file | source |
|---|---|
| `assets/john-snow-portrait-1856-pd.jpg` | John Snow, autotype of an 1856 photograph (via Wikimedia Commons) |
| `assets/snow-broad-street-map-1854-pd.jpg` | John Snow's map of the deaths around Broad Street, from *On the Mode of Communication of Cholera* (1855) (via Wikimedia Commons; central crop) |
| `assets/snow-1855-title-page-wellcome-pd.jpg` | title page of *On the Mode of Communication of Cholera*, 2nd ed. (1855), Wellcome Collection (Internet Archive `b28985266`) |
| `assets/snow-1855-table1-fatal-attacks-by-day.csv` | Snow's Table 1, fatal attacks by day (HistData `Snow.dates`, via Rdatasets) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) |

- The pump, fog, rings, plates, the chart drawn from Table 1, and the cards are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english18-01.mp4
node src/render.mjs --thumb aarambh-30s-english18-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english18-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
