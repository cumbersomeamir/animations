# Progress — NutriAI (com.nutriaimobile)

Session: Claude Code "NutriAI — Production Video" · branch `claude-video/nutriai` · workspace `videos/nutriai/` only.

## 1. Verified facts (evidence only)
Source: `videos/nutriai/assets/listing.json` (public Google Play snapshot, Oct 2026) and `context/01-product-facts.json`.
- Listing name: "NutriAI: Calorie Tracker". Package `com.nutriaimobile`. Category HEALTH_AND_FITNESS. Rated 3+. Developer "Tensorblue AI".
- Listing description (only feature claim used): "Track meals, water, weight and fasting privately on your Android device."
- Approved assets: `assets/icon.png` (512×512 RGBA; leaf inside a plate ring with fork; charcoal + greens), `assets/listing.json`.
- Unknown / not claimed: health, weight-loss or medical outcomes; pricing, in-app purchases, ratings, user counts, endorsements; AI photo or food recognition; real app screen layouts. Fasting is presented as optional.

## 2. Context acknowledgement (before coding)
Read in order: CLAUDE.md → START_HERE.md → 00-scope → 01-product-facts → 02-creative-brief → 03-assets → 04-deliverables-and-qa → 05-progress → `.claude/skills/animation-direction/SKILL.md`.
App NutriAI, package com.nutriaimobile, context branch claude-video/nutriai, output `videos/nutriai/output/nutriai-30s.mp4`. No other app branches, folders or outputs were read.

## 3. Creative decisions (proposals, not facts)
- Format: editorial paper-cutout world + an original stickman ("leaf-sprout" stickman whose sprout echoes the icon leaf). 1080×1920, 30 fps, 30.0 s.
- Story: "a day, caught". Hook: a plate, glass, scale and alarm clock rain on the stickman, who catches them in a wobbling tower ("Your day moves fast"). The tower topples, and a giant phone rises and catches each object; each object becomes a tracker card. Then morning → night: meals (bite, then flick into the phone; ring fills), water (gulp, then taps fill glass icons), weight (crouch, jump, land, needle settles, dot flies to chart), optional fasting (he drags the clock hand and the fasting ring sweeps in sync), privacy (the phone shrinks into his hand, padlock clicks), then the CTA end card with the approved icon and "Explore on Google Play".
- Palette: paper cream #F5EEDF, ink #1C2620, leaf greens #4FAE2E / #7ACC3E / #C6EA9C, honey #EBB66D (earlier brief colour), water blue #3FA7E0 used only for water, night #22303C.
- Type: Inter Display / Inter (OFL), vendored in `source/fonts/`.
- The phone screens are a stylized illustration, labelled on screen as "Stylized illustration".
- Narration: Piper TTS 1.8.0 with the `en_US-ljspeech-high` voice (LJ Speech dataset is public domain; piper-voices repo MIT). Lines are split at natural pauses and placed on action frames.
- Music and all SFX: synthesized from scratch in numpy (original; no samples).
- Renderer: self-contained Node canvas renderer (`@napi-rs/canvas` 1.1.0, pinned) piping raw frames to FFmpeg (libx264 + AAC).

## 4. Completed milestones
- M1 (context + toolchain): context read; npm `@napi-rs/canvas@1.1.0` installed; Python venv (scratchpad, not committed) with `piper-tts==1.8.0`, `numpy`, `scipy`, `faster-whisper==1.2.1` (ASR used only for QA). Voice model downloaded from huggingface.co/rhasspy/piper-voices (sha256 recorded in `source/audio/VOICE.md`).
- Narration wording probed with ASR: "Log breakfast…" was heard as "Law…", so the line was changed to "Log your breakfast, lunch, and dinner." (transcribed correctly).

## 5. Verification results
(pending; see QA.md once rendered)

## 6. Unresolved issues
- None yet.

## 7. Next step
PAUSED (2026-11-02). Status: 30 s campaign source in progress (rig, props, phone illustration, timeline, canvas renderer; 8 hook stills rendered); no audio, no final MP4. Committed as WIP (d79dede). Superseded in priority by the 15 s style test (06/07) and the educational direction (08–10). Do not relabel as finished.

