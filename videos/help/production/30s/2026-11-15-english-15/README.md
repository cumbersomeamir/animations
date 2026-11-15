# Help — english-15 (2026-11-15) 30 s #01 (English): "The empty seat" — why a school meal does more than fill a stomach

**Final:** `help-30s-english15-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `bc2eeb24f39edaf1e8bead553ee67c60105695a747a408018ea1104b3b22cdb8`.
**Thumbnail:** `help-30s-english15-thumbnail.png` (= frame 0 + "THE EMPTY SEAT.").
Rules: `../../../context/11-production-format.md` (Update 2026-11-11 + later updates, incl. the 2026-11-15 first-frame rule).
Record: `../../../context/28-production-30s-english15-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json (first card >= 0.07 s)
node render.mjs                          # build/video.mp4 (~5 min)
node render.mjs --thumb                  # help-30s-english15-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -af volume=-0.3dB -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english15-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
