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
