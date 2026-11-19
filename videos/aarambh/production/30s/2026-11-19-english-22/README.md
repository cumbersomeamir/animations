# Aarambh english-22 30 s #01: Elizebeth Friedman, codebreaker, "SHE READ THEIR SECRETS"

**Final file:** `aarambh-30s-english22-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `0a8731d84956ce6b8f34604c875123f0bf5bcf1ca1639bf38826ea83b6485db7`

**Thumbnail:** `aarambh-30s-english22-01-thumbnail.png` (1080x1920; identical composition to frame 0)
- sha256 `a3d5e7c5a122e1615ec0f857eca0f7a637058bd325dfcccc631e44119e0239aa`

- **Language:** English narration and English captions.
- **Topic:** the brief suggested Hedy Lamarr's frequency hopping, which this app already covered (episodes 04 and 07). This episode keeps the brief's lesson (changing a pattern protects a signal) with a new person. The reasoning is in context/36.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Topic replacement, story structure, script, sources, claim map, QA: `../../../../context/36-production-30s-english22-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/elizebeth-friedman-nsa-pd.jpg` | Wikimedia Commons "Elizebeth-Friedman.jpg" (480x640), source NSA website | Commons tag `PD-USGov` |
| `assets/elizebeth-friedman-nsa-pd-2x.jpg` | the same image scaled 2x (Lanczos, mild unsharp; no added detail), used in the video | as above |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- The radio dial, coded letter tiles, padlocks, keys, swap box, message slips, rotor and cards are original Canvas2D illustrations. The letter mappings are illustrative, not real messages.
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
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english22-01.mp4
node src/render.mjs --thumb aarambh-30s-english22-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english22-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
```
