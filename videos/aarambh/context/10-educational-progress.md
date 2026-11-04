# 10 — Educational progress (Pilot 01: lockstitch)

Facts, creative choices and verification are kept separate. Update after every milestone.

## Status: COMPLETE (rendered, QA'd, committed). Last updated 2026-11-02
- **Final video:** `videos/aarambh/education/pilot-01/aarambh-education-pilot-01.mp4`
- **Spec:** 15.000 s, 1080x1920, 30 fps, 450 frames, H.264 High yuv420p, AAC 48 kHz stereo, 13.3 MB
- **sha256:** see the "Final output" section below; it is recomputed at each commit.

## Session identity (checked 2026-11-02)
- **App:** Aarambh, package in.aarambh.app
- **Repo / branch:** cumbersomeamir/animations, branch `claude-video/aarambh` (the only branch touched; main untouched)
- **Workspace:** `videos/aarambh/` only. No other app's branches, folders, chats or outputs were opened.

## State at the start of this brief
- No prior render, no unfinished 15 s skill test and no earlier educational work existed. 05-progress.md said "No new video has been rendered yet."
- So there was nothing to checkpoint, trim or relabel, and no earlier 30 s render to preserve.
- Context files 06 and 07 do not exist on this branch. 00–05, the listing, the icon and the animation-direction skill were read.

## Verified facts (public sources, accessed 2026-11-02; full map in education/pilot-01/SOURCES.md)
- A lockstitch uses two threads: an upper (needle) thread and a lower (bobbin) thread. (Wikipedia "Lockstitch"; Wikipedia "Sewing machine")
- The hook or looptaker seizes the needle-thread loop, enlarges it and carries it around the bobbin case. (Wikipedia "Lockstitch"; US4091753A Singer 1978; US4355590A Singer 1982)
- The take-up lever supplies thread for the enlarged loop, then takes up the excess. The bobbin thread is drawn up with it. (US4091753A)
- Ideally the lock forms in the centre of the material's thickness. (Wikipedia "Lockstitch")
- A chain stitch uses a single thread and is not self-locking. This was consulted only to avoid confusion; it is not shown.
- App fact used: none beyond the name and signature. The listing says "Fund verified livelihood tools and follow their impact." This is not claimed in the lesson.

## Creative choices (not facts)
- **Niche:** "Tools, skills and everyday livelihoods". Series kicker: "HOW TOOLS WORK · 01".
- **Performer:** Bindu, an original miniature craftsperson. The rig is `education/pilot-01/src/lib/bindu.mjs`; the model sheet is `education/pilot-01/character/bindu-model-sheet.png`.
- **Look:** painted miniature workshop in icon-sampled green, cream and gold. The needle thread is gold and the bobbin thread cream.
- **Story devices:** Bindu shrinks into the needle hole (iris cutaway) and a swatch flip sets the puzzle. The swatch flip returns as the payoff.
- **Voice:** Piper en_US-ljspeech-medium (LJ Speech, public domain), pitch ×1.08 with shifted formants, EQ and compression. This makes Bindu's synthetic voice.
- **Music and SFX:** original procedural numpy/scipy.
- **Ten follow-on titles** are planned in 08 (not rendered).
- **Skill adaptation:** the `animation-direction` skill (SKILL.md) was followed where it fits:
  - storyboard first, with timing and action verbs
  - a reusable rig and primitives inside the app workspace
  - anticipation, action, impact and recovery (crank lean-back, hop squash, lever lift, drop and bounce)
  - props that show cause and effect
  - the full verification loop
  - The "stickman" rig style was upgraded to a painted, dimensional character to match this brief's "miniature craftsperson" direction.
  - The editorial paper texture became painterly grain plus brush layers.
  - The referenced GitHub repos were not fetched or executed (not needed).

## Exact commands (from `videos/aarambh/education/pilot-01/`)
```bash
python3 -m venv <venv> && <venv>/bin/pip install numpy==2.5.4 scipy==1.16.3   # (+ piper-tts==1.8.0 for TTS)
<venv>/bin/python audio/tts.py --model <path>/en_US-ljspeech-medium.onnx --out audio/narration/raw   # optional, stochastic
PYTHON=<venv>/bin/python ./build.sh          # npm ci, audio, model sheet, render, mux, tools/qa.sh
<venv>/bin/python tools/asr_check.py aarambh-education-pilot-01.mp4 --models <cache>   # optional QA (faster-whisper tiny.en)
node src/render.mjs --stills build/stills --times 3.3,7.6   # quick stills for review
```

