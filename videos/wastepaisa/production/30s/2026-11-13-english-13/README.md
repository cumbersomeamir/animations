# WastePaisa english-13 episode 01: Why does a mill pay ₹8 more a kilo for some iron? (steel scrap grades, English, Scrap Shop X-ray)
Deliverables:
- `wastepaisa-30s-english13-01.mp4`: 30.000 s, 1080×1920, H.264 yuv420p, 30 fps / 900 frames, AAC 48 kHz stereo, English narration and captions.
- `wastepaisa-30s-english13-01-thumbnail.png`: separate 1080×1920 thumbnail ("THICK BEATS THIN.").

Where things are:
- **Brief and research:** topic decision (the proposed cardboard-air topic was already covered), final script, sources, same-truck
  example, claim map, storyboard and QA are in `PRODUCTION-NOTES.md` (= `context/26-english-13-01.md`).
- **Rules:** `context/11-production-format.md`, section "PUBLISHED-APPS FEEDBACK RULES (2026-11-11)".
- **Post text with sources:** `publishing-caption.txt` (matches the final transcript).
- **QA evidence:** `qa/`.
- **Renderer:** the accepted `../2026-11-11-english-12/src/scene.html`, copied with new steel-scrap props and scenes.

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mixe13.py                    # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js captions                # optional: caption bounds only -> qa/caption-bounds.json
node src/render.js video video-only.mp4    # 900 frames @ 30 fps; also writes qa/caption-bounds.json
node src/render.js thumb wastepaisa-30s-english13-01-thumbnail.png
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-english13-01.mp4
```
