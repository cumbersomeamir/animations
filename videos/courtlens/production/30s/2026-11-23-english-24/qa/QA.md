# QA: courtlens-30s-english24-01.mp4 (English, India; batch 24) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-23-english-24/courtlens-30s-english24-01.mp4`
  sha256 `ff23f4c838fb125c9099267acfd3a6ce68795a139975239576f769eeb3ea11a5` (23870741 bytes)
- Thumbnail: `courtlens-30s-english24-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `6df8176563c4048ca572d95070b3d7b49f6a346fe2e171b1793d401ca9911f58`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (35 beats and cuts), `final-frame.jpg`. Caption bounds and frame
zero: `src/capcheck.py <mp4> <thumb> <out> 230 470 470 545`.

## Automated checks (all PASS, on the final file)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.1 LUFS integrated, LRA 2.2 LU, true peak −2.4 dBFS (no clipping); mix gain 6.3 dB |
| Narration placement | 10/10 English lines at planned start +3 ms (similarity 0.94–0.97) |
| Pacing | hook 0.05–1.57 s; superhook 1.85–5.17 s; proof 5.45–21.57 s; payoff 21.90–26.31 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: a dark vault with a wall of two-key steel lockers, locker 212 hanging open and empty, a red alarm sweep inside the vault, an empty red velvet jewellery box in the foreground, and "LOCKER ROBBED. WHO PAYS?" (mean luma 182/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.68/255 outside the chip band (99th percentile 6.0). Voice starts at 0.05 s. |
| Caption band (y≈280–460) | Caption ink in decoded frames (every 3rd frame): **x 104..894, y 285..449** |
| Top zone y<280 | 180 sampled frames, darkest pixel 205/255 → clear (the alarm beam is clipped to the vault) |
| Captions | 13 English chunks, ≤ 2 lines, non-overlapping; at most the caption plus one short pill |
| Bottom/right controls | Pills sit at y≈1356–1456 and vital labels at x ≤ 900. The vault backdrop fades out by y≈1445. |
| Missing assets | none: Inter faces (including ₹ and ×), the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries. Then frames 200–305 were re-rendered in place (placeholder slots); neighbours 197–199 and 306–308 plus frames 0 and 899 are bit-identical. Audio re-muxed and all checks re-run. |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody watched the video in real time or listened to the audio. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.012**.
  - Lines 1–9 are word-perfect ("jewelry" is a US spelling): "RBI's locker rules", "theft, robbery, fire, or a
    building collapse", "fraud by the bank's own staff", "100 times your yearly locker rent", "Floods or earthquakes …
    isn't liable", "can't sell you insurance", "buy your own insurance for costly valuables".
  - The only miss is the brand in line 10, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Hook:** the vault with its alarm sweep; the alarm flares on "break into"; the open door creaks; the box lid snaps
  on "gone". Chip shown.
- **Proof, one condition per shot:**
  - RBI / LOCKER RULES stamp
  - three dashed slots fill on their words with a thief mask, flame and cracked building
  - BANK STAFF badge stamped FRAUD
  - one "1 YEAR" coin multiplies to a ×100 stack: 100 × RENT
  - storm, lightning, floodwater and ground crack ✕: NOT LIABLE
  - the bank's "LOCKER INSURANCE" policy pushed back ✕: NOT FROM THE BANK
- **Payoff:** the rent slip ₹4,000 ×100; a cyan shield wraps the jewellery box ✓: OWN INSURANCE.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Transitions:** crossfades carry content through the cuts. Brief light frames remain at about 5.35 s (before the
  stamp) and 11.95 s (the coin dropping in), each under 0.3 s.

## Defects found and fixed
- **Stills review:**
  - The alarm beam crossed the hook caption and the y<280 zone, so it is now clipped inside a dark vault backdrop.
  - The floodwater had a hard bottom edge, so it now fades.
  - The "×100" chip covered "RENT", so it moved outside the slip.
- **Full render, decoded review:** the events shot was near-empty for about 0.5 s (7.0–7.5 s), so dashed placeholder
  slots were added and frames 200–305 re-rendered.
- **Narration before synthesis:**
  - "RBI rules for banks say" (heard "banksay") became "RBI's locker rules say"
  - "insure costly valuables" (heard "ensure") became "buy your own insurance for costly valuables"