## Verification results (final build, see education/pilot-01/QA.md)
- **ffprobe:** format 15.000000 s; video h264 1080x1920 30/1 with 450 decoded frames; audio aac 48 kHz 2 ch, 15.000000 s.
- **Full decode:** no errors.
- **Loudness:** −15.1 LUFS, −1.7 dBTP.
- **ASR (tiny.en) on the final MP4:** WER 0.000. All key-word times are aligned with the visual events (the lock snap lands 0.06 s before "lock").
- **Visual review:** contact sheets every 0.5 s plus all transition boundaries were inspected. Twelve issues were found and fixed (listed in QA.md).

## Unresolved / limitations
- No human listening test was possible here; intelligibility is verified by ASR only. Voice quality is TTS-grade.
- The reference accounts (Instagram) were not viewed. Their influence comes only from the user's description.
- There is a small one-frame loop-shape change at 8.55 s (hook release). Accepted.
- Piper TTS is stochastic. The committed takes are the canonical ones; regenerating them needs an ASR re-check.

## Milestones
- [x] Context read, isolation confirmed
- [x] Research and claim map
- [x] Script, TTS takes (L4 re-taken after the ASR check)
- [x] Renderer, rig, model sheet
- [x] Audio: voice chain, music, SFX, mix, lip-sync envelope
- [x] Full render, QA, 12 fixes, final rerender with clean `build.sh`
- [x] Commit and push to claude-video/aarambh

## Next action
- Get user feedback on Pilot 01: voice, pacing, Bindu design.
- Then pick episode 02 from the list in 08. Verify its mechanism against public sources before storyboarding.
- Reuse `src/lib/bindu.mjs`, `paint.mjs`, `core.mjs` and `ui.mjs`. Make new scene modules per episode.

## Final output
- `videos/aarambh/education/pilot-01/aarambh-education-pilot-01.mp4`
- sha256 `a513250845432be73d1113707ae497f0dc4cc1f1db72d93299dabbc1a1477fc3`
- 13,285,577 bytes

