# QA — ideaverse-30s-english21-01.mp4 (English, batch 2026-11-18-english-21 / batch21)
sha256 164a40c2803afd942d983884642b6eac2e3f423e890785dbb3da7daf3f665309 · thumbnail `ideaverse-30s-english21-01-thumbnail.png`
(1080x1920 PNG, sha256 68bf0ce7714301a98b7a306499635ac9aca7d00b55663dd22c99c99dba1e63da) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, LRA 5.1 LU, true peak −1.6 dBFS; music ducked under voice; "?" notes
  after "hidden inside it."; ticks on the hidden marks, a chime on each MARK FOUND, low notes on NO WATERMARK, a soft thwack on
  the AI-MADE stamp, a chime after "first appeared.".

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 58–60 px; pill x 101..899 / y 344..520, text ink x 139..861 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500; the widest line, "Google's AI didn't make it.", auto-sized to 58 px). Top 300 px: scene only
  (DOCKET's antenna in the phone shot) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- Caption boundaries moved after ASR on the final mix: 2.85 → 2.30 s ("and" starts 2.30 s) and 10.72 → 10.50 s ("can").
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, qa/cut1-check.png, key frames, thumbnail)
- Frame 0: two framed photos (sunset lake + sailboat; blue-hour lake + lit cabin) fill the frame; WHICH ONE IS AI? (no
  fade-in, no logo). Card: the cabin image builds under AI MAKER from the cut; zoom box → enlarged pixels → hidden marks
  light up (INVISIBLE WATERMARK); AI MAKER ⇄ AI FINDER (TRAINED TOGETHER) → scan → ✓ MARK FOUND. Print: CROPPED → FILTERED →
  COMPRESSED, ✓ MARK FOUND each time (STILL FOUND). Phone: WATERMARK FOUND (MARK FOUND) → swipe → NO WATERMARK, "Not made by
  Google AI" (NOT GOOGLE'S AI). Both photos: the sunset one gets AI-MADE (ANOTHER AI). Card: NO MARK (NO MARK ≠ REAL) →
  reposts, the oldest is the first post, "made with AI" (FIND THE FIRST POST). CTA.
- Fixed during review: prints cut at the frame edges, a tripod leg across a photo, DOCKET's face hidden behind the prints
  (DOCKET now off for the photo shots; he carries the phone check and CTA), the label over the print's MARK FOUND chip, the
  easel's card visible behind the photo shots, overflowing "made with AI" text (all before the full render); after the full
  render: empty image box for 5 frames after the 4.5 s cut (build starts at the cut; frames 135–172 re-rendered, score
  re-mixed) and the two caption boundaries above (frames 63–93, 309–329 re-rendered).

## Content
- Sources and claim types in context/36 (DeepMind SynthID page + 2023 blog: watermark in the pixels, added at creation, two
  jointly trained models, designed to survive crops/filters/compression; Gemini Apps Help: what a detected / not-detected
  result means, reverse image search). Photos, marks, model chips, the check screen (EXAMPLE) and posts are illustrations;
  no Google or Gemini UI; no Ideaverse detection feature implied.

## Preservation
- All 26 earlier MP4s (incl. english20-01) re-hashed unchanged.
