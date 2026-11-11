# QA: courtlens-30s-english12-01.mp4 (English, Tamil Nadu) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-11-english-12/courtlens-30s-english12-01.mp4`
  sha256 `fbedfed53307a8741b8aafd51a87f252006c6bc836699be0ea6f12af8663c6d2`
- Thumbnail: `courtlens-30s-english12-01-thumbnail.png` (PNG 1080x1920)
  sha256 `250436d7efbb611fc7a68844206b79fef7684557272f7524652c86daef6c965b`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −15.9 LUFS integrated, LRA 2.2 LU, true peak −2.5 dBFS (no clipping; voice-forward, quiet bed) |
| Narration placement | 8/8 English lines at planned start +3 ms (similarity 0.95–0.97) |
| Pacing | hook 0–2.75 s; escalation 2.9–4.9 s; proof 5.3–20.7 s; payoff 21.2–26.3 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| Top zone y<300 | 180 sampled frames, darkest pixel 204/255 (only the soft vignette) → clear |
| Captions | 10 English chunks, ≤ 2 lines, non-overlapping, centred on x=500 inside x 100..900, band y 340..540 (inside y 230..1500) |
| Missing assets | none: Inter faces, icon and all drawn props render (frames reviewed) |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling, as in all accepted episodes). "Tamil Nadu", "24", "7 a.m." and "8 p.m." are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov feedback rules)
- **Hook (0–2.75 s):** the brass key slides in and turns (0.15–0.92); the door swings open (1.0–2.1); warm light and a
  lamp appear and light spills over the full-width hallway floor. The giant caption "THEIR HOUSE. YOUR HOME?" matches
  the thumbnail.
- **Escalation:** a push-through into the room (clipped below the caption band). The tenant looks up as a long shadow
  crosses the floor; a red "?" appears; the chip "IS THIS LEGAL IN INDIA?" shows.
- **Proof, one idea per beat:**
  - the "TAMIL NADU" stamp with "Tenancy Act 2017 · s.17" and the line drawn
  - Repairs → Inspection → Agreed reason, revealed one at a time
  - the NOTICE slides in ("IN WRITING") and the 24-hour ring fills ("AHEAD")
  - WHY ✓, DAY ✓, TIME ✓, then the 7 am → 8 pm arc lights on a 24-hour dial
- **Payoff:** a day/night split. With notice, the door opens ✓; with no notice, ✕ and the key withdraws. Then
  "RENT COURT" with the gavel strike.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Labels:** each beat has at most 1–3 large labels plus the caption. There are no paragraph cards.

## Defects found and fixed
- **Stills review (before the first full render):**
  - The hallway wall and floor were partial panels with hard edges, so they became full-width gradients with a
    vignette.
  - The thumbnail's key floated beside a barely open door, so it was recomposed: the door half-open with warm light
    and a large foreground key.
  - The "Agreed reason" label had more width.
- **Frame review of the first full render:**
  - The push-through zoom (about 2.75–3.2 s) drew the enlarged door frame across the caption and chip, so the hook
    scene is now clipped below y=560.
  - The escalation room panel had hard top and bottom edges, so it now has soft gradients.
  - The first render was re-rendered in full and superseded. It was not committed; it is archived in the session
    scratchpad.
- **Residual (accepted):** at about 3.0 s the fading chip briefly overlaps the top of the zoomed doorway for under
  0.4 s while it fades in.
