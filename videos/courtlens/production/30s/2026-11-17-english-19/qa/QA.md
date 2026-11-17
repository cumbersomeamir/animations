# QA: courtlens-30s-english19-01.mp4 (English, India; batch 19) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-17-english-19/courtlens-30s-english19-01.mp4`
  sha256 `fee5078b4f9cf67d500ce9dd0b359207201535dfd2138a2a21b673146997ecac`
- Thumbnail: `courtlens-30s-english19-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `7265fd8c64460c19b8253807d4509b6710cf577f4cef809efe8c41ecab049343`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.3 LUFS integrated, LRA 3.0 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 9/9 English lines at planned start +3 ms (similarity 0.95–0.97) |
| Pacing | hook 0.05–1.51 s; escalation 1.75–3.94 s; proof 4.20–20.08 s; payoff 21.00–25.18 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: the "S · SHOP" logo bag with the red ₹18 tag on the lit billing counter, the receipt showing "CARRY BAG ₹18", and the hook words (mean luma 185/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.56/255 outside the chip band (99th percentile 5.7). Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 154/255 → clear. The darkest moment is the plain bag dropping in from above at 6.3 s. |
| Captions | 13 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 106..892, y 330..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹), the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames in one pass, no capture retries, no partial re-render |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.012**. Lines 1–8 are word-perfect ("Eighteen rupees" is heard as "18 rupees", which
  normalises equal). The only miss is the brand in line 9, heard as "Courtlands" (an ASR spelling, as in all accepted
  episodes). "National Consumer Commission", "name or logo", "can't charge", "your own empty bag", "at the entrance"
  and "before you shop" are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules and the 15 Nov first-frame rule)
- **Frame zero / hook:**
  - a big kraft shopping bag with the shop's "S · SHOP" logo
  - a red "₹18" tag hanging from the handle
  - the billing counter and receipt printer
  - "₹18 FOR THEIR BAG?" (4 words), readable at phone size
  - The tag flicks on "rupees".
- **Escalation:** the printer feeds and the "CARRY BAG ₹18" line is marked red on "added". Chip shown.
- **Proof, one condition per beat:**
  - the "NATIONAL / CONSUMER COMMISSION" stamp slams, then "2024 · Bata India case"
  - the same bag returns plain and drops onto the stage; ✓ and ✕ pop: "YOUR CHOICE"
  - the shop's logo slams onto that bag on "name or logo", and the tag flips from ₹18 to FREE: "LOGO BAG = FREE"
  - a cloth tote swings in, ✓: "BRING YOUR OWN"
  - the shopfront; a notice board "CARRY BAGS / ₹ EXTRA / OPTIONAL" drops by the door, ✓: "BEFORE YOU SHOP"
- **Payoff:** three steps with ✓, one at a time: LOGO BAG: FREE, PLAIN BAG: SAY NO, BRING YOUR OWN.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Transitions:** scale crossfades dip briefly to paper (≈0.2–0.3 s). This is the established style. The stamp has
  a ≈0.25 s run-up (about 4.05 to 4.3 s), and the first payoff step starts sliding in at 21.0 s. The notice board
  passes over the "SHOP" fascia for under half a second as it drops. No defect needed a re-render.

## Defects found and fixed (stills review, before the full render)
- **Logo stamp:** a rubber-stamp prop entered the caption band and pressed at the top of the bag, not the logo. It was
  replaced by the series' slam-in of the logo itself, timed to "name or logo".
- **Frame zero:**
  - The counter front was too heavy, so it now fades out earlier.
  - The receipt was enlarged so "CARRY BAG ₹18" reads.
  - The bag was enlarged slightly while keeping it clear of the chip.
- **Bag stage:** it was raised so "YOUR CHOICE" clears the bottom overlay zone.
- **Narration:** it was 29.0 s, too long for the CTA window, and was trimmed to 24.7 s. The year moved onto the stamp,
  "Shops don't have to give bags free" became "Shops can sell bags", and "So at the counter" was dropped. Meaning is
  unchanged.
