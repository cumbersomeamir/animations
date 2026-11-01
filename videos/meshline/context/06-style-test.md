# 06: Style test brief (15s, text-message-animation)

Source: the user's latest request in the Claude Code session titled "Meshline — Production Video". It is recorded here verbatim in substance.

## Request
- Create and render a NEW 15-second test video for Meshline (`com.cumbersomeamir.meshline`) using the **text-message-animation** skill.
- This is a separate style experiment. It is not a trim or reuse of the earlier 30s animation. Earlier work must be preserved.
- This brief supersedes the old duration and visual-style requirements for this test only.

## Isolation
- Repository `cumbersomeamir/animations`, branch `claude-video/meshline`.
- Read only CLAUDE.md, START_HERE.md, context 00–05, this brief and this app's icon/listing/approved assets. No other app branches, folders or chats.
- Keep a separate `07-test-progress.md` (facts, creative choices, source/skill provenance, render checks, next step). Reread both files on every resume.

## Skill
- Skill: https://github.com/iart-ai/text-message-video-skills/blob/HEAD/skills/text-message-animation/SKILL.md (MIT).
- What it covers: sequential chat bubbles, typing pulses, timed message pops, auto-scroll, script-driven timing and portrait safe areas.
- Read the actual SKILL.md and the linked references, then apply its workflow and visual grammar. Record what was used and what was adapted.
- Third-party scripts are reference only: implement with our own inspected code and official registry dependencies. No paid API, secrets, new subscription or Blender.
- If the skill is style-only, implement an original, local, code-rendered version of its visual grammar and say so.

## Art direction
- Story: a nearby exchange while the internet is unavailable. UI must be verified or explicitly stylised illustration.
- Palette: electric blue and charcoal, sampled from the icon. The skill's default iMessage/WhatsApp colours are overridden.
- Only verified product features. No invented metrics, outcome guarantees or testimonials.
- Variety is the purpose. Use the skill's medium and movement throughout. No static poster panning, no generic text slides, and no reuse of the earlier style or another app's choreography.
- One clear app story, a strong opening, meaningful moving action, and a readable app/Google Play ending.

## Deliver and verify
- Exactly 15 s, 1080x1920, 30 fps, H.264 MP4 with AAC.
- Original or properly licensed sound, matched to the action. Concise captions or short narration only where they help.
- Timebox optional voice setup so it cannot block the render.
- Output: `videos/meshline/tests/15s/meshline-15s-test.mp4`, plus source, storyboard, contact sheet, ffprobe metadata and QA.md.
- Inspect boundaries and representative frames. Check text, readability, colour and continuity. Run a full FFmpeg decode and check duration and audio.
- Fix problems and rerender, then commit to the app branch and report the exact path.
