# Progress

## Verified facts
- App Mello, package `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`.
- Listing (`assets/listing.json`, sha256 matches 03-assets.json) says: "Guided relaxation, calming exercises, wellness challenges and progress tools." Health & Fitness, rated 3+, price 0 INR, author Tensorblue AI.
- Icon (`assets/icon.png`, sha256 matches): lavender ghost-like character on deep navy/indigo with gold sparkles.
- Unknowns kept unknown: no outcome, metric, pricing or endorsement claims; pronunciation of "Mello" not documented.

## Creative decisions (30 s production video)
- Stickman story: thought threads tangle him, a tap on the phone brings out a Mello character (an original vector take on the icon), a calm wave turns the world from paper to night, two breath cycles release the threads, he hops three platforms (one per listing feature), and the end card shows the icon, "Mello" and "Explore on Google Play".
- Palette: paper `#F4EDE1` with ink `#2A2340` for stress; navy `#110D25`→`#2D2459` with lavender `#CDB8F4`, gold `#F7C548` and mint `#B6D7C2` for calm.
- Font Nunito (OFL) from npm `@fontsource/nunito@5.2.7`, converted to TTF and committed.
- Narration: Kokoro-82M (Apache-2.0) through kokoro-onnx 0.4.9, voice `af_heart`, speed 0.9, local CPU.
- Score and SFX are all synthesized in numpy/scipy (`project/src/audio.py`), with no samples.

## Completed (30 s)
- Final: `videos/mello/output/mello-30s.mp4`, sha256 `b167aa03…5fc4ada`, 1080x1920, 30 fps, 900 frames, H.264 + AAC 48 kHz, 30.0 s.
- QA: `videos/mello/output/QA.md` and `output/qa/*`. Full decode clean, −16.0 LUFS, −1.4 dBTP, ASR 48/48 words.
- Commands:
  - `cd videos/mello/project && ./setup.sh` (one time; needs `apt-get install libegl1` on minimal Linux)
  - `./build.sh` (TTS → audio → frames → mux → QA)
  - Optional ASR check: `python src/asr_check.py ../output/mello-30s.mp4 <model_dir>` in a faster-whisper venv.
- Fix loop: camera tightened for the stress scenes; ring moved up; platform C delayed; the character's path lowered; end-card micro-motion added; limiter changed to soft-knee for true peak under −1 dBTP; QA script bugs fixed (last-frame seek, spectrogram scale).

## Unresolved
- Nobody has listened to the audio; it was checked with numbers only.

## Next
- 30 s production video is done. A separate 15 s geomotion style test is tracked in `07-test-progress.md`.
