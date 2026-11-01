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
