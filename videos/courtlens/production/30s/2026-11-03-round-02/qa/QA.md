# QA: courtlens-30s-round02-01.mp4

File: `videos/courtlens/production/30s/2026-11-03-round-02/courtlens-30s-round02-01.mp4`
sha256 `f12d786e3a8824a87d788891dee6e0e0a697b5ed4f0c47d7f860fb59583291bb`
Machine-readable: `qa_report.json` (from `src/qa.py`). Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 2.1 LU, true peak −2.0 dBFS (same delivery as accepted feedback-01) |
| Narration timing | 7/7 lines found by cross-correlation at planned start +3 ms (similarity 0.93–0.97) |
| Caption timing | 12 chunks, non-overlapping; each covers its spoken phrase (lead 0.05–0.42 s, tail ≥ 0.04 s) |
| CTA | "Follow Courtlens…" 26.62 → 29.57 s = final 3.38 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Voice vs bed | voice median 17.1 dB above music+SFX during speech (quiet, voice-forward) |

## Visual review (contact sheet, transition frames, targeted stills)
- Accepted feedback-01 grammar is intact: ivory paper, navy type, icon cyan accent, card spring, object landing,
  sign drop and swing, dashed line to tag, rule card sliding between, chip highlights, tag flip, split stage, morph,
  envelope, ticking action card, icon CTA.
- Each change lands on its words:
  - "MRP twenty rupees": MRP line marker
  - "twenty-five": sign drops
  - "chilled": frost appears
  - "maximum retail price" / "all taxes": chip highlights
  - "can't sell above it": tag flips to "Max ₹20 (MRP)"
  - "different case": right result
  - "keep the bill" / "snap the label": items enter the envelope
  - "1 9 1 5": each digit written as spoken
- Captions stay in y 340–520, ≤ 2 lines. Nothing else enters that band, including mid-transition. Stage content stays
  in y ≈ 560–1460 and x ≤ 960 below y = 1000.

## Defects found and fixed
1. Bottle drawn at the mug's scale looked small and left the stage empty in S2–S4. It is now drawn larger
   (S1 1.15, S2 0.78, S4 0.72), clear of the rule card. Re-checked on stills.
2. True peak −1.2 dBTP on the first encode (target ≤ −1.5). Gain/limiter changed 7.3 dB/0.79 → 6.8 dB/0.75, and audio
   re-muxed onto the same 900 frames: −2.0 dBTP, −15.9 LUFS.

## Known limitations
- Legal checkpoints A/B in `../notes/LEGAL-SOURCES.md`: the NCH FAQ page blocked automated fetch, and there is no
  national circular on "cooling charges". The line rests on the Rule 18(2) text.
