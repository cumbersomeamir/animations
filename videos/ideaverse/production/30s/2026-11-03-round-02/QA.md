# QA — ideaverse-30s-round02-01.mp4
File: `videos/ideaverse/production/30s/2026-11-03-round-02/ideaverse-30s-round02-01.mp4` · sha256 `3bc06d6403be95c9f5a8058767139ea2eb794ce254b19ace308e6e2405447da2` · 15.2 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded count 900).
- AAC-LC 48 kHz stereo 192 kb/s. Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt, qa/spectrum.png)
- Integrated −15.0 LUFS, LRA 5.4 LU, true peak −1.5 dBFS. Music-only gap before the CTA ≈ −35 dBFS vs speech ≈ −17 dBFS
  RMS before mastering: voice-forward, no loops (accepted quiet pad bed + event-linked notes/SFX).

## Narration / caption timing (qa/asr-narration.txt — faster-whisper base.en on the final MP4)
- All 5 lines exactly as scripted (66 words). Every spoken word lies inside a caption that shows it.
- CTA "Download the Ideaverse app" spoken 26.40–27.75 s; caption 25.9–30 s (final 4.1 s) with the current icon chip.

## Captions / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry, all frames: pill x 118..962, y 344..520; ink x 157..923, y 373..497 — SPEC PASS.
- 11 captions, all 2 lines at 60 px, never overlapping. Top band y 0..300: no text (antenna, face glyphs, flash only).
- Phone screen, board, menu and cards stay in y ≈ 540–1500 in their shots; nothing important in side/bottom UI zones.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET newsroom style (feedback-round renderer, unchanged rig/lights/stage/captions).
- 9 distinct setups, each moving with its narration: hook photo + flash · text boxes · tile to NUMBERS · matching
  (MATCH meter, 3/B/6/8) + 8 learned styles · real text + select-all sweep · tap/Copy/Copied + NOTES · menu flips ES→EN ·
  blurry misread 06:15 → double-check → 08:15 ✓, FARE ✓ · CTA wave.
- Fixes after reviewing rendered frames: phone screen texture not refreshing (fixed before the full render); hook made
  active (step in, raise phone, push-in) instead of a 1.4 s hold; real-text close-up given a select-all sweep; menu card
  hidden at the cut to the board (was crossing the board); misread state no longer flashes one frame before that cut.

## Accepted minor issues
- Tap hand stops ~7 cm short of the screen surface at 14.6 s (reads as a tap at this scale).
- During the 18.5–18.85 s move into the board shot the phone sits at the right edge for ~0.3 s.
- In the CTA the phone in DOCKET's lowered hand is partly cropped at bottom-left (non-essential).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, pilot-01
2886236d…, 15 s test f10ebf29…). Earlier episodes' MP4s keep the old icon; only assets/icon.png was replaced.
