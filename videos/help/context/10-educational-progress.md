# 10 — Educational progress (Pilot 01)

Resume protocol: reread `CLAUDE.md`, `START_HERE.md`, `05-progress.md` and this file; then `08`/`09`. Only branch `claude-video/help`;
only `videos/help/`. Never touch main or other app branches.

## State at session start (2026-11-02, inspected before any change)
- Branch `claude-video/help` clean, 2 commits (`b893669` first commit, `c084761` isolated context). Context files 00–05 only
  (no 06/07 existed). `05-progress.md`: "No new video has been rendered yet."
- **No earlier 30 s render and no 15 s skill-test exist on this branch** → nothing to checkpoint, trim or relabel.
  The old campaign MP4 named in `01-product-facts.json` (`previous_brief_reference`) lives on a local Mac path, is not in
  this repo and was not used.

## Verified facts (evidence)
- Product: only `assets/listing.json` — "Donate essentials in Lucknow with next-day delivery and verified proof", Lifestyle,
  free, rated 3+. *How* Help verifies proof is unknown → no product-safeguard claims in the lesson.
- Icon palette sampled from `assets/icon.png` pixels: cream `#F7F5EF`, ink `#0B0D12`, green `#2DB37D`, yellow `#F2C230`.
- Subject sources (accessed 2026-11-02): Verification Handbook ch.5 (provenance, location, date; reposted with different
  context; one piece of evidence insufficient) · WITNESS metadata guide (images need context; who/when/where) · ACL Logic
  Model Guidance adapted from Kellogg 2004 (outputs vs outcomes/impact). Full claim map: `education/pilot-01/SOURCES.md`.

## Creative decisions (proposals, not facts)
- One concept: a clip shows one handoff inside its frame → check when/where → it can't show after → "one piece of evidence".
  Identity/authenticity-in-depth/use-of-funds deliberately left for later lessons (narrowed to fit 15 s).
- Medium: three.js miniature diorama on an ink stage (tilt-shift, soft shadows), rendered deterministically in headless
  Chromium (SwiftShader). Recurring host **Tally** (original). Captions in a cream pill; "Illustrative scene · Lesson 01" chip.
- Script tightened twice to fit pace: first draft = 14.4 s of speech (too dense) → final 36 words / 11.3 s.
  L1 changed "…prove your donation helped?" (3.25 s, collided with L2) → "…prove you helped?".
- L4 take chosen from 8 re-takes because offline ASR recognised "clip" only in that take (others heard "club").
- Music: original 96 BPM D-major mallet/bass/pad; chords change on shot boundaries; thins to Em during "after the clip"; resolves at 13.75 s.

## Skill adaptation (`.claude/skills/animation-direction/SKILL.md`, read in full)
Used: storyboard first with timings + action verbs; reusable primitives inside this app workspace; anticipation/action/
impact/recovery (hop squash, tag toss → snap → wobble, pin drop → bounce, "?" overshoot); props explain cause and effect;
voice and picture tell the same story; render whole video, inspect boundary frames + full contact sheet, ffprobe + full decode.
Adapted: the skill's stickman / paper-editorial styles were **not** used — this brief asks for a dimensional miniature
documentary, so the "simple rig with clear silhouettes" became a 3D figure rig with IK limbs; "editorial cut-outs" became
dimensional props. The referenced GitHub repos (stickman-video, vox-editorial) were not fetched or executed.

## Paths
- Source: `videos/help/education/pilot-01/` (see its README). Final: `videos/help/education/pilot-01/help-education-pilot-01.mp4`.
- Character: `education/pilot-01/character/tally-model-sheet.png`, `TALLY.md`, rig `src/rig/figure.js`.

## Exact commands
```bash
cd videos/help/education/pilot-01
npm install                      # three@0.170.0 (lockfile committed)
python3 -m venv --system-site-packages .venv && .venv/bin/pip install -r requirements.txt   # piper-tts==1.3.0
.venv/bin/python audio/voice.py  # takes -> audio/generated/voice (committed); L1/L4 re-taken with --only
python3 audio/mix.py             # soundtrack + src/generated/lipsync.json
node tools/render.mjs --out build/video.mp4
ffmpeg -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart help-education-pilot-01.mp4
node tools/render.mjs --sheet    # character sheet
# or simply ./build.sh
```

## Render / QA state
- Iteration log: v0 stills → fixed stale 2D overlay (Chromium canvas double-buffer: now hidden when empty + willReadFrequently
  + 2×rAF before capture); A reveal camera clipped through the frame → restaged Tally as presenter facing camera; C cropped
  tag/pin → new C angle, tag tossed onto frame; D cropped "?"/cards → wider crane; E Tally off-centre → camera centred on Tally;
  WHERE card occluded/cropped → raised; E pointing arm crossed face → angled out.
- Full render v1: in progress at time of writing (see QA.md for final results).

## Unresolved / notes
- `CLAUDE.md` (root) still says "produce a 30-second MP4"; the user's latest brief explicitly makes this educational 15 s
  pilot the active direction and says not to generate another campaign ad. No 30 s campaign video was made in this session.
- Satchel strap nit (see `character/TALLY.md`).

## Next action
Finish QA of v1 → fix/re-render if needed → commit + push → plan episode 02 (titles in `08`), only after user approval.
