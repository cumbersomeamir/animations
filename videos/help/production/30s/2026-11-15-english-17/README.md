# Help — english-17 (2026-11-15, batch 17) 30 s #01 (English): "One step. Zero access." — why a ramp has to be 1 in 12

**Final:** `help-30s-english17-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `b1463217e515bc69c1d630f426ec9808c2826cc1fc19895e94227a6ddd664fe5`.
**Thumbnail:** `help-30s-english17-thumbnail.png` (= frame 0 + "ONE STEP. ZERO ACCESS.").
Rules: `../../../context/11-production-format.md` (Update 2026-11-11 + later, incl. the 2026-11-15 first-frame rule).
Record: `../../../context/30-production-30s-english17-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline; per-sentence "tts" spellings
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~3 min)
node render.mjs --thumb                  # help-30s-english17-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english17-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
