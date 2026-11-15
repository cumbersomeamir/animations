# WastePaisa english-18 episode 01: Banner to bag. (an old flex banner cut and stitched into tote bags, English, Scrap Shop X-ray)
Deliverables:
- `wastepaisa-30s-english18-01.mp4`: 30.000 s, 1080×1920, H.264 yuv420p, 30 fps / 900 frames, AAC 48 kHz stereo, English narration and captions.
- `wastepaisa-30s-english18-01-thumbnail.png`: separate 1080×1920 thumbnail = the frame-zero composition ("BANNER TO BAG").

Where things are:
- **Brief and research:** topic check (fresh: no banner, flex, tarp or bag episode before), final script, sources, labelled assumptions,
  claim map, storyboard and QA are in `PRODUCTION-NOTES.md` (= `context/31-english-18-01.md`).
- **Rules:** `context/11-production-format.md`, sections "PUBLISHED-APPS FEEDBACK RULES (2026-11-11)" and the 2026-11-15 first-frame rule.
- **Post text with sources:** `publishing-caption.txt` (matches the final transcript).
- **QA evidence:** `qa/`.
- **Renderer:** the accepted `../2026-11-15-english-17/src/scene.html`, copied with new banner props (generic printed flex banner, tote,
  truck with tarp, cost blocks) and scenes; the hook caption is forced visible from frame 0.

## Rebuild (from this folder; reuses pilot-01 node_modules/fonts/synth instruments, preinstalled Playwright + FFmpeg)
Kokoro model files come from the kokoro-onnx `model-files-v1.0` release. They are not committed.
```bash
<venv-python with kokoro-onnx 0.6.1> audio/tts.py kokoro-v1.0.onnx voices-v1.0.bin audio/lines.json   # Meshline: af_bella 0.7 + am_puck 0.3, en-us, 0.98
python3 audio/mixe18.py                    # accepted voice-forward mix (subtle pad, no loops) -> audio/mix.wav
node src/render.js captions                # optional: caption bounds only -> qa/caption-bounds.json
node src/render.js video video-only.mp4    # 900 frames @ 30 fps; also writes qa/caption-bounds.json
node src/render.js thumb wastepaisa-30s-english18-01-thumbnail.png
ffmpeg -i video-only.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart wastepaisa-30s-english18-01.mp4
```
