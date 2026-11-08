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
- Full render v1 (07:04 UTC): QA found 2 boundary defects — B→C overlay carry-over (f169) and D→E "?"/card leak (f329).
  Fixed in `src/main.js`; audio true-peak headroom raised (loudnorm TP −2, limiter 0.79). Full render v2 (07:33 UTC, 1154 s).
- **Final v2 verified** (`education/pilot-01/QA.md`): 15.000000 s container/video/audio; H.264 High L4.1 1080×1920 yuv420p 30/1,
  450 frames decoded; AAC-LC 48 kHz stereo; full decode exit 0 with zero errors; −16.0 LUFS, −2.1 dBTP; captions/chip/signature
  0 boxes outside safe zone; offline ASR 35/36 words (key words all correct). SHA-256 `57842cda…f75080`.
- QA artefacts: `qa/ffprobe.json`, `qa/full-decode.log`, `qa/audio-report.txt`, `qa/text-bounds.json`, `qa/contact-sheet.png`,
  `qa/boundary-sheet.png`; model sheet re-rendered (header spacing).

## Unresolved / notes
- `CLAUDE.md` (root) still says "produce a 30-second MP4"; the user's latest brief explicitly makes this educational 15 s
  pilot the active direction and says not to generate another campaign ad. No 30 s campaign video was made in this session.
- Satchel strap nit (see `character/TALLY.md`).

