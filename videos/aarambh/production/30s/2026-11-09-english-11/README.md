# Aarambh english-11 30 s #01: Gideon Sundback, the 1917 separable fastener and its slider

**Final file:** `aarambh-30s-english11-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `00156882edde88febff20428b144be783d3152faee907f982017d47ad3e9353f`
- **Language:** English narration and English captions.
- **Subject:** Sundback replaces the suggested Garrett Morgan topic, which was already episode 09 (see context/24).

**Records:**
- Script, sources, claim map, storyboard, QA: `../../../../context/24-production-30s-english11-01.md`
- Accepted recipe, CTA correction and English notes: `../../../../context/11-production-format.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/gideon-sundback-portrait-pd.jpg` | Wikimedia Commons "File:Gideon Sundback.jpg" (c. 1920) | PD-old (Commons) |
| `assets/us1219881-sheet1.png` | U.S. Patent 1,219,881, drawing sheet (header + Figs. 1–9), cropped from the USPTO full-image PDF | U.S. patent drawings are generally not subject to copyright |
| `assets/us1219881-fig1-slider.png` | U.S. Patent 1,219,881, Fig. 1 (slider on the stringers) | as above |
| `assets/us1219881-fig2-locking.png` | U.S. Patent 1,219,881, Fig. 2 (locking and unlocking); stray Fig. 8 labels masked white | as above |
| `assets/us1219881-fig4-member.png` | U.S. Patent 1,219,881, Fig. 4 (one locking member) | as above |
| `assets/us1219881-fig9-nesting.png` | U.S. Patent 1,219,881, Fig. 9 (members nested); a Fig. 3 fragment masked white | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- The zipper hook, the alternating-teeth strip, the opening demo (after patent Fig. 1) and the lesson diagram are original Canvas2D illustrations, labelled "ILLUSTRATION".
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english11-01.mp4
python tools/asr_words.py aarambh-30s-english11-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
