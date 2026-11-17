# Aarambh english-19 30 s #01: Mary Anning and her first ichthyosaur, "A MONSTER IN THE CLIFF?"

**Final file:** `aarambh-30s-english19-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `b75dd5278810de64499fb4179985f17de5e608304dd7ff99d6e5024e10a24d7e`

**Thumbnail:** `aarambh-30s-english19-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `8ad6da84666d60a5f35dd139def2128b854b91dd84d01ae7d7a5752ebbce7513`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules plus the 2026-11-15 first-frame addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map, scope notes, QA: `../../../../context/33-production-30s-english19-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets** (public domain):

| file | source |
|---|---|
| `assets/mary-anning-portrait-before-1842-nhm-pd.jpg` | portrait of Mary Anning with her dog Tray, before 1842 (Natural History Museum, London; via Wikimedia Commons) |
| `assets/home-1814-ichthyosaur-skull-plate-pd.jpg` | Everard Home, 1814, plate of the ichthyosaur skull found by Joseph and Mary Anning (Philosophical Transactions; via Wikimedia Commons) |
| `assets/home-1814-ichthyosaur-skeleton-plate-pd.jpg` | Everard Home, 1814, plate of part of the skeleton found in 1812 (via Wikimedia Commons) |
| `assets/de-la-beche-duria-antiquior-1830-pd.jpg` | Henry De la Beche, *Duria Antiquior*, 1830 (via Wikimedia Commons) |
| `assets/mary-anning-plesiosaur-letter-1823-wellcome-pd.jpg` | Mary Anning's letter with a plesiosaur sketch, 26 December 1823 (Wellcome Collection; via Wikimedia Commons) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) |

- The ichthyosaur outline, rock, plates, rings, stamp and cards are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english19-01.mp4
node src/render.mjs --thumb aarambh-30s-english19-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english19-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
