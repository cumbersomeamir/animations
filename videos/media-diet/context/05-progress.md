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

## Checkpoint 2026-11-03 — round 02 delivered
- New 30.000 s episode rendered, verified and committed: production/30s/2026-11-03-round-02/media-diet-30s-round02-01.mp4
  (SHA-256 51db6af0eb83efeadb335a2779200e0f1210816ad31fc5fd346440ee44f47e0e). Accepted Layered Tech Cutaway recipe kept unchanged;
  brief/feedback handling/script/sources/storyboard/QA: context/15-production-30s-round02-01.md; context/11 got one log row only.
- Commands: render `node build/render.mjs film frames 0 449` + `… 450 899` (parallel), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz; full decode clean;
  −15.2 LUFS / −2.0 dBTP; captions y 378–488, 0 safe-area violations; ASR recall 0.961, all lines in window.
- Fixed: V3 heard as "Unsupported phones" → re-worded ("With a supported phone and country, it goes via satellite.");
  stopwatch carry-over into S8. Previous MP4s preserved. No automation created. Unresolved: none known (listen once before posting).

## Checkpoint 2026-11-03 — hindi-03 (in progress)
- Start state: clean at 3704e6a (= remote), no active generation. Topic: current tech news — Apple iOS 27.2 (26 Oct 2026) adds Google's
  SynthID invisible watermark to images made/changed with iPhone generative tools; Google's SynthID Detector checks it (Google blog
  updated 29 Oct). Not covered before. Language override: Hindi narration + Devanagari captions.
- Voice: cached Kokoro-82M v1.0 native Hindi voices hf_alpha 0.7 + hm_omega 0.3, lang hi, speed 1.08 (0.98 overran 30 s); ASR-driven
  wording fixes ("नए"→"बाद के", "सिंथ आई डी" spoken). Captions: Noto Sans Devanagari 700 (@fontsource 5.3.0).
- Committed: production/30s/2026-11-03-hindi-03/ sources, narration, cues, build/QA scripts (incl. asr_check_hi.py), SOURCES.md,
  caption, licences, README; context/16-production-30s-hindi03-01.md; one context/11 log row.
- Running: `node build/render.mjs film frames 0 449` + `… 450 899`; next `SKIP_FRAMES=1 bash build/build.sh`, inspect, fix, commit MP4.

## Checkpoint 2026-11-03 — hindi-03 delivered
- New 30.000 s Hindi episode rendered, verified and committed: production/30s/2026-11-03-hindi-03/media-diet-30s-hindi03-01.mp4
  (SHA-256 a4848025f89e51dd97853bedabeba47b0f1457c7ffbbeb0c716721702b0dea19). Record: context/16-production-30s-hindi03-01.md; context/11 got one log row.
- Commands: `node build/render.mjs film frames 0 449` + `… 450 899` (parallel, ~42 min), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (hin); decode clean; −15.0 LUFS /
  −2.0 dBTP; Devanagari captions y 362–494, 0 violations; Whisper-medium (hi) CER 0.055, all lines in window.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-04 — hindi-04 (in progress)
- Start state: clean at 3b1093c (= remote), no active jobs. Topic (official, dated 2026-11-02): Google Play Store v53.9 reminds you
  if Play Protect stays off; Play Help gives what it does + the path to keep it on. Not covered before; other candidates and why
  they were not chosen are in production/30s/2026-11-04-hindi-04/SOURCES.md.
- Voice: Kokoro Hindi hf_alpha 0.7 + hm_omega 0.3, speed 1.08; ASR-driven spoken spellings (ऐंड्रॉइड, मीडिआ, गये). 74 words, 27.0 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/17, log row.
- Running: `node build/render.mjs film frames 0 449` + `… 450 899` (started 07:46); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-04 — hindi-04 delivered
- New 30.000 s Hindi episode rendered, verified and committed: production/30s/2026-11-04-hindi-04/media-diet-30s-hindi04-01.mp4
  (SHA-256 aa815eb04ce787cd2513904d0be77b02ad5307e66720fd28740b30ff350c38d2). Record: context/17-production-30s-hindi04-01.md; context/11 got one log row.
- Commands: `node build/render.mjs film frames 0 449` + `… 450 899` (parallel, ~43 min), hero fix `… 779 838` + `… 839 899`, then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (hin); decode clean; −14.9 LUFS /
  −2.0 dBTP; captions y 362–494, 0 violations; caption↔speech 9/9; Whisper-medium (hi) per-line CER 0.065.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-05 — feedback-05 (in progress)
