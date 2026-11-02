# 06 — Style test brief: TableVerse 15 s, manim-composer + manimce-best-practices

Recorded from the user's latest request (this session). It supersedes the duration and visual-style
requirements **for this test only**; the 30 s stickman production video remains a separate deliverable and is preserved.

## Identity & isolation
- App: TableVerse · package `com.tensorblue.tableverse` · repo `cumbersomeamir/animations` · branch `claude-video/tableverse`.
- Read only: CLAUDE.md, START_HERE.md, context 00–05, this brief, `assets/icon.png`, `assets/listing.json`.
- No other app branches, folders or chats. Session title stays "TableVerse — Production Video".

## Skill
- `manimce-best-practices` — https://github.com/adithya-s-k/manim_skill/blob/HEAD/skills/manimce-best-practices/SKILL.md
  (math scene planning, shape creation/morphing, grouped animations, equations, camera guidance, CLI renders).
- `manim-composer` (same repo) — plan the video as a scenes.md before coding.
- Read the actual SKILL.md files and linked references; apply their workflow and visual grammar; record what was used
  and every adaptation. Repository scripts/installers are reference only: implement with own inspected code and
  official registry dependencies. No paid API, secrets, subscriptions or Blender.

## Art direction
- One multiplication fact explained by **groups of objects rearranging**.
- Working palette: deep violet and purple; accents sampled from the app icon (exact values recorded in 07).
- Only verified product facts (listing sentence); no metrics, outcome guarantees or testimonials.
  UI must be verified or explicitly stylised illustration (none is shown).
- Variety is the purpose: use this skill's distinctive medium (clean vector math animation: Create/Write,
  Transform, LaggedStart, ValueTracker, camera frame moves) throughout. No poster panning, no generic text slides,
  no reuse of the 30 s stickman style or choreography. Strong opening, meaningful moving action, readable
  app + Google Play ending; pacing designed for this medium.

## Deliverables
- Exactly 15 s, 1080×1920 portrait, 30 fps, H.264 + AAC, original sound matched to action, concise captions,
  short narration (voice setup timeboxed).
- `videos/tableverse/tests/15s/tableverse-15s-test.mp4` + source, storyboard, contact sheet, ffprobe metadata, QA.md.
- Inspect scene boundaries and representative frames; check text, readability, colour, continuity; full FFmpeg
  decode, duration and audio; fix and rerender. Commit to the app branch; provide the playable MP4 and exact path.
