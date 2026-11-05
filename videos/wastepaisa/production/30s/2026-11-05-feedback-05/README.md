# WastePaisa feedback-05 episode 01: गत्ता अलग, मुनाफ़ा अलग (Hindi, Scrap Shop X-ray)
Deliverable: `wastepaisa-30s-feedback05-01.mp4`. Spec:
- 30.000 s, 1080×1920
- H.264 yuv420p, 30 fps / 900 frames
- AAC 48 kHz stereo
- Hindi narration and Devanagari captions

Where things are:
- **Brief, script and research:** the brief, final Hindi script with gloss, sources, illustrative batch, claim map, storyboard and QA
  are in `PRODUCTION-NOTES.md` (= `context/18-feedback-05-01.md`).
- **Format:** `context/11-production-format.md`.
- **Post text with sources:** `publishing-caption.txt` (Hindi; matches the final transcript).
- **QA evidence:** `qa/`; `asr.txt` summarises both Hindi ASR engines.
- **Renderer:** the accepted `../2026-11-04-hindi-04/src/scene.html`, copied with new cardboard/paper props and scenes only (see the
  header comment in `src/scene.html`).

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Hindi voices hf_beta 0.7 + hm_omega 0.3, lang hi
python3 audio/mixf5.py                     # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js video video-only.mp4    # 900 frames @ 30 fps (~105 s); also writes qa/caption-bounds.json
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-feedback05-01.mp4
```
