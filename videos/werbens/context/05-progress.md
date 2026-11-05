# Progress (30-second production video)

## Verified facts
- App Werbens, package com.werbens.app, branch claude-video/werbens, account info@tensorblue.com.
- Listing evidence (assets/listing.json, sha256 verified 710c80fd...): "Discover creators and manage brand campaigns, briefs and conversations."; Android; Business; price 0; Rated 3+; publisher Tensorblue AI.
- Icon (assets/icon.png, sha256 verified b9709c1f...): violet #6234FB background, white ribbon "W".
- Unknowns kept unknown: no metrics, pricing claims, endorsements or outcome guarantees.

## Creative decisions
- Editorial paper-cutout world + expressive stickman rig; violet ribbon motif = cause of every fix. Storyboard: videos/werbens/storyboard.md.
- Narration: Kokoro-82M (Apache-2.0, local, kokoro-js 1.2.1), voice af_heart; brand phoneme override wˈɜɹbɛnz (ASR verified "Werbens"/"Wurbens").
- Music/SFX: to be synthesised procedurally (original).

## Completed (WIP, preserved)
- Project scaffold videos/werbens/project (package.json pinned: @napi-rs/canvas 1.1.0, kokoro-js 1.2.1).
- src/tts.mjs + src/narration.mjs: narration generated and ASR-checked (src/asr_check.mjs, Whisper small.en).
- src/lib/* (rig, props, ribbon, captions, draw, util), src/timeline.mjs, src/scenes.mjs written. Pose sheet verified.
- NOT yet: render.mjs, audio.mjs, full render, QA. No 30s MP4 rendered yet.

## Paused
- 2026-11-01: user redirected to a separate 15s Three.js style test (see 06-style-test.md / 07-test-progress.md). 30s WIP committed unchanged so it can be resumed.

## Next (30s)
- Write render.mjs + audio.mjs, render, inspect stills/contact sheet, QA, fix, deliver videos/werbens/output/werbens-30s.mp4.

## Checkpoint 2026-11-02 (new Code session, educational brief)
- Honest status: UNFINISHED. No 30 s MP4 exists in the repository; render.mjs/audio.mjs were never written. Sources stay
  exactly as committed in 3090eba. Not resumed in this session: the user-approved next brief is the educational pilot
  (see context/08–10). Nothing here was overwritten, trimmed or relabelled.

## Pointer 2026-11-02
- A separate approved round, production-30s-2026-11-02, delivered a NEW 30 s educational video at
  `production/30s/2026-11-02/werbens-30s-production-01.mp4` (see context/11 and 12). The 30 s promo WIP above remains
  unfinished and was not reused.
- Batch production-30s-2026-11-02-batch-02 delivered `production/30s/2026-11-02-batch-02/werbens-30s-production-02.mp4`
  ("The ad that admits a weakness"; see context/11 and 13).
- Feedback round (2026-11-02) delivered `production/30s/2026-11-02-feedback-round/werbens-30s-feedback-01.mp4`
  ("The decoy effect", new "Satisfying Product Theatre" style; see context/11 "Update — feedback round" and context/14).
- Round 02 (2026-11-03) delivered `production/30s/2026-11-03-round-02/werbens-30s-round02-01.mp4` ("One shape,
  everywhere"; context/16). Brand colours/logo corrected from official sources: context/15.
- Hindi 03 (2026-11-03) delivered `production/30s/2026-11-03-hindi-03/werbens-30s-hindi03-01.mp4` (Hindi narration
  via Kokoro hf_alpha + eSpeak NG hi; context/18). Colours/logo from app.werbens.com: context/17.
- Hindi 04 (2026-11-04) delivered `production/30s/2026-11-04-hindi-04/werbens-30s-hindi04-01.mp4` (fair before/after;
  context/19).
- Feedback-05 (2026-11-05) delivered `production/30s/2026-11-05-feedback-05/werbens-30s-feedback05-01.mp4` (offer clarity;
  context/20).