## 2026-11-02: 10 s style test, batch "2026-11-02-pre-reset" (S01 Archive Light Table)
The user changed direction: Aarambh's content is now **famous people, achievements and life stories**. The sewing-machine/livelihood topic was rejected and is not continued. Pilot 01 above is preserved as is.
- **Output:** `videos/aarambh/tests/10s/pre-reset-2026-11-02/aarambh-10s-test.mp4`, sha256 `949f7989c0c73638b975911ab276d91a0be4bdd54cda917e1afb4149bd56345e`
- **Spec:** 10.000 s, 1080x1920, 30 fps, 300 frames, H.264 + AAC 48 kHz stereo. Full decode OK.
- **Topic:** Marie Curie, Nobel Physics 1903 (shared, 1/4) and Nobel Chemistry 1911 (1/1). Verified on the nobelprize.org facts pages 2026-11-02.
- **Portrait:** Wikimedia Commons, Henri Manuel c. 1920, public domain.
- **Voice:** Kokoro-82M ONNX with the Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us. Not Piper.
- **ASR (tiny.en):** exact match with the script.
- **Limits:** −18.5 LUFS (below the −14 target); the caption plate partly covers the portrait during the card beat; QA was within the time budget only (details in that folder's README.md).
- **Next:** user review of the style. If approved, re-master loudness to −14 LUFS and run a fresh full contact-sheet pass.

## 2026-11-02: production round production-30s-2026-11-02 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-02/aarambh-30s-production-01.mp4`, sha256 `83cdfef3825d7cb19241a0f02fb117bfeadc5413af33def2129cb5ea825fb986`. 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Format rules:** `context/11-production-format.md`. **Episode record** (script, sources, storyboard, QA): `context/12-production-30s-01.md`.
- **Next:** user review. Future rounds follow 11; no automation has been created.

## 2026-11-02: production batch-02 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-02-batch-02/aarambh-30s-production-02.mp4`, sha256 `4ec3350b32b03ed58c50bea8f6e90192e862734c7d4848be3fe676c24ef67171`. Ada Lovelace / Note G. 30.000 s, 900 frames, −15.2 LUFS, −1.5 dBTP, full decode OK.
- **Record:** `context/13-production-30s-02.md`. The user's five-page/scene-change feedback is saved in `context/11` (feedback log). No automation has been created.

## 2026-11-02: feedback round (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-02-feedback-round/aarambh-30s-feedback-01.mp4`, sha256 `97ba7e3b63d505d7a89afefd481f6ee3af1e2c2695fb0976468944ebd501d66a`. George de Mestral / hook-and-loop. 30.000 s, 900 frames, −15.0 LUFS, full decode OK.
- **New durable rules** (style recipe, five or more pages, magnifier once, mechanism motion, CTA, safe areas, non-repetitive music): `context/11` "FEEDBACK ROUND". **Record:** `context/14`.
- No automation was created and no other episode was started.

## 2026-11-03: round-02 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-03-round-02/aarambh-30s-round02-01.mp4`, sha256 `7a3f6da5aa13e91425570956991a585e4efa5d61167a47989dc6dca0bd53b54f`. Hedy Lamarr & George Antheil, frequency hopping. 30.000 s, 900 frames, −15.0 LUFS, −1.2 dBTP, full decode OK.
- **CTA corrected** to "Download Aarambh to support livelihood tools." (verified against the Play listing); see `11` "CTA correction". **Record:** `context/15`.
- No automation; no other episode started.

## 2026-11-03: hindi-03 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-03-hindi-03/aarambh-30s-hindi03-01.mp4`, sha256 `86011cfc47afec81facec81b1fc356d19535a70ad9089dea0780b4cb74c1a383`. Katherine Johnson hand-checks the Friendship 7 equations (1962). Hindi narration and captions. 30.000 s, 900 frames, −15.0 LUFS, −3.0 dBTP, full decode OK.
- **Verified facts:** NASA biography (Shetterly, 2016) and NASA image records (see `16`). The photos are real NASA photographs of Johnson (1966, Dec 1962, 1971; NASA/Bob Nye), plus the Friendship 7 launch and decal photos.
- **Creative:** the accepted recipe with 7 pages; the magnifier lands on her desk calculating machine.
- **Voice:** Kokoro `hf_alpha`, a Hindi voice. Rules are in `11` (Hindi-language note). **Record:** `context/16`.
- **Verification:** Hindi ASR recognises every sentence in order, with spelling-level mis-hearings. There was no human listening.
- **Final fixes:** two credit overlaps (P4 leader line, P6 check badge) were found on the contact sheets, fixed, and the video re-rendered.
- No automation; no other episode started.

## 2026-11-04: hindi-04 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-04-hindi-04/aarambh-30s-hindi04-01.mp4`, sha256 `3319c7ebf55a0d391e5fcd0852dd5c43d287267a804f67bff7854fd3d32d8feb`. Louis Braille and why six raised dots read by touch (Hindi). 30.000 s, 900 frames, −15.0 LUFS, −3.8 dBTP, full decode OK.
- **Verified facts:** AFB (What Is Braille? and the Louis Braille Online Museum), RNIB, and Braille's own 1829 *Procédé* (Internet Archive scan, "No Copyright").
- **Portrait:** Thiriat engraving, 1887, public domain (Wikimedia Commons).
- **Principle taught:** dot position in the six-dot cell distinguishes symbols (b = 1-2, c = 1-4; 1829 definitions).
- **Creative:** 7 pages; the magnifier lands on the real 1829 sign table; a slate-and-stylus cross-section shows how a dot is raised.
- **Voice:** Kokoro `hf_alpha` (Hindi), speed 1.02. New Hindi TTS rules are in `11`. **Record:** `context/17`.
- **Verification:** Hindi ASR recognises all sentences in order; there was no human listening. Six layout defects were fixed (one full re-render).
- No automation; no other episode started; earlier outputs untouched.
