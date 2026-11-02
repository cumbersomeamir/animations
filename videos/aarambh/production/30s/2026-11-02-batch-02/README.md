# Aarambh production 30 s #02: Ada Lovelace and Note G

**Final file:** `aarambh-30s-production-02.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `4ec3350b32b03ed58c50bea8f6e90192e862734c7d4848be3fe676c24ef67171`

**Records:**
- Brief, final script, source-to-claim map, storyboard and QA: `../../../../context/13-production-30s-02.md`
- Format rules and the user feedback log: `../../../../context/11-production-format.md`
- Post caption: `publishing-caption.txt`

**Assets (all from Wikimedia Commons, checked via the API on 2026-11-02):**
- `assets/ada-lovelace-chalon-c1840-PD.jpg`: "File:Ada_Lovelace_portrait.jpg", Alfred Edward Chalon, c. 1840, **public domain**
- `assets/note-g-bernoulli-diagram-1843-PD.jpg`: "File:Diagram_for_the_computation_of_Bernoulli_numbers.jpg", from Lovelace's Notes, **public domain**
- `assets/analytical-engine-science-museum-wichary-CCBY2.jpg`: "File:Analytical_Engine_(2290032530).jpg", Marcin Wichary, **CC BY 2.0**. It is credited on the page and in the post caption.
  - A Science Museum photo on Commons is CC BY-SA 2.0. It was deliberately not used: the style guide says to ask before using BY-SA.

**Also used:**
- Fonts: Fraunces and Inter (OFL, @fontsource), JetBrains Mono (OFL)
- Music and SFX: original procedural
- Voice: Kokoro-82M ONNX v1.0, 0.7 af_bella + 0.3 am_puck, speed 0.98, en-us
- Style module, read-only: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/archive-lighttable/STYLE.md

## Rebuild
```bash
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>      # optional; takes committed in audio/narration/
node src/render.mjs --cues && python audio/build_audio.py          # SFX cues from word timings; build/mix.wav at −15 LUFS
node src/render.mjs --out build/video.mp4                          # ~80 s
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-production-02.mp4
```
