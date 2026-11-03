# WastePaisa round-02 episode 01: brass scrap in old taps and door handles (Scrap Shop X-ray)
Deliverable: `wastepaisa-30s-round02-01.mp4` (30.000 s, 1080×1920, H.264 yuv420p 30 fps / 900 frames, AAC 48 kHz stereo).
Brief, script, sources, claim map, storyboard and QA: `PRODUCTION-NOTES.md` (= `context/15-round-02-01.md`). Format: `context/11-production-format.md`.
Post text with sources: `publishing-caption.txt`. QA evidence: `qa/`.
Renderer: the accepted `../2026-11-02-feedback-round/src/scene.html`, copied with new props and scene functions only (see the header comment in `src/scene.html`).

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
```bash
<venv-python with kokoro-onnx 0.6.1> -I audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # takes committed
python3 audio/mixr2.py                     # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js video video-only.mp4    # 900 frames @ 30 fps (~2 min)
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-round02-01.mp4
```
