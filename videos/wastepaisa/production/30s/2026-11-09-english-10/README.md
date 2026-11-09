# WastePaisa english-10 episode 01: Sell a used box by the kilo, or as a box? (cardboard box reuse before scrap, English, Scrap Shop X-ray)
Deliverable: `wastepaisa-30s-english10-01.mp4`. Spec:
- 30.000 s, 1080×1920
- H.264 yuv420p, 30 fps / 900 frames
- AAC 48 kHz stereo
- English narration and English captions

Where things are:
- **Brief and research:** the brief, topic decision, final script, sources, illustrative batch, claim map, storyboard and QA are in
  `PRODUCTION-NOTES.md` (= `context/23-english-10-01.md`).
- **Format:** `context/11-production-format.md`.
- **Post text with sources:** `publishing-caption.txt` (matches the final transcript).
- **QA evidence:** `qa/`.
- **Renderer:** the accepted `../2026-11-08-english-09/src/scene.html`, copied with new box/scale/shelf/buyer props and scenes.

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mixe10.py                    # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js captions                # optional: caption bounds only -> qa/caption-bounds.json
node src/render.js video video-only.mp4    # 900 frames @ 30 fps; also writes qa/caption-bounds.json
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-english10-01.mp4
```
