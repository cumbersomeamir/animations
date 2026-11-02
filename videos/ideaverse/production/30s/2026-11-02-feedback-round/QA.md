# QA — ideaverse-30s-feedback-01.mp4
File: `videos/ideaverse/production/30s/2026-11-02-feedback-round/ideaverse-30s-feedback-01.mp4`
sha256 `3806e0ead510b66b7d49b1acee28882e80cb4b807c25398724070e01a268f8b7` · 20.1 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- Duration 30.000 s (container, video and audio streams).
- Video: H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (counted by decoding: 900).
- Audio: AAC-LC, 48 kHz, stereo, 192 kb/s.
- Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt, qa/spectrum.png)
- Integrated −14.7 LUFS, LRA 5.5 LU, true peak −1.8 dBFS (target −15 LUFS / TP −1.5; spec −14…−16, TP ≤ −1).
- Mix before mastering: speech ≈ −15 dBFS RMS, music-only gaps −27…−39 dBFS: voice clearly on top. No rhythmic loops.

## Narration timing (qa/asr-narration.txt — faster-whisper base.en on the final MP4)
- All 6 lines transcribed exactly as scripted ("Ideaverse" heard as "ideaverse").
- Every spoken word falls inside a caption window that shows that word: none outside.
- Spans heard: s1 0.15–2.13 · s2 2.80–10.00 · s3 10.70–15.06 · s4 16.25–18.41 · s5 19.85–22.87 · s6 25.75–27.95 s.
  (The first word of each window is reported from the window start, ~0.15 s early.) CTA occupies 25.8–30 s.

## Captions / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-*.png)
- Exact renderer geometry, all 900 frames: pill x 92..988, y 344..520; ink x 131..950, y 372..497 — SPEC PASS.
- Max 2 lines; never two captions at once; 60 px Space Grotesk bold (one caption auto-fits to 50 px).
- Top band y 0..300 (montages of every 5th / 15th frame): no text. Only décor reaches it (antenna mic, cabinet
  edges, wall-monitor icons; DOCKET's "?" face glyph for ~0.3 s at 18 s). Nothing drawn in the bottom UI zone.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, qa/style-vs-pilot.png)
- Style matches pilot-01 at 1/6/11 s: same DOCKET, white/cream shell, dark screen face with mint expressions,
  navy limbs, navy-black newsroom, warm key + mint rim lighting. No Riso/paper/halftone/printer.
- 7 distinct scenes (hook catch · clusters · magnifier insert · score+sort · mistake · drawer search/recovery · CTA);
  no static page, no camera-bob-only shots. Envelope headlines ≥ ~45 px on screen; inserts fill the frame.
- Fixes made after reviewing rendered frames: fly-ins moved to the side (text had crossed y<300); two camera sweeps
  replaced by cuts on open drawers (labels had swept through the top band); "Team lunch" landing delayed 0.15 s
  (it brushed the caption pill); caption 5 started 0.08 s earlier (ASR word-in-caption check).

## Accepted minor issues
- Hand IK reaches within ~0.04–0.12 m on a few long reaches (magnifier handle at 6.3–8 s, SPAM handle at 22.3 s);
  not visible at the shot scales used.
- The flying "Team lunch"/"Job interview" envelopes pass beside the caption pill for a few frames while moving.

## Preservation
Previous MP4 sha256 unchanged: production-01 c5ababf6…, production-02 8b30167988…, production-03 fc6836f0…,
pilot-01 2886236d…, 15 s test f10ebf29….
