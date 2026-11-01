# 07 — Progress: 15 s diagram-animation test

Brief: context/06-style-test.md. Output folder: videos/courtlens/tests/15s/. The 30 s film (output/courtlens-30s.mp4,
project/) is preserved untouched and committed in ab2a56c.

## Facts (verified sources only)
- Listing: "Court records, case tracking and an AI assistant for advocates." (assets/listing.json). No other feature,
  metric, price or outcome is claimed.
- Icon colours measured from assets/icon.png (median of opaque-pixel clusters):
  navy deep #021C3F, navy mid #10497A, ivory #F5EDDF, gold #E0AD59, cyan glow #2EE4F9. Not provisional.
- No verified app screenshots exist in approved assets → the piece is an abstract diagram, labelled
  "CASE TRAIL · ILLUSTRATIVE" on screen and "Illustrative diagram, not app screens." in the end footnote.
- "Case / cause list / order" appear as kinds of court record (user art direction). Trail states
  (Case filed → On cause list → Order → Next hearing) are illustrative tracking steps, not a product claim.

## Skill / source provenance
- SKILL.md read from raw.githubusercontent.com/iart-ai/explainer-video-skills/HEAD/skills/diagram-animation/SKILL.md
  (sha256 eb4aebe125e1f70608cf365670a618907d5c8f1229e184cdd4e32fdc34a7a8fb), plus the linked
  references/diagram-and-chart-recipes.md (sha256 b5789057a05c8e01914b34352973b9a72582d0cfc7c3d76a35e14600cb851fb8).
  The linked scripts/README.md returned 404. No skill scripts or installers were downloaded or run.
- Applied from the skill:
  - progressive disclosure, in the order containers → nodes → edges → labels
  - node appear = scale 0.8→1 + opacity with back.out(1.6)
  - edge connect = pathLength=1 stroke-dashoffset 1→0, easeInOut, 0.2–0.5 s
  - flowing connectors = marching dash + travelling packet
  - highlight = active full opacity, context dimmed to 0.35
  - hold each step 0.5–1.5 s, with steps gated on the VO line (via ASR word onsets)
  - fixed colour grammar
  - one master timeline with a deterministic freeze (`window.seek(t)` / `?t=N`)
  - the verify loop: freeze, screenshot, contact sheet
- Adaptations:
  - The skill's GSAP+SVG route is implemented as one inline-SVG HTML file (src/diagram.html) driven by a single
    paused GSAP 3.15.0 master timeline (npm, pinned; GSAP Standard "no charge" license). GSAP tweens plain state
    objects, and a paint(t) function writes the SVG attributes. Continuous effects (marching dash, pulses, typing
    dots) are pure functions of t, so every frame is deterministic.
  - For video output the skill suggests Remotion. Instead, each frame is frozen with window.seek(f/30) and
    screenshotted in the preinstalled Playwright Chromium (tools/capture.js), then piped to FFmpeg/libx264. This
    gives the same per-frame determinism without Remotion's company-licence terms or a browser download.
  - The skill's default blue (#0A84FF) is replaced by the icon-sampled palette.
  - The "count-up" and chart recipes were not used: there are no verified numbers to count.
  - prefers-reduced-motion is not applicable to an MP4.

## Creative choices
- Medium: one continuous living diagram on a navy blueprint dot grid. There are no scene cuts and no camera
  panning; story beats are diagram operations. Storyboard: tests/15s/docs/storyboard.md.
- Story: frame 0 shows a big CASE node → 11 record nodes and tangled connectors ("records everywhere") → the COURT RECORDS
  container sorts them into Case / Cause list / Order → Courtlens hub (verified icon) receives data packets → CASE TRAIL with a
  signal stepping down the active path → AI ASSISTANT (cyan) answers through a VERIFY gate that only turns gold when the
  OFFICIAL COURT RECORD (gold) packet arrives → the gold edge marks the active trail step verified → everything converges
  into the hub → wordmark, chip chain, "for advocates", CTA node "Explore on Google Play" activated by a packet.
- Colour grammar: ivory = records/trail content; cyan = AI; gold = official/verified only; navy-mid = idle structure.
- Type: JetBrains Mono (diagram labels + typed captions) and Inter (wordmark, CTA, footnote), both OFL via @fontsource.
- Captions: a label box draws on and the text types with a block cursor, synced to word onsets. v5 is hidden because
  the end card's type carries it.
- Voice: local Kokoro-82M v1.0 ONNX (Apache-2.0), voice bf_emma. It reuses the already-downloaded, sha256-verified model
  (only bf_emma.bin, 522 KB, which was already cached). "Courtlens" is spoken via the spelling "Court lens".
- Sound: original synthesis (audio/score15.py): FM bells, sub pulses and filtered-noise data ticks at 120 BPM. SFX are
  generated from the cue sheet exported by the same GSAP timeline (pops, edge zips, packet tick streams, arrival bells,
  verified chime, converge sweep, logo hit, CTA click). The palette is deliberately different from the 30 s film.

## Render checks (final encode, see tests/15s/QA.md + qa/)
- courtlens-15s-test.mp4: 15.000 s; H.264 High 1080x1920 yuv420p 30 fps, 450 frames counted; AAC 48 kHz stereo.
- Full ffmpeg decode: 0 errors. Loudness -14.1 LUFS, LRA 0.8 LU, true peak -1.0 dBTP, no clipping.
- Narration ASR similarity 1.00 on all 5 lines; VO 7.9–13.4 dB over the bed.
- Fixes made after inspection, each followed by a rerender: blank frame 0 (GSAP seek-at-0) → clamp + larger opening node;
  VERIFY label near the left edge → column shifted; label overlaps → moved; small labels → enlarged;
  bus levelling switched from peak to RMS (the logo hit had skewed the SFX bus).
- Contact sheet qa/contact-sheet.png; boundaries qa/boundary_strip.png; frames qa/frames/*.jpg.

## Exact commands
- `cd videos/courtlens/tests/15s && npm ci && tools/build.sh` (narration+ASR → cues → score → frame capture → mux → QA)

## Status
- DELIVERED: videos/courtlens/tests/15s/courtlens-15s-test.mp4 (sha256 39062915c3485488dd1486276f9494ca3247244aece025c7d20a74bc12ae9279).

## Next
- Await feedback on the diagram-animation style. Separately, finish the 30 s film's QA.md (context/05-progress.md).
