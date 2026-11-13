# QA: courtlens-30s-english13-01.mp4 (English, India) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-13-english-13/courtlens-30s-english13-01.mp4`
  sha256 `dbc4f175950a4bfe6e3e6618e820002ca6e824ac21f4aea844f4943d568b6913`
- Thumbnail: `courtlens-30s-english13-01-thumbnail.png` (PNG 1080x1920)
  sha256 `60c3a9a030fc79761a8440e7332bab95593607d33a5b04d924aeee90beba67d5`

Machine-readable: `qa_report.json`, `asr_check.json`. Sheets decoded from the final MP4: `contact-sheet-1fps.jpg`,
`transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.0 LUFS integrated, LRA 2.2 LU, true peak −2.4 dBFS (no clipping; voice-forward, quiet bed) |
| Narration placement | 8/8 English lines at planned start +3 ms (similarity 0.95–0.98) |
| Pacing | hook 0–2.55 s; escalation 2.7–5.05 s; proof 5.25–19.63 s; payoff 20.6–26.57 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| Top zone y<300 | 180 sampled frames, darkest pixel 204/255 (only the soft background) → clear |
| Captions | 11 English chunks, ≤ 2 lines, non-overlapping. Caption ink measured in decoded frames: x 103..894, y 330..518 (inside x 100..900, y 230..1500). The series chip sits below at y ≤ 628. |
| Missing assets | none: Inter faces (including ₹), icon and all drawn props render (frames reviewed) |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody listened to the audio or watched the video in real time. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.014**. Every line is word-perfect except the brand, heard as "Courtlands" (an ASR
  spelling, as in all accepted episodes). "RBI", "Ombudsman", "soiled" and "30 days" are heard correctly.
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames, against the 11 Nov feedback rules)
- **Hook (0–2.55 s):**
  - A ₹500 note under a warm spotlight rips along a jagged line (0.35).
  - The halves pull apart (0.62), then sag and dim on "worthless" (1.24).
  - The giant caption "TORN NOTE. WORTHLESS?" matches the thumbnail.
- **Escalation:**
  - A push-through to the teller window, clipped below the caption band.
  - The "NO ACCOUNT? NO EXCHANGE" sign drops from the window top, the tray is pushed back, and ✕ pops.
  - The chip "IS THIS LEGAL IN INDIA?" shows.
- **Proof, one idea per beat:**
  - the "RBI RULES" stamp
  - three branches in depth, each lighting its "NOTES EXCHANGED HERE" board, with "EVERY BRANCH"
  - an account holder ✓ and a walk-in ✓, with "CUSTOMER OR NOT"
  - halves slide together, tape is laid and the whole note is outlined ✓, then "SOILED"; the note goes down behind
    the counter and a fresh note comes up with a shine, then "FREE SWAP"
  - a piece tears off and falls, then "ACCEPTED" ✓; the "what's left" tint and bar appear; the remaining size morphs
    so FULL, HALF and NOTHING light in step with the voice
- **Payoff:**
  - "REFUSED?" ✕, then a COMPLAINT letter written line by line ("IN WRITING")
  - a calendar counts 1→30 ("NO REPLY?"), then an envelope flies to the Ombudsman building ("RBI OMBUDSMAN")
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained".
- **Labels:** each beat has at most 1–3 large labels plus the caption. There are no paragraph cards.
- **Transitions:** scale crossfades dip briefly to the paper background between scenes (≈0.1–0.2 s at 5.0, 10.0 and
  14.75 s). This is the established transition style, not a missing frame.

## Defects found and fixed
- **Stills review (before the first full render):**
  - The hook halves drifted off-frame.
  - Dash-like paper fibres read as a decorative line, so they were removed.
  - The side-branch boards were clipped.
  - The "CUSTOMER OR NOT" label overlapped the people.
  - A floating bar became a full-width counter.
  - The swap crossed the "FREE SWAP" label.
  - There was a blank gap before the stamp.
  - The building overlapped the moving calendar.
- **Render failures:**
  - The first two full renders stopped at ~450 frames with Chromium "Unable to capture screenshot" because the session
    disk was full of old episodes' intermediate frames. Those reproducible frame folders were deleted (the delivered
    MP4s are in git), and a capture retry was added to `render.cjs`.
  - Neither failed render produced an MP4.
- **Frame review of the first complete render:**
  - The dropping sign briefly overlapped the series chip (~2.9 s), so it is now clipped to drop from the window top.
  - A shrinking tick left a stray dot (~13.5 s), so it now fades out with the swap.
  - The ✕ and the complaint letter cross-faded over each other (~21.2 s), so they are now sequential, and the ✕ pops
    at 20.5.
  - The episode was re-rendered in full.
- **Frame review of the second complete render:**
  - The fading "EVERY BRANCH" label sat behind the people stepping in (~9.0 s). It now fades out before they appear.
  - Frames 250–285 (8.33–9.50 s) were re-rendered with `node render.cjs range` and re-muxed (`SKIP_FRAMES=1`).
  - Determinism evidence: frames 245–249 and 286–290 re-rendered by the new code are bit-identical (md5) to the full
    render. Frames 260–262 differ, as expected from the fix.
  - The audio is regenerated deterministically (seeded generator); the final mix measured the same −16.0 LUFS /
    −2.4 dBTP.
