# QA — ideaverse-30s-hindi03-01.mp4 (Hindi)
File: `videos/ideaverse/production/30s/2026-11-03-hindi-03/ideaverse-30s-hindi03-01.mp4` · sha256 `97aef888343ad06e8f204f9eaf46fac591d7aafb7bfc2d0eda13bb2d4fa4b22c` · 10.0 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded count 900).
- AAC-LC 48 kHz stereo 192 kb/s. Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.9 LUFS, LRA 3.3 LU, peak −3.0 dBFS. Speech ≈ −14…−16 dBFS RMS vs music-only tail −38 dBFS before
  mastering: voice-forward; accepted quiet pad bed + event-linked notes/SFX, no loops.

## Hindi narration / caption timing (qa/asr-narration.txt — faster-whisper medium, language hi, on the final MP4)
- All 6 lines recognised; spelling-normalised CER per line 0.04–0.13 (worst h5: "फ़ोन" heard "फून", "लिए" as "लिये").
- Every heard word lies inside a caption that shows it (after fixing two boundaries found by this check: 6.6→6.2 s, 12.55→12.6 s).
- CTA "आइडियावर्स ऐप डाउनलोड कीजिए" spoken 26.30–28.57 s; caption 26.1–30 s with the icon chip.
- Listening method: I cannot hear audio; intelligibility was judged by multilingual ASR transcripts of each clip and of the
  final mix plus phoneme review (espeak-ng hi). ASR shows aspirates sometimes softened (दिखता → "दिकता", भर → "बर");
  Kokoro's Hindi voices are graded C by their author. A native-speaker listen is recommended before posting.

## Captions / glyphs / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry: pill x 174..906, y 344..520; ink x 210..871, y 362..501 — SPEC PASS; 10 captions, 2 lines, 60 px.
- Devanagari rendered with Noto Sans Devanagari (matras, nukta ज़/फ़, chandrabindu परछाइयाँ/जाँचें verified at full size);
  no missing-glyph boxes. Top band y 0..300: no text (antenna, sky, frame edge only).

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET newsroom style; 6 setups each moving with its line: two-shot hook (amber ring) · phone insert (tap ripple,
  rough circle) · photo close (cut-out lifts into "हटाया गया", checkerboard gap, 24 patches fill it) · check close-up (edge box,
  missed shadow, re-selection) · phone insert (free/paid checklist ticks) · CTA (walk + wave).
- Fixed after reviewing frames: DOCKET blocked the dustbin in the hook; check close-up too tight; checklist text overflow;
  DOCKET walked through the check close-up (dark frames ~19.8–20.6 s) — now stays put and walks in the CTA shot.

## Accepted minor issues
- Phone lowers out of the insert in the last 0.3 s before the cut at 9.3 s.
- In the CTA the phone in DOCKET's lowered hand is partly cropped bottom-left (non-essential).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
pilot-01 2886236d…, 15 s test f10ebf29…). Icon unchanged this round.
