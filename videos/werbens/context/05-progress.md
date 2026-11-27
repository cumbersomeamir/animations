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
- English-06 (batch 2026-11-06-english-06) delivered `production/30s/2026-11-06-english-06/werbens-30s-english06-01.mp4`
  (attribute framing, English narration + captions, Meshline voice; context/21). Suggested backpack topic replaced (duplicate).
- English-07 (batch 2026-11-06-english-07) delivered `production/30s/2026-11-06-english-07/werbens-30s-english07-01.mp4`
  (anchoring on a fictional café menu; English narration + captions, Meshline voice; context/22).
- English-08 (batch 2026-11-07-english-08) delivered `production/30s/2026-11-07-english-08/werbens-30s-english08-01.mp4`
  (scarcity; suggested "admit a flaw" topic replaced as a duplicate of #02; English narration + captions; context/23).
- English-09 (batch 2026-11-08-english-09) delivered `production/30s/2026-11-08-english-09/werbens-30s-english09-01.mp4`
  (endowed progress; suggested "show the outcome" topic replaced as a duplicate of #01; English narration + captions; context/24).
- English-10 (batch 2026-11-09-english-10) delivered `production/30s/2026-11-09-english-10/werbens-30s-english10-01.mp4`
  (make the next action specific; W3C WCAG 2.2 SC 2.4.4 + F84; English narration + captions; context/25).
- English-11 (batch 2026-11-09-english-11) delivered `production/30s/2026-11-09-english-11/werbens-30s-english11-01.mp4`
  (choice overload; suggested "feature list vs outcome" topic replaced as a duplicate of #01; English narration + captions; context/26).
- 2026-11-11: approved feedback rules persisted in `context/27-approved-feedback-rules-2026-11-11.md` (pointer in context/11);
  they govern english-12 onward.
- English-12 (batch 2026-11-11-english-12) delivered `production/30s/2026-11-11-english-12/werbens-30s-english12-01.mp4` +
  thumbnail (brand positioning: same product, new perception; Häagen-Dazs + McClure 2004; dark-navy app.werbens.com theme; first
  episode under context/27; context/28).
- English-13 (batch 2026-11-13-english-13) delivered `production/30s/2026-11-13-english-13/werbens-30s-english13-01.mp4`
  + thumbnail (IKEA effect; Norton, Mochon & Ariely 2012; IKEA concept statement; dark-navy app.werbens.com theme; context/29).
- English-14 (batch 2026-11-14-english-14) delivered `production/30s/2026-11-14-english-14/werbens-30s-english14-01.mp4`
  + thumbnail (unit pricing + unit effect; CMA mayo snapshot; Pandelaere et al. 2011; dark-navy app.werbens.com theme; context/30).
- 2026-11-15: first-frame rule persisted as context/27 §5.
- English-15 (batch 2026-11-15-english-15) delivered `production/30s/2026-11-15-english-15/werbens-30s-english15-01.mp4`
  + thumbnail (free samples vs ads; Smith & Swinyard 1983; Bawa & Shoemaker 2004; frame 0 = thumbnail; dark-navy app.werbens.com theme; context/31).
- English-16 (batch16 2026-11-15-english-16) delivered `production/30s/2026-11-15-english-16/werbens-30s-english16-01.mp4`
  + thumbnail (compromise effect; proposed decoy topic replaced as a duplicate of #03; Simonson & Tversky 1992; frame 0 = thumbnail; render 2 after a frame review moved in-world text off the platform icon rail; sha256 f074b38a; context/32).
- English-17 (batch17 2026-11-15-english-17) delivered `production/30s/2026-11-15-english-17/werbens-30s-english17-01.mp4`
  + thumbnail (space-to-product ratio / negative space; proposed topic kept, not covered before; Sevilla & Townsend 2016;
  frame 0 = thumbnail: overcrowded shelf with one lit bottle; render 2 after a frame review removed a near-empty transition;
  sha256 2b2d5d43; context/33).
- English-18 (batch18 2026-11-15-english-18) delivered `production/30s/2026-11-15-english-18/werbens-30s-english18-01.mp4`
  + thumbnail (proposed packaging-taste topic covered by the pilot + #14 → switched to sound cues and perceived carbonation,
  "SAME DRINK. DIFFERENT FIZZ?"; Zampini & Spence 2005; frame 0 = thumbnail; panned synthesised fizz bed; render 2 after a
  review merged two too-short caption groups; sha256 ba78e2b4; context/34).
- English-19 (batch19 2026-11-17-english-19) delivered `production/30s/2026-11-17-english-19/werbens-30s-english19-01.mp4`
  + thumbnail (proposed decoy topic covered by #03 → switched to subtractive vs additive option framing, "SAME OPTIONS. BIGGER
  ORDER?"; Park, Jun & MacInnis 2000; UK CCR 2013 reg. 40 for paid extras; frame 0 = thumbnail; render 1 passed review;
  sha256 b468d260; context/35).
- English-20 (batch20 2026-11-17-english-20) delivered `production/30s/2026-11-17-english-20/werbens-30s-english20-01.mp4`
  + thumbnail (left-digit effect, "WHY 99, NOT 100?"; topic not covered before; Thomas & Morwitz 2005, Anderson & Simester 2003,
  Wadhwa & Zhang 2015; frame 0 = thumbnail; live feedback applied (app.werbens.com colours/logo); render 2 after a review
  removed a false intermediate "3.99"; sha256 23ab87bc; context/36).
- English-21 (batch21 2026-11-18-english-21) delivered `production/30s/2026-11-18-english-21/werbens-30s-english21-01.mp4`
  + thumbnail (proposed decoy-vs-compromise topic covered by #03 + #18 → switched to the zero-price effect, "FREE BEATS
  BETTER?"; Shampanier, Mazar & Ariely 2007; Hossain & Saini 2015 limit; frame 0 = thumbnail; live feedback applied
  (app.werbens.com colours/logo); render 2 after a review removed a near-empty lateral move; sha256 87d77b67; context/37).
- English-22 (batch22 2026-11-19-english-22) delivered `production/30s/2026-11-19-english-22/werbens-30s-english22-01.mp4`
  + thumbnail (free-shipping threshold, "THE FREE SHIPPING TRAP"; topic not covered before; Lewis, Singh & Fay 2006; exact
  illustrative math 40+6=46 vs 40+10=50; captions y 293–447 per the brief (now standard, context/27 §6); frame 0 = thumbnail;
  live feedback applied (app.werbens.com colours/logo); render 2 after a review (denser move, longer pause); sha256 434afd8b;
  context/38).
- English-23 (batch23 2026-11-21-english-23) DELIVERED `production/30s/2026-11-21-english-23/werbens-30s-english23-01.mp4`
  + thumbnail (Spotify Wrapped as an identity-sharing distribution format, "THE CUSTOMER BECAME THE CHANNEL"; not covered
  before; first non-pricing topic after five pricing episodes; Spotify Newsroom 2018/2025, Berger 2014, Toubia & Stephen 2013;
  original illustrative card, no metrics; new camera grammar push-in/orbit/crane/descend; frame 0 = thumbnail; captions
  y 293–447; render 2 after a review (records spiral in face-on, spin ends facing the viewer); sha256 5b58d498; context/39).
- English-24 (batch24 2026-11-23-english-24) DELIVERED `production/30s/2026-11-23-english-24/werbens-30s-english24-01.mp4`
  + thumbnail (IKEA's showroom-first store guide + mental simulation of use, "WHY ROOMS COME FIRST?"; not covered before —
  distinct from #15 IKEA effect and #19 space-to-product ratio; IKEA NZ/AU/IN pages, Escalas 2004, Elder & Krishna 2012;
  original miniature store with pop-up rooms, no numbers; new camera grammar: follow-cam along a store path; frame 0 =
  thumbnail; captions y 293–447; render 2 after a review (SHOWROOM FIRST label moved off a light floor plate); sha256 1835159a;
  context/40).
- English-25 (batch25 2026-11-27-english-25) IN PROGRESS `production/30s/2026-11-27-english-25/werbens-30s-english25-01.mp4`
  + thumbnail (Share a Coke: the cooler became a search for your name, a friend's name a gift, "FIND YOUR NAME?"; not covered
  before — scoped to the shelf purchase mechanism to stay distinct from #25 Spotify Wrapped; Coca-Cola history page + 2014/2015/
  2025 releases, Shapiro et al. 1997; original generic bottles, illustrative names, no figures; context/41). Done: existence
  check (no prior batch-25 work), research, brand re-check, script, narration + timing, audio mix (0 NaN/Inf), scene (cooler of
  150 named bottles, label flip wave, wall of six coolers, search light, name stream, find + gift + hand-over), 6 stills passes
  (wall + frame-0 framings solved by projection; labels get a dark halo over the busy cooler), thumbnail,
  `node src/qa_dom.mjs 3` = 0 issues; checkpoint commit. Next: full render, mux, qa.sh, frame review, ASR, docs, push, attach.
