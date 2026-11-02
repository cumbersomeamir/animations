# 06 — Style test brief: NutriAI 15 s, shader-glsl

Status: active test request (supersedes duration + visual style **for this test only**; the 30 s production brief in 02/04 is unchanged and its work is preserved in `videos/nutriai/source/`).

## Request (as received)
- Create and render a NEW 15-second test video for NutriAI (com.nutriaimobile) using the **shader-glsl** skill. Separate style experiment, not a trim or reuse of the 30 s animation. Keep the session named "NutriAI — Production Video".
- Isolation: repo cumbersomeamir/animations, branch `claude-video/nutriai`. Read CLAUDE.md, START_HERE.md, context 00–05 and this request only; only this app's icon/listing/approved assets. No other app branches, folders or chats.
- Skill to read and apply: https://github.com/iart-ai/webgl-animation-skills/blob/HEAD/skills/shader-glsl/SKILL.md (GLSL noise, SDF geometry, fluid domain warping, ripple/displacement transitions, Three.js uniforms). Read SKILL.md + linked references; record what was used and adapted. Third-party scripts are reference only; implement with own inspected code + official registry deps. No paid API, secrets, subscriptions or Blender.
- Art direction: organic fluid motion resolves into meal and water tracking motifs. Working palette black + leaf green, accents sampled from the app icon (override skill defaults). Verified features only; no invented metrics, outcomes or testimonials. UI verified or explicitly stylized.
- Variety: the skill's medium and movement throughout; no static poster panning, generic text slides, earlier-style reuse or other-app choreography. One clear app story, strong opening, meaningful moving action, readable app / Google Play ending.
- Deliver: exactly 15 s, 1080×1920, 30 fps, H.264 + AAC, original sound matched to action, concise captions + short narration. Timebox voice setup.
- Output: `videos/nutriai/tests/15s/nutriai-15s-test.mp4` + source, storyboard, contact sheet, ffprobe metadata, QA.md. Inspect scene boundaries and representative frames; check text, readability, colour, continuity, full decode, duration, audio; fix and rerender. Commit to own app branch; provide playable MP4 path.
- Keep `07-test-progress.md` (facts, creative choices, source/skill provenance, render checks, next step) and reread 06/07 on every resume.
