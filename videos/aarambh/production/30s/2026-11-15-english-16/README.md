# Aarambh english-16 30 s #01: Florence Nightingale and the polar-area chart, "NOT THE WOUNDS"

**Final file:** `aarambh-30s-english16-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `7198a45442f00b446e957304fadf4dff0e4c2e0886b7f91849d4e7213e0d388f`

**Thumbnail:** `aarambh-30s-english16-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `2b762a6efcbfb5ae1ad54ae9605e5b999947892ebb45185e0e64814a90ab7c3b`

- **Language:** English narration and English captions.
- **Rules:** made under the 2026-11-11 rules plus the 2026-11-15 first-frame addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Story structure, script, sources, claim map (measured vs interpretive), QA: `../../../../context/30-production-30s-english16-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets** (public domain):

| file | source |
|---|---|
| `assets/florence-nightingale-hering-npg-x82368-pd.jpg` | Henry Hering, photograph of Florence Nightingale, c. 1860 (National Portrait Gallery, London, x82368; via Wikimedia Commons) |
| `assets/nightingale-diagram-causes-of-mortality-1858-pd.jpg` | Nightingale, "Diagram of the Causes of Mortality in the Army in the East" (via Wikimedia Commons, "Nightingale-mortality.jpg") |
| `assets/sanitary-commission-report-1857-title-wellcome-pd.jpg` | title page of the 1857 report to Lord Panmure on the Sanitary Commission, 1855–56 (Wellcome Collection, Internet Archive `b24757354`) |
| `assets/nightingale-monthly-deaths-1854-1856.csv` | her monthly figures, April 1854 – March 1856 (HistData `Nightingale`, via Rdatasets) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) |

- The before/after roses in scene 4 are redrawn from the CSV (area-true: radius ∝ sqrt(rate)) and labelled so on screen. The pipe, stamp, arrows, "?" marks and cards are original Canvas2D illustrations.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english16-01.mp4
node src/render.mjs --thumb aarambh-30s-english16-01-thumbnail.png   # thumbnail = frame 0
python tools/asr_words.py aarambh-30s-english16-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
