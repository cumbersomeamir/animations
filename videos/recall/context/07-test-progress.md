# 07 — 15 s style test (06-style-test.md): honest status checkpoint

Checkpoint written 2026-11-02 by the Claude Code session that received the educational-pilot brief,
before starting that new brief (see 08/09/10). Nothing below creates, trims, relabels or replaces any video.

## Status: NOT STARTED on this branch (unfinished)
Verified by inspecting `origin/claude-video/recall` at commit 93c706f (2026-11-02):
- `videos/recall/context/06-style-test.md` exists (brief received 2026-11-01).
- `videos/recall/tests/` does **not** exist: no source, storyboard, render, contact sheet or QA for the 15 s test.
- `videos/recall/tests/15s/recall-15s-test.mp4` does **not** exist.
- This file (07) did not exist before this checkpoint; no earlier progress notes for the test were found.
- The 30 s production video `videos/recall/output/recall-30s.mp4` is a different deliverable and is untouched.

## What this means
- There is no 15 s style-test video for Recall. Nothing may be described as one.
- The educational pilot (`videos/recall/education/pilot-01/recall-education-pilot-01.mp4`) is a separate,
  newer brief. It is **not** the 06 style test and must not be relabelled as such.
- The newer user-approved direction is educational pilots; the user said not to spend this brief generating
  another campaign ad. The 06 test therefore remains open and was deliberately not built in this session.

## Next step (if the user re-requests the 06 test)
Follow 06-style-test.md as written: read the referenced stickman-video SKILL.md (read-only), build under
`videos/recall/tests/15s/`, render `recall-15s-test.mp4`, and record facts / creative choices / checks here.

## Addendum 2026-11-22 — recovered local work (honest status: UNFINISHED checkpoint, not a deliverable)
Written by the recovered Recall Code session while preparing english-23. The note above (2026-11-02) was correct for what was on the
remote at the time: this session had built the 15 s test locally on 2026-11-01/02 but never pushed it before the worker restarted.
That local work was found uncommitted in this container, backed up, and is now committed **as found** under
`videos/recall/tests/15s/` (nothing trimmed, relabelled or reused; no other video was changed). It was not continued further,
because the newer briefs (educational pilot, then the production format 11) superseded the 06 style test.
- What exists: own pycairo re-implementation of the stickman-video skill's grammar (`src/engine.py`, `src/video15.py`), synthesized
  audio (`src/audio15.py`), Kokoro am_michael narration (`audio/voice/`), storyboard, OFL fonts, and one full render
  `recall-15s-test.mp4` (15.000 s, 1080x1920, 30 fps, H.264 + AAC, full decode clean).
- Why it is unfinished: its own check (`qa/check_report.json`) fails — decoded AAC peak +0.8 dBFS with 4 clipped samples (true peak
  −0.8 dBFS), and the ASR transcript did not match the script ("steady material", "process", "space reviews"; "Forgot it?" missed);
  the final-render contact sheets were not reviewed and no QA.md was written. It must not be described as a finished or approved video.
- Next step only if the user asks for the 06 test again: fix the limiter ceiling, re-check narration intelligibility, review the
  contact sheets, write QA.md.
