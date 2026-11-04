# Help — hindi-04 (2026-11-04) 30 s #01 (Hindi): "फ़ीस माफ़ हो, तब भी बच्चे का स्कूल क्यों छूट सकता है?"

**Final:** `help-30s-hindi04-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `c0d370ed547356659260ebc2f2010b73e8051373145fb3b96450073380613caf`.
Accepted renderer/primitives reused from hindi-03 (`src/stage.html` head unchanged; new scene functions for this topic). No child is drawn.
Brief/script/sources/claims/storyboard: `../../../context/17-production-30s-hindi04-01.md`. Post copy (Hindi + sources): `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
npm ci                                   # @fontsource/noto-sans-devanagari@5.2.8 (woff2 already copied to fonts/)
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro_hi.py   # Hindi: hf_alpha 0.7 + hm_omega 0.3, lang hi, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav
# one Vosk Hindi ASR pass (vosk-model-small-hi-0.22, QA-only) -> qa/asr-voice-track-hi.txt, then:
python3 tools_captions.py                # src/captions.json (asserts every spoken word is captioned)
node render.mjs                          # build/video.mp4 (~5 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-hindi04-01.mp4
node render.mjs --capbounds
```
