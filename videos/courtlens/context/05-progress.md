# Progress — Courtlens 30 s production video

## Verified facts (from assets/listing.json + icon.png only)
- Listing line: "Court records, case tracking and an AI assistant for advocates." Android, Business, rated 12+, author Tensorblue AI, Play offer price 0 INR.
- Icon: navy tile, ivory courthouse, gold disc, cyan chat bubble with gold sparkle. Hashes match 03-assets.json.
- Unknowns kept unknown: pricing beyond listing, metrics, endorsements, real UI screens (none approved → all UI drawn as labelled illustration).

## Creative decisions
- Editorial paper-cutout world + original stick-figure advocate (black coat, white bands). Story: file slam → paper mountain collapses → paper maze → Courtlens lens collects walls into the phone → cards become a case trail → AI assistant answer verified against an official record with a magnifier → navy end card + "Explore on Google Play".
- Palette from icon (navy/ivory/gold/cyan) on warm paper; Fraunces + Inter (OFL, pinned via npm @fontsource).
- Narration: local Kokoro-82M v1.0 ONNX (Apache-2.0), voice af_heart; "Courtlens" spoken via "Court lens" spelling. Music + SFX synthesised in numpy (original).
- Storyboard: docs/storyboard.md. SFX cue sheet exported from the same timing constants as the animation (src/scenes.js → build/cues.json).

## Status (2026-11-01)
- RENDERED: output/courtlens-30s.mp4 — H.264 1080x1920 30fps 900 frames, AAC 48 kHz stereo, 30.000 s, loudnorm -14 LUFS; full ffmpeg decode OK.
- Narration ASR check (faster-whisper base.en): all 7 lines recognised (sim 0.80–1.00; lower scores are only "Court Lens" word split).
- Mix: VO 6.4–10.2 dB above music+SFX bed per line after compression/ducking.
- QA PENDING (paused when the 15 s diagram-animation test was requested): full post-mux contact sheet, scene-boundary frame review of the final encode, QA.md write-up.

## Exact commands (from videos/courtlens/project)
- `python3 -m venv .venv && .venv/bin/pip install kokoro-onnx==0.6.1 soundfile faster-whisper==1.2.1 scipy==1.17.0`; `npm ci`
- `./tools/fetch_models.sh` (sha256-verified HuggingFace download)
- `.venv/bin/python audio/narration.py && .venv/bin/python audio/asr_check.py && .venv/bin/python audio/captions.py`
- `node src/render.js cues build/cues.json && .venv/bin/python audio/score.py`
- `node src/render.js video build/video_noaudio.mp4`
- `ffmpeg -i build/video_noaudio.mp4 -i build/audio/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart ../output/courtlens-30s.mp4`

## Next
- Finish 30 s QA.md after the 15 s test is delivered.
