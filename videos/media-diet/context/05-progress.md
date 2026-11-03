# Progress

## Verified facts
App identity and branch specified. Saved public app listing included when available.

## Creative decisions
Brief is a proposed direction; refine within this app context.

## Completed
Isolated context scaffold prepared. No new video has been rendered yet.

## Next
Read context in numbered order, storyboard, implement, render, inspect, fix and deliver.

## Checkpoint 2026-11-02 (educational session) — honest status of earlier work
- Inspected at the start of the educational session (branch `claude-video/media-diet`, commit 8a9342c):
  no earlier render, no 30-second campaign MP4, no 15-second skill test and no unfinished build existed on this branch
  (only the context scaffold above). Nothing to preserve, trim or relabel.
- The 30 s campaign video described in 02/04 remains **not rendered in this repository**. The old campaign MP4 referenced in
  01-product-facts.json (`previous_brief_reference.video`) lives outside this repo and was neither imported nor relabelled.
- The user then approved a new educational direction (context/08). Active work and its progress are tracked in
  context/10-educational-progress.md; campaign requirements do not govern educational pilots.

## Checkpoint 2026-11-02 — production round production-30s-2026-11-02
- New 30.000 s educational production rendered, verified and committed: production/30s/2026-11-02/media-diet-30s-production-01.mp4
  (SHA-256 b3bbbf4c2e9b2ed6f40de763479e95178ec0f53d9ab9f5909d98f685c14c9763). Format rules: context/11-production-format.md; brief/script/storyboard/QA: context/12-production-30s-01.md.
- Earlier outputs preserved unchanged (education/pilot-01/…). No automation created.

## Checkpoint 2026-11-02 — batch production-30s-2026-11-02-batch-02
- New 30.000 s production rendered, verified and committed: production/30s/2026-11-02-batch-02/media-diet-30s-production-02.mp4
  (SHA-256 f077ae0bfb37b1ac84905cec0b2379421404183c5a584b42f641effd2d7a69d8). Brief/feedback/script/sources/storyboard/QA: context/13-production-30s-02.md; format updates: context/11.
- Production 01 and the education pilot preserved unchanged. No automation created.

## Checkpoint 2026-11-02 — feedback round (Layered Tech Cutaway)
- New 30.000 s episode rendered, verified and committed: production/30s/2026-11-02-feedback-round/media-diet-30s-feedback-01.mp4
  (SHA-256 2b713067274a19f9822075edf627c992938686cd849d69ca162fd7a35a7b57e5). Style upgrade + new caption/audio rules: context/11 "FORMAT UPGRADE"; brief/script/sources/storyboard/QA:
  context/14-production-30s-feedback-01.md. Previous MP4s preserved. No automation created.

## Checkpoint 2026-11-03 — round 02 (in progress)
- No generation was active at the start (clean at c61ea19, remote equal). Topic (emergency satellite messaging) not covered before.
- Committed: production/30s/2026-11-03-round-02/ sources (src/film.js on the accepted renderer, timeline, cues, Kokoro narration),
  build/QA scripts, SOURCES.md (Apple 101573/105097, Apple Newsroom 2022, Google Pixel 15254448), caption, licences, README;
  context/15-production-30s-round02-01.md; one episode-log row in context/11.
- Running: full 900-frame render (`node build/render.mjs film frames 0 449` + `… 450 899`), then
  `SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA). Next: inspect QA, fix defects, commit MP4 + QA, push, attach.
