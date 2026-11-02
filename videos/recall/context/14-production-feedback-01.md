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

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `1f7208ec0e46fa37da69a3c8ee1e2c6595f2fc36c4f81302086e402258fef555` (18,766,196 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames (counted by full decode), AAC-LC 48 kHz stereo; video, audio and
  container all 30.000000 s; full FFmpeg decode clean.
- −14.7 LUFS integrated, −1.5 dBTP true peak, LRA 4.9 LU, 0 clipped samples; ASR WER 0.0.
- Narration lines located in the final audio by cross-correlation: all six within 0.1 ms of plan (corr ≈ 0.83).
- Caption ink x 132–949, y 341.5–464.5, ≤ 2 lines; nothing above y 300; labels in the central region; no overlaps.
- zxing-cpp on the drawn cards: small logo decodes "HELLO FROM RECALL"; 15×15 sticker and thumb-over-top-right-marker
  do not; phone-insert frames at 3.0 s and 24.9 s decode from the final MP4.
- 25/25 automated checks pass. Limits: audio judged by measurement + ASR (cannot listen); Instagram reference not viewed;
  POV phone inserts hide the person; no lip-sync by design.

## Creative decisions taken during production (not facts)
- One original café customer (oatmeal sweater, lime cuffs); three-way cutting café ↔ phone POV ↔ giant 3D code.
- Covered marker is the top-right one so the left hand reaches it from the card edge without hiding the code.
- On-screen takeaway "Small logo, clear corners." over the silent peel beat (22.85–25.95 s); CTA in the final 3.85 s.

## Progress
- 2026-11-02: repo/branch verified; round folder new; research done; narration done; QR built and verified; durable
  context 11/14/15 written; scene work started.
- 2026-11-02: scene fixes from stills (thumb shot, phone size, hook/CTA framing); full render run 1 (two layout checks
  failed by 1.5 px / 15 px) → margins fixed → full render run 2: all checks pass. Sources/docs/caption written.
- Exact commands: `cd videos/recall/production/30s/2026-11-02-feedback-round && WORKERS=3 ./build.sh` (mix → 900 frames
  → card images → mux → qa/qa.py → qa/narration_sync.py); `audio/.venv/bin/python qrdata/make_qr.py` re-verifies the QR.
- Delivered: committed and pushed to `claude-video/recall`, MP4 attached in chat. No further episode started; no automation.
- Next (only on user request): a new episode in the Low-poly Everyday Discovery format (11 + 15) in a new folder.
