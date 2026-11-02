# 07 — Test progress: NutriAI 15 s shader-glsl style test

Workspace: `videos/nutriai/tests/15s/`. Brief: `06-style-test.md`. Reread CLAUDE.md, 05, 06 and this file on every resume.

## 1. Facts (evidence only)
- App: "NutriAI: Calorie Tracker", package com.nutriaimobile (assets/listing.json).
- Only feature claim used: "Track meals, water, weight and fasting privately on your Android device." CTA wording: "Explore on Google Play".
- Palette sampled from `assets/icon.png` (median of pixel clusters, alpha > 250): ink `#151E16` (25 336 px), leaf `#5AB626` (23 974 px), green `#86DA3F` (3 645 px), lime `#A6E955` (1 178 px). Background of the icon is white; no blue exists in brand assets, so water is shown as clear refraction in the green/black palette.
- Unknown / not shown: real app UI, metrics, outcomes, pricing, testimonials.

## 2. Skill provenance
- Source: github.com/iart-ai/webgl-animation-skills, `skills/shader-glsl/SKILL.md` (sha256 5fbaf306…e564, v0.1.0) and `skills/shader-glsl/references/glsl-cookbook.md` (sha256 5d9a1454…f422), fetched 2026-11-01 via raw.githubusercontent.com (HEAD). `scripts/seek-shot.sh`, `scripts/contact-sheet.sh`, `scripts/README.md` returned 404, and would not have been executed anyway.
- Used from the skill: fragment-shader skeleton (normalize + aspect-correct), hash/value noise, simplex 2D (Ashima/Gustavson, public domain) + rotated-octave fbm, domain warping (noise into noise) for fluid, SDF library (circle, segment, round box, smooth union) with `fwidth` AA fill, IQ cosine palette (re-tuned to the icon greens), noise-dissolve and displacement transitions driven by `u_progress`-style uniforms, chromatic aberration, Three.js `ShaderMaterial` + full-screen quad, half-resolution render target for heavy fbm (mobile/perf section), `?t=N` seek/freeze harness and the start/mid/end screenshot verify loop.
- Adaptations: video delivery instead of a live HTML loop. Three.js comes from npm, not a CDN, and is served locally. Every frame is driven by one clock (`u_time = frame/30`) and captured by Playwright from the pre-installed Chromium (SwiftShader WebGL), then encoded with FFmpeg. Captions are rendered into canvas textures and revealed in-shader with ripple displacement. Audio is synthesized locally (not part of the skill).

## 3. Creative choices
Storyboard: `tests/15s/STORYBOARD.md`. Summary:
- One story: droplet → organic flow → resolves into a meal ring (fork + 3 segments filled by liquid blobs) → melts into a glass (4 refractive droplets raise caustic water, tally ticks) → vortex resolves into the icon's ring + leaf → noise-dissolve to the real icon tile → NutriAI / Calorie Tracker / Meals · Water · Weight · Fasting / Explore on Google Play.
- Medium is shader-only: two passes (half-res domain-warped fluid → full-res composite with SDF shapes, ripples, chromatic aberration, liquid text reveal). No 2D illustration, no stickman, no poster panning.
- Palette: icon-sampled ink/leaf/green/lime + near-black VOID and leaf-tinted MIST for text; skill's rainbow cosine defaults replaced by a palette fitted to the greens. Water = clear refraction + lime caustics (no blue).
- Captions (Inter Display Black 118 px, top band with a shader scrim): "Every bite. Every sip." / "Track every meal." / "Log every glass of water." Labels Breakfast/Lunch/Dinner inside the ring.
- Narration: Piper en_US-ljspeech-high (already downloaded for the 30 s work; no new setup). Music + SFX synthesized in `source/audio/build_audio.py`.

## 4. Render checks
First-pass render complete and muxed: `tests/15s/nutriai-15s-test.mp4` (15.000 s, 1080×1920, 30 fps, 450 frames, H.264 High + AAC, −14.0 LUFS / −1.4 dBTP, full decode clean, no black/freeze, text in safe area). Details: `tests/15s/QA.md`, `tests/15s/qa/`.

## 5. Unresolved issues
Status: CHECKPOINTED first pass (paused 2026-11-02 for the educational pilot). Known, unfixed: last narration ends 14.885 s (tight); button/press slightly late vs. words; scene A fluid busy at frame bottom; no real-time watch-through. Planned fixes were reverted from timeline.json so the source reproduces the committed render.

## 6. Log
- T1: test brief written (06), WIP 30 s source committed (d79dede) to preserve it, skill read, palette sampled.
- T2: harness built (`tests/15s/source/`: web/index.html + main.js + state.js + shaders/{common.glsl,fluid.frag,composite.frag}, render.mjs, audio/build_audio.py, build.sh, qa/qa.py). SwiftShader benchmark: about 0.35 s per full-res domain-warp frame + 0.28 s readback; final composite about 1.5 s/frame (about 12 min per full render).
- T3: still review round 1: fluid too fine/bright and lime caption words lost contrast → fluid scale 1.15→0.62, contrast remap, caption scrim; opening too empty → light trail, larger drop, anticipation rings; fork unreadable over the ring → solid fork glyph inside the plate; end card top-heavy → moved down 90 px; chromatic aberration produced red/blue fringes → reduced.
- T4: narration ASR check (faster-whisper base.en) on the stem: "Every bite, every sip. Track every meal. Log every glass of water. Nutri AI. Explore on Google Play." (all lines intelligible). Last line originally ended at 14.885 s → moved to frames 362/390 (ends ≈14.69 s); button/press moved to 392/418 to sit on the spoken words.

## 7. Next step
Paused. If resumed: apply the 3 timing/fluid fixes listed in QA.md, re-render (≈12 min), re-run qa.py. Do not overwrite the checkpoint without recording it.