## Next action
Pilot 01 is complete and pushed. Await user feedback on Pilot 01 (tone, pace, Tally design, caption style). Then, only with
approval, research + storyboard episode 02 from the list in `08` (suggested: "Receipt vs delivery photo"), reusing the rig,
`audio/mix.py` and `tools/` from this folder in a new `education/pilot-02/` (copy, don't edit pilot-01 sources).

## 2026-11-02 — 10 s style test, batch 2026-11-02-pre-reset (S03 Shadow Puppetry) — DONE
- Output: `videos/help/tests/10s/pre-reset-2026-11-02/help-10s-test.mp4`, SHA-256 `6cd2db7e489e7f40373334335036d5044a9d543fd5d0d938edf24eded1c6bc1d`.
- Verified: 10.000000 s container/video/audio; H.264 High 1080×1920 30/1, 300 frames; AAC-LC 48 kHz stereo; full decode exit 0 / 0 errors; −16.3 LUFS, −1.9 dBTP; ASR 14/15 words.
- Voice: Kokoro-82M ONNX (kokoro-onnx 0.6.1, model-files-v1.0), Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us. Not Piper.
- Canvas2D original renderer (~76 s for 150 unique frames ×2). Pilot-01 15 s work untouched.
- Unresolved: 2-line caption bottom y≈492 (asked ~460); light carving density; no human listening pass. Details: that folder's README.md.

## 2026-11-02 — production round production-30s-2026-11-02 — DONE
- Output `videos/help/production/30s/2026-11-02/help-30s-production-01.mp4`, SHA-256 `470743a39e6d7ec540699ee26cd98df33dafae8c2483c2304a41d1da2a2ec80b`.
- Format spec: `11-production-format.md`; brief/script/claims/storyboard/QA: `12-production-30s-01.md`. No automation created.

## 2026-11-02 — production batch production-30s-2026-11-02-batch-02 — DONE
- Output `videos/help/production/30s/2026-11-02-batch-02/help-30s-production-02.mp4`, SHA-256 `6461ba4980129694d1bbff8cc6d634dd11df900208c2e9d6a2e11e2a729c7c12`.
- Topic: why a flood survivor may need cash rather than another box. Record: `13-production-30s-02.md`; format/feedback update appended to `11-production-format.md`. No automation created.

## 2026-11-02 — feedback round 30 s #01 (poverty premium, "Hands That Reveal the Hidden Cost") — DONE
- Output `videos/help/production/30s/2026-11-02-feedback-round/help-30s-feedback-01.mp4`, SHA-256 `2d8c0afee3b1233d3586732bfd77e95aca7e9daccedc72af8b34a6ee27e2d1dc`.
- Brief/script/claims/storyboard: `14-production-30s-feedback-01.md`; format + exact style recipe update in `11-production-format.md`. No automation created.

## 2026-11-03 — round 02, 30 s #01 (food surplus vs unmet need) — DONE
- Output `videos/help/production/30s/2026-11-03-round-02/help-30s-round02-01.mp4`, SHA-256 `029e11a7f43ef31fd02a61c3599c1777b80b03d19e32543408dd1365ec184e11`.
- Record: `15-production-30s-round02-01.md`; specific corrections appended to `11-production-format.md`. No automation created.

## 2026-11-03 — hindi-03, 30 s #01 (Hindi; unrequested goods in disaster relief + checklist) — DONE
- Output `videos/help/production/30s/2026-11-03-hindi-03/help-30s-hindi03-01.mp4`, SHA-256 `649520e96e9aac9190844fea7065a35dae2e65d3bcde83c64ad9081114293061`.
- Record: `16-production-30s-hindi03-01.md`; Hindi rules appended to `11-production-format.md`. No automation created.

## 2026-11-04 — hindi-04, 30 s #01 (Hindi; free tuition but transport/uniform costs block attendance) — DONE
- Output `videos/help/production/30s/2026-11-04-hindi-04/help-30s-hindi04-01.mp4`, SHA-256 `c0d370ed547356659260ebc2f2010b73e8051373145fb3b96450073380613caf`.
- Record: `17-production-30s-hindi04-01.md`; skill adjustments (no child drawn, fictional-family label, caption assert) appended to `11-production-format.md`. No automation created.

## 2026-11-05 — feedback-05, 30 s #01 (Hindi; checks before donating a used phone to a student) — DONE
- Output `videos/help/production/30s/2026-11-05-feedback-05/help-30s-feedback05-01.mp4`, SHA-256 `2fb84eb716ea60d4d3f806ee43a7e66d3359dec9c898e8c071ace574e51254cd`.
- Record: `18-production-30s-feedback05-01.md`; corrections appended to `11-production-format.md`. No automation created.

## 2026-11-06 — english-06, 30 s #01 (English; donate a school bag a child can actually use) — DONE
- Output `videos/help/production/30s/2026-11-06-english-06/help-30s-english06-01.mp4`, SHA-256 `2b6f787b2f737dafd340c33d3ea02ada40fdb64b0d620ea25c7c8f88d397d02d`.
- Record: `19-production-30s-english06-01.md`; corrections appended to `11-production-format.md`. No automation created.

## 2026-11-06 — english-07, 30 s #01 (English; three checks before giving to an unknown group — subject changed from a covered topic) — DONE
- Output `videos/help/production/30s/2026-11-06-english-07/help-30s-english07-01.mp4`, SHA-256 `e6038f558780092ef1c0161e5e7a28eb09a205e49c90078642e6d71481110134`.
- Record: `20-production-30s-english07-01.md`; corrections appended to `11-production-format.md`. No automation created.

## 2026-11-07 — english-08, 30 s #01 (English; use-by vs best-before before donating food — subject changed from a covered topic) — DONE
- Output `videos/help/production/30s/2026-11-07-english-08/help-30s-english08-01.mp4`, SHA-256 `455326f9ef5628e409edd14f70efd62ba69a7e187f8f4ae56a09cb8aecec4e3b`.
- Record: `21-production-30s-english08-01.md`; corrections appended to `11-production-format.md`. No automation created.

## 2026-11-08 — english-09, 30 s #01 (English; "brand new" shoes can be unusable — pair, sole, size) — DONE
- Output `videos/help/production/30s/2026-11-08-english-09/help-30s-english09-01.mp4`, SHA-256 `62971dbf735d8b15c077fff7cb4b4b82a8ff56b74da28bf3b8fd9e760592b972`.
- Record: `22-production-30s-english09-01.md`; corrections appended to `11-production-format.md`. No automation created.
