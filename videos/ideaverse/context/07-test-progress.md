# 07 — 15s kinetic-reel test: progress log

## Facts (verified, from assets/listing.json + assets/icon.png)
- Name "Ideaverse - All in One AI App"; description "a platform for creating Images for Instagram and a lot more!";
  Social category; by Tensorblue AI.
- Icon colours (pixel-sampled): navy #1B2333 (bg), mint #6CDA7E (bulb/ring), white #FFFFFF (sparkles).
- NOT verified (not claimed on screen): video/animation generation, speed, pricing, ratings use, any in-app UI.

## Skill provenance
- Read: SKILL.md, references/style-guide.md, references/sound.md; skimmed template/reel/cues.js, template/STORYBOARD.md,
  template/music/score.mjs (reading only; nothing from the repo executed or copied in).

## Creative choices
- Story: "idea becomes image then motion" → 01 IDEA (particle bulb) · 02 ONE APP (chrome knot absorbs app chips) ·
  03 IMAGE lead 40% (bulb particles → 95x95 pixel grid → scan resolve → textured 3D card + chrome planet ring) ·
  04 MOTION (helix of image cards + mono tapes + serif "made for your feed.") · END (real icon + chrome ring, name, CTA).
- Palette override: skill ink/lime/cream → navy #1B2333 / mint #6CDA7E / white (icon-sampled). Derived, provisional:
  deep navy #121826 (darker ground), mist #EEF4F0 (light ground), #2F8F57 (dark mint for "feed." on mist).
  Generated picture uses violet/peach dusk tones inside the image only (illustrative content, labelled).
- Type per skill: Anton (headlines), Archivo Black (slam), Instrument Serif italic (voice line), JetBrains Mono (HUD/chips),
  from @fontsource npm packages (OFL).
- Transitions per skill catalogue, all different: iris (bulb lights) → zoom-through (knot centre) → slats (on bar) →
  hard cut + glitch + impact (chapter slam into END).
- Narration: Piper 1.8.0 + en_US-ljspeech-high (public domain dataset), 5 short lines, best ASR-verified take kept.
- Adaptations vs skill: portrait 1080x1920 instead of 16:9 (margins 64-80 px, HUD at corners, content y 160-1740);
  no per-shot WebGL post pass (grain/vignette/glitch slices done in Canvas 2D); helix + icon plane are new GL layers
  for this app; liquid-marble layer not used (no "principle" line); cloud silhouette = the icon's bulb.

## Source / skill provenance
- Own code only: src/reel/{cues.js,reel.js,index.html}, src/render.mjs, src/music/score.mjs, src/narration/*.
- Registry deps (exact pins, package-lock.json): three 0.186.1, @fontsource/{anton,archivo-black,instrument-serif,jetbrains-mono} 5.3.0.
- Preinstalled Playwright 1.63.0 + Chromium (SwiftShader WebGL2) for headless frame rendering; FFmpeg 6.1.1 for encode.

## Render checks
(pending)

## Commands
- cd videos/ideaverse/tests/15s && ./build.sh   (frames → score → limiter → encode → contact sheet)
- stills: cd src && node render.mjs --stills=0,3.3,9.6 --out=../build/stills

## Render checks (checkpoint 2026-11-02)
- 450 frames rendered (8.5 min, 3 SwiftShader workers). Encoded: tests/15s/ideaverse-15s-test.mp4 — 15.000 s, H.264
  1080x1920 30 fps + AAC 48 kHz; full decode OK; −13.5 LUFS, −1.7 dBFS peak. See tests/15s/QA.md + qa/.
- Known unfixed issue: near-empty flash frames f360–f362 at the 12.0 s hard cut.

## Status / next step
CHECKPOINTED (honest status: encoded + automated QA; visual fix pass incomplete). Superseded as active work by the
educational pilot (context/08–10). Do not overwrite; if resumed, fix the 12.0 s cut and re-encode under a new name.
