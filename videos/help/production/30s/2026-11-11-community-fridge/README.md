# Help — community fridge (2026-11-11) 30 s #01 (English): "This fridge has no cashier, and it solves two problems."

**Final:** `help-30s-communityfridge-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `13a2097849eef2bd8c66d61344c02b56eae15bbeee37fc0d90b1ec02349060fb`.
**Thumbnail:** `help-30s-communityfridge-thumbnail.png` (1080×1920; "NO CASHIER. TWO PROBLEMS.").
First episode under the 2026-11-11 feedback rules (`../../../context/11-production-format.md`). Record: `../../../context/25-production-30s-communityfridge-01.md`.
Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json
node render.mjs                          # build/video.mp4 (~3 min)
node render.mjs --thumb                  # help-30s-communityfridge-thumbnail.png
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-communityfridge-01.mp4
node render.mjs --capbounds              # rule: x 100-900, y 230-1500
```
