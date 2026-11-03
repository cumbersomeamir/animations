# Aarambh round-02 30 s #01: Hedy Lamarr & George Antheil, frequency hopping

**Final file:** `aarambh-30s-round02-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- sha256 `7a3f6da5aa13e91425570956991a585e4efa5d61167a47989dc6dca0bd53b54f`

**Records:**
- Script, sources, claim map, storyboard and QA: `../../../../context/15-production-30s-round02-01.md`
- Accepted recipe and the CTA correction: `../../../../context/11-production-format.md`
- Post copy with sources: `publishing-caption.txt`

**Assets:**
- `assets/us2292387-sheet2-figs7-4.png` and `assets/us2292387-sheet2-signatures.png`: crops of U.S. Patent 2,292,387 drawing sheet 2 (U.S. patent drawings are generally not subject to copyright), from patentimages.storage.googleapis.com.
- `assets/aarambh-icon.png`: copied from `videos/aarambh/assets/icon.png`.
- All other visuals are original Canvas2D illustration (`src/render.mjs`, based on the accepted feedback-round renderer).
- Music and SFX: original procedural (`audio/build_audio.py`).
- Voice: cached Kokoro-82M ONNX v1.0, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98.

## Rebuild
```bash
node src/render.mjs --cues && python audio/build_audio.py
node src/render.mjs --out build/video.mp4
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-round02-01.mp4
```
