# Help — english-18 (2026-11-15, batch 18) 30 s #01 (English): "Same sun. Two roofs." — why a white roof can make a home easier to live in

**Final:** `help-30s-english18-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `198bd1a31888e452fff08ad137bfafed2ea36e6a2aa3e14bfff06b2a82ab466e`.
**Thumbnail:** `help-30s-english18-thumbnail.png` (= frame 0 + "SAME SUN. TWO ROOFS.").
Rules: `../../../context/11-production-format.md` (Update 2026-11-11 + later, incl. the 2026-11-15 first-frame rule).
Record: `../../../context/31-production-30s-english18-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline; per-sentence "tts" spellings
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~5 min)
node render.mjs --thumb                  # help-30s-english18-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english18-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
