# 10 — Educational progress (resume file)

Active direction: `08-educational-strategy.md`. Pilot 01 brief + storyboard: `09-educational-pilot-01.md`. Workspace: `videos/nutriai/education/pilot-01/`. On resume reread CLAUDE.md, START_HERE.md, 08, 09 and this file.

## Status of earlier work (preserved, not overwritten)
- 30 s campaign: WIP source only (`videos/nutriai/source/`), no MP4; paused (see 05).
- 15 s shader-glsl test: first-pass render checkpointed at `tests/15s/nutriai-15s-test.mp4` with QA.md listing unfixed issues (see 07). Commit 1366d44.

## 1. Verified facts (evidence)
- Nutrition (USDA FDC SR Legacy 169910 "Mangos, raw", per 100 g edible portion): water 83.5 g; carbohydrate by difference 15.0 g; fibre 1.6 g; sugars 13.7 g (not used); protein 0.82 g; fat 0.38 g; ash 0.36 g; energy 60 kcal / 250 kJ; vitamin C 36.4 mg; portions: 1 cup pieces 165 g, 1 fruit without refuse 336 g; calorie factors carb 3.6 / protein 3.36 / fat 8.37. Retrieved 2026-11-02 from the official bulk JSON (API DEMO_KEY rate-limited, HTTP 429). Files in `education/pilot-01/research/`. Claim map: `education/pilot-01/SOURCES.md`.
- App identity: NutriAI, com.nutriaimobile; icon used only as a small signature.

## 2. Creative choices (not facts)
- Performer **Gram** = living 100 g calibration weight on a Roberval balance (measurement is the gag and the mechanism). Original design; sheet at `education/pilot-01/character/`.
- Medium: browser Three.js 3D (dimensional dark stage), procedural mango with natural colours (vertex-colour blush, lenticels, clip-plane cut, glossy flesh), true-proportion nutrient column, measuring cup; 2D overlay for type.
- Script narrowed to fit 15 s at a natural pace (no speed-up): five lines, about 11.3 s of speech. Sugars and daily values omitted on purpose.
- Palette: icon ink/leaf/green/lime + mist; food in natural colours; vitamin C accent `#FFB830`.

## 3. Skill provenance / adaptations
- `.claude/skills/animation-direction/SKILL.md`: storyboard with action verbs; anticipation → action → impact → recovery (launch, chop, stomp); props explain cause → effect (balance tilt, stomp pulse → stamp); render full video, inspect boundaries + contact sheet, ffprobe + full decode.
- shader-glsl skill (iart-ai): Three.js `ShaderMaterial` uniforms for the backdrop (value noise + fbm haze) and water layer (noise-ridge caustics + fresnel); deterministic single clock (`frame/30`), `?t=N` seek/freeze harness (`web/main.js`), start/mid/end screenshot verify loop. Not used: full-screen domain-warp fluid (wrong medium for a realistic food lesson).
- Engine adaptation: 3D scene + 2D canvas overlay composited as a texture; frames captured by `readPixels` in headless Chromium (SwiftShader), piped to FFmpeg.

## 4. Render / QA state
- 2026-11-02: stills reviewed in 4 rounds. Fixed: sRGB vs linear vertex colours (pale mango), portrait framing (smaller balance, new cameras), instanced cubes culled (frustumCulled=false), floating column rim, label/stamp/caption collisions, invisible cup glass, graduations outside the safe area, last cube above the fill line, pale flesh under the key light.
- Audio built: voice ASR (faster-whisper base.en) = "what's inside 100 grams of mango, just the flesh, mostly water, 15 grams of carbs with some fiber, 60 calories, 36 milligrams of vitamin C, just over half a cup." Voice ends 14.39 s.
- Review render 1 (QA run on `build/review-pass1.mp4`): decode clean; freezedetect flagged 12.0–12.87 s; caption overlap at 5.5 s; "not counted" tags left the frame; B4 kcal label crossed x 1020; QA logger ignored canvas transforms (false positives). All fixed: staggered captions, clamped tags, label moved, breathing/sway + magnifier sway + slow B3 push-in, transform-aware logger, B3 overlays fade before the cup move.
- Voice reproducibility: Piper sampling is stochastic, so canonical takes are now cached in `source/audio/voice-takes/` and reused. The first cached L1 take said "mango" unclearly (ASR heard "mega"/"mago"), so 6 L1 and 5 L3 candidates were generated and one passing both ASR models verbatim was kept for each. The opening line was also moved to 0.80 s (after the slam) and SFX/music ducked under the voice. Final mix ASR (base.en and small.en): "What's inside a hundred grams of mango? Just the flesh. Mostly water. 15 grams of carbs with some fiber. 60 calories. 36 milligrams of vitamin C. Just over half a cup." (verbatim).
- Final render (2026-11-02): `education/pilot-01/nutriai-education-pilot-01.mp4`, sha256 df50f7aa…092015. 15.000 s / 450 frames / H.264 High 1080×1920 30 fps / AAC 48 kHz; decode clean; −14.0 LUFS, −1.5 dBTP; no black/freeze; 0 of 3 506 text runs outside the safe area; ASR on the MP4 verbatim. Last fix before final: the 60 kcal stamp re-grew while fading (fade decoupled from slam-in). Details: `education/pilot-01/QA.md`.
- Character sheet: `education/pilot-01/character/gram-model-sheet.png` (turnaround, 6 expressions, 6 poses, palette), rendered from the production rig.

## 5. Unresolved / blockers
- None blocking. USDA API rate limit worked around with the official bulk file.

## 6. Next action
Pilot 01 delivered. Next (only when asked): episode 2 from the list in 08. Research one FDC entry first, then storyboard, reuse Gram rig + balance, and change the situation, camera and choreography.
