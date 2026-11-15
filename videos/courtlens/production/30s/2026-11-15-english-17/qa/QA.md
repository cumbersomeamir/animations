# QA: courtlens-30s-english17-01.mp4 (English, India; batch 17) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-15-english-17/courtlens-30s-english17-01.mp4`
  sha256 `759e4aee5821d171fcefcb7a3568458e63f8bcd05d1dccf1a31715889098db28`
- Thumbnail: `courtlens-30s-english17-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `8a450791f2b5f5f323173b07334c4e6726b03d92540df3fbf32d902ec4ef6b00`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −15.9 LUFS integrated, LRA 3.9 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 8/8 English lines at planned start +3 ms (similarity 0.95–0.97) |
| Pacing | hook 0–2.20 s; escalation 2.35–5.39 s; proof 5.75–16.76 s; caveat 17.25–20.50 s; payoff 21.20–25.45 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition (pack, bowl on the scale at 970 g, −30 g tag, hook words; mean luma 204/255; no fade or logo). It matches the thumbnail at mean abs diff 1.6/255 outside the chip band. Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 108..892, y 347..514 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including the minus sign), icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.014**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling, as in all accepted episodes). "Thirty grams", "nine hundred seventy grams", "fifteen grams", "Legal
  Metrology", "when packed" and "environmental loss can be excused" are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules and the 15 Nov first-frame rule)
- **Frame zero / hook:**
  - a big sealed kraft "RICE · NET QTY 1 kg" pack with its label highlighted
  - a bowl of its contents on a scale reading 970 g
  - a red "−30 g" tag
  - "30 GRAMS MISSING. LEGAL?" (4 words), readable at phone size
  - The tag pulses on "missing".
- **Escalation:** the label glows and the 970 g display blinks. Chip shown.
- **Proof, one idea per beat:**
  - the gram gauge with "1 kg"; the allowed band sweeps 1000→985, "ALLOWED: 15 g"
  - the needle drops to 970 and the red zone fills: "30 g SHORT = 2×"
  - the LEGAL METROLOGY badge, the pack tested on a scale at the counter ("TESTED AT THE SHOP"), then the "SEIZED"
    stamp ("SHORT PACKS SEIZED")
- **Caveat:** "WHEN PACKED" (large label + strip on the pack); sun and moisture drifting off; "MAY BE EXCUSED".
- **Payoff:** three steps with ✓: WEIGH CONTENTS, KEEP THE BILL, COMPLAIN.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Transitions:** scale crossfades dip briefly to paper (≈0.2–0.3 s). This is the established style. The frame
  review found no defects needing a re-render.

## Defects found and fixed (stills review, before the full render)
- **Frame zero:** the −30 g tag and the label highlight only appeared later, so they are now present at t=0 (= the
  thumbnail) and pulse on their words.
- **"When packed" beat:** the strip was too small, so a large label was added and "MAY BE EXCUSED" moved clear of the
  pack.
- **A caption threw in the renderer (it overflowed two lines at the minimum size):** it was split at the pause.
- **Narration:** "Complain, and a Legal Metrology officer" was heard as "an illegal metrology officer", so it became
  "Complain. A Legal Metrology officer".
