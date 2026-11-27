# QA: courtlens-30s-english25-01.mp4 (English, India; batch 25) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-27-english-25/courtlens-30s-english25-01.mp4`
  sha256 `1644447a6c04307c39db6008a6de7efda651fbad4d2e247305099848e87a64c8` (24636271 bytes)
- Thumbnail: `courtlens-30s-english25-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `ee10b3dbf7e08d2498ba9be3e49313bef28ea377bc5d87870c55d86bb08837a2`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (33 beats and cuts), `final-frame.jpg`. Caption bounds and frame
zero: `src/capcheck.py <mp4> <thumb> <out> 230 470 470 545`.

## Automated checks (all PASS, on the final file)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.2 LUFS integrated, LRA 1.6 LU, true peak −2.4 dBFS (no clipping); mix gain 6.6 dB |
| Narration placement | 10/10 English lines at planned start +3 ms (similarity 0.95–0.98) |
| Pacing | hook 0.05–1.99 s; superhook 2.30–4.96 s; proof 5.25–23.37 s; payoff 23.65–26.41 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: an airport gate at dusk with a plane at the gate and a "FL 214 BOM CANCELLED" screen; the boarding pass stamped CANCELLED with a gold VOUCHER card over its corner; "FLIGHT CANCELLED. VOUCHER ONLY?" (mean luma 181/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.67/255 outside the chip band (99th percentile 9.3). Voice starts at 0.05 s. |
| Caption band (y≈280–460) | Caption ink in decoded frames (every 3rd frame): **x 108..891, y 303..448** |
| Top zone y<280 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping; at most the caption plus one short pill |
| Bottom/right controls | Pills sit at y≈1356–1456 and vital labels at x ≤ 900 |
| Missing assets | none: Inter faces (including ₹), the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames in one pass, no capture retries, no partial re-render |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody watched the video in real time or listened to the audio. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**.
  - Lines 1–9 are word-perfect: "DGCA rules say", "another flight or a full refund", "A credit shell is your call, not
    their default", "under a day's notice … no flight that suits you", "up to 10,000 rupees in cash or bank transfer",
    "beyond their control, like weather", "ask for your refund in writing".
  - The only miss is the brand in line 10, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Hook:** the gate at dusk with the CANCELLED row blinking; the voucher slides further over the boarding pass on
  "offers". Chip shown.
- **Proof, one condition per shot:**
  - DGCA / FLIGHT CANCELLED? stamp
  - the voucher flips into NEW FLIGHT and FULL REFUND; your finger taps: YOUR CHOICE
  - the CREDIT SHELL switch goes on and off only by your tap; DEFAULT struck out: YOUR CALL
  - the 24h ring runs down to < 24h; an unsuitable alternate pass gets ✕: < 24 HOURS
  - refund notes, then bars ₹5,000 / ₹7,500 / ₹10,000 by flight length, then an arrow to a bank: CASH OR BANK
  - a storm; the "+₹" compensation coins fade with ✕ while the refund keeps ✓: NO COMPENSATION
- **Payoff:** the voucher pushed away ✕; a note written ✓: REFUND, IN WRITING.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Transitions:** crossfades carry content through every cut except the hook → stamp entry (about 5.15 s, a light
  frame under 0.3 s, the established style). No defect needed a re-render.

## Defects found and fixed (stills review, before the full render)
- The departures-screen CANCELLED chip covered "BOM", so the font and chip were resized.
- The boarding-pass stamp overflowed the card, so it was resized and lowered; the voucher now overlaps only the
  corner.
- A ghost-money cue was removed as clutter.
- The DEFAULT stamp collided with the CREDIT SHELL title, so it moved.
- The bank icon overlapped the ₹10,000 label, so the icon and arrow moved up.
- **Narration:** trimmed from 30.6 s to 26.9 s of speech before the visuals were timed.
