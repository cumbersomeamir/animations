# Help — production 30 s #01: "Before donating clothes, ask these three questions"

**Final:** `help-30s-production-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo ·
SHA-256 `470743a39e6d7ec540699ee26cd98df33dafae8c2483c2304a41d1da2a2ec80b`. Post text: `publishing-caption.txt`. QA: `QA.md`.
Brief, final script, claim map and storyboard: `../../../context/12-production-30s-01.md`. Format rules: `../../../context/11-production-format.md`.

Style: Shadow Puppetry — https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/shadow-puppet/STYLE.md (read-only art direction; original Canvas2D code).
Voice: Kokoro-82M ONNX, Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (cached model, see context/11).

## Rebuild
```bash
# voice (needs the cached Kokoro venv/models from tests/10s/pre-reset-2026-11-02)
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py
python3 audio/mix30.py                 # build/mix.wav + build/voice_track.wav
# one ASR pass (Vosk, QA-only, not committed) -> qa/asr-voice-track.txt, then:
python3 tools_captions.py              # src/captions.json
node render.mjs                        # build/video.mp4 (~8.5 min, Canvas2D in headless Chromium)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-production-01.mp4
node render.mjs --capbounds            # qa/caption-bounds.json
```
