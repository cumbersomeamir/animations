# Aarambh english-23 30 s #01: Inge Lehmann, "SHE HEARD THE IMPOSSIBLE"

**Final file:** `aarambh-30s-english23-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256: see `qa/sha256.txt`

**Thumbnail:** `aarambh-30s-english23-01-thumbnail.png` (1080x1920; it is frame 0)

- **Language:** English narration and English captions.
- **Topic:** the brief's subject (Inge Lehmann and the inner core) had not been covered by any earlier Aarambh episode; batch 22 used Elizebeth Friedman (codebreaking), so the question, setting and mechanism are all different. Reasoning in context/37.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Topic check, story structure, script, sources, claim map, QA: `../../../../context/37-production-30s-english23-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/inge-lehmann-1932-neuhaus-kb.jpg` | Wikimedia Commons "Inge Lehman.jpg" (1280 px standard-width copy of the 3370x4922 scan), photograph by Even Neuhaus (1863–1946), 1932, The Royal Library / National Library of Denmark | Commons tags `PD-Denmark50` and `CC BY-SA 4.0` |
| `assets/earth-blue-marble-2002-nasa-1920.jpg` | Wikimedia Commons "Land shallow topo 2048.jpg" (1920 px copy), NASA Visible Earth Blue Marble 2002, Reto Stöckli / NASA GSFC | `PD-USGov-NASA` |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- **Illustrations:** the Earth cutaway is rendered per pixel in `src/earth.mjs` (the NASA texture is regraded to the icon palette); the layer radii are PREM's (6371 / 3480 / 1221.5 km). Ray paths are traced through a simplified PREM-like P-wave profile by conserving the ray parameter (Snell's law). The seismograph, station pins, shadow band, lesson diagram and cards are original Canvas2D illustrations.
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98. "Inge Lehmann" is synthesised from the phonemes ˈɪŋə lˈeɪmən (ING-uh LAY-mun) via `phoneme_overrides` in `audio/script.json`.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S8.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english23-01.mp4
node src/render.mjs --thumb aarambh-30s-english23-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english23-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
node src/render.mjs --capbounds && bash tools/qa.sh && python tools/sync_table.py   # caption bounds, ffprobe/decode/loudness/first frame/contact sheets, sync table
```
