# Aarambh english-08 30 s #01: Samuel F. B. Morse, painter turned telegraph inventor

**Final file:** `aarambh-30s-english08-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `7ae642a952e47114de2e4ebb5256a4a5b1ee0a7696e1f2cc9a0f5d5523f71aec`
- **Language:** English narration and English captions.
- **Subject:** Morse replaces the suggested Lamarr & Antheil topic, which was already episodes 04 and 07 (see context/21).

**Records:**
- Script, sources, claim map, storyboard, QA: `../../../../context/21-production-30s-english08-01.md`
- Accepted recipe, CTA correction and English notes: `../../../../context/11-production-format.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/samuel-morse-brady-loc-cwpbh00853.jpg` | Library of Congress, Brady-Handy collection, cwpbh.00853 (tile.loc.gov) | PD-old-100-1923 (Commons record of the same image) |
| `assets/samuel-morse-with-recorder-brady-1857.jpg` | Wikimedia Commons "File:Samuel Morse with his Recorder by Brady, 1857.png" | PD-old-100 |
| `assets/us1647-sheet3-register.png` | U.S. Patent 1,647, drawing sheet 3 (Register), cropped from the USPTO full-image PDF | U.S. patent drawings are generally not subject to copyright |
| `assets/us1647-sheet1-example3-letters.png` | U.S. Patent 1,647, drawing sheet 1, "Example 3, For Letters" | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The map/wire, tape, circuit demo and lesson cards are original Canvas2D illustrations, labelled "ILLUSTRATION".
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S6.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english08-01.mp4
python tools/asr_words.py aarambh-30s-english08-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
