# QA: courtlens-30s-english21-01.mp4 (English, India; batch 21) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-18-english-21/courtlens-30s-english21-01.mp4`
  sha256 `85523e0101cbc99c948f365609ce2a5a3bddd03a91859dc1cf304450604f537e` (26508784 bytes)
- Thumbnail: `courtlens-30s-english21-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `ea23b446272937fba3722132397977fe3004ddf2874c7c8f9a242c533350a1e6`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (40 beats and cuts), `final-frame.jpg`. The caption-bounds and
frame-zero check is `src/capcheck.py`.

## Automated checks (all PASS, on the final re-muxed file)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.0 LUFS integrated, LRA 2.5 LU, true peak −2.3 dBFS (no clipping) |
| Narration placement | 9/9 English lines at planned start +3 ms (similarity 0.95–0.99) |
| Pacing | hook 0.05–1.25 s; escalation 1.55–5.36 s; proof 5.70–21.25 s; payoff 21.60–24.95 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: the gold padlock chained to the iron "LOAN" ball, the red "2% FEE" tag, the cash bundle, a soft cyan halo, and the hook words "PAY EARLY. GET FINED?" (mean luma 203/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.61/255 outside the chip band (99th percentile 5.3). Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 15 English chunks, ≤ 2 lines, non-overlapping. Caption ink in decoded frames (every 3rd frame): x 117..884, y 331..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹ and %), the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames in one pass (112 s), no capture retries. Then a partial re-render of frames 250–310 and 460–526 after the frame review (below). |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final re-muxed mix.
- **Final mix:** full WER **0.012**.
  - Lines 1–8 are word-perfect: "two percent" is heard as "2 %", which normalises equal. "RBI rules say", "floating
    rate loan", "anything but business", "banks and finance companies can't charge you", "new lender", "if your loan
    papers disclose it" and "sanction letter" are all heard correctly.
  - The only miss is the brand in line 9, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules, the 15 Nov first-frame rule and the 18 Nov feedback)
- **Frame zero / hook:** the padlocked LOAN ball and chain with the red 2% FEE tag and the cash ready, plus 4 hook
  words; the tag swings at 0.3 s.
- **Escalation:** the cash slides to the lock; the tag pulses on "adds"; the cash is pushed back and ✕ pops. Chip
  shown.
- **Proof, one condition per beat:**
  - INDIA / RBI RULES stamp
  - a "%" buoy surfaces on waves: FLOATING RATE
  - home/studies/wallet tiles ✓: NOT FOR BUSINESS
  - back at the lock: BANKS & NBFCs; the tag is torn off, the shackle springs, the chain falls, the ball rolls free:
    ✓ ₹0 CHARGE
  - a cash bundle knocks blocks off the debt tower; the rest glows; a new lender's money clears it: ✓ ANY SOURCE
  - a "%" in concrete slams down, the fee tag returns, the loan papers show the 2% line: ✓ IF DISCLOSED
- **Payoff:** the sanction letter; a magnifier checks FLOATING then FIXED: ✓ CHECK FIRST.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Text load (18 Nov feedback):** at most one 1–3-word pill plus the caption at any time. The sanction letter's own
  words (title, RATE TYPE, FLOATING, FIXED) are the payoff object.
- **Transitions:**
  - the scale crossfades dip briefly to paper (≈0.2–0.3 s), around 5.55 s, 9.0 s and 21.5 s; this is the established
    style
  - the stamp slam overscans the frame edges for about 0.2 s
  - the new lender's building enters from the right edge

## Defects found and fixed
- **Stills review, before the full render:**
  - Frame zero was enlarged (lock, ball, visible chain) and got a brand-cyan halo.
  - The opened shackle grazed the caption band (~13.6 s), so the lift and rotation were reduced and the unlock scene
    lowered 28 px.
  - The torn tag's flight path and the concrete block's slam start (y≈496) would have entered the band, so the tag now
    exits right and the slam starts at 860.
  - The loan papers sat near the right edge, so they moved to x 735.
- **Frame review of the full render:**
  - (a) The ✓ "ANY SOURCE" appeared only as the tower scene faded (≈17.1 s). The new-lender events moved earlier
    (15.55 / 16.0 / 16.5) and the tower window was extended to 17.5.
  - (b) A ≈0.4 s near-blank beat at 8.7–9.1 s: the icons now start at 8.95 and the buoy scene fades later.
  - Frames 250–310 and 460–526 were re-rendered in place (`node render.cjs range $S/build21/frames …`). Neighbour
    frames 247–249, 311–313, 457–459 and 527–529 re-rendered with the new code are **bit-identical** to the full
    render.
  - Audio was re-mixed (SFX follow the moved events) and re-muxed with `SKIP_FRAMES=1`. All checks above were re-run
    on that final file.
- **Narration:** "banks and NBFCs" was heard as "NBFC" (the plural dropped), so it became "banks and finance
  companies"; the screen shows BANKS & NBFCs.
