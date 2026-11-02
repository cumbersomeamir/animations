# WastePaisa feedback-round 01: "What's inside an old cable" (Scrap Shop X-ray)
Deliverable: `wastepaisa-30s-feedback-01.mp4` (30.000 s, 1080×1920, H.264 yuv420p 30 fps / 900 frames, AAC 48 kHz stereo).
Brief, final script, sources, claim map, storyboard and QA: `PRODUCTION-NOTES.md` (= `context/14-feedback-round-01.md`). Rules and the
style recipe: `context/11-production-format.md` (Feedback round rules; Style recipe B "Scrap Shop X-ray").
Post text with sources: `publishing-caption.txt`. QA evidence: `qa/` (ffprobe.txt, decode.log, loudness.txt, caption-bounds.json,
asr.json/asr.txt, contact-full.png, contact-transitions.png, audio-spectrogram.png).

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
```bash
<venv-python with kokoro-onnx 0.6.1> -I audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # takes committed
python3 audio/mixfb.py                     # subtle pad (no loops) + event SFX + voice -> audio/mix.wav (-15 LUFS / -1.5 dBTP)
node src/render.js video video-only.mp4    # 900 frames @ 30 fps, smooth camera travel (~2 min)
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-feedback-01.mp4
```
