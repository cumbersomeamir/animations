# QA — ideaverse-30s-english20-01.mp4 (English, batch 2026-11-17-english-20 / batch20)
sha256 089ada072be371b3e7ef664818a3e86a0cb7064000c8436e2388ab9edc8e5b39 · thumbnail `ideaverse-30s-english20-01-thumbnail.png`
(1080x1920 PNG, sha256 6df579910e15db8bec734f8bfc1c16aa7c211341ef13128277996f45c901236f) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, LRA 5.1 LU, true peak −2.0 dBFS; music ducked under voice; "?" notes
  after "Your twin's?" and "mask mode on."; a chime after "mask mode off."; ticks on the dots, bars and chips; key taps on
  the passcode digits.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 133..867 / y 344..520, text ink x 170..829 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's head and antenna) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- The checker gained a "1" → "one" mapping (ASR writes digits) and now accepts a word's digit or spelled form against the
  caption; the caption 5/6 boundary moved from 10.10/10.15 to 10.08 s because ASR put "A" at 10.12–10.18 s.
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: two near-identical sculpted busts flank DOCKET, whose phone shows a lock; 1 IN A MILLION? (no fade-in, no logo).
  "Your twin's?" → the twin glows amber, DOCKET turns to it (YOUR TWIN?). Scan: beam, depth colours (3D MAP), red dot grid
  (THOUSANDS OF DOTS). Card: the saved row, the new row grows and slides onto it → ✓ (FACE → NUMBERS, MATCH); the twin's row
  lands almost on top (TOO CLOSE) with TWIN / SIBLING / UNDER 13 chips on each word. Mask: the lower face is covered and its
  dots go out (MASK MODE: HIGHER). Phone: passcode keypad (USE A PASSCODE) → "Face ID with a Mask" toggle off (MASK MODE
  OFF); CTA.
- Fixed during review: busts cut at the frame edges, an oversized scan phone, a bust in front of the card and the chips
  under the label (all before the full render); after the full render: the card was empty for 0.75 s after its cut (saved
  row now shown from the cut, frames 303–325 re-rendered); the numbers card showed behind the bust in the mask shot (easel
  hidden there, frames 597–659 re-rendered); caption boundary 10.08 s (frames 297–312 re-rendered).

## Content
- Sources and claim types in context/35 (Apple Support "About Face ID advanced technology": 1 in 1,000,000; thousands of
  invisible dots → depth map; neural engine → mathematical representation compared with enrolment; higher for twins,
  look-alike siblings and children under 13, further with mask; passcode / Face ID without mask). Busts, dots, bars and
  phone screens are illustrations (EXAMPLE; not Apple's UI); no Ideaverse security feature implied.

## Preservation
- All 25 earlier MP4s re-hashed unchanged.
