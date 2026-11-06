# QA — ideaverse-30s-english07-01.mp4 (English)
File: `videos/ideaverse/production/30s/2026-11-06-english-07/ideaverse-30s-english07-01.mp4` · sha256 `b24aad7c6b09e954320fae15fc4e2fc609f17f894369ecafcd436d270582b7b8` · 10.5 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded 900). AAC-LC 48 kHz stereo.
- Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.8 LUFS, peak −2.7 dBFS. Speech ≈ −16 dBFS RMS vs music-only gap −34 dBFS / tail −37.5 dBFS before mastering.

## English narration / caption timing (qa/asr-narration.txt — faster-whisper base.en on the final MP4)
- All 6 lines match the script (spoken "six / eight" transcribed as 6 / 8, compared as words); every heard word is inside
  a caption that shows it.
- Fixed: s4 "six eggs or eight" was heard as "six eggs are ate" in the mix → reworded to "is that a six or an eight?"
  (verified with base.en and small.en first), the eggs sting moved out from under the words, caption boundary 15.3 → 15.1 s.
- CTA "Download the Ideaverse app." spoken 26.60–27.98 s; caption 26.3–30 s with the icon.
- Listening: I cannot play audio; pronunciation/intelligibility judged by ASR (all lines exact) with the approved English voice.

## Captions / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry: pill x 90..990, y 344..520; ink x 126..952, y 372..497 — SPEC PASS. 9 captions, ≤ 2 lines,
  48–60 px (the hook caption auto-fits to 48 px).
- Top band y 0..300: no text (antenna only).

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET lesson style. Hook moves from frame 0 (note slides in spinning and smooths out by 0.6 s), shutter at 2.15 s.
- 8 setups each acting on its line: note close-up · side-on photo snap · instruction typing + chips · rings on crossed-out
  bread ("skipped") and the ambiguous digit ("6 or 8?") · flip to "Checklist by aisle" with the flagged eggs row · flip back,
  ✓ per matched line · zoom into the photo, "it's a 6", row → "eggs ×6 ✓" · CTA.
- Fixed before the full render: note landed out of frame / behind the easel frame; ambiguous digit was unreadable then too
  clearly "8"; chips leaked onto the clean photo copy (NaN alpha guard); phone hid DOCKET in the hook (side-on staging).

## Accepted minor issues
- In the CTA the lowered phone is partly cropped bottom-left (non-essential).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
hindi03-01 97aef888…, meme-01 669848f7…, hindi04-01 718b32cb…, feedback05-01 ea5687f2…, english06-01 030a2de6…,
pilot-01 2886236d…, 15 s test f10ebf29…).
