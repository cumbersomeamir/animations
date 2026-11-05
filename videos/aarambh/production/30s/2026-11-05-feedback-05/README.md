# Aarambh feedback-05 30 s #01 (Hindi): Hedy Lamarr & George Antheil, frequency hopping

**Final file:** `aarambh-30s-feedback05-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `6b8e384b9d30e5f072fd199b203a6bf26296d103b378650d6b8dab6004ebd7a4`
- **Language:** all narration and captions are Hindi (Devanagari).

**Records:**
- Script (Hindi + gloss), sources, claim map, storyboard, QA: `../../../../context/18-production-30s-feedback05-01.md`
- Accepted recipe, CTA correction, Hindi notes and feedback-05 notes: `../../../../context/11-production-format.md`
- Publishing caption (Hindi, matches the final transcript): `publishing-caption.txt`

**Assets:**

| file | source | rights |
|---|---|---|
| `assets/hedy-lamarr-screenland-oct-1942-cover.jpg` | *Screenland*, October 1942 cover; Internet Archive `screenland45unse`, page n440 (Library of Congress MBRS copy); binding edge cropped | IA: "Library of Congress has determined that this item is not in copyright"; Commons copy tagged PD-US-not renewed |
| `assets/george-antheil-berenice-abbott-1927.jpg` | Wikimedia Commons "File:Antheil 1927.jpg", Berenice Abbott, 1927 | PD-US-expired |
| `assets/us2292387-sheet2-figs7-4.png`, `assets/us2292387-sheet2-signatures.png` | U.S. Patent 2,292,387, drawing sheet 2 (reused from this app's round-02) | U.S. patent drawings are generally not subject to copyright |
| `assets/aarambh-icon.png` | `videos/aarambh/assets/icon.png` | app's own icon |

- Channels, ships, torpedo, jammer, rolls and skill cards are original Canvas2D illustrations, labelled "चित्रण".
- **Fonts:** Noto Sans Devanagari, Noto Serif Devanagari, Fraunces and Inter via `@fontsource` 5.3.0 (SIL OFL); JetBrains Mono (system).
- **Voice:** Kokoro-82M ONNX v1.0 Hindi voice `hf_alpha`, `lang="hi"`, speed 1.05 (Apache-2.0 model, stock voice, no imitation).
- **Music and SFX:** original procedural (`audio/build_audio.py`); music is ducked under speech.

## Rebuild (from this folder)
```bash
npm ci
python audio/tts_kokoro_hi.py <kokoro-v1.0.onnx> <voices-v1.0.bin>      # Hindi narration -> audio/narration/S1..S7.wav (committed takes are canonical)
python tools/place_vo.py                                               # build/vo_timing.wav (narration at script.json starts)
python tools/asr_words_hi.py build/vo_timing.wav qa/asr_words_narration.json --models <cache>   # word timings (committed)
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-feedback05-01.mp4
python tools/asr_words_hi.py aarambh-30s-feedback05-01.mp4 qa/asr_words_final.json --models <cache>  # Hindi ASR QA
```
