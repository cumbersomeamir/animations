# QA: courtlens-30s-english14-01.mp4 (English, India) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-14-english-14/courtlens-30s-english14-01.mp4`
  sha256 `57cbf3ed137dcb85947a628c652e4606f8054ab4154c5632254aba72c24980ff`
- Thumbnail: `courtlens-30s-english14-01-thumbnail.png` (PNG 1080x1920)
  sha256 `0931017c372a3c34248fc6e5b2bbefe2bf93aa522b317202922ab580b159be2f`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.0 LUFS integrated, LRA 3.0 LU, true peak −2.4 dBFS (no clipping; voice-forward, quiet bed) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.95–0.97) |
| Pacing | hook 0–2.65 s; escalation 2.65–5.37 s; proof 5.65–17.49 s; payoff 17.9–25.19 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| Top zone y<300 | 180 sampled frames, darkest pixel 204/255 → clear. The hook's "lights out" darkness is feathered below the caption band (y ≥ 590). |
| Captions | 10 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 104..891, y 330..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹), icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling, as in all accepted episodes). "Electricity Act", "15 clear days", "under protest", "six-month average" and
  "pending" are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov feedback rules)
- **Hook (0–2.65 s):**
  - Under a warm pendant lamp the ELECTRICITY BILL slides up.
  - "THIS MONTH ₹9,800" lights red under "LAST MONTH ₹1,400".
  - The lamp flickers and dies; the room goes dark and only the disputed line glows.
  - The giant caption "WRONG BILL. LIGHTS OUT?" matches the thumbnail.
- **Escalation:** in the dark room, the "PAY ALL ₹9,800 / OR DISCONNECT" notice swings down and the plug is yanked out
  with a spark. The chip "IS THIS LEGAL IN INDIA?" shows.
- **Proof, one idea per beat:**
  - the "ELECTRICITY ACT" stamp ("2003 · Section 56")
  - the NOTICE envelope, then 15 day-tiles fill one by one ("15 CLEAR DAYS", "IN WRITING")
  - six monthly bars, then the red disputed bar towers; "UNDER PROTEST" stamp; "PAY THE LOWER"; "CLAIMED ₹9,800";
    the average line sweeps ("6-MONTH AVERAGE ₹1,400"), then ✓ on the average while the claim bar fades
- **Payoff:**
  - The plug goes back in and the lamp relights ("SUPPLY STAYS ON", hourglass "WHILE PENDING").
  - Three steps appear one at a time with ✓: "IN WRITING", "PAY THE LOWER", "KEEP RECEIPT". "PAID UNDER PROTEST" stamps
    the receipt.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Labels:** each beat has at most 1–3 large labels plus the caption. There are no paragraph cards.
- **Transitions:** scale crossfades dip briefly to the paper background between scenes (≈0.1–0.3 s near 5.5, 9.95 and
  21.3 s). Caption chunks cross-fade at their boundaries, so a boundary frame (e.g. exactly 23.0 s) can show no
  caption for one frame. This is the established style, not a missing asset.

## Defects found and fixed (stills review, before the full render)
- **Bill:** "THIS MONTH" collided with the amount, so the rows were resized.
- **Hook:** the bill stayed bright in the dark, so the room now dims over the bill with the disputed line drawn on top.
- **Hook → escalation:** the hook's zoom muddied the cut to the plug, so it is now a short crossfade.
- **Notice:** the envelope was small, so it was enlarged.
- **Chart:** "CLAIMED ₹9,800" collided with the UNDER PROTEST stamp, so the bar was shortened and the stamp moved.
- **Payoff:** the hourglass sat on the cable, so it was moved. The steps list was left-heavy, so it was centred.
- **Thumbnail:** the lamp cord showed through the chip, so the cord now starts below it.
- The first full render was the final one; no frame review defects required a re-render.
