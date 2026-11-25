# Aarambh english-24 30 s #01: Tu Youyou, "THE CLUE WAS THE TEMPERATURE"

**Final file:** `aarambh-30s-english24-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256: see `qa/sha256.txt`

**Thumbnail:** `aarambh-30s-english24-01-thumbnail.png` (1080x1920; it is frame 0)

- **Language:** English narration and English captions.
- **Topic:** the brief's subject (Tu Youyou and the low-temperature extraction clue behind artemisinin) had not been covered by any earlier Aarambh episode. Batch 23 used Inge Lehmann (the Earth's inner core), so the question, setting and mechanism are all different. Reasoning in context/38.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).
- **Not medical advice:** the video tells a history of research and gives no treatment advice.

**Records:**
- Topic check, story structure, script, sources, claim map, QA: `../../../../context/38-production-30s-english24-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/tu-youyou-2015-bengt-nyman-ccby2.jpg` | Wikimedia Commons "D810 4987 Tu Youyou, medicine (22945001843).jpg" (1280 px standard-width copy of 3147x3147), photograph by Bengt Nyman, Stockholm, 6 December 2015 (Flickr) | `CC BY 2.0` (Flickr review passed) |
| `assets/gehong-zhouhou-beijifang-juan3-siku-734-407-pd.jpg` | Wikimedia Commons "文淵閣四庫全書 0734冊.djvu", page 412 (printed 734-407), right half-leaf of the lower spread: 肘後備急方 卷三, 治寒熱諸瘧方第十六, 晉 葛洪 撰, with the line 又方青蒿一握以水二升漬絞取汁盡服之 | `PD-scan` (`PD-old-100-expired`) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- **Illustrations:** the glassware, burner, thermometer, "active" sparks, herb bundle, bowl, ice bath, microscope view of infected red blood cells, crystal vial and lesson diagram are original Canvas2D drawings. The sparks are a visual metaphor for an active ingredient, not a depiction of molecules.
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98. "Tu Youyou" is synthesised from the phonemes tˈuː jˈoʊjˈoʊ ("too YOH-yoh") via `phoneme_overrides` in `audio/script.json`.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S8.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english24-01.mp4
node src/render.mjs --thumb aarambh-30s-english24-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english24-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
node src/render.mjs --capbounds && bash tools/qa.sh && python tools/sync_table.py   # caption bounds, ffprobe/decode/loudness/first frame/contact sheets, sync table
```
