# 06 — Style test brief: Ideaverse 15s kinetic-reel (received 2026-11-01)

Separate style experiment — NOT a trim or reuse of the 30s stickman animation. Earlier work is preserved (commit 75b7b37).

- App: Ideaverse, com.ideaverseai, branch claude-video/ideaverse. Session title stays "Ideaverse — Production Video".
- Skill: kinetic-reel — https://github.com/tuzhechen2005/opus-video-skills/blob/HEAD/skills/kinetic-reel/SKILL.md
  (+ references/style-guide.md, references/sound.md). Generative 3D layers, chrome shapes, particles, bold type,
  shape-continuity transitions, beat-locked synthesized score. Apply its workflow + grammar; record use and adaptations.
  Third-party scripts are reference only: implement with own inspected code + official registry deps. No paid API,
  secrets, subscriptions or Blender.
- Art direction: "Idea becomes image then motion." Palette dark navy + mint, sampled from the app icon; override
  the skill's default colours. Verified features only; UI verified or explicitly stylized.
- Variety: use the skill's medium throughout; no static poster panning, no generic text slides, no earlier style or
  other-app choreography. One clear story, strong opening, meaningful motion, readable app + Google Play ending.
- Deliver: exactly 15.000 s, 1080x1920, 30 fps, H.264 + AAC, original sound matched to action, concise captions,
  short narration where it helps (voice setup timeboxed).
- Output: videos/ideaverse/tests/15s/ideaverse-15s-test.mp4 + source, storyboard, contact sheet, ffprobe, QA.md.
  Inspect scene boundaries + representative frames, full decode, duration, audio; fix and rerender; commit.
- Context isolation: read only CLAUDE.md, START_HERE.md, context 00–05 (+06/07), this app's assets. Reread 06/07 on resume.
