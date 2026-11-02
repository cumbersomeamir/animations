# 07 — 15 s Three.js style test: progress log

## Facts (verified)
- App Werbens · com.werbens.app · branch claude-video/werbens. Listing (assets/listing.json, sha256 710c80fd… verified):
  "Discover creators and manage brand campaigns, briefs and conversations." Android, Business, Google Play.
- Palette sampled from assets/icon.png (sha256 b9709c1f… verified): violet `#6234FB` (background), lavender fold
  `#CCC0F7` / `#C6BAF6`, pale lavender `#F0EAFC`, white `#FEFEFD`. Ink `#1B1433` is a derived legibility colour (provisional).
- Claims on screen/voice: only "Discover creators", "Campaigns / Briefs / Conversations", "All in one app" (the three listed
  capabilities in one app), the verbatim listing tagline, "Explore on Google Play". Phone screen, cards and chat text are
  stylized illustrations, not real Werbens UI.

## Skill provenance (threejs-animation, iart-ai/webgl-animation-skills@HEAD — read, not executed)
- Read: `skills/threejs-animation/SKILL.md` (v0.1.0), `references/r3f-and-perf.md`, `references/resource-disposal.md`.
- `scripts/seek-shot.sh`, `scripts/contact-sheet.sh`, `scripts/README.md` referenced by SKILL.md return 404 → own equivalents
  (`src/render.mjs --stills`, `qa.sh` contact sheet).
- Applied from the skill:
  - **Deterministic time:** `frame(t)` is pure; every object, the camera, screen texture and HUD derive from `t`; randomness seeded (mulberry32).
  - **?t=N freeze harness** (`scene.html?t=N` renders one frame and sets `window.__ready`), plus `?play` live loop via
    `renderer.setAnimationLoop` + `Clock` (honours `prefers-reduced-motion`).
  - **Verify loop:** render → freeze → screenshot at start/mid/end in Playwright Chromium (SwiftShader WebGL2) → check fidelity & artifacts;
    console/pageerror/HTTP-404 capture (black-canvas = init error rule).
  - **InstancedMesh** for 420 creator tiles (two instanced meshes sharing matrices, `DynamicDrawUsage`, per-instance colour) and 160 spark particles.
  - **Camera paths:** smooth fly-through + crane + orbit as time-parameterised Catmull-Rom (Hermite, C1) — skill's CatmullRom guidance adapted to time.
  - **Lighting/material grammar:** PBR `MeshPhysicalMaterial` (clearcoat), RoomEnvironment PMREM instead of many lights, no shadow-casting lights (perf),
    emissive motion for glow beats (ignite, docking, spiral).
  - **Post-processing:** EffectComposer → RenderPass → UnrealBloomPass (threshold 0.97, only HDR emissives bloom) → OutputPass; MSAA render target.
  - **Resource controls:** DPR capped to 1 (exact 1080×1920 offline), `disposeAll()` traversal (geometry, every material texture slot, PMREM, RT, renderer);
    `renderer.info.memory` logged before/after (27→36 geometries / 21→26 textures after first frame compile, then stable).
- Adaptations: browser scene is rendered offline frame-by-frame (not real-time); three is served from the pinned npm package (three@0.180.0) via a local
  importmap instead of a CDN; GLTF/AnimationMixer/R3F/scroll sections not needed (all geometry procedural, no models).

## Creative choices
- One continuous camera take (no cuts): tunnel rush through floating creator tiles → ¾ hero arc → crane/orbit → frontal brand push-in.
- Cause → effect beats: camera passes → tiles flip & part; tiles ignite → follow and dock; each dock → light stream + screen row fills;
  phone pulse → tile chaos snaps into a grid floor (wave); pieces spiral into screen → phone spins & morphs into the icon tile → floor ripple.
- Captions: dark violet glass pills (backdrop-blur) — white-glass version failed legibility over bright cards (fixed). Caption 2 = three word chips
  popping on "campaigns", "briefs", "conversations".
- Narration (Kokoro af_heart, local, phoneme override for "Werbens"): T1 0.25 s "Discover creators." · T2 3.05 s "Manage campaigns, briefs and
  conversations." · T3 7.0 s "All in one app." · T4 11.85 s "Werbens. Explore on Google Play."
- Sound: fully synthesised (additive pads D–Bm–G–D–A–Bm–D, FM plucks, sub kick, hats, noise whooshes, glass bell docks, Freeverb-lite);
  SFX cue sheet in `src/timeline.js` shared with the scene.

## Render checks
- Stills pass 1: overexposed bloom, white-glass captions illegible over bright cards, caption-2 pill mostly empty, brief card clipped right,
  icon back face visible mid-morph, wordmark crowding icon → all fixed (exposure/bloom down, dark glass + chips, docks pulled in + look target,
  swap at edge-on with icon = spin − 2π, CTA layout lowered).
- Stills pass 2 (0–13.5 s, 12 samples + 1.6 s/3.2 s at half-res): all issues resolved.
- Audio: 15.000 s, 48 kHz stereo; -14.0 LUFS integrated, peak -1.5 dBFS; rush lowered + SFX ducked under voice for narration clarity.
- Full render: in progress (≈2.3 s/frame, SwiftShader).

## Next
- Mux, run qa.sh + ASR-on-mix, inspect boundary frames/contact sheet, fix, write QA.md, commit + push, send MP4.

## Checkpoint 2026-11-02 (new Code session, educational brief)
- Honest status: UNFINISHED / NOT DELIVERED. The full frame render was "in progress" in an earlier container that was
  reclaimed; `build/` (frames, narration, mix) was gitignored and is gone. `tests/15s/werbens-15s-test.mp4` was never
  committed and does not exist. No QA.md, contact sheet or ffprobe output exist for this test.
- Sources are preserved exactly as committed in d6ea7b4 (`build.sh` would regenerate it). Not resumed in this session:
  the user-approved next brief is the educational pilot (context/08–10). Not overwritten, trimmed or relabelled.
