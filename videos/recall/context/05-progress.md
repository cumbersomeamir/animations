# Progress (30 s production video)

## Verified facts
- App Recall, package com.recallmobile, branch claude-video/recall, workspace videos/recall/.
- assets/listing.json sha256 1f92917f…f039 and assets/icon.png sha256 c059d0e0…2962 match 03-assets.json.
- Only product claim used: "Turn your study material into lessons, practice and spaced reviews." (EDUCATION, 12+, Tensorblue AI, Android).
- Icon colours sampled: lime #C7F36B, ink #20251B, page #F8FAF3.
- Unknowns kept unknown: no pricing, metrics, outcome guarantees, endorsements or UI screens.

## Creative decisions
- Stickman story with cause and effect (see project/STORYBOARD.md); tile = stylised icon prop; real icon PNG on the end card.
- Palette: paper #F4F2E9, ink #20251B, lime #C7F36B (icon); lavender #B597E7 (earlier brief reference) for "escaping" cards.
- pycairo vector renderer → FFmpeg; Kokoro af_heart narration; numpy/scipy synthesised music + 142 event-locked SFX.

## Completed
- [M1] Context read; toolchain; narration.
- [M2] Renderer, audio, QA scripts; full renders; fixes (see qa/QA.md); final render verified.
- Output: videos/recall/output/recall-30s.mp4 (30.000 s, 1080x1920, 30 fps, H.264/AAC, -16.2 LUFS).

## Exact commands
```
cd videos/recall/project
./build.sh                 # venv, audio.py, render.py, mux, qa.py
TTS=1 ./build.sh           # also regenerate narration (needs ./fetch_models.sh)
```

## Verification
qa/QA.md, qa/qa_report.json, qa/ffprobe.json, qa/contact_sheet.png, qa/boundaries.png.

## Unresolved
- Audio judged by measurement + ASR only (cannot listen).

## Next
30 s complete. Separate 15 s style test tracked in 06-style-test.md / 07-test-progress.md.

## Update 2026-11-02: educational direction (newer brief)
- Active direction moved to educational pilots: see 08 (strategy), 09 (pilot 01 brief/storyboard), 10 (progress).
- Pilot 01 delivered: `videos/recall/education/pilot-01/recall-education-pilot-01.mp4` (15.000 s, verified; QA in
  `education/pilot-01/qa/QA.md`). The 30 s ad above is untouched. The 06 15 s style test is not started (07).
- Production round 2026-11-02: `videos/recall/production/30s/2026-11-02/recall-30s-production-01.mp4` (30.000 s knowledge
  challenge; format in 11, record + QA in 12).
- Production batch-02 2026-11-02: `videos/recall/production/30s/2026-11-02-batch-02/recall-30s-production-02.mp4`
  (30.000 s knowledge challenge "kilo of steel vs feathers"; record + QA in 13).
- Feedback round 2026-11-02 (quiz direction retired; new durable format 11 + style recipe 15 "Low-poly Everyday
  Discovery"): `videos/recall/production/30s/2026-11-02-feedback-round/recall-30s-feedback-01.mp4` (30.000 s, QR code
  with a logo; record, sources + QA in 14).
- Round 02 2026-11-03 (same F01 performer/set/caption/voice; CTA corrected to "Download Recall for learning any new
  subject with AI."): `videos/recall/production/30s/2026-11-03-round-02/recall-30s-round02-01.mp4` (30.000 s, microwave
  cold patches; record, sources, product-fact check + QA in 16).
- Hindi 03 2026-11-03 (latest user correction: Hindi narration + Devanagari captions; same performer/set/phone; Kokoro
  official Hindi voices): `videos/recall/production/30s/2026-11-03-hindi-03/recall-30s-hindi03-01.mp4` (30.000 s, wet
  touchscreen; record, Hindi voice/ASR checks, sources + QA in 17).
