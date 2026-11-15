# QA: courtlens-30s-english16-01.mp4 (English, India; batch 16) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-15-english-16/courtlens-30s-english16-01.mp4`
  sha256 `38f107c106022de6cd70b369b6f9a01ff7261448fc6ced2ed8e36e9853966ad9`
- Thumbnail: `courtlens-30s-english16-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `3f469b9c11244e39cb101b2df8484d2da617ffe5cfee57e045d8eee47729e6b1`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.1 LUFS integrated, LRA 1.9 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 8/8 English lines at planned start +3 ms |
| Pacing | hook 0–1.40 s; escalation 1.45–4.89 s; proof 5.25–22.07 s; payoff 22.45–26.48 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition (home, HQ tower, both pins, hook words; mean luma 208/255; no fade or logo). It matches the thumbnail at mean abs diff 1.5/255 outside the chip band. Voice starts at 0.05 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 12 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 106..894, y 330..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹), icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.051**. All three misses are spellings, not wrong words:
  - "company's" heard as the homophone "companies"
  - the portal name "e-Jagriti" spelled "EJGreedy" (a proper noun; per-line, without music, it was "eJagridi";
    respellings tested worse)
  - the brand "Courtlens" spelled "Courtlands" (as in all accepted episodes)
  - Every other word is recognised exactly, including "Consumer Protection Act", "two years", "replacement, refund,
    or compensation" and "district commission".
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules and the 15 Nov first-frame rule)
- **Frame zero / hook:**
  - your home in front, the company's HQ tower far away down the road
  - YOURS / THEIRS pins
  - "THEIR CITY, OR YOURS?" (4 words), readable at phone size
  - The pins bounce on their words.
- **Escalation:** the phone cracks, "NO REPLY", "ANOTHER STATE". Chip shown.
- **Proof, one idea per beat:**
  - the "CONSUMER PROTECTION ACT · 2019 · Section 34" stamp
  - a commission rises beside your home while the tower fades: "WHERE YOU LIVE"
  - the generic e-Jagriti form: FILE → FILED ✓, "FILE IT YOURSELF"
  - YOU vs LAWYER with an "OPTIONAL" stamp
  - "DEADLINE" → "2 YEARS" bar with a PROBLEM pin
  - four remedy slots that light up one by one: REPAIR, REPLACE, REFUND, COMPENSATION
- **Payoff:** BILL + replies drop into a folder, which flies to the commission: "DISTRICT COMMISSION".
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Transitions:** scale crossfades dip briefly to paper (≈0.2–0.3 s). This is the established style.

## Defects found and fixed
- **Stills review (before the full render):**
  - Frame 0 lacked the pins, so they are now static at t=0 and bounce later; frame 0 = the thumbnail.
  - "THEIRS" touched the chip, so the tower moved right.
  - The YOU/LAWYER labels were overlapped by legs, so they moved down.
  - The folder flew into the caption band, so it now scales about its own centre.
  - The narration was trimmed and the "and/in" wording fixed.
- **Frame review of the full render:**
  - a ~1.3 s near-empty beat at 17.6–18.9 s: four placeholder slots now wait for the remedies
  - an empty deadline bar for ~0.8 s: a "DEADLINE" label now leads into "2 YEARS"
  - a ~0.4 s gap before the Act stamp: the stamp moved to 5.5 s, and its sound moved with it
  - "BILL + REPLIES" fading under "DISTRICT COMMISSION": the labels are now sequential
  - Frames 150–210 and 430–805 were re-rendered with `node render.cjs range` and re-muxed (`SKIP_FRAMES=1`).
  - Determinism evidence: frames 145–149, 211–215, 425–429 and 806–810 re-rendered by the new code are bit-identical
    (md5) to the full render. Frames 180 and 600 differ, as intended.