- Start state: clean at f37d7d1 (= remote), no active jobs. Topic: Android automatic screen-share privacy extends to Chrome/WebView
  (Google, 14 Oct 2026; rolling out in October to Android 15+) — no in-window item had enough official detail; dated explicitly.
- Voice: approved Hindi Kokoro setup (hf_alpha 0.7 + hm_omega 0.3, 1.08); ASR-fixed wording ("पंद्रह और ऊपर", "छिप जाते हैं"). 27.0 s speech.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, publishing caption, licences, README, context/18, log row.
- Running: `node build/render.mjs film frames 0 449` + `… 450 899` (started 08:35); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-05 — feedback-05 delivered
- New 30.000 s Hindi episode rendered, verified and committed: production/30s/2026-11-05-feedback-05/media-diet-30s-feedback05-01.mp4
  (SHA-256 ff8d7b8806d0ff9e9cba72cd6ebe27a67ae7db9c4ed9ac40ab27fae299c9cc72). Record: context/18-production-30s-feedback05-01.md; context/11 got one log row.
- Commands: `node build/render.mjs film frames 0 449` + `… 450 899` (parallel, ~32 min), then `SKIP_FRAMES=1 bash build/build.sh` (twice: audio fix).
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (hin); decode clean; −14.9 LUFS /
  −2.1 dBTP; captions y 362–493, 0 violations; caption↔speech 8/8; Whisper-medium (hi) full CER 0.088 / per-line 0.102.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-06 — english-06 (in progress)
- Start state: clean at 500fe5d (= remote), no active jobs. Topic (official, 28 Oct 2026): Chrome's enhanced autofill suggests details
  from Gmail in forms; U.S. rollout for Gemini in Chrome users with Personal Intelligence; control in Chrome settings. New topic.
- English narration + captions (approved English Kokoro blend, 0.98, en-us); V6 rephrased after Whisper check. 74 words, 26.4 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts (asr_check_en.py, caption_sync.py), SOURCES.md, caption,
  licences, README, context/19, log row.
- Running: `node build/render.mjs film frames 0 449` + `… 450 899` (started 19:12); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-06 — english-06 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-06-english-06/media-diet-30s-english06-01.mp4
  (SHA-256 bf60786f9b16a7747c6275a4ed8fd4fc4693056d2a483b65f801b7ae3171161c). Record: context/19-production-30s-english06-01.md; context/11 log row → delivered.
- Commands: `node build/render.mjs film frames 0 449` + `… 450 899` (parallel), re-render of frames 68–73 and 414–430 after the
  boundary review (lens limited to S1; S5 starts with an empty field), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS /
  −1.6 dBTP; captions y 378–488, x 135–944, 0 violations; caption↔speech 11/11; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-06 — english-07 (in progress)
- Start state: clean at af431c6 (= remote; english-06 delivered), no active jobs. Topic (official, Meta Newsroom, 5 Nov 2026): WhatsApp
  Events invites reach friends without WhatsApp (RSVP without the app), new Events Home with reminders; limit: guests without
  WhatsApp see the address only after they RSVP; rolling out to everyone over the following weeks. New topic for this app.
- English narration + captions (approved English Kokoro blend, 0.98, en-us); V6 says "after replying" after the Whisper check. 73 words, 25.0 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/20, log row.
- Running (after a session restart stopped the first workers at ~127 frames): `build/render_chunks.sh 0 60 … 420` + `… 480 … 840`
  (resumable 60-frame chunks); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-06 — english-07 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-06-english-07/media-diet-30s-english07-01.mp4
  (SHA-256 c89e87bd5047a31a56e14ead15075ab4110fd19b3833a09b67effebcf39f6d27). Record: context/20-production-30s-english07-01.md; context/11 log row → delivered.
- Commands: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (parallel, resumable), re-render of frames 311–330
  after the boundary review (page opens at the S4 cut), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS /
  −1.9 dBTP; captions y 378–488, x 128–953, 0 violations; caption↔speech 9/9; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-07 — english-08 (in progress)
- Start state: clean at 249d30a (= remote; english-07 delivered), no active jobs. Topic (official, Amazon News, 6 Nov 2026, newer than
  WhatsApp Events): text Alexa for Shopping — a photo of a recipe adds all the ingredients to your cart; invite-only for a small group
  of U.S. customers, expanding over the coming weeks. New topic for this app.
