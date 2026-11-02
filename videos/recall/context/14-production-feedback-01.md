# 14 — Feedback round 01: "Why QR codes can still scan with a logo in the middle"

Output: `videos/recall/production/30s/2026-11-02-feedback-round/recall-30s-feedback-01.mp4`. Format: 11 (rewritten for this
round). Style recipe: 15. Earlier MP4s are preserved. No automation.

## User feedback that set this round (essentials; supersedes earlier directions)
- One new 30 s ready-to-post portrait video with English VO; strong opening, distinct scenes that show the mechanism
  as narrated, clear takeaway, and a short natural brand/action CTA in the final 3–4 s.
- **Replace the quiz/game-show direction completely** (no GUESS, REPLAY, answer chips, countdowns or grade tests). Genre:
  useful educational stories about technology or how the world works.
- Reference (watched by the user): agentpoly CAPTCHA short. Adopt its cinematic low-poly room, expressive original
  human acting, cuts between the person's problem and a readable physical screen, warm directional lighting, real depth,
  clear close-ups, concise narration and comedic timing. Do not copy its character, set, script or plot. Keep Recall
  lime/off-white accents. Save the recipe as "Low-poly Everyday Discovery" (15).
- Story: a NEW original everyday phone user sees a logo-covered QR and tries it; cut to a giant 3D QR; error-correction
  information shown as extra tiles rebuilding damaged content (not literal duplicate copies); back to phone scanning;
  then critical locator corners damaged and the scan failing. Accurate QR or clearly illustrative diagram; no invented
  machine-readable result. Do not claim a fixed percentage can always be covered, or universal scanner behaviour.
- Captions y≈340–520, x 90–990, ≤ 2 lines, nothing meaningful above y 300; no crucial diagrams in side/bottom UI areas.
- Voice: Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98 (cached). Subtle music without repetitive loops; clear voice;
  −14 to −16 LUFS; true peak ≤ −1 dBTP.

## Final script (draft kept verbatim after the source check; 63 words, 20.48 s of speech)
| id | text | dur (s) |
|---|---|---|
| l01 | How can a QR code still work with a logo in the middle? | 2.99 |
| l02 | It stores extra error-correction information, so a scanner can rebuild some missing data. | 5.01 |
| l03 | Those three large corner squares help it find and orient the code. | 3.73 |
| l04 | Cover too much, especially those markers, and it may fail. | 3.15 |
| l05 | A bigger logo isn't always better. | 1.94 |
| l06 | Follow Recall for the technology hiding in everyday life. | 3.66 |
Per-line ASR matched every word. Start times are in `timeline.json`.

## The real QR code used (verified, `qrdata/make_qr.py` → `qrdata/qr.json`)
Version 2, level H, mask from segno; alphanumeric text **"HELLO FROM RECALL"**. Single Reed–Solomon block: 16 data +
28 EC codewords. The module-role map (finder/timing/alignment/format/data/EC) is verified by reading back the mode header
and recomputing all 28 EC codewords. zxing-cpp decode tests: clean ✓; 7×7 centre logo (10 codewords) ✓;
15×15 centre logo (25 codewords) ✗; top-right finder covered (no data codewords touched) ✗. The phone shows
"HELLO FROM RECALL" only where the code really decodes.

## Sources (details in `production/30s/2026-11-02-feedback-round/docs/SOURCES.md`)
DENSO WAVE (qrcode.com): error correction ("restore data if the code is dirty or damaged"; Reed–Solomon; levels as a
ratio of total codewords, approx. 7/15/25/30 %), history (position-detecting square marks, orientation from any angle
out of 360°, 1:1:3:1:1), FAQ (caution about overlaying illustrations; trademark wording).

## Storyboard and QA
In the output folder's `docs/STORYBOARD.md` and `qa/QA.md`; summary and progress below.

## Progress
- 2026-11-02: repo/branch verified; round folder new; research done; narration done; QR built and verified; durable
  context 11/14/15 written; scene work started.
