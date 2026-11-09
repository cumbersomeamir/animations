# Help — english-11 (2026-11-09) 30 s #01 (English): "Leftover pills in a donation bag? Take them out."

**Final:** `help-30s-english11-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `c1a2440018158bd3089d6423777d75ad81c0072765c119cb9afcdfb5c7ce8120`.
Accepted renderer/primitives reused from english-10 (`src/stage.html` head unchanged; new medicine/pharmacy props). Subject changed from the
suggested shoe checklist (= english-09) — see `../../../context/24-production-30s-english11-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav
# one Vosk English ASR pass (vosk-model-small-en-us-0.15, QA-only) on build/voice_track.wav -> qa/asr-voice-track.txt, then:
python3 tools_captions.py                # src/captions.json (asserts every spoken word is captioned)
node render.mjs                          # build/video.mp4 (~3 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-english11-01.mp4
node render.mjs --capbounds
```