- English narration + captions (approved English Kokoro blend, 0.98, en-us); every take heard exactly by Whisper. 70 words, 24.5 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/21, log row.
- Running: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (resumable); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-08 — english-08 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-07-english-08/media-diet-30s-english08-01.mp4
  (SHA-256 75e35072bda29ae3d2338538fd9f972edc166d11e8a2205f44d4fddfeeb346f0). Record: context/21-production-30s-english08-01.md; context/11 log row → delivered.
- Commands: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (parallel, resumable), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS /
  −2.0 dBTP; captions y 378–488, x 123–958, 0 violations; caption↔speech 10/10; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-08 — english-09 (in progress)
- Start state: english-08 job finished and delivered first (e6458c9 = remote), then clean, no jobs. Topic (official, Spotify Newsroom,
  5 Nov 2026): personal Spotify logins on United seatback screens via QR code; Wi-Fi without a pass; login never on the seatback; auto
  logout after the flight; United Starlink aircraft now, more through 2027. New topic for this app (nothing newer suitable on Nov 6–8).
- English narration + captions (approved English Kokoro blend, 0.98, en-us); "United's" reworded after the Whisper check. 71 words, 24.8 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/22, log row.
- Running: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (resumable); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-09 — english-09 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-08-english-09/media-diet-30s-english09-01.mp4
  (SHA-256 344d8d563f4e0ff3c2c79058a48c3ee356bdc4874648fb8c3e6a25cdbed1ab20). Record: context/22-production-30s-english09-01.md; context/11 log row → delivered.
- Commands: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (parallel, resumable), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS /
  −1.9 dBTP; captions y 378–488, x 158–921, 0 violations; caption↔speech 11/11; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- The repeated english-09 request (same batch ID/path) was treated as this same job — no duplicate render.
- Previous MP4s preserved. No automation created. Unresolved: audio not listened to by a human yet (no listening in this environment).

## Checkpoint 2026-11-09 — english-10 (in progress)
- Start state: earlier accepted jobs finished first, in order (english-09 delivered 8886d96 = remote), then clean, no jobs. Topic
  (official, Meta Newsroom, 6 Nov 2026 — newest consumer launch in the feeds as of 9 Nov 07:48 UTC): Muse spaces; Meta's school-dashboard
  example; self-updating with connected apps; available wherever Muse is; sharing not yet. New topic for this app.
- English narration + captions (approved English Kokoro blend, 0.98, en-us); every take heard exactly by Whisper. 76 words, 24.8 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/23, log row.
- Running: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (resumable); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-09 — english-10 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-09-english-10/media-diet-30s-english10-01.mp4
  (SHA-256 9fa46e991efec11aaf15f10dbee1fb6b4d1dcc4ec94191d916327cf7407e5f4e). Record: context/23-production-30s-english10-01.md; context/11 log row → delivered.
- Commands: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (parallel, resumable), then `SKIP_FRAMES=1 bash build/build.sh`;
  ASR re-scored with `python build/asr_check_en.py media-diet-30s-english10-01.mp4 qa/asr.json` after the apostrophe fix.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS /
  −1.8 dBTP; captions y 378–488, x 122–959, 0 violations; caption↔speech 11/11; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- Repeated english-09/english-10 requests received mid-job were the same batches (already delivered / this job) — nothing duplicated.
- Previous MP4s preserved. No automation created. No analytics used. Unresolved: audio not listened to by a human yet.

## Checkpoint 2026-11-09 — english-11 (in progress)
- Start state: clean at 1ff91e7 (= remote; english-10 delivered, earlier jobs finished in order), no jobs. Topic (official, Meta Newsroom,
  9 Nov 2026 12:00 UTC — newest consumer announcement at 16:08 UTC): Instagram's teen-detection AI expands globally; suspected teens get
  Teen Account protections even with an adult birthday; Facebook rolling out; Threads later this year. New topic and product for this app.
- English narration + captions (approved English Kokoro blend, 0.98, en-us); every take heard exactly by Whisper. 72 words, 24.5 s.
- Committed: sources, narration, cues, film.js, audio/build/QA scripts, SOURCES.md, caption, licences, README, context/24, log row.
- Running: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (resumable); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-09 — english-11 delivered
- New 30.000 s English episode rendered, verified and committed: production/30s/2026-11-09-english-11/media-diet-30s-english11-01.mp4
  (SHA-256 d8db014cb07bdff26c559c6619d9ec6aa7fa0553059e2803971b3bc075d0c5ad). Record: context/24-production-30s-english11-01.md; context/11 log row → delivered.
