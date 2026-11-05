# WastePaisa english-06 episode 01: Coconut shells into charcoal briquettes (English, Scrap Shop X-ray)
Deliverable: `wastepaisa-30s-english06-01.mp4`. Spec:
- 30.000 s, 1080×1920
- H.264 yuv420p, 30 fps / 900 frames
- AAC 48 kHz stereo
- English narration and English captions

Where things are:
- **Brief, script and research:** the brief, final script, sources, illustrative batch, claim map, storyboard and QA are in
  `PRODUCTION-NOTES.md` (= `context/19-english-06-01.md`).
- **Format:** `context/11-production-format.md`.
- **Post text with sources:** `publishing-caption.txt` (matches the final transcript).
- **QA evidence:** `qa/`.
- **Renderer:** the accepted `../2026-11-05-feedback-05/src/scene.html`, copied with new coconut/charcoal props and scenes, and English
  captions at the accepted 70 px line spacing.

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mixe6.py                     # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js video video-only.mp4    # 900 frames @ 30 fps; also writes qa/caption-bounds.json
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-english06-01.mp4
```
