# Help — english-08 (2026-11-07) 30 s #01 (English): "A fresh salad or a tin: which one can you donate?"

**Final:** `help-30s-english08-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `455326f9ef5628e409edd14f70efd62ba69a7e187f8f4ae56a09cb8aecec4e3b`.
Accepted renderer/primitives reused from english-07 (`src/stage.html` head unchanged; new food-label props). Subject changed from the suggested
cold-storage topic (covered by round-02) — see `../../../context/21-production-30s-english08-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (deeper duck 0.72 this episode)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json (asserts every spoken word is captioned)
node render.mjs                          # build/video.mp4 (~3.5 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english08-01.mp4
node render.mjs --capbounds
```
