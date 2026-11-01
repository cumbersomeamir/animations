# Progress (30 s production video)

## Verified facts
- App: Plan My Wedding, com.tensorblue.planmywedding, developer link text "Tensorblue AI".
- Public Play listing fetched 2026-11-01 and saved to `assets/listing.json` (description text). Features used: vendor browsing (venues, photographers, caterers, decorators, DJs, mehendi artists...), save favourites, request quotes, personalised checklist, monitor budget, dashboard next tasks, digital invitations, guest details, follow RSVPs.
- Not used: AI assistant, privacy controls, any pricing/ratings/metrics.

## Creative decisions
- Editorial paper world + stick-figure couple (A: bun + rose scarf; B: tuft + marigold boutonniere).
- Story: Save-the-date slams and bursts into a thousand notes -> red threads link guests/venue/caterer/budget -> pencil changes 150 -> 180 guests, each card reacts -> threads wrap A -> B pulls out a stylized phone that vacuums the mess into 4 tiles -> couple dives into the planner: vendors carousel (swipe, heart, quote stamp), checklist ticks feeding a budget jar under a "plan" line (magnifier eye gag), invitation plane splits to 5 houses with RSVP checks -> threads return as garlands, arch assembles, dance -> end card "Plan My Wedding / Explore on Google Play".
- Narration: kokoro-js 1.2.1 + Kokoro-82M ONNX (Apache-2.0), voice af_heart, local CPU. Lines in `project/src/narration.mjs`; all fit slots (see build/tts_report.txt when rebuilt).
- Palette: provisional cream/rose based on previous brief colour #DDA4AD (to be checked against icon sample in 07-test-progress.md).

## Completed (milestone 1)
- Project `project/` (pinned: @napi-rs/canvas 1.1.0, kokoro-js 1.2.1, @expo-google-fonts fraunces 0.4.1 / dm-sans 0.4.2 / caveat 0.4.2).
- Visual scenes S1-S6 implemented and inspected via stills: `node src/render.mjs --frames <list>`.
- TTS generated: `node src/tts.mjs`.

## Unresolved / next
- audio.mjs (music + SFX from src/cues.mjs + VO mix), mux.mjs, verify.mjs not written yet.
- Full render + QA.md + contact sheet still to do; output path `output/plan-my-wedding-30s.mp4` not yet produced.
- Paused at user request for the 15 s origami style test (see 06/07).
