# Aarambh english-25 30 s #01: Henrietta Leavitt, "A BLINK MEASURES SPACE"

**Final file:** `aarambh-30s-english25-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256: see `qa/sha256.txt`

**Thumbnail:** `aarambh-30s-english25-01-thumbnail.png` (1080x1920; it is frame 0)

- **Language:** English narration and English captions.
- **Topic replacement:** the brief suggested Mary Anning reading a sea monster in the cliffs (Joseph's skull, Mary's body, the evidence for a marine reptile). That subject and mechanism were already delivered as episode 21 (english-19, `../../../../context/33-production-30s-english19-01.md`), so, as the brief instructs, this episode uses an unrelated subject in the same genre: Henrietta Swan Leavitt and the period–luminosity relation of Cepheid variables. Reasoning in context/39.
- **Rules:** made under the 2026-11-11 rules, the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (`../../../../context/25-feedback-2026-11-11-story-rules.md`).

**Records:**
- Topic check, story structure, script, sources, claim map, QA: `../../../../context/39-production-30s-english25-01.md`
- Publishing caption (matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | licence |
|---|---|---|
| `assets/henrietta-leavitt-c1898-pd.jpg` | Wikimedia Commons "Henrietta Swan Leavitt.jpg" (1280 px standard-width copy of 2388x3171), photographer unknown, c. 1898; published in Popular Astronomy 30, no. 4 (April 1922) | public domain (published in the U.S. before 1931) |
| `assets/leavitt-1912-circular173-fig2-pd.png` | Wikimedia Commons "HSLeavittHSCr13Fig2 1912.png" (1280 px copy of 1509x1566): Fig. 2 of "Periods of 25 Variable Stars in the Small Magellanic Cloud", Harvard College Observatory Circular 173 (1912), prepared by Leavitt, signed by E. C. Pickering | public domain |
| `assets/andromeda-isaac-roberts-1899-pd.jpg` | Wikimedia Commons "Pic iroberts1.jpg" (569x371): Isaac Roberts, Great Andromeda Nebula, *A Selection of Photographs of Stars, Star-clusters and Nebulae*, vol. II (1899) | public domain (author died 1904) |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` (app's own icon) | — |

- **Illustrations:** the stars and their light curves, the two-star depth diagram, the star cloud, Earth, the drawn graph, the lookup arrow, the telescope, the tape measure, the Milky Way disc and the lesson diagram are original Canvas2D drawings. Star "blinks" are sped up (real Cepheids take days to months per cycle); the cloud stands in for the Small Magellanic Cloud; the ringed star on the Roberts photograph marks an illustrative position, not Hubble's actual variable.
- **Fonts:** Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0, approved Meshline/Recall blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98. "Leavitt" is synthesised as lˈɛvɪt (LEV-it) via `phoneme_overrides` in `audio/script.json`.
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>        # English narration -> audio/narration/S1..S8.wav
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-english25-01.mp4
node src/render.mjs --thumb aarambh-30s-english25-01-thumbnail.png   # thumbnail = frame 0 (saved as RGB)
python tools/asr_words.py aarambh-30s-english25-01.mp4 qa/asr_words_final.json --models <cache>  # ASR QA (tiny.en; small cross-check in qa/)
node src/render.mjs --capbounds && bash tools/qa.sh && python tools/sync_table.py   # caption bounds, ffprobe/decode/loudness/first frame/contact sheets, sync table
```
