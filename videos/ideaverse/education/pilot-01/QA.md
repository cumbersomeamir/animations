# QA — Ideaverse AI Literacy · Pilot 01 "Why an AI can sound certain and still be wrong" (2026-11-02)

Deliverable: `videos/ideaverse/education/pilot-01/ideaverse-education-pilot-01.mp4`
sha256 2886236d22c4264fdb10695eb34a3a5e2b28f9c127fd25bb5f624ecb15f69460 · 9,659,025 bytes

## Technical (evidence in qa/)
| Check | Result |
|---|---|
| Duration (container / video / audio) | 15.000000 s / 15.000000 s / 15.000000 s (qa/ffprobe.json) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 450 frames; decoded frame count 450 (qa/decoded-video-frames.txt) |
| Audio | AAC-LC, 48 kHz, stereo, 192 kb/s |
| Full FFmpeg decode | OK, no errors (qa/full-decode.log) |
| Loudness | −12.7 LUFS integrated, LRA 2.1 LU, peak −1.4 dBFS (qa/loudness.txt); spectrum qa/spectrum.png |
| Narration intelligibility | faster-whisper base.en on the MP4's own audio, per line (qa/asr-narration.txt): all 6 lines transcribed exactly as scripted ("There is" for "There's"). |

I cannot listen to audio; intelligibility/levels were verified with ASR, loudness metering and a voice-only stem.

## Visual review (qa/contact-sheet-representative.png, qa/contact-sheet-boundaries.png, qa/transition-*.png)
- Opening: frame 0 already has motion (answer box mid-flight from the AI terminal, DOCKET in catch-ready crouch).
- Mechanism readable: TONE gauge slams to SURE (1.0 s) → fluent-text ribbon + taps → SUPPORT drawer yank → insert
  shot shows the chain with the amber dashed missing link (5.6–6.3 s) → CLAIM half lifted alone → reliable-source
  book scan + "NO MATCH" → amber "UNCONFIRMED ?" sticker stamped, gauge droops → takeaway with raised finger.
- Scene boundaries (2.4 / 4.7 / 7.8 / 10.4 / 12.6 s) are continuous camera moves on one stage; no empty frames.
  Captions hand over with a 1–4 frame gap (intentional beat).
- Text: captions inside a backed pill, max width ≤ 980 px, two-line wrap where needed; all within the top safe area
  (y ≈ 230–420). Signature top-left (small), "ILLUSTRATIVE EXAMPLE · NOT A REAL CHAT" at y 1700.
- Continuity: DOCKET's design, palette and props are stable; hands land on props via IK; lip-sync from the voice.

## Defects found and fixed during QA
1. Held box covered DOCKET's face → box lowered to waist height.
2. Hands missed props → numeric IK for box sides, gauge, drawer handle, chain, book, own drawer, stamp.
3. Narrow portrait lens made side shots claustrophobic → FOV 44° and wider camera keys.
4. Drawer reveal hidden behind DOCKET's head → dedicated high-angle insert + hand moves away after the yank.
5. Chain too small to read → links and tags enlarged; lifted chain dangles in front of the dark panel.
6. Stamp text overprinted "DEFINITELY." → solid amber sticker.
7. Wall ticker read like a stray caption; neon sign sat behind captions → ticker removed, sign moved low-left.
8. Gauge hub hid "TONE"; needle covered "SURE" → label moved, needle shortened.
9. Book clipped through the closed SOURCES drawer on return (10.3–10.7 s) → drawer opens to receive it
   (frames 300–329 re-rendered, video re-encoded).
10. "Mark it unconfirmed" heard as "Market…" → line rephrased to "Label it unconfirmed"; SFX (thwack, droop glide,
    "nope" blips) lowered under that line.

## Known, accepted
- The camera move into the drawer insert (≈4.8–5.0 s) passes close to DOCKET's head for ~6 frames.
- The B→C and D→E camera moves are quick (~0.5–0.6 s) swings; no motion blur is rendered.
- Loudness is −12.7 LUFS (slightly above a −14 target); platforms normalise; true peak stays below −1 dBFS.

## Educational accuracy
- One concept: fluent/confident wording ≠ evidence; check support against a reliable source; label unverified.
- The answer in the scene HAS support (drawer, SOURCE tag) — the gap is in the chain, so the video does not imply
  that AI never retrieves sources, nor that citations guarantee truth. Claim-to-source map: SOURCES.md (NIST AI 600-1,
  Kalai et al. 2025, Magesh et al. 2024, Wineburg & McGrew 2019).
- Everything shown is labelled illustrative; no app UI, experiment data, metrics, testimonials or news announcement.
- App presence: small Ideaverse signature only; no CTA, no product claims.
