# QA: courtlens-30s-feedback-01.mp4

File: `videos/courtlens/production/30s/2026-11-02-feedback-round/courtlens-30s-feedback-01.mp4`
sha256 `8df8a15e524a71b22a7c648948e428f299e2525710b62558b108f590f42bad08` · 18,638,341 bytes
Machine-readable results: `qa_report.json` (produced by `src/qa.py`). Sheets: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg` (all decoded from the final MP4, not from source frames).

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Container duration | 30.000000 s (format, video stream and audio stream) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full read, BT.709 tagged |
| Audio | AAC-LC, 48 kHz, stereo, 30.000 s |
| Full FFmpeg decode | `ffmpeg -v error -i … -f null -` → exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 2.8 LU, true peak −2.0 dBFS |
| Narration timing | All 7 lines found by cross-correlation at planned start +3 ms (similarity 0.93–0.97) |
| CTA window | "Follow Courtlens…" 26.62 → 29.57 s = final 3.38 s |
| Captions | 13 chunks, non-overlapping in time, ≤ 2 lines each, inside y 340–520 / x 90–990 |
| Top safe zone (y<300) | 180 sampled frames (every 5th), darkest pixel 211/255 → no text or diagram in y<300 |

## Visual review (contact sheet + transition frames + targeted stills)
- Strong opening: frame 0 already shows caption, series chip and order card; delivery track completes by 1.2 s;
  the mug emerges, lands and visibly cracks on "broken" (2.5 s) and splits into two halves with shards.
- Five distinct changes, each on its narration: banner (4.1 s), rule card slides between banner and mug (5.75 s),
  clause chips highlight on "defective" / "not as described" (9.05 / 10.2 s), tag flips to "Return or refund" on
  "does not erase" (13.2 s), split stage (15.15 s), envelope + action card (21.65 s), CTA (26.72 s).
- Distinction is explicit: left "RULE APPLIES: Return or refund can't be refused" vs right "NO AUTOMATIC RIGHT:
  Depends on the return policy"; the NO REFUNDS sticker lands only on the change-of-mind side. No "ILLEGAL" stamp.
- Text sizes: captions 64 px ExtraBold; rule card 41–42 px; result cards 36 px; action card 40–46 px; CTA 58/32 px.
  The compact receipt in S2–S3 is deliberately small context (the readable outcome is carried by the 40 px tag).
- Final frame holds the action card (all three steps ticked) plus the Courtlens icon/CTA.

## Issues found and fixed during QA (each fixed and re-rendered)
1. Banner exited upward through the caption band and stayed parked at the top (y<300) → now exits sideways.
2. Rule-card → result-card morph was translucent and crossed the mug → opaque morph; split layout put results on top, mugs below.
3. NO REFUNDS sticker covered the "NO AUTOMATIC RIGHT" label → moved to the card's top-right corner, smaller.
4. Envelope flap left papers visible → papers tuck fully inside, clipped at the envelope bottom.
5. Action card initially dropped through the caption band; banner drop and mug drop also crossed y 340–520 → action card
   rises from below, banner fades in with a short drop, mug emerges from behind the order card.
6. Rule card was static for about 2.5 s → its lines now reveal as narrated before the clause highlights.
7. Shrinking order card briefly crossed the mug (3.6 s); CTA icon popped over the exiting envelope (26.6 s) → curved card
   path; envelope exits before the icon appears.
8. Thud/crack/tap SFX were louder than the voice → reduced; voice ≈15.7 dB above the bed during speech.

## Known limitations
- Narration is synthetic (Kokoro). The narrated sentence is a summary; deficient/spurious goods and late delivery are
  covered in the notes, not on screen.
- Legal checkpoints A–C in `../notes/LEGAL-SOURCES.md` (official `.nic.in`/eGazette copies unreachable from the build container).