- Commands: `build/render_chunks.sh 0 60 … 420` + `build/render_chunks.sh 480 … 840` (parallel, resumable), then `SKIP_FRAMES=1 bash build/build.sh`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.0 LUFS /
  −2.0 dBTP; captions y 378–488, x 126–953, 0 violations; caption↔speech 9/9; Whisper-medium (en) word recall 1.0 full / 1.0 per line.
- Remote: the owner pushed a74b9c6 (user-supplied footage assets/user-footage/2026-11-10-chicago-bean.mp4) during this job; rebased onto it,
  kept intact and unused (no instruction to use it yet).
- Previous MP4s preserved. No automation created. No analytics used. Unresolved: audio not listened to by a human yet.

## Checkpoint 2026-11-10 — Bean 45 s special (in progress)
- Start state: english-11 delivered and pushed (57bb5a0 = remote, owner footage commit a74b9c6 integrated earlier by rebase), no jobs.
- Footage: committed asset assets/user-footage/2026-11-10-chicago-bean.mp4 (SHA-256 0a631a1f…a362 = origin); frames 180–284 → .cache/footage.
- Sources verified (CBS Chicago, WXRT, PBC, Aerotrope, Stuart Dean); calculations re-computed; VO 108 words / 39.2 s, all lines heard by Whisper.
- Committed: sources/assumptions/calculations, narration, cues, film.js, audio/build/QA scripts (45 s), caption, licences, README, context/25, log row.
- Running: three resumable chunk workers (`build/render_chunks.sh 0…420`, `480…900`, `960…1320`); next `SKIP_FRAMES=1 bash build/build.sh`, QA, commit MP4.

## Checkpoint 2026-11-10 — Bean 45 s special delivered
- production/45s/2026-11-10-bean/media-diet-bean-45s-01.mp4 (SHA-256 a7a31eaeefb6a15e513c74889b69925e26f4d9fc8303d876d70ecdc407e532f4); record context/25.
- Checks: 1350 frames, 45.000 s, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS / −1.9 dBTP; captions y 378–488,
  0 violations; caption↔speech 18/18; Whisper-medium word recall 1.0 full / 1.0 per line. Earlier episodes untouched. No social publishing.

## Checkpoint 2026-11-11 — approved feedback rules persisted
- New context/26-approved-feedback-rules-2026-11-11.md (from "Published apps → Satisfied?", read 11 Nov 2026); pointer added at the top of
  the rules in context/11. These rules supersede older caption/pacing notes. Next: research the newest verified "how can that work?" tech story.

## Checkpoint 2026-11-11 — english-12 (topic + sources recorded; rendering)
- Topic (selected after scanning 4–11 Nov 2026): BYD YANGWANG U9 Xtreme, 503.17 km/h single-direction run on 1 Nov 2026, FIA news
  6 Nov 2026 + Guinness single-direction titles + BYD press release 6 Nov 2026. Status: record by a limited-production model (30 units),
  customer cars at contract/production-planning stage. Sources/facts/calculations/assumptions: production/30s/2026-11-11-english-12/SOURCES.md;
  record context/27-production-30s-english12-01.md; log row in context/11.
- Narration 85 words / 26.5 s (approved Kokoro blend), every take heard exactly by Whisper; cues from pauses; word timestamps drive events.
- New rules applied in code: captions auto-fit to x 100–900; one large label at a time at y ≈ 1330; bounds_check.py now enforces
  x 100–900 / y 230–1500 for all text, no label in the caption band while a caption shows, one large label at a time.
- Running: `build/render_chunks.sh 0 60 120 180 240` + `300 … 540` + `600 … 840` (three resumable workers); next
  `SKIP_FRAMES=1 bash build/build.sh`, `node build/thumb.mjs thumbnail-english12-01.png`, QA, commit MP4 + thumbnail.

## Checkpoint 2026-11-11 — english-12 delivered
- production/30s/2026-11-11-english-12/media-diet-30s-english12-01.mp4 (SHA-256 743dec9abd92bb95d3edcfbe2d0db23a26bcc3aaf32108ad55d776c0426e4053)
  + separate thumbnail thumbnail-english12-01.png ("500 KM/H / WHY HARD?"); record context/27; context/11 log row → delivered.
