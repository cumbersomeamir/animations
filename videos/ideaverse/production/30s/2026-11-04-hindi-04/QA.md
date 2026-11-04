# QA — ideaverse-30s-hindi04-01.mp4 (Hindi)
File: `videos/ideaverse/production/30s/2026-11-04-hindi-04/ideaverse-30s-hindi04-01.mp4` · sha256 `718b32cb924ab33eb9e225465bb6ff74b2907db30fbc8145eb814575c1669179` · 12.0 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded 900). AAC-LC 48 kHz stereo.
- Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.9 LUFS, peak −3.1 dBFS. Speech ≈ −14…−16 dBFS RMS vs music-only gap −33 dBFS / tail −38 dBFS before mastering.

## Hindi narration / caption timing (qa/asr-narration.txt — faster-whisper medium, language hi)
- All 6 lines recognised; spelling-normalised CER 0.08–0.20. Heard variants: शर्ट → "शर्थ", सिकुड़ → "से कुड",
  कपड़े → "कप्रे", ऐप → "आप", हिंदी → "हिंडि", धुलाई → "धूलाए", वेबसाइट → "वेप्साइट" (retroflex/aspirate softening).
- Every heard word lies inside a caption that shows it. CTA "आइडियावर्स ऐप डाउनलोड कीजिए" spoken 26.20–28.46 s; caption 25.9–30 s.
- ASR was run on the first mux; the final mux has a byte-identical audio source (only frames 540–549 were re-rendered).
- **Limitation:** I cannot listen to audio. Intelligibility is judged by multilingual ASR + phoneme review only. Kokoro's
  Hindi voices are graded C by their author; a native-speaker listen is recommended before posting.

## Captions / glyphs / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry: pill x 139..941, y 344..520; ink x 175..906, y 362..501 — SPEC PASS. 9 captions, ≤ 2 lines, 60 px.
- Devanagari via Noto Sans Devanagari: matras, nukta (अंदाज़े, साफ़, फ़ोटो), chandrabindu (महँगी) render correctly; no tofu.
- Top band y 0..300: no text (only DOCKET's antenna).

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET lesson style. 7 setups, each acting on its line: washer + shirt shrink · viewfinder (tilted/blurry →
  straight/sharp "साफ़ ✓", shutter) · chat (photo + Hindi question typed) · label close-up (ring + "30°C तक", bar ring +
  "हल्की धुलाई") · easel two-shot (answer list, ✓ on each symbol) · brand care page "लेबल से मेल ✓" · CTA.
- Fixed after reviewing frames: hook framing cropped the shirt; label close-up cut off the tub symbol; "हल्की धुलाई" chip
  overlapped its ring; "उदाहरण" tag text overflowed its pill; DOCKET walked into the label close-up 0.14 s before the cut.

## Accepted minor issues
- Shirt is held close to DOCKET's face at the moment of shrinking (reads as a lift-up).
- In the CTA the lowered phone is partly cropped bottom-left (non-essential).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
hindi03-01 97aef888…, meme-01 669848f7…, pilot-01 2886236d…, 15 s test f10ebf29…).
