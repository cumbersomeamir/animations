# Help — english-21 (2026-11-18, batch 21) 30 s #01 (English): "Free for 21 days" — why a birth certificate matters and how to get one on time

**Final:** `help-30s-english21-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `b0fde7277ccc8099f332dd12a2f9d9f4eaef81f4dbedd6765aea9eb53b14750a`.
**Thumbnail:** `help-30s-english21-thumbnail.png` (= frame 0 + "FREE FOR 21 DAYS.").
Rules: `../../../context/11-production-format.md`. Record: `../../../context/33-production-30s-english21-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline; per-sentence "tts" spellings
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~4 min)
node render.mjs --thumb                  # help-30s-english21-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english21-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