- Commands: three `build/render_chunks.sh` workers (0…240, 300…540, 600…840), `SKIP_FRAMES=1 bash build/build.sh`, `node build/thumb.mjs thumbnail-english12-01.png`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS / −2.0 dBTP;
  captions y 378–488, x 181–900; labels x 237–845, y 1217–1482; 0 violations of the new x 100–900 / y 230–1500 rules; caption↔speech 11/11;
  Whisper word recall 1.0 full / 0.975 per line (token fusion "SpeedCubed").
- Unresolved: audio and picture not yet reviewed by a human; no review folder exists in this container (MP4 only in the episode folder).
  Earlier outputs untouched. No automation, analytics or publishing.

## Checkpoint 2026-11-13 — english-13 (topic + sources recorded; rendering)
- Reread CLAUDE.md + this file; start state ee4dd12 = remote, no jobs. Topic (6–13 Nov 2026 window): Boston Dynamics "Atlas on a Roll"
  (blog + video, 9 Nov 2026 14:50 UTC) — scooter rims on Atlas's ankle actuators as a motor stress test; research testbed, not a product.
  Corroboration: The Robot Report, Korea JoongAng Daily, Interesting Engineering; motor physics: Northwestern Mechatronics Wiki.
  Rejected: ApusNeo 100-h flight (unconfirmed), DARPA/Caltech ASTRA (5 Nov), Lift Ocean ONE (undated), CAT R3200 XE (leaks), BYD charger.
  Record: context/28-production-30s-english13-01.md; sources/facts/illustrations: production/30s/2026-11-13-english-13/SOURCES.md.
- Narration 81 words / 26.1 s (approved Kokoro blend), every take heard exactly by Whisper; word timestamps drive events.
- Running: three `build/render_chunks.sh` workers (0…240, 300…540, 600…840); next `SKIP_FRAMES=1 bash build/build.sh`,
  `node build/thumb.mjs thumbnail-english13-01.png`, QA, commit MP4 + thumbnail.

## Checkpoint 2026-11-13 — english-13 delivered
- production/30s/2026-11-13-english-13/media-diet-30s-english13-01.mp4 (SHA-256 9abd3e98617372033bb0061ccabfb0723f08a72c0407bd8e2b235e3021ca3f23)
  + separate thumbnail thumbnail-english13-01.png ("WHY / WHEELS?"); record context/28; context/11 log row → delivered.
- Commands: three `build/render_chunks.sh` workers (0…240, 300…540, 600…840), `SKIP_FRAMES=1 bash build/build.sh`, `node build/thumb.mjs thumbnail-english13-01.png`.
- Checks: 900 frames, 30.000 s video/audio/container, H.264 High yuv420p 1080×1920 30 fps, AAC 48 kHz (eng); decode clean; −15.1 LUFS / −2.0 dBTP;
  captions y 378–488, x 181–900; labels x 185–895, y 1300–1456; 0 violations (x 100–900 / y 230–1500, caption band, one label);
  caption↔speech 12/12; Whisper word recall 1.0 full / 1.0 per line.
- Unresolved: not yet watched or listened to by a human; no review folder exists in this container (MP4 only in the episode folder).
  Earlier outputs untouched. No automation, analytics or publishing.

## Checkpoint 2026-11-14 — english-14 (topic + sources recorded; rendering)
- Reread CLAUDE.md + this file; start state 63f6257 = remote, no jobs running or queued. Topic (7–14 Nov 2026 window): MIT/Northeastern
  "Scale-rich network-based metamaterials", Nature 11 Nov 2026 + MIT News same day; corroboration arXiv 2511.18108, XenoSpectrum; Euler
  buckling: Penn State ESM tutorial. Lab research, not a product. Rejected: frog robot (no official source), Starship flight 15
  (outcome pending), AGIBOT trial (2–3 Nov). Record context/29; sources: production/30s/2026-11-14-english-14/SOURCES.md; log row in context/11.
- Narration 75 words / 25.6 s (approved Kokoro blend), every take heard exactly by Whisper; word timestamps drive events.
- Running: three `build/render_chunks.sh` workers (0…240, 300…540, 600…840); next `SKIP_FRAMES=1 bash build/build.sh`,
  `node build/thumb.mjs thumbnail-english14-01.png`, QA, commit MP4 + thumbnail.
