# QA — ideaverse-30s-english06-01.mp4 (English)
File: `videos/ideaverse/production/30s/2026-11-06-english-06/ideaverse-30s-english06-01.mp4` · sha256 `030a2de67d1ba531bd47277f0f19a0f5df0c7784424c7cb609ac5193686a5500` · 11.1 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded 900). AAC-LC 48 kHz stereo.
- Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.9 LUFS, peak −2.1 dBFS. Speech ≈ −15…−18 dBFS RMS vs music-only gap −33 dBFS / tail −37.5 dBFS before mastering.

## English narration / caption timing (qa/asr-narration.txt — faster-whisper base.en on the final MP4)
- All 6 lines match the script (spoken "three fifteen / three fifty" transcribed as 315 / 350, compared as words).
- Every heard word lies inside a caption that shows it.
- Fixed: "mishear" (heard "miss here") → "get it wrong" before rendering; caption boundary 20.6 → 21.0 s ("matter," was
  spoken after its caption ended); caption 3 re-broken so it renders at 52 px instead of auto-shrinking to 46 px.
- CTA "Download the Ideaverse app." spoken 26.60–27.98 s; caption 26.3–30 s with the icon.
- Listening: I cannot play audio; pronunciation/intelligibility judged by ASR (all lines exact) — English Kokoro voice
  is the approved character.

## Captions / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry: pill x 96..984, y 344..520; ink x 133..945, y 372..497 — SPEC PASS. 8 captions, ≤ 2 lines, 52–60 px.
- Top band y 0..300: no text (antenna and handrail only).

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET lesson style. Hook moves from frame 0 (bus sway, swinging straps, pulsing noise squiggles, muted badge).
- 6 setups each acting on its line: bus hook · settings toggles flip on as named · live caption types word by word ·
  said-vs-captioned card (3:15 clock vs 3:50 clock, ≠, ring) · chips + check message + reply, caption corrects to "3:15 ✓" · CTA.
- Fixed before the full render: phone covered DOCKET's face in the hook; strap out of reach (rail lowered).

## Accepted minor issues
- 12.4–14.3 s the comparison card shows only its title before the two panels appear (caption carries "But it can get it wrong").
- In the CTA the lowered phone is partly cropped bottom-left (non-essential).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
hindi03-01 97aef888…, meme-01 669848f7…, hindi04-01 718b32cb…, feedback05-01 ea5687f2…, pilot-01 2886236d…, 15 s test f10ebf29…).
