# QA: courtlens-30s-english15-01.mp4 (English, India; one Madras High Court case) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-15-english-15/courtlens-30s-english15-01.mp4`
  sha256 `c85d0109e5530db43a653d7b7bd29dc419f921e9c47202f9bf2cc32f549720bb`
- Thumbnail: `courtlens-30s-english15-01-thumbnail.png` (PNG 1080x1920; = frame zero + series chip)
  sha256 `04cedb68e587a5f7329fb3223cd87a776bc3df156892292ec17f96ba684c4f02`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.0 LUFS integrated, LRA 3.8 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 7/7 English lines at planned start +3 ms (similarity 0.95–0.98) |
| Pacing | hook 0–1.70 s; escalation 1.75–4.17 s; proof 4.60–20.19 s; payoff 21.20–25.52 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full hero composition (mean luma 187/255, no fade from black, no logo). It matches the thumbnail with a mean abs difference of 1.6/255 outside the chip band. Hook voice onset is 0.08 s. |
| Top zone y<300 | 180 sampled frames, darkest pixel 204/255 → clear |
| Captions | 11 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 109..889, y 330..518 (inside x 100..900, y 230..1500). |
| Missing assets | none: Inter faces (including ₹), icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling, as in all accepted episodes). "2012", "Madras High Court", "custody", "ransom" and "breach of trust" are
  heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov rules and the 15 Nov first-frame rule)
- **Frame zero / hook:**
  - An original degree is locked in an office glass-front drawer: HR plate, gold padlock, lit well, glass sheen, on
    a desk.
  - "YOUR DEGREE. THEIR LOCK?" (4 words) is readable at phone size.
  - The sheen sweeps across the glass, and the padlock rattles on "lock" but holds.
- **Escalation:** a RESIGNATION letter slides in, then the "PAY UP FIRST" tag swings onto the hasp. Chip shown.
- **Proof, one idea per beat:**
  - the degree arcs to the HR tray: "CUSTODY", "WITH CONSENT" ✓
  - the "MADRAS HIGH COURT · 2012 · teachers v. their school" stamp
  - the tag is torn off with ✕: "NOT A RANSOM"
  - ₹ coin → courthouse: "MONEY OWED?" → "SUE FOR IT"
  - police shield + case file "REGISTERED": "POLICE CASE / BREACH OF TRUST"
- **Payoff:** three evidence steps with ✓: "SIGNED RECEIPT", "ASK IN WRITING", "KEEP REPLIES".
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Transitions:** scale crossfades dip briefly to paper (≈0.2–0.3 s near 9.0 and 21.1 s). This is the established
  style.

## Defects found and fixed
- **Stills review (before the full render):**
  - The drawer read like a screen, so a desk and an "HR" plate were added.
  - The custody scene was small and its tick collided with its label, so it was enlarged and the tick moved.
  - The falling tag crossed "NOT A RANSOM", so the label moved above the cabinet.
- **Frame review of the full render:**
  - About 0.9 s of near-empty screen at 21.05–21.95 s before the first payoff step. The step now enters at 21.35, on
    "So get…".
  - Frames 630–805 were re-rendered with `node render.cjs range` and re-muxed (`SKIP_FRAMES=1`); the step's tap sound
    moved with it.
  - Determinism evidence: frames 625–629 and 806–810 re-rendered with the new code are bit-identical (md5) to the
    full render. Frames 650–651 differ, as intended.
