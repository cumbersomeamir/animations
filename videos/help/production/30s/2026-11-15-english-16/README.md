# Help — english-16 (2026-11-15, batch 16) 30 s #01 (English): "No address, no access?" — the address-certificate route for Aadhaar

**Final:** `help-30s-english16-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `aa258415ebb7acb5d7c6c6a0c29412bbc45e9e9d3ec19268a06f33f6af75b7aa`.
**Thumbnail:** `help-30s-english16-thumbnail.png` (= frame 0 + "NO ADDRESS, NO ACCESS?").
Rules: `../../../context/11-production-format.md` (Update 2026-11-11 + later, incl. the 2026-11-15 first-frame rule).
Record: `../../../context/29-production-30s-english16-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline; uses each sentence's optional "tts" spelling
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav (voice from 0.10 s)
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json (sequence-aligned to ASR)
node render.mjs                          # build/video.mp4 (~3-5 min)
node render.mjs --thumb                  # help-30s-english16-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english16-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