## 8. Production 30 s #03, pomegranate (2026-11-03; public app name CalMeter)
- Facts: USDA FDC 169134 "Pomegranates, raw" per 100 g arils: 83 kcal, 4.0 g fibre, 16.4 µg vitamin K; SR28 refuse "Skin and membrane" 44 %; FDC 167787 bottled juice 0.1 g fibre; MedlinePlus fibre / vitamin K functions. Details: `context/14-production-30s-pomegranate.md`, `production/30s/2026-11-03/SOURCES.md`.
- Decisions: batch-02 renderer and mix reused with food geometry swapped (no redesign); 68-word script; CalMeter phoneme override; the cancelled oats round is not used.
- Commands (from `production/30s/2026-11-03/source/`): `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` → `node render.mjs` → `python audio/mix.py` → two-pass FFmpeg loudnorm (I −15, TP −1.5, linear) → mux AAC 192k 48 kHz `-t 30` to `../calMeter-30s-pomegranate-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.3 dBTP; captions 0 outside the safe band; one sync fix (vitamin K line). See `production/30s/2026-11-03/QA.md`.
- Unresolved: none blocking (limits listed in QA.md). Next step: none requested.

## 9. Round 02 #01, papaya (2026-11-03; CalMeter)
- Pre-check: no active generation; papaya not covered before. Facts: USDA FDC 169926 "Papayas, raw" per 100 g: 43 kcal, 1.7 g fibre, 60.9 mg vitamin C, 88.1 g water; refuse "Seeds and skin" 38 %; portion 1 cup 1" pieces = 145 g; MedlinePlus fibre / vitamin C (iron absorption). Details: `context/15-production-30s-round02-papaya.md`.
- Decisions: pomegranate renderer + mix reused (food geometry swapped); sheet feedback applied (no generic disclaimers, one basis line, spoken + visible CTA via in-plate CalMeter seal, no bottom signature).
- Commands: as in section 8, from `production/30s/2026-11-03-round-02/source/`, output `../nutriai-30s-round02-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.1 LUFS, −1.5 dBTP; captions 0 outside x 90–990 / y 350–470; freeze defect fixed (0 events). See `production/30s/2026-11-03-round-02/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 10. Hindi #03, orange (2026-11-03; CalMeter; Hindi narration and captions)
- Pre-check: no active generation. Proposed guava topic was already covered by #02, so orange (same genre and nutrients) was used; reason recorded in `context/16-production-30s-hindi03-orange.md`.
- Facts: USDA FDC 169097 "Oranges, raw, all commercial varieties" per 100 g: 47 kcal, 2.4 g fibre, 53.2 mg vitamin C, 86.8 g water; refuse "Peel and seeds" 27 %; portion fruit (2-5/8" dia) = 131 g edible; MedlinePlus fibre / vitamin C (wound healing).
- Decisions: Kokoro's own Hindi voice hf_beta (lang hi, speed 1.0), not the English blend; Noto Sans Devanagari (OFL) vendored in the episode; papaya renderer + mix reused with orange geometry.
- Commands (from `production/30s/2026-11-03-hindi-03/source/`): `python audio/voice_kokoro_hi.py <onnx> <voices.bin> script.json audio/voice-takes` → `python audio/asr_hi.py medium audio/voice-takes/*.wav` → `node render.mjs` → `python audio/mix.py` → two-pass loudnorm → mux to `../nutriai-30s-hindi03-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; captions 0 outside x 90–990 / y 340–520 (ink-measured); Hindi ASR recovers every number; sync ±0.3 s; freeze defect fixed. See `production/30s/2026-11-03-hindi-03/QA.md`.
- Unresolved: Hindi intelligibility judged by ASR, not a native listener. Next step: none requested.

## 11. Hindi #04, cooked chickpeas / chana (2026-11-04; CalMeter; Hindi narration and captions)
- Pre-check: no active generation; chana not covered before. Facts: USDA FDC 173757 cooked, boiled, without salt, per 100 g: 164 kcal, 8.86 g protein, 7.6 g fibre; 1 cup = 164 g (≈ 270 kcal, 14.5 g protein per cup); MedlinePlus protein (repair cells) and fibre. Details: `context/17-production-30s-hindi04-chana.md`.
- Decisions: Hindi #03 renderer, voice (Kokoro hf_beta) and mix reused; chickpea geometry, protein "repair" motif and a cup-vs-weights balance (100 g, then + 64 g) added; cutaway contrast raised.
- Commands: as in section 10, from `production/30s/2026-11-04-hindi-04/source/`, output `../nutriai-30s-hindi04-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; captions 0 outside x 90–990 / y 340–520 (ink-measured); Hindi ASR recovers every number (ASR-only, no listening); CTA freeze fixed. See `production/30s/2026-11-04-hindi-04/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 12. Batch 2026-11-05-feedback-05, plain paneer (CalMeter; Hindi narration and captions)
- Pre-check: repo/branch confirmed, origin at a728357, no active job; paneer not covered before.
- Facts: reference food Matvaretabellen "Cheese, paneer" 01.301 (values from UK CoFID via FDNC 2021): 325 kcal, 26 g protein, 24.5 g fat per 100 g, 67 % of energy from fat; FAO FNP 77 Atwater factors (fat 9, protein 4 kcal/g). USDA FNDDS paneer (FDC 2705740) checked and not used (recipe-derived, implausible 22.5 g carbohydrate). Details: `context/18-production-30s-feedback05-paneer.md`.
- Decisions: performance snapshot treated as a controlled topic/opening test (knife cuts the block within ~1.3 s); approved style, renderer, Hindi voice (Kokoro hf_beta; the Meshline blend is English-only), mix, captions and CTA unchanged; no invented brand values (qualitative comparison; read your pack's per-100 g label).
- Commands: as in section 10, from `production/30s/2026-11-05-feedback-05/source/`, output `../nutriai-30s-feedback05-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events; captions 0 outside x 90–990 / y 340–520 (ink-measured); Hindi ASR recovers every number (ASR-only, no listening); one note moved inside x 950. See `production/30s/2026-11-05-feedback-05/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 13. Batch 2026-11-06-english-06, peanuts vs peanut butter (CalMeter; English narration and captions)
- Pre-check: repo/branch confirmed, origin at 46a58de, no active job; topic not covered before.
- Facts: USDA FDC 173806 dry-roasted unsalted peanuts (587 kcal, 49.7 g fat, 6 mg sodium per 100 g); real label USDA FDC 2674433 SKIPPY Creamy (Hormel; 32 g: 190 kcal, 16 g fat, 3 g sugars, 150 mg sodium; ingredients peanuts, sugar, hydrogenated vegetable oil, salt); SR28 "2 tbsp = 32 g". Per 30 g: 176 vs 178 kcal; sodium 2 vs ~141 mg. Details: `context/19-production-30s-english06-peanuts.md`.
- Decisions: English papaya renderer + Meshline voice (af_bella 0.7 + am_puck 0.3, en-us, 0.98) + accepted mix reused; balance hook within 0.5 s; brand named in repo notes only (label text shown, no logo).
- Commands: as in section 9, from `production/30s/2026-11-06-english-06/source/`, output `../nutriai-30s-english06-01.mp4`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events after two motion fixes; captions 0 outside x 90–990 / y 340–520; ASR verbatim. See `production/30s/2026-11-06-english-06/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 14. Batch 2026-11-06-english-07, boiled egg + a measured teaspoon of oil (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 5c71dff, no active job; egg/oil not covered before.
- Facts: USDA FDC 173424 hard-boiled egg (155 kcal, 12.58 g protein / 100 g; 1 large = 50 g → ≈ 78 kcal, 6.3 g protein); FDC 171411 soybean oil 884 kcal / 100 g, 1 tsp = 4.5 g → ≈ 40 kcal, 0 g protein; FDC 173423 fried large egg also 6.3 g protein. Details: `context/20-production-30s-english07-egg.md`.
- Decisions: english-06 renderer + Meshline voice + accepted mix reused; oil shown as an extra ingredient ("up to 40 kcal"), no preparation judged; generic ledger, not an app screen.
- Commands: as in section 9, from `production/30s/2026-11-06-english-07/source/`, output `../nutriai-30s-english07-01.mp4`; ASR on the final mix needs `vad_filter=True` (scratchpad asr_vad.py) because of a faster-whisper alignment edge case.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events; captions 0 outside x 90–990 / y 340–520; plate text inside x 950; ASR verbatim. See `production/30s/2026-11-06-english-07/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 15. Batch 2026-11-07-english-08, raisins vs grapes, the same 30 g (CalMeter; English)
- Pre-check: repo/branch confirmed, origin in sync after english-07, no active job; grapes/raisins not covered before.
- Facts: USDA FDC 174683 grapes (69 kcal, 80.5 g water, 15.5 g sugars / 100 g) and FDC 168165 raisins, seedless (299 kcal, 15.5 g water, 65.2 g sugars / 100 g); per 30 g 20.7 vs 89.7 kcal, sugar 4.65 vs 19.56 g (4.2×); 30 g raisins ← ≈ 130 g grapes (dry-matter balance), same ≈ 20 g sugar and ≈ 90 kcal; SR28 "10 grapes = 49 g", "1 oz (60 raisins)". Details: `context/21-production-30s-english08-raisins.md`.
- Decisions: english-07 renderer + Meshline voice + accepted mix reused; a takeaway line (T3b "Same sugar, just far less water.") added after the still review to fill a 2.6 s silent gap; sugar granules keep their count as the grape dries (concentrated, not created).
- Commands: as in section 9, from `production/30s/2026-11-07-english-08/source/`, output `../nutriai-30s-english08-01.mp4`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; 0 freeze events after two motion fixes; captions 0 outside x 90–990 / y 340–520; plate text inside x 90–950; ASR verbatim except the brand on base.en ("cow meter"; small.en "Cal Meter"; same CTA take as english-06/07). See `production/30s/2026-11-07-english-08/QA.md`.
- Unresolved: none blocking. Next step: none requested.
