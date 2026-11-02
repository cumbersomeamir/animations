# Help — production 30 s #02: "Why a flood survivor may need cash rather than another box"

**Final:** `help-30s-production-02.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo ·
SHA-256 `6461ba4980129694d1bbff8cc6d634dd11df900208c2e9d6a2e11e2a729c7c12`. Post text: `publishing-caption.txt`. QA: `QA.md`. Brief/script/claims/storyboard: `../../../context/13-production-30s-02.md`.
Format rules: `../../../context/11-production-format.md` (updated for batch-02).

Style: Shadow Puppetry — https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/shadow-puppet/STYLE.md (read-only; original Canvas2D code,
puppet primitives reused from production 30s-01). Voice: Kokoro-82M ONNX, Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro.py      # (--only 0 re-takes sentence 1 only)
python3 audio/mix30.py                 # build/mix.wav + build/voice_track.wav (-15 LUFS target)
# one ASR pass (Vosk, QA-only, not committed) -> qa/asr-voice-track.txt, then:
python3 tools_captions.py              # src/captions.json
node render.mjs                        # build/video.mp4 (~17 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-production-02.mp4
node render.mjs --capbounds            # qa/caption-bounds.json
```
