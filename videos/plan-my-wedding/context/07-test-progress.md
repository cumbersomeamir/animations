# 07 — 15 s style-test progress (origami world)

Brief: 06-style-test.md. The 30 s production work (05-progress.md) is preserved and committed separately.

## Verified facts
- App identity: Plan My Wedding, com.tensorblue.planmywedding, Play developer link text "Tensorblue AI".
- Listing (assets/listing.json, fetched 2026-11-01): venue search, vendor bookings (venues, photographers, makeup, decorators, caterers, DJs, mehendi), save favourites, request quotes, personalised checklist, monitor budget, dashboard next tasks, digital invitations, guest details, follow RSVPs, AI planning assistant, privacy controls; "together in one calm, beautiful workspace".
- Brand palette, sampled from the app's own Play icon (og:image of the listing, saved as tests/15s/assets/app-icon-play.png, 512 px):
  - background cream **#FDF6EE** (exact pixel)
  - ribbon/flower raspberry **#B32F3F** (median), shadow **#8C2622**, highlight **#D95A65**; flower median #B83644
  - gold rings **#C3904C** (median), shadow **#AE722E**, highlight **#D9AE64**; leaf gold #C99C5F
  - The icon shows a gold heart made of two rings, a raspberry ribbon and a four-petal raspberry flower with gold leaves.
- Derived (not sampled): blush #F3DAD6 (18% raspberry on cream), blushDeep #E6BDB9, creamDeep #F1E3D2, goldPale #EBD5AE, ink #4A1E26 (darkened raspberry), skin tone #E9C9AE for figures.
- The previous brief's colour #DDA4AD does not appear in the icon, so it is not used in this test. The palette is **verified**, no longer provisional.

## Skill provenance
- Read on 2026-11-01: `plugins/animation-styles/skills/paper-animation/SKILL.md` (HEAD of Dror-Bengal/claude-video-skills, 135 lines) and its linked reference `reference/paper-animation-styles.webp` (five-style comparison; panel 5 = origami world). No scripts or installers from that repo were run (it contains none for this skill; it is prompt guidance for AI image/video models).
- **Style-only skill → adaptation:** the skill targets AI image/video generation (Nano Banana 2 / GPT Image 2 start frames + video prompts). No paid API or model was used. Instead its visual grammar is implemented as original local code (Node + @napi-rs/canvas + FFmpeg):
  - "What makes anything read as paper": grain/fibre overlay on every pixel; soft diffused cast shadows on every piece; crease highlight lines; faceted tones from upper-left light. **Planar motion only** (hinge folds, pop-up rises, slides, pivots; no squash/stretch). **Stepped timing**: the whole picture is quantized to 12 fps (`stepT`) with per-step jitter (`jit`).
  - Origami lane anchors: everything folded with clean geometric creases (card → kite → crane, faceted hearts, people, coins, lens). Pleated details (canopy, accordion checklist, pleated dress). Soft pastel palette exception: blush/cream with gold/raspberry accents. The skill suggests sage, but sage is left out because it is not a brand colour.
  - Camera inside the paper world: eye-level stage with a floor plane, a riser and a faceted wall in parallax; no diorama/box exterior view.
  - Paper transitions: foreground wipe (crane swoops), pop-up unfold (all set pieces), assemble (pull-back), fold flat → card opens on its crease (end).
  - "Text overlays happen in post": captions on folded paper strips rendered over the scene.
  - Not applicable / not used: model-choice rules, verbatim prompt blocks, "physicality block" wording (realised as rendering rules instead).

## Creative choices
- Story: the invitation folds into a crane; each crane pass unfolds one part of the world (venue → vendors → checklist + budget → invitations/RSVPs). The pull-back shows it all coordinated, then it folds flat into the end card. Storyboard: tests/15s/storyboard.md.
- Type: Cormorant Garamond 700 (titles/captions), Jost 500/600 (labels, CTA). Different from the 30 s cut (Fraunces / DM Sans / Caveat).
- Sound: original synthesized music-box + pad + pluck score in D major at 96 BPM, plus 77 synthesized paper SFX cues from src/cues.mjs. Narration: kokoro-js 1.2.1 + Kokoro-82M ONNX (Apache-2.0), voice af_heart, local CPU, reusing weights already downloaded for the 30 s cut.
- End card shows the official Play icon (verified asset) inside the CTA banner, generic "Explore on Google Play" text, and no store badge/logo.

## Render checks (final, pass 2)
- `qa/verify.json`: 15.000 s; H.264 High 1080x1920 yuv420p 30 fps, 450 frames; AAC 48 kHz stereo 15.000 s; −15.9 LUFS, TP −3.2 dBFS; full decode: no errors.
- Inspected: qa/contact-sheet.jpg (every 0.5 s), qa/boundaries.jpg (16 boundary frames), plus targeted stills at 2.45, 4.75, 9.95, 12.7, 13.1, 13.45 s.
- Fixes applied: see tests/15s/QA.md "Defects found and fixed" (7 items).

## Exact commands (from videos/plan-my-wedding/tests/15s)
```
npm ci                       # pinned: @napi-rs/canvas 1.1.0, kokoro-js 1.2.1, @expo-google-fonts/cormorant-garamond 0.4.1, @expo-google-fonts/jost 0.4.2
node src/tts.mjs             # narration -> build/vo (downloads Kokoro weights once if not cached)
node src/audio.mjs           # score + SFX + VO mix -> build/mix.wav
node src/render.mjs          # 450 frames, 4 parallel chunks -> build/video_lossless.mkv (~15 s)
node src/mux.mjs             # x264 crf17 + AAC 192k, loudnorm -> plan-my-wedding-15s-test.mp4
node src/verify.mjs          # qa/ffprobe.json, qa/verify.json, qa/decode.log, qa/contact-sheet.jpg, qa/boundaries.jpg
node src/render.mjs --frames 0,60,120   # stills for inspection
```

## Next step
- User review of the test. Open choices: a regional narration voice, 12 fps versus a softer stepped cadence, and whether to carry origami into a 30 s cut.
- The 30 s production video (05-progress.md) still needs audio, mux and QA to finish.
