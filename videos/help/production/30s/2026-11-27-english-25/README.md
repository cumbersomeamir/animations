# Help — english-25 (2026-11-27, batch 25) 30 s #01 (English): "One pot. No meal." — a community kitchen runs on staples and fuel, not just a donated pot

**Final:** `help-30s-english25-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `542e143b183bd8c5cae216ce8a45a597cb190c098dd539baacdb6c60d7243245`.
**Thumbnail:** `help-30s-english25-thumbnail.png` (= frame 0 + "ONE POT. NO MEAL.").
Rules: `../../../context/11-production-format.md`. Record: `../../../context/33-production-30s-english25-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline; per-sentence "tts" spellings
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~4 min)
node render.mjs --thumb                  # help-30s-english25-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english25-01.mp4
node render.mjs --capbounds              # rule (2026-11-19 brief): x 100-900, y 280-460
```
