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

## 16. Batch 2026-11-08-english-09, avocado vs cucumber, 100 g edible portion each (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 4d458c9, no active job; avocado/cucumber only listed as ideas in 08, never produced. The Instagram performance sheet is not in the repo/chat; its approved direction (fast hook, concrete payoff, short CTA) applied as stated, no causal claims.
- Facts: USDA FDC 171705 avocado (160 kcal, 14.7 g fat, 6.7 g fibre, 73.2 g water / 100 g flesh) and FDC 168409 cucumber with peel (15 kcal, 0.11 g fat, 0.5 g fibre, 95.2 g water); FAO FNP 77 fat 9 kcal/g (USDA factor 8.37 → fat ≈ 123 of 160 kcal); 160 kcal ≈ 1 067 g cucumber ≈ 3½ × 301 g. Details: `context/22-production-30s-english09-avocado.md`.
- Decisions: english-08 renderer parts + Meshline voice + accepted mix reused; CTA = cached accepted take; 100 g jars that turn from grams into kcal explain energy density; calorie balance for the portion takeaway; first voice pass (28.9 s) tightened to 24.8 s.
- Commands: as in section 9, from `production/30s/2026-11-08-english-09/source/`, output `../nutriai-30s-english09-01.mp4`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events; captions 0 outside x 90–990 / y 340–520; plate text inside x 90–950; ASR verbatim except the brand on base.en ("cow meter"; small.en "Cal Meter"; cached CTA take). See `production/30s/2026-11-08-english-09/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 17. Batch 2026-11-09-english-10, cooked vs dry-roasted chickpeas (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 0cb1b29, no active or unfinished job. Hindi #04 covered cooked chickpeas alone; roasting/water removal/snack portions were new, so the requested topic was used. Performance sheet not in repo/chat; its approved direction applied as stated, no analytics quoted.
- Facts: USDA FDC 173757 cooked, boiled, no salt (164 kcal, 8.86 g protein, 60.2 g water / 100 g); no USDA entry for home dry-roasted chickpeas, so roasted values come from cooked dry matter (cross-checked with dried FDC 173756 and Foundation FDC 2644282): ≈ 380 kcal, ≈ 20 g protein / 100 g at ≈ 8 % water (ranges for 3–10 %); 100 g cooked → ≈ 42 g; 30 g roasted ≈ 70 g cooked ≈ 115 kcal; 28–30 g label servings from USDA Branded Foods. Details: `context/23-production-30s-english10-chickpeas.md`.
- Decisions: english-09 renderer parts + Meshline voice + accepted mix reused; CTA = cached accepted take; roasting shown on a kitchen scale; roasted bars built from copies of the cooked bar; snack dishes pair the same chickpeas; preparation labelled everywhere.
- Commands: as in section 9, from `production/30s/2026-11-09-english-10/source/`, output `../nutriai-30s-english10-01.mp4`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; 0 freeze events; captions 0 outside x 90–990 / y 340–520; plate text inside x 90–950; ASR verbatim except the brand on base.en ("cow meter"; small.en "Cal Meter"); a masking page sound before "Per" fixed. See `production/30s/2026-11-09-english-10/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 18. Batch 2026-11-09-english-11, a medium baked potato with skin, then butter (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 2beaad2, no active or unfinished job; potato only an idea in 08, never produced. Performance sheet not in repo/chat; its approved direction applied as stated, no analytics quoted.
- Facts: USDA FDC 170093 potato, baked, flesh and skin, no salt (93 kcal, 21.15 g carbohydrate, 2.2 g fibre, 535 mg potassium / 100 g; medium = 173 g → ≈ 161 kcal, 37 g, 3.8 g, 926 mg); FDC 173410 butter, salted (717 kcal, 81.1 g fat / 100 g; pat 5 g ≈ 36 kcal, tbsp 14.2 g ≈ 102 kcal, 2 tbsp ≈ 204 kcal). Details: `context/24-production-30s-english11-potato.md`.
- Decisions: english-10 renderer parts + Meshline voice + accepted mix reused; CTA = cached accepted take; hook = potato splitting open + a tablespoon of butter melting in; a potato-vs-butter ledger with per-row bars; stacked bars for three butter portions on the same potato; no good/bad framing.
- Commands: as in section 9, from `production/30s/2026-11-09-english-11/source/`, output `../nutriai-30s-english11-01.mp4`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events; captions 0 outside x 90–990 / y 340–520; plate text inside x 90–950; ASR verbatim except the brand on base.en ("cow meter"; small.en "Cal Meter"). See `production/30s/2026-11-09-english-11/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 19. 2026-11-11: approved feedback rules persisted + english-12 popcorn (CalMeter; English)
- Rules: the user's approved feedback (Published apps, Satisfied? column, read 2026-11-11) saved as `context/25-feedback-rules-2026-11-11.md` and linked from `11-production-format.md` (story structure thumbnail → hook → super hook → build-up + proof → payoff → CTA; captions inside x 100–900 / y 230–1500; large brief labels, one visual idea at a time; separate thumbnail with 2–4 words; return to egg/avocado-era composition; verified facts with sources in notes; honest QA reporting).
- Pre-check: repo/branch confirmed, origin at 78bec1c, no active or unfinished job; popcorn never covered. Inspected the actual egg (english-07) and avocado (english-09) sheets; no dragonfruit episode exists in this app.
- Facts: USDA FNDDS 2708219 air-popped (1 cup 8 g, 385 kcal/100 g) and 2708221 oil-popped (1 cup 11 g, 498 kcal/100 g); SR 173410 butter (1 tbsp 14.2 g, 717 kcal/100 g); SR 169655 sugar (1 tbsp ≈ 12.5 g, 387 kcal/100 g); Virot & Ponomarenko 2015 (≈ 180 °C, pressure vessel, 8× less dense). Details: `context/26-production-30s-english12-popcorn.md`.
- Commands: as in section 9, from `production/30s/2026-11-11-english-12/source/`, output `../nutriai-30s-english12-01.mp4`; thumbnail `node render.mjs --thumb` → `../nutriai-30s-english12-thumbnail.png`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events; captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980; ASR verbatim (base.en "calmetre", small.en "Cal Meter"). Machine checks only; no human watch/listen. See `production/30s/2026-11-11-english-12/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 20. Batch 2026-11-13, english-13 rice: water changed the number (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 0718e07, no active or unfinished job; rice only an idea in 08, never produced (related water-removal episodes english-08/10 noted; this is water added by cooking). Latest approved feedback (context/25) applied; prior popcorn subject and narration discarded.
- Facts: USDA SR Legacy FDC 169756 raw long-grain white rice (365 kcal, 11.6 g water / 100 g) and FDC 169757 cooked without salt (130 kcal, 68.4 g water); calculated 50 g dry → ≈ 140 g cooked, ≈ 182 kcal both, dry label on cooked ≈ 511 kcal (2.8×). Details: `context/27-production-30s-english13-rice.md`.
- Commands: as in section 9, from `production/30s/2026-11-13-english-13/source/`, output `../nutriai-30s-english13-01.mp4`; thumbnail `node render.mjs --thumb` → `../nutriai-30s-english13-thumbnail.png`; ASR on the final mix with `vad_filter=True`.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events (also at the stricter scan); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980; ASR verbatim apart from the "weigh"/"way" homophone. Machine checks only; no human watch/listen. See `production/30s/2026-11-13-english-13/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 21. Batch 2026-11-14, english-14 edamame vs green peas (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at 57c1084, no running or unfinished job. Requested "peanuts vs green peas" overlapped english-06 (peanuts, "about half fat") → per the overlap rule, edamame replaced peanuts with the same brief criteria; neither edamame nor peas covered before.
- Facts: USDA SR Legacy FDC 168411 edamame, frozen, prepared (121 kcal, 11.9 g protein, 5.2 g fat, 72.8 g water / 100 g; cup 155 g) and FDC 170017 green peas, frozen, boiled, no salt (78 kcal, 5.15 g protein, 0.27 g fat, 79.5 g water; 1/2 cup 80 g); mature seeds FDC 174270 / 172428; edamame = immature soybeans (SDSU Extension, ATTRA). Details: `context/28-production-30s-english14-edamame.md`.
- Decisions: latest approved composition (english-12/13); "edamame" phoneme override /ˌɛdəmˈɑːmeɪ/; masking page sound before "Per" moved and softened.
- Commands: as in section 9, from `production/30s/2026-11-14-english-14/source/`, output `../nutriai-30s-english14-01.mp4`; thumbnail `node render.mjs --thumb` → `../nutriai-30s-english14-thumbnail.png`; ASR on the final mix with base.en (VAD) and small.en.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 and above y 1500; small.en verbatim on the full mix. Machine checks only; no human watch/listen. See `production/30s/2026-11-14-english-14/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 22. Batch 2026-11-15, english-15 honey vs sugar by the tablespoon (CalMeter; English)
- Pre-check: repo/branch confirmed, origin at a659dcc, no running or unfinished job. Requested avocado vs apple overlapped english-09 (avocado, fat ≈ 9 kcal/g, "neither is bad") → honey vs sugar chosen (never covered). New "first frame is critical" feedback persisted as an addendum in `context/25-feedback-rules-2026-11-11.md`.
- Facts: USDA SR Legacy FDC 169640 honey (304 kcal, 17.1 g water / 100 g; tbsp 21 g; cup 339 g) and FDC 169655 granulated sugar (387 kcal / 100 g; tsp 4.2 g; cup 200 g → tbsp 12.5 g); per tablespoon ≈ 64 vs ≈ 48 kcal. Details: `context/29-production-30s-english15-honey.md`.
- Decisions: frame 0 = thumbnail composition with "WHICH SPOON?"; mirrored spoons; T1 reworded ("Gram for gram") for intelligibility; T3–T5 spaced so "But" is heard.
- Commands: as in section 9, from `production/30s/2026-11-15-english-15/source/`, output `../nutriai-30s-english15-01.mp4`; thumbnail `node render.mjs --thumb` → `../nutriai-30s-english15-thumbnail.png`; ASR base.en (VAD) + small.en text-only (word-timestamp alignment crashed on this file).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 and above y 1500; small.en verbatim. Machine checks only; no human watch/listen. See `production/30s/2026-11-15-english-15/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 23. Batch 16 (2026-11-15), english-16 dark vs milk chocolate (CalMeter; English)
- Pre-check: CLAUDE.md and this file reread; repo/branch confirmed, origin at 0afca7a (batch 15), no running or unfinished job; batch 15 not repeated. Requested grapes vs raisins was english-08 (and water removal also carried english-10/13) → dark vs milk chocolate chosen (never covered). Egg (english-07) and avocado (english-09) contact sheets re-inspected for the approved fun/varied direction.
- Facts: USDA SR Legacy FDC 170273 dark chocolate 70–85 % (598 kcal, 42.6 g fat, 24.0 g sugars / 100 g) and FDC 167587 milk chocolate (535 kcal, 29.7 g fat, 51.5 g sugars); 21 CFR 163.111 (chocolate liquor 50–60 % cacao fat); FAO FNP 77 factors (fat 9, carbohydrate 4 kcal/g); 30 g ≈ 179 vs ≈ 161 kcal. Details: `context/30-production-30s-english16-chocolate.md`.
- Decisions: frame 0 = thumbnail composition with "MORE CALORIES?"; story reordered so the takes fit (answer first, sugar as the open question, cocoa butter + 9 vs 4 as proof); new hero assets in code (bars with sleeves, sugar cubes, cacao pod, cocoa-butter blocks, energy coins); sugar cubes retimed onto "less than half the sugar" after the contact-sheet review.
- Commands: from `production/30s/2026-11-15-english-16/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` (T6 = cached CTA take) → `python audio/mix.py` → `node render.mjs` → two-pass loudnorm (I −15, TP −1.5, linear) → mux AAC 192k 48 kHz `-t 30` to `../nutriai-30s-english16-01.mp4`; thumbnail `node render.mjs --thumb` → RGB PNG `../nutriai-30s-english16-thumbnail.png`; ASR base.en (VAD) + small.en (word timestamps).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.1 LUFS, −1.5 dBTP; 0 black, 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 / y 480–1500; small.en verbatim incl. "CalMeter". Machine checks only; no human watch/listen. See `production/30s/2026-11-15-english-16/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 24. Batch 17 (2026-11-15), english-17 watermelon wedge vs raisins, "SIZE LIES" (CalMeter; English)
- Pre-check: CLAUDE.md and this file reread; repo/branch confirmed, origin at 6338780 (batch 16), no running or unfinished job; batch 16 not repeated. Watermelon never covered → requested topic used (raisins in english-08 and "water has no calories" in english-09 noted and kept distinct).
- Facts: USDA SR Legacy FDC 167765 watermelon (30 kcal, 91.4 g water / 100 g; wedge 286 g edible flesh, refuse 48 %) and FDC 168165 raisins, dark, seedless (299 kcal / 100 g; 1 oz = 28.35 g = 60 raisins); SR28 doc: household weights are edible portions; FAO FNP 77 energy components. Wedge ≈ 86 kcal, ounce ≈ 85 kcal. Details: `context/31-production-30s-english17-watermelon.md`.
- Decisions: frame 0 = thumbnail composition with "SIZE LIES"; brighter card + colour glows; wedge weight voiced and labelled as flesh after the SR28 edible-portion check (line 2 re-voiced, later lines moved); ghost wedge rendered off-screen to avoid muddy translucency.
- Commands: from `production/30s/2026-11-15-english-17/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` (T6 = cached CTA take) → `python audio/mix.py` → `node render.mjs` → two-pass loudnorm (I −15, TP −1.5, linear) → mux AAC 192k 48 kHz `-t 30` to `../nutriai-30s-english17-01.mp4`; thumbnail `node render.mjs --thumb` → RGB PNG `../nutriai-30s-english17-thumbnail.png`; ASR base.en (VAD) + small.en (word timestamps).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; 0 black, 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 / y 480–1500; all captions within ±0.21 s; small.en verbatim. Machine checks only; no human watch/listen. See `production/30s/2026-11-15-english-17/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 25. Batch 18 (2026-11-15), english-18 passion fruit, "JEWELS YOU CAN EAT" (CalMeter; English)
- Pre-check: CLAUDE.md and this file reread; repo/branch confirmed, origin at 7c1c0a9 (batch 17), no running or unfinished job; batch 17 not repeated. Requested pomegranate was production #03 → purple passion fruit chosen (never covered; fibre angle). Egg episode source and egg/avocado sheets re-opened; no dragonfruit episode exists in this app.
- New approved feedback persisted: `context/25-feedback-rules-2026-11-11.md` addendum "full-frame, no cream card" (no cream chart-only layouts or rigid boxed cards; full-bleed bright scenes; outlined bright type; white outlined captions; white CTA wordmark).
- Facts: USDA SR Legacy FDC 169108 passion fruit, purple, raw (97 kcal, 10.4 g fibre / 100 g; shell 48 % refuse; 1 fruit = 18 g edible) and FDC 171688 apple with skin (2.4 g fibre / 100 g); one fruit ≈ 17 kcal, ≈ 1.9 g fibre. Details: `context/32-production-30s-english18-passionfruit.md`.
- Commands: from `production/30s/2026-11-15-english-18/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` (T6 = cached CTA take) → `python audio/mix.py` → `node render.mjs` → two-pass loudnorm (I −15, TP −1.5, linear) → mux AAC 192k 48 kHz `-t 30` to `../nutriai-30s-english18-01.mp4`; thumbnail `node render.mjs --thumb` → RGB PNG; ASR base.en (VAD, word timestamps) + small.en (text only; its word alignment crashes on this file).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 black, 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 / y 480–1500; small.en verbatim (plus a hallucinated line over the closing music, not in the audio). Machine checks only; no human watch/listen. See `production/30s/2026-11-15-english-18/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 26. Batch 19 (2026-11-17), english-19 kiwi, "WHAT'S INSIDE?" (CalMeter; English)
- Pre-check: CLAUDE.md and this file reread; repo/branch confirmed, origin at 08c1b89 (batch 18), no running or unfinished job; batch 18 not repeated. Requested guava was production #02 → green kiwi chosen (never covered; same genre).
- Facts: USDA SR Legacy FDC 168153 kiwifruit, green, raw (61 kcal, 3.0 g fibre, 92.7 mg vitamin C / 100 g; skin 24 % refuse; 1 fruit = 69 g edible), FDC 169097 orange (53.2 mg vitamin C / 100 g), 21 CFR 101.9(c)(8)(iv) vitamin C DV 90 mg; one kiwi ≈ 42 kcal, 64 mg = 71 % DV. Details: `context/33-production-30s-english19-kiwi.md`.
- Decisions: full-frame bright scenes (approved 2026-11-15 addendum); ring label "≈ 70%" to match the narration; on-screen "US DAILY VALUE" for accuracy.
- Commands: from `production/30s/2026-11-17-english-19/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` (T6 = cached CTA take) → `python audio/mix.py` → `node render.mjs` → two-pass loudnorm (I −15, TP −1.5, linear) → mux AAC 192k 48 kHz `-t 30` to `../nutriai-30s-english19-01.mp4`; thumbnail `node render.mjs --thumb` → RGB PNG; ASR base.en (VAD, word timestamps) + small.en (text only; its word alignment crashes on this file).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.1 LUFS, −1.4 dBTP; 0 black, 0 freeze events (also strict); captions 0 outside x 100–900 / y 230–1500; labels inside x 100–980 / y 480–1500; small.en verbatim. Machine checks only; no human watch/listen. See `production/30s/2026-11-17-english-19/QA.md`.
- Unresolved: none blocking. Next step: none requested.

## 27. Continuation 2026-11-18 (new isolated session; account load-balancing expressly authorised) + batch 20, english-20 pistachios, "HALF IS SHELL?" (CalMeter; English)
- Pre-check: CLAUDE.md, START_HERE, context 00–33, the skill and english-19 source reread; origin `claude-video/nutriai` at `46e4873` (english-19); no english-20/21 anywhere → nothing duplicated. Toolchain restored (npm canvas 1.1.0, scratchpad venv kokoro-onnx + faster-whisper 1.2.1, Kokoro model-files-v1.0, USDA bulk files hash-verified). Continuation note: `context/34-continuation-2026-11-18.md` (also records the 2026-11-18 live feedback and how it is applied).
- Facts: USDA SR Legacy FDC 170185 pistachios, dry roasted, no salt (572 kcal, 45.8 g fat, 21.0 g protein, 10.3 g fibre / 100 g kernels; raw 170184 cross-check), SR28 refuse "Shells" 47 %, "1 oz (49 kernels) = 28.35 g"; 100 g in shell = 53 g kernels ≈ 303 kcal; 49 kernels ≈ 162 kcal. Details: `context/35-production-30s-english20-pistachios.md`.
- Decisions: captions 84 px (≥ 66), numbers 136–190 px; whip-pan transitions with motion blur + speed lines; rays/bokeh parallax; squash-and-stretch; playful pistachio and kernel characters with eyes; motion drawn at 30 fps (line boil stays 15 drawings/s); T2 rephrased for intelligibility; CTA = cached accepted take (stored here as T9.wav).
- Commands: from `production/30s/2026-11-17-english-20/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` → `python audio/mix.py` → `node render.mjs` (≈ 45 s) → `./master.sh` (two-pass loudnorm I −15, TP −1.5, linear; AAC 192k 48 kHz; `-t 30`) → `PY=<venv python> ASR=<asr_takes.py> ./qa_run.sh` → `python3 qa_sync.py > ../qa/sync.txt`; thumbnail `node render.mjs --thumb` → RGB PNG. ASR: the venv's PyAV 19 is incompatible with faster-whisper 1.2.1's decoder, so the scratchpad `asr_takes.py` decodes with FFmpeg to a 16 kHz array (same models).
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; 0 black, 0 freeze (also strict); captions 0 outside x 100–900 / y 230–1500; labels 0 outside x 100–980 / y 480–1500; 25/25 caption lines within ±0.25 s; base.en and small.en verbatim. Machine checks only; no human watch/listen. See `production/30s/2026-11-17-english-20/QA.md`.
- Unresolved: none blocking. Next step: batch 21 (requested roasted vs cooked chickpeas = english-10 → replacement topic, see context/36).

## 28. Batch 21 (2026-11-18), english-21 one coconut, two foods: coconut water vs coconut meat, "WATER OR MEAT?" (CalMeter; English)
- Pre-check: batch 20 finished, pushed (`8f755ff`) and attached first; origin in sync; no running or unfinished job; nothing duplicated. Requested "roasted vs cooked chickpeas: same food, water changes calories per gram" = english-10 (also water-per-gram in english-08/13/17) → coconut water vs coconut meat chosen (never covered; same idea of one food with very different calories per gram; reason in `context/36-production-30s-english21-coconut.md`).
- Facts: USDA SR Legacy FDC 170174 coconut water (19 kcal, 95.0 g water / 100 g; cup 240 g; coconut yields 206 g) and FDC 170169 coconut meat, raw (354 kcal, 47.0 g water, 33.5 g fat / 100 g; medium 397 g; piece 45 g); per coconut ≈ 39 vs ≈ 1 405 kcal; piece ≈ 159 kcal = 3.49 glasses.
- Decisions: english-20 engine reused unchanged (84 px captions, whip-pans, parallax, kinetic numbers, CTA); new heroes: cracked coconut character, glass with a face, meat chunk with a face, beakers, calorie balance (pivot "kcal"), palm fronds; bed transposed down a whole step; foley kept off spoken numbers; CTA = cached accepted take (T9.wav).
- Commands: from `production/30s/2026-11-18-english-21/source/`: `python audio/voice_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin> script.json audio/voice-takes` → `python audio/mix.py` → `node render.mjs` (≈ 40 s) → `./master.sh` → `PY=<venv python> ASR=<asr_takes.py> ./qa_run.sh` → `python3 qa_sync.py > ../qa/sync.txt` (+ stem-onset check appended for 3 lines); thumbnail `node render.mjs --thumb` → RGB PNG.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.5 dBTP; 0 black, 0 freeze (also strict); captions 0 outside x 100–900 / y 230–1500; labels 0 outside x 100–980 / y 480–1500; 26/26 caption lines within ±0.25 s (23 by base.en word timestamps, 3 by voice-stem/take onset); small.en verbatim apart from "Its/It's". Machine checks only; no human watch/listen. See `production/30s/2026-11-18-english-21/QA.md`.
- Unresolved: none blocking. Next step: none requested (batch 21 was the single requested episode).

## 29. Batch 22 (2026-11-19), english-22 what's really inside a pineapple, "MORE THAN SWEET" (CalMeter; English)
- Pre-check: CLAUDE.md and this file reread; origin `claude-video/nutriai` at `9d8a3ae` (english-21); batches 20/21 complete; nothing pending. Requested "What is really inside a mango?" = production #01 (also pilot 01, 10 s test) → pineapple (never covered; same brief structure). Details: `context/37-production-30s-english22-pineapple.md`. Durable brief decisions saved as the 2026-11-19 addendum in `context/25-feedback-rules-2026-11-11.md` (new CTA wording, caption band y 280–460, one headline at a time, controls-safe zone).
- Facts: USDA SR Legacy FDC 169124 (1.4 g fibre, 47.8 mg vitamin C / 100 g; refuse 49 %; cup chunks 165 g → 78.9 mg = 88 % of the 90 mg US DV); variety records 168193/168194; MedlinePlus vitamin C and fibre pages verified live 2026-11-19.
- Commands: from `production/30s/2026-11-19-english-22/source/`: `python audio/voice_kokoro.py <onnx> <voices.bin> script.json audio/voice-takes` → `python audio/mix.py` → `node render.mjs` (≈ 40 s) → `./master.sh` → `PY=<venv python> ASR=<asr_takes.py> ./qa_run.sh` → `python3 qa_sync.py` (+ stem notes) → audio-balance script (inline in QA notes) → `node render.mjs --thumb` → RGB PNG.
- Verification: 900 frames / 30.000 s / H.264 High yuv420p / AAC 48 kHz stereo; decode clean; −15.0 LUFS, −1.4 dBTP; 0 black, 0 freeze (also strict) after an end-card motion fix; captions 0 outside x 100–900 / y 280–460; labels/CTA 0 outside x 100–940 / y 480–1450; 23/23 caption lines within ±0.25 s (20 base.en + 3 voice-stem); small.en verbatim; voice-to-background 15.9 dB median; dense frame review (every 6th frame) on sheets. Machine checks only; no human watch/listen. See `production/30s/2026-11-19-english-22/QA.md`.
- Unresolved: none blocking. Next step: batch 23 (requested popcorn = english-12 → replacement, see context/38).
