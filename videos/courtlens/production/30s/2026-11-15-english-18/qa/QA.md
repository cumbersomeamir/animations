# QA: courtlens-30s-english18-01.mp4 (English, India; batch 18) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-15-english-18/courtlens-30s-english18-01.mp4`
  sha256 `60feee0992051e7b5c50696e8855f20e282ddc26bbe295f75e5d5977983b540b`
- Thumbnail: `courtlens-30s-english18-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `cc535470b202d501ac9294e2717fe31cd33b56eb67b733d4c9998281c4b5dcfb`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`. All checks below were re-run on the final file
after the partial re-render described at the end.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.2 LUFS integrated, LRA 3.2 LU, true peak −2.5 dBFS (no clipping) |
| Narration placement | 8/8 English lines at planned start +3 ms (similarity 0.95–0.98) |
| Pacing | hook 0.05–1.27 s; escalation 1.75–3.58 s; proof 4.05–20.22 s; payoff 21.00–25.78 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: snack bag with ✕, lit CINEMA marquee, NO OUTSIDE FOOD sign, rope, carpet and hook words (mean luma 162/255; no fade or logo). It matches the thumbnail at mean abs diff 1.93/255 outside the chip band; the 99th percentile is 11.3 because the marquee bulbs are at a different chase phase. Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 204/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 107..892, y 330..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces, the ✕/✓ badges, the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries; frames 118–181 and 475–503 re-rendered in place (below) |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**. Lines 1–7 are word-perfect. The only miss is the brand in line 8, heard as
  "Courtlands" (an ASR spelling, as in all accepted episodes). "Supreme Court", "entry rules", "drinking water is
  free", "reasonable amounts", "medical diet", "case by case" and "doctor's note" are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules and the 15 Nov first-frame rule)
- **Frame zero / hook:**
  - a giant red foil "SNACKS" bag stopped with a ✕ at a lit cinema entrance
  - a "CINEMA" marquee with chasing bulbs, glowing doors, a "NO OUTSIDE FOOD" sign, a velvet rope and a red carpet
  - "YOUR SNACK. THEIR RULE?" (4 words), readable at phone size
- **Escalation:** the sign swings on "no outside food". Chip "IS THIS LEGAL IN INDIA?" shown.
- **Proof, one condition per beat:**
  - the "SUPREME COURT" stamp slams on "Supreme Court", then "2023 · K.C. Cinema v. J&K"
  - the cinema door gets a ✓: "THEIR ENTRY RULES"
  - an empty glass fills with water, then "FREE": "DRINKING WATER"
  - a baby bottle and lunchbox, then ✓: "CHILD'S FOOD" / "REASONABLE AMOUNT"
  - a doctor's DIET note rises on "medical diet", an "ASK" bubble pops: "CASE BY CASE"
- **Payoff:** three steps with ✓, one at a time: ASK: FREE WATER, CHILD'S FOOD, DOCTOR'S NOTE.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Transitions:** scale crossfades dip briefly to paper (≈0.2–0.3 s). This is the established style. Before the
  stamp, the stage is clear from about 4.0 s to 4.3 s as its run-up, with the caption showing.

## Defects found and fixed
- **Before the full render (stills review):**
  - Frame zero: the ✕ covered the "N" of "NO OUTSIDE FOOD", so the sign moved right and the ✕ moved to the bag's
    other corner.
  - The child-food beat had a ~0.85 s empty start, so the items now enter at 11.75 s.
  - Narration trimmed from 28.2 s to 25.2 s.
- **After the full render (frame review), two near-blank beats:**
  - The stamp arrived at 4.55 s, leaving the "Supreme Court" line on an empty stage, so it moved to 4.3 s.
  - The DIET note arrived at 16.3 s, after "On a medical diet?" had started, so it moved to 15.95 s (with the line).
- **How these were fixed:** the timeline was edited and only the affected frames were re-rendered in place:
  ```bash
  node render.cjs range $S/build18/frames 118-181
  node render.cjs range $S/build18/frames 475-503
  ```
  Then the existing frames and mix were re-muxed (`SKIP_TTS=1 SKIP_FRAMES=1 ./build.sh`).
- **Evidence that the re-render left no seams:** the renderer is a pure function of t.
  - Freshly rendered neighbour frames were bit-identical to the full-render frames: 112–117, 182–186, 469–474 and
    504–505.
  - Frames 501–503 differed (the end of the note's old rise), so the range was extended to 503 before re-muxing.
  - Check stills at 4.2, 4.45, 16.05 and 16.4 s confirm the stamp is visible by 4.45 s and the note from 16.05 s.
  - The pre-fix MP4 (sha256 `2de2e25a…`) is superseded and was never delivered.
