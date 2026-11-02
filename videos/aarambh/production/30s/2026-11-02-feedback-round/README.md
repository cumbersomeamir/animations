# Aarambh feedback-round 30 s #01: George de Mestral and the hook-and-loop fastener

**Final file:** `aarambh-30s-feedback-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `97ba7e3b63d505d7a89afefd481f6ee3af1e2c2695fb0976468944ebd501d66a`

**Records:**
- Script, sources, claim map, storyboard and QA: `../../../../context/14-production-30s-feedback-01.md`
- Format rules and the exact style recipe: `../../../../context/11-production-format.md` ("FEEDBACK ROUND")
- Post copy with sources: `publishing-caption.txt`

**Assets:**
- All illustrations are original (Canvas2D, `src/render.mjs`).
- The app icon is copied from `videos/aarambh/assets/icon.png`.
- Fonts: Fraunces and Inter (OFL), JetBrains Mono (OFL).
- Music and SFX: original procedural (`audio/build_audio.py`).
- Voice: Kokoro-82M ONNX v1.0 (cached), 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98. Takes are in `audio/narration/`.

## Rebuild
```bash
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-feedback-01.mp4
```
