# Help — feedback-05 (2026-11-05) 30 s #01 (Hindi): "पुराना फ़ोन दान करने से पहले, ये तीन बातें देख लें"

**Final:** `help-30s-feedback05-01.mp4` — 30.000 s · 1080×1920 · H.264 High yuv420p · 30 fps (900 frames) · AAC-LC 48 kHz stereo · SHA-256 `2fb84eb716ea60d4d3f806ee43a7e66d3359dec9c898e8c071ace574e51254cd`.
Accepted renderer/primitives reused from hindi-04 (`src/stage.html` head unchanged; new phone/app/battery/charger/reset props in the same carved-hide style).
Brief/script/sources/claims/storyboard: `../../../context/18-production-30s-feedback05-01.md`. Post copy (Hindi + sources): `publishing-caption.txt`. QA: `QA.md`.

## Rebuild
```bash
../../../tests/10s/pre-reset-2026-11-02/.venv/bin/python audio/voice_kokoro_hi.py   # Hindi: hf_alpha 0.7 + hm_omega 0.3, lang hi, 0.98
python3 audio/mix30.py                   # build/mix.wav + voice_track.wav
# one Vosk Hindi ASR pass (vosk-model-small-hi-0.22, QA-only) on build/voice_track.wav -> qa/asr-voice-track-hi.txt, then:
python3 tools_captions.py                # src/captions.json (asserts every spoken word is captioned)
node render.mjs                          # build/video.mp4 (~5 min)
ffmpeg -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart help-30s-feedback05-01.mp4
node render.mjs --capbounds
```
