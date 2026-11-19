# WastePaisa english-22 episode 01: Trash with a buyer. (a discarded coconut shell sanded, oiled, drilled and roped into a hanging planter, English, Scrap Shop X-ray)
Deliverables:
- `wastepaisa-30s-english22-01.mp4`: 30.000 s, 1080×1920, H.264 yuv420p, 30 fps / 900 frames, AAC 48 kHz stereo, English narration and captions.
- `wastepaisa-30s-english22-01-thumbnail.png`: separate 1080×1920 thumbnail = the frame-zero composition ("TRASH WITH A BUYER").

Where things are:
- **Brief and research:** topic check (kept: english-06 sold shells to the charcoal-briquette trade; this is a hand-finished planter), final
  script, sources, labelled unit economics (revenue vs margin), claim map, storyboard and QA are in `PRODUCTION-NOTES.md`
  (= `context/35-english-22-01.md`).
- **Rules:** `context/11-production-format.md`, including the 2026-11-17 live feedback and the 2026-11-19 caption band (ink y ~280–460).
- **Post text with sources:** `publishing-caption.txt` (matches the final transcript).
- **QA evidence:** `qa/`.
- **Renderer:** the accepted `../2026-11-18-english-21/src/scene.html`, copied with new coconut-shell props (half shell rough → sanded → oiled,
  drain hole, jute hanger, plant, spotlight wall shadow, coconuts, crates, container) and scenes; caption centre moved from y 430 to y 375.

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mixe22.py                    # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js captions                # optional: caption bounds only -> qa/caption-bounds.json
node src/render.js video video-only.mp4    # 900 frames @ 30 fps; also writes qa/caption-bounds.json
node src/render.js thumb wastepaisa-30s-english22-01-thumbnail.png
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-english22-01.mp4
```
