# 10: Educational progress (Pilot 01)

## Status of earlier work (checked 2026-11-02 before starting)
- 30s production video: complete and committed (`750aeed`), `videos/meshline/output/meshline-30s.mp4`.
- 15s text-message test: complete and committed (`f5eb10f`), `videos/meshline/tests/15s/meshline-15s-test.mp4`.
- The working tree was clean, so nothing needed checkpointing. Neither item was touched or relabelled.

## Verified facts (sources: `education/pilot-01/research/claims.md`)
- T-Mobile (2026-03-26): bars show signal strength, not how busy the network is or how much capacity is available. Full bars can still mean slow speeds in crowded places like stadiums, and high demand can slow speeds even with strong signal.
- Three UK and Vodafone UK (2026): temporary masts (COWs) add capacity where thousands of people use their phones at once.
- Wikipedia, "Mobile cell sites": COWs provide capacity for short-term demand at special events.
- The Guardian (2023) is recorded only as an unverified secondary source (404); no claim relies on it.

## Creative choices
- Cast: Bix (sphere body, four-bar crest = signal) and Dot (packet cube).
- World: a transparent glass city concert, hand-projected 3D on canvas.
- Radio paths converge on one tower. A FIFO queue spirals the mast with four gate lanes; μ = 4/s is illustrative.
- Bars vs throughput: the handheld meter and the city board.
- Camera: A (medium) → B (low angle along the radio path) → C (crane reveal) → D (return, takeaway plaque).
- Voice: Kokoro blend 0.7 `af_bella` + 0.3 `am_puck`, speed 0.98.
- Score: D-dorian marimba and pad. SFX are tied to cues.

## Provenance / adaptations
- `animation-direction` (local skill), applied: storyboard with action verbs first; a rig with clear silhouette, poses and facial cues; anticipation → action → impact → recovery; props for cause and effect; the verify loop (stills → boundary frames → contact sheet → ffprobe → full decode).
  - Adaptation: an original sphere/crest performer instead of a stickman, as the brief asked.
- `text-message-animation`: not used (wrong medium). Only the frame-driven loading-indicator idea carries over.
- Rendering: original Node code on `@napi-rs/canvas`. No Three.js, Blender or paid APIs. 3D is a hand-written pinhole projection (`src/core.mjs`).
- Instagram references: not viewed; the user's description was used only as a quality bar.

## Render / QA state: complete
- Output: `videos/meshline/education/pilot-01/meshline-education-pilot-01.mp4`, sha256 `a5bdbb97de1241d5adc470bb6eaac352f6c788ae69d1e4d28e339d76b1021256`.
- Format: 15.000 s, 450 frames, 1080x1920, 30 fps, H.264 High + AAC LC 48 kHz.
- Full decode clean. No black or freeze. −15.0 LUFS, −3.0 dBTP. Voice/bed (speech band) +9.1 / +14.2 / +11.7 / +10.0 dB.
- Contact sheet (31 frames) and boundary sheet (22 frames) inspected. 10 defects fixed (see `education/pilot-01/QA.md`).
- Commands (from `education/pilot-01`):
  - `npm ci`
  - `PY=<py with numpy+scipy> scripts/build.sh`
  - `scripts/qa.sh`

## Next action
- Await user feedback on Pilot 01: the character, pacing and accuracy framing.
- Then pick episode 2 from the 10-title list in `08-educational-strategy.md` and reuse `src/cast.mjs`, `src/core.mjs` and the build/QA scripts in a new `education/pilot-02/`.

## Batch 2026-11-02-pre-reset: 10s style test (S14 Transit Map). Done.
- Output: `videos/meshline/tests/10s/pre-reset-2026-11-02/meshline-10s-test.mp4`, sha256 in `qa/sha256.txt`.
- Format: 10.000 s, 300 frames, 1080x1920, 30 fps, H.264 + AAC. Full decode OK. −14.0 LUFS / −3.3 dBTP.
- Voice: Meshline Kokoro blend (0.7 af_bella + 0.3 am_puck, 0.98, en-us). Claim reused from pilot 01 (T-Mobile source).
- Unresolved: no ASR or listening check; caption plate sits slightly outside the 350–460 band; beat-1 labels are small; no depth of field. See the folder's `QA.md`.
- Earlier 15s, 30s and pilot-01 work was untouched.
- QA fix pass: all four signal bars are now bright with "signal: full", and the illustrative note is kept in frame. New sha256 `fd3f2a4dc62332c67a03692d2aab20c1b8e43a8d4059938fb799fd3728332e00`.

## Production round production-30s-2026-11-02: complete
- See `11-production-format.md` (durable format) and `12-production-30s-01.md` (brief, script, storyboard, QA). Output sha256 `99ac6725f731772bc74b3d3717ba21c965af3f939715f2fd15f9048a5edd8578`.

## Production batch production-30s-2026-11-02-batch-02: complete
- See `13-production-30s-02.md`; output sha256 `1fb50fb7bc2a554f9c710a28a8ed45cb377bdbbdb1b26bde92e42afa753ea47c`. Format and feedback updated in `11-production-format.md`.

## Production 2026-11-03 store-and-forward: complete
- See `14-production-30s-store-forward-01.md`; output sha256 `9ed0380683c235e840ee61e025a0444fe7b60d3cdc8b82ca43abe0a5a35e05a5`. Style recipe re-confirmed in `11-production-format.md`.

## Production 2026-11-03 round 02 (direct radio vs network route): complete
- See `15-production-30s-round02-01.md`; output sha256 `365aa20ed90fa09179b06c15957f16873a613322014cd3ce98de4674b950f64c`. The episode log and the CTA feedback are recorded in `11-production-format.md`.

## Production 2026-11-03 Hindi batch 03 (airplane mode, Hindi): complete
- See `16-production-30s-hindi03-01.md`; output sha256 `3fcc05cb73dfe1cc81e11edb270b6870ffb780331d081179bc57ea813207650a`. The topic swap (concert/full bars was already covered) and the Hindi rules are recorded in `11-production-format.md`.

## Production 2026-11-04 Hindi batch 04 (GPS without mobile data, offline maps): complete
- See `17-production-30s-hindi04-01.md`; output sha256 `5239f66af914a1454115cdd74cae91c6a0f5e3a4e9f2ceea2c81f79006326a25`. The episode log and skill adjustments are in `11-production-format.md`.

## Production 2026-11-05-feedback-05 (Hindi, Bluetooth headphones behind a thick wall): complete
- See `18-production-30s-feedback05-01.md`; output sha256 `7ba35b646d94a35f6d446cb823f6afa8db338dca3d8e5189ddce6939e43c5099`.

## Production 2026-11-06-english-06 (English, sent vs delivered + direct nearby link): complete
- See `19-production-30s-english06-01.md`; output sha256 `336c3ff6780c930cdb563063aa51c920a632b8d5fddcf725dfee5f643f8ed5b5`.

## Production 2026-11-06-english-07 (English, upload vs download): complete
- See `20-production-30s-english07-01.md`; output sha256 `6994a0491da964080be466ea06d796521e0d1234ef3afd021025f9cb77ee7e65`.

## Production 2026-11-07-english-08 (English, latency vs bandwidth): complete
- See `21-production-30s-english08-01.md`; output sha256 `3a431ac4f95022444e80d9533c0ea96187cbcf203196d1c766757c0af9923c2a`.
