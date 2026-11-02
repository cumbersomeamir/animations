# WastePaisa production 30s-02: "Why one aluminium can can become another can"
Deliverable: `wastepaisa-30s-production-02.mp4` (30.000 s, 1080×1920, H.264 yuv420p 30 fps / 900 frames, AAC 48 kHz stereo).
Brief, final script, claim map, storyboard and QA: `PRODUCTION-NOTES.md` (= `context/13-production-30s-02.md`). Format and feedback: `context/11-production-format.md`.
Post text with sources: `publishing-caption.txt`. QA evidence: `qa/` (ffprobe.txt, decode.log, loudness.txt, caption-bounds.json, asr.json/asr.txt, contact-full.png, contact-transitions.png, audio-spectrogram.png).

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
```bash
<venv-python with kokoro-onnx 0.6.1> -I audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # takes committed
python3 audio/mix30.py                      # -> audio/mix.wav (1,440,000 samples, -15 LUFS / -1.5 dBTP)
node src/render.js video video-only.mp4     # 360 stepped 12 fps frames (6 paper-cut scenes, 6 transitions) -> 900 frames @ 30 fps (~40 s)
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-production-02.mp4
```
