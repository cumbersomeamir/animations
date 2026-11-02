# Help — feedback round 30 s #01: "Why having less money can make the same essential cost more"

**Final:** `help-30s-feedback-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `2d8c0afee3b1233d3586732bfd77e95aca7e9daccedc72af8b34a6ee27e2d1dc`.
Format: "Hands That Reveal the Hidden Cost" (recipe in `../../../context/11-production-format.md`). Brief/script/claims/storyboard:
`../../../context/14-production-30s-feedback-01.md`. Post copy: `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py   # Kokoro af_bella 0.7 + am_puck 0.3, 0.98, en-us
python3 audio/mix30.py              # build/mix.wav (+ voice_track.wav); no repeating music loop
# one Vosk ASR pass -> qa/asr-voice-track.txt (QA-only tool, not committed), then:
python3 tools_captions.py           # src/captions.json
node render.mjs                     # build/video.mp4 (~4 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-feedback-01.mp4
node render.mjs --capbounds
```
