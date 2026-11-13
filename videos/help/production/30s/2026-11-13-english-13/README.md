# Help — english-13 (2026-11-13) 30 s #01 (English): "This food bank looks like a shop, on purpose." — client-choice pantries

**Final:** `help-30s-english13-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `ec4d5ded9706b9aebb4da1fd34915ce88c68c5a47a02a731fcac9489dcf8b538`.
**Thumbnail:** `help-30s-english13-thumbnail.png` (1080×1920; "PICK, DON'T PACK.").
Rules: `../../../context/11-production-format.md` (Update 2026-11-11 + 2026-11-13). Record: `../../../context/26-production-30s-english13-01.md`.
Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~5 min)
node render.mjs --thumb                  # help-30s-english13-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english13-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
