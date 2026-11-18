# QA: courtlens-30s-english20-01.mp4 (English, Tamil Nadu, India; batch 20) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-17-english-20/courtlens-30s-english20-01.mp4`
  sha256 `6b8d5ca09fa636e4fae6cd4635f2b6e204676b06f8e4b884d5b7e6bbf5bb6d14` (27877212 bytes)
- Thumbnail: `courtlens-30s-english20-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `e324e28eb87b1f325b04d0002ad460c55d1c18d0e3f5d6a432e69e342496dd24`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (37 beats and cuts), `final-frame.jpg`. The caption-bounds and
frame-zero check is `src/capcheck.py`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −15.9 LUFS integrated, LRA 2.6 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 9/9 English lines at planned start +3 ms (similarity 0.95–0.97) |
| Pacing | hook 0.05–1.85 s; escalation 2.05–4.84 s; proof 5.05–20.91 s; payoff 21.20–25.34 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: the padlocked "DEPOSIT ₹45,000" envelope in front of the worn flat, a red marker ring on a stain, and the hook words (mean luma 204/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.52/255 outside the chip band (99th percentile 5.3). Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 15 English chunks, ≤ 2 lines, non-overlapping. Caption ink in decoded frames (every 3rd frame): x 104..897, y 358..516 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹), the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames in one pass (107 s on 4 workers), no capture retries, no partial re-render |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**.
  - Lines 1–8 are word-perfect: "Tamil Nadu's tenancy law", "except normal wear and tear", "the landlord's job,
    whatever the agreement says", "a broken window, can be deducted", "takes the empty flat back" and "deductions in
    writing" are all heard correctly.
  - The only miss is the brand in line 9, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules, the 15 Nov first-frame rule and the 18 Nov feedback)
- **Frame zero / hook:**
  - the padlocked deposit envelope, big, in front of a worn rented flat (stains, red ring)
  - "DEPOSIT GONE FOR WEAR & TEAR?" (5 words), readable at phone size
  - The padlock rattles at 0.5 s.
- **Escalation:** the keys drop and bounce ("moved out"); a second red ring draws on "faded" and the first pulses on
  "paint"; a slow push-in. Chip shown.
- **Proof, one condition per beat:**
  - the flat dims and "TAMIL NADU / TENANCY ACT" slams
  - rewind to move-in day (fresh walls), then a day/night time-lapse fades them: ✓ "NORMAL WEAR"
  - the camera pushes to the wall; a roller wipes it fresh: "LANDLORD'S JOB"; an agreement lands and its red line is
    struck
  - the camera pushes to the window; a cricket ball cracks it; two notes fly from the envelope, ₹45,000 rolls to
    ₹43,500, the glass heals: "DEDUCTED"
  - the camera moves to the door; the envelope springs back and the keys arc onto the peg: "AT HANDOVER" ✓
- **Payoff:** a phone viewfinder rises; two flashes give polaroids IN and OUT; a note slides in and a pen writes:
  ✓ "IN WRITING".
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Text load (18 Nov feedback):** at most one 1–3-word label plus the caption on screen at any time. There are no
  sub-lines, law cards or paragraphs.
- **Transitions (no defect needing a re-render):**
  - the stamp slam starts at 1.6× and overscans the frame edges for about 0.2 s (series stamp style)
  - the phone exits through the bottom zone (y > 1460) at about 24.0 s
  - labels fade during camera moves
  - the payoff crossfades into the CTA (26.6–27.1 s)

## Defects found and fixed (stills review, before the full render)
- **Phone viewfinder:** it was a solid navy block (even-odd path reset by `rr()`) and is now see-through.
- **Frame zero:**
  - the worn layer was too faint, so the stains and vignette are stronger
  - a picture ghost plus the key hook read as a face, so the ghost was removed and the hook became a peg
  - two red rings overlapped, so there is now one at t=0 and a second drawn on "faded"
- **Keys:** they were hidden behind the envelope, so they moved left.
- **Window beat:** the crack was too small, so a cricket ball and a tighter zoom were added.
- **Odometer:** now rolls in ₹100 steps. The chip moved to y=548, off the room frame.
- **Narration:** 28.4 s → 26.4 s. "…draws the line" gave a mid-phrase break and became "…says:".
