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

## 2026-11-05: feedback-05 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-05-feedback-05/aarambh-30s-feedback05-01.mp4`, sha256 `6b8e384b9d30e5f072fd199b203a6bf26296d103b378650d6b8dab6004ebd7a4`. Hedy Lamarr & George Antheil, frequency hopping (Hindi). 30.000 s, 900 frames, −15.0 LUFS, −4.1 dBTP, full decode OK.
- **Verified facts:** NIHF inductee pages (Lamarr, Antheil) and the US 2,292,387 drawing sheet.
- **Portraits:** *Screenland* Oct 1942 cover (LOC copy, "not in copyright") and Berenice Abbott 1927 (PD-US-expired).
- **Not claimed:** Wi-Fi or wartime deployment.
- **Why the topic repeats:** a deliberate Hindi re-test of round-02's topic (see `18`).
- **Voice:** Kokoro `hf_alpha` (Hindi), speed 1.05.
- **Verification:** Hindi ASR recognises all sentences in order; there was no human listening. Three layout fixes (one full re-render).
- No automation; no other episode started; earlier renders untouched.

## 2026-11-06: english-06 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-06-english-06/aarambh-30s-english06-01.mp4`, sha256 `72f3928d01b1cfd605fc2960422635c6f5abeb3eb51e46cb00e158474c03ee42`. Mary Anderson and the windshield wiper (English). 30.000 s, 900 frames, −15.1 LUFS, −1.9 dBTP, full decode OK.
- **Verified facts:** NIHF inductee page and the full text and drawing of U.S. Patent 743,801 (USPTO PDF).
- **Portrait:** c. 1910, PD-old on Commons; it is the same photo as NIHF's image.
- **Voice:** the Meshline blend (English).
- **Verification:** ASR matches the script; the CTA was cross-checked with the small model. There was no human listening. One pre-render fix (P2 driver and wipe).
- No automation; no other episode started; earlier renders untouched.

## 2026-11-06: english-07 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-06-english-07/aarambh-30s-english07-01.mp4`, sha256 `3eabf720bfdc3fa01913368adc6933044d2f718c99223a1754aa4525fec5362e`. Garrett Morgan's all-stop traffic signal improvement (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** the full text and drawings of U.S. Patent 1,475,024 (USPTO PDF) and NIHF. The video presents his patented improvement, not the invention of the traffic light.
- **Photos:** a portrait (PD-old) and a 1916 newspaper rescue photo (PD-US).
- **Voice:** the Meshline blend.
- **Verification:** small-model ASR matches the script except the app name; there was no human listening. One pre-render fix (hook near miss); no defects on the final sheets.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-07: english-08 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-07-english-08/aarambh-30s-english08-01.mp4`, sha256 `7ae642a952e47114de2e4ebb5256a4a5b1ee0a7696e1f2cc9a0f5d5523f71aec`. Samuel F. B. Morse (English). 30.000 s, 900 frames, −15.1 LUFS, −1.4 dBTP, full decode OK.
- **Subject change:** the suggested Lamarr & Antheil topic was already covered twice (04, 07), so a fresh subject was chosen with the same lesson (combining fields) and the same communication theme.
- **Verified facts:** NIHF and the full text and drawings of U.S. Patent 1,647 (USPTO PDF).
- **Images:** an LOC Brady portrait and Brady's 1857 photo with the recorder.
- **Verification:** both ASR models match the script except the app name; there was no human listening. Pre-render layout fixes only; no defects on the final sheets.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-08: english-09 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-08-english-09/aarambh-30s-english09-01.mp4`, sha256 `eaf06c952e37f760a356850b3b07af044db2d6bcb5e3e57599fc993cabfb06fc`. Percy Spencer and microwave cooking (English). 30.000 s, 900 frames, −15.0 LUFS, −1.7 dBTP, full decode OK.
- **Verified facts:** the full text and drawing of U.S. Patent 2,495,429 (USPTO PDF): wave guide, conveyor, 10 cm waves, and the egg at 2 vs 36 kW·s. Also U.S. 2,408,235, NIHF, the Smithsonian NMAH RL-1 record and the Linda Hall Library ("by his own account"). The candy-bar story is attributed, and its varying snacks are shown as retellings.
- **Portrait:** no openly licensed one was found, so a typeset name plate is used. The real images are the two patents' drawings and the CC0 Tappan RL-1 photo.
- **Voice:** the Meshline blend.
- **Verification:** both ASR models match the script except the app name and a "change"/"changed" liaison; there was no human listening. After the first full render, two concrete fixes were made (the P5 credit overflow and NMAH wording, and the P4 column citation); no defects on the final sheets.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-09: english-10 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-09-english-10/aarambh-30s-english10-01.mp4`, sha256 `f001542cafcba4b5244ab060dac91fc0d369483581f4097ca1021754e7ca8eaf`. Josephine Cochran's 1886 dish-washing machine (English). 30.000 s, 900 frames, −15.1 LUFS, −1.5 dBTP, full decode OK.
- **Subject change:** the suggested Mary Anderson topic was already episode 08 (english-06), so a fresh subject was chosen with the same everyday-friction lesson.
- **Verified facts:** the full text and drawings of U.S. Patent 355,139 (USPTO PDF): hand lever 15/handle 17, force-pumps with jet-holes, slowly rotated crate, soap-suds then hot rinse, dishes "dry from their own heat", and the plate/glass/knife racks. Also the USPTO "I'll do it myself" story: chipped heirloom china, water pressure rather than scrubbers, and the 1893 award.
- **Images:** a public-domain portrait (Commons; the same photo is on the USPTO story page) and four patent crops.
- **Voice:** the Meshline blend.
- **Verification:** both ASR models match the script except the app name; there was no human listening. Pre-render layout fixes, plus one post-render label nudge (video only, audio md5 unchanged); no defects on the final sheets.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-09: english-11 #01 (COMPLETE)
- **Output:** `videos/aarambh/production/30s/2026-11-09-english-11/aarambh-30s-english11-01.mp4`, sha256 `00156882edde88febff20428b144be783d3152faee907f982017d47ad3e9353f`. Gideon Sundback and the zipper slider (English). 30.000 s, 900 frames, −15.0 LUFS, −2.0 dBTP, full decode OK.
- **Subject change:** the suggested Garrett Morgan topic was already episode 09 (english-07), so a fresh subject was chosen with the requested lesson (design the transition, not just the endpoints) and careful credit (he improved Judson's fastener).
- **Verified facts:** the full text and drawings of U.S. Patent 1,219,881 (USPTO PDF): identical cup-shaped members that alternate and nest, and the sliding cam device with Y-shaped/diverging channels and a pointed cap. Also NIHF: dates, the Judson credit and the 2006 induction.
- **Images:** a PD-old Commons portrait (likeness checked against NIHF's photo) and five patent crops.
- **Voice:** the Meshline blend.
- **Verification:** small-model ASR matches the script except the name spelling and homophones; there was no human listening. Pre-render fixes only; no defects on the final sheets.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-11: english-12 #01 (COMPLETE; first episode under the 2026-11-11 rules, context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-11-english-12/aarambh-30s-english12-01.mp4`, sha256 `2f84eccba3ab1c3c2f48b0a14a4b1c43da027a23da1214cdc0e58ab5c108ed53`, plus the thumbnail `aarambh-30s-english12-01-thumbnail.png` ("HOLD A NANOSECOND"). Grace Hopper's wire nanoseconds (English). 30.000 s, 900 frames, −15.0 LUFS, −2.0 dBTP, full decode OK.
- **Subject change:** Lamarr & Antheil was proposed a third time (04, 07), so a fresh topic was chosen with the same story criteria.
- **Verified facts:** the Smithsonian NMAH record (the wires, about 30 cm, late 1960s, purpose, pepper picosecond), the exact speed of light (NIST) and Earth's radius (NASA). Derived numbers are computed and labelled ≈; the visuals are illustrations.
- **Style:** the new rules applied: one idea per scene, large brief labels, no source footers, a spotlit desk with depth and no grid, six motivated transitions, captions within x 100–900.
- **Verification:** both ASR models match the script except the app name; there was no human listening. One post-render card-overflow fix (video only).
- No automation; no other episode started; earlier renders untouched.

## 2026-11-13: english-13 #01 (COMPLETE; second episode under context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-13-english-13/aarambh-30s-english13-01.mp4`, sha256 `108d9fd89ce5f48b373e9b2b5f0d863cd3ab193ad1865cf5bb7aa4bf81fc7b61`, plus the thumbnail `aarambh-30s-english13-01-thumbnail.png` ("CUT THE CABLE"). Elisha Otis and the elevator safety brake (English). 30.000 s, 900 frames, −14.9 LUFS, −1.5 dBTP, full decode OK.
- **Subject change:** Mary Anderson was already episode 08, so a fresh topic was chosen with the same three-page structure and the invention-before-demand lesson.
- **Verified facts:** NIHF (the 1854 demonstration, he didn't invent the elevator, his dates) and the U.S. 31,128 text (pawls, spring, hook-toothed racks, rope tension). The NARA drawing is shown on screen.
- **Verification:** ASR matches except the first name (one of two models), the brake/break homophone and the app name; there was no human listening. One post-render, video-only fix.
- No automation; no other episode started; earlier renders untouched.

## 2026-11-14: english-14 #01 (COMPLETE; third episode under context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-14-english-14/aarambh-30s-english14-01.mp4`, sha256 `d589c52011444ee698a433bb5c6f67b56efbb2c8c5cbca93e575846273ae9b9e`, plus the thumbnail `aarambh-30s-english14-01-thumbnail.png` ("SHE CARRIED THE PLANS"). Emily Warren Roebling and the Brooklyn Bridge (English). 30.000 s, 900 frames, −14.9 LUFS, −1.5 dBTP, full decode OK.
- **Topic:** fresh (not covered). The mismatched topic line "bridge collapse" was not used.
- **Verified facts:** Linda Hall Library (the bends from the caissons, 11 years working from home, dictation and relay to the assistant engineers, learning the engineering, treated like the Chief Engineer).
- **Images:** Brooklyn Museum portraits (PD-Art), the RPI 1867 caisson drawing and the LOC 1883 print.
- **Verification:** small ASR matches the script word for word except the name spelling and the app name; there was no human listening. One post-render caption fix (video only).
- No automation; no other episode started; earlier renders untouched.

## 2026-11-15: english-15 #01 (COMPLETE; first under the first-frame addendum to context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-15-english-15/aarambh-30s-english15-01.mp4`, sha256 `86d5532a47693f9b085d26c0912653be425f364867108f2c3134034776764a29`, plus the thumbnail `aarambh-30s-english15-01-thumbnail.png` (= frame 0, "STOPPED AT THE DOOR"). Frances Oldham Kelsey and thalidomide (English). 30.000 s, 900 frames, −14.8 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** FDA history page (dozens of countries, inadequate evidence, constant pressure, reliable evidence, the link found about a year later, never marketed in the U.S.), NLM (1960, first month at FDA) and FDA's Kevadon photo caption. No sole-saviour or "saved" statistic.
- **First frame:** the real portrait plus the real bottle plus 4 words at t = 0; audio from 0.09 s; no fade.
- **Verification:** both ASR models match the script except the app name and homophones; there was no human listening. Two video-only fixes (label width, caption split).
- No automation; no other episode started; earlier outputs untouched.

## 2026-11-15: english-16 #01 (COMPLETE; second under the first-frame addendum to context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-15-english-16/aarambh-30s-english16-01.mp4`, sha256 `7198a45442f00b446e957304fadf4dff0e4c2e0886b7f91849d4e7213e0d388f`, plus the thumbnail `aarambh-30s-english16-01-thumbnail.png` (= frame 0, "NOT THE WOUNDS"). Florence Nightingale and the polar-area chart (English). 30.000 s, 900 frames, −14.9 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** her monthly figures (HistData `Nightingale`: 81% of 17,982 deaths from disease; 11,157 vs 3,319 disease deaths before/after; Jan 1855 2,761 vs Jan 1856 42), the diagram's own legend (blue = preventable zymotic disease), the 1857 Panmure report ("trapping and flushing sewers and privies") and Friendly & Andrews 2021 (commission formed around April 1855; area-true wedges).
- **Correlation vs certainty:** narrated as "Strong evidence, not certainty: one chart can't rule out other changes." No percentage-drop or sole-cause claim.
- **Verification:** both ASR models match the script except the app name and tiny.en's "1 ,855" tokenisation; there was no human listening. One pre-render crop fix; no post-render re-render.
- No automation; no other episode started; earlier outputs untouched.

## 2026-11-15: english-17 #01 (COMPLETE; third under the first-frame addendum to context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-15-english-17/aarambh-30s-english17-01.mp4`, sha256 `b2b0f2bd7d411d9a4f3400aa2e4e7f07ac84c266d20a16e60e3ba10818a8c2b0`, plus the thumbnail `aarambh-30s-english17-01-thumbnail.png` (= frame 0, "A THREAD THAT SAVED LIVES"). Stephanie Kwolek and Kevlar (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** SHI (1965, the thin, cloudy liquid; rod-like molecules lined up in parallel → very high strength and stiffness; five times stronger than steel), Lemelson-MIT (fluid and cloudy; she insisted on spinning it), NIHF (five times stronger than the same weight of steel; material of choice for bullet-resistant vests), U.S. Patent 3,671,542 (shown) and NIJ (no such thing as bulletproof armour; armour rated to threat levels; more than 3,000/3,100 officers saved by body armour).
- **Strength vs bulletproof:** narrated as "strong isn't bulletproof; ask which threats a vest is rated for". No firefighting claim, despite the topic line.
- **Verification:** both ASR models match the script except the surname (a close variant), the app name and small slips; there was no human listening. One post-render re-render: a sequential swap and nested-fade fixes.
- No automation; no other episode started; earlier outputs, batch 16 included, untouched.

## 2026-11-15: english-18 #01 (COMPLETE; fourth under the first-frame addendum to context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-15-english-18/aarambh-30s-english18-01.mp4`, sha256 `90166fbac1f41adbe3720210c343f1275c7508c393265f0eaf83d888eafe5586`, plus the thumbnail `aarambh-30s-english18-01-thumbnail.png` (= frame 0, "ONE HANDLE. MANY LIVES."). John Snow and the Broad Street pump (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** Snow's own 1855 text: over 500 fatal attacks in ten days; nearly all of the 83 deaths he traced near the pump; brewery (70+ workers, none severely ill, malt liquor and their own well); workhouse (5 of 535, its own well); the handle removed on 8 Sept; attacks had diminished before. Also his Table 1 (via HistData) and the London Museum on miasma.
- **Myth vs evidence:** the narration and the chart show the handle came off after attacks were already falling. No claim that the handle alone ended the outbreak.
- **Verification:** both ASR models match the script except the app name (and tiny.en's "asked"); there was no human listening. One full render, no post-render re-render.
- No automation; no other episode started; earlier outputs, batch 17 included, untouched.

## 2026-11-17: english-19 #01 (COMPLETE; fifth under the first-frame addendum to context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-17-english-19/aarambh-30s-english19-01.mp4`, sha256 `b75dd5278810de64499fb4179985f17de5e608304dd7ff99d6e5024e10a24d7e`, plus the thumbnail `aarambh-30s-english19-01-thumbnail.png` (= frame 0, "A MONSTER IN THE CLIFF?"). Mary Anning and her first ichthyosaur (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** NHM (a fossil-collecting "sidekick" from five or six; Joseph's skull in 1811; Mary's months-long dig of the five-metre skeleton in 1812; the town thought it a monster, scientists a crocodile; named Ichthyosaurus by 1820, an extinct marine reptile; Duria Antiquior 1830, the first picture of prehistoric life based on fossils; papers often didn't credit her) and UCMP.
- **Credit:** the skull is credited to Joseph and the body to Mary, on screen and in the narration. No "first ichthyosaur ever" or "nobody believed" claim; Cuvier's plesiosaur doubt was not voiced.
- **Verification:** both ASR models match the script word for word except the app name and spelling; there was no human listening. Two video-only re-renders for the frame-0 layout.
- No automation; no other episode started; earlier outputs, batch 18 included, untouched.

## 2026-11-17: english-20 #01 (COMPLETE; first under the 2026-11-17 feedback addendum in context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-17-english-20/aarambh-30s-english20-01.mp4`, sha256 `4725b3937de045c986a7fefc0a589447021a0087d9883f78c0613e284c3f4d4a`, plus the thumbnail `aarambh-30s-english20-01-thumbnail.png` (= frame 0, "HER METHOD. HIS NAME."). Alice Ball and chaulmoogra oil (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Verified facts:** Parascandola (NLM PDF: nausea, painful poorly absorbed injections, the esters "thin fluid oils … readily absorbed", Dean's uncredited 1920–22 papers, "Dean's derivatives", her death at 24, sulfones replacing chaulmoogra), Hollmann 1922 ("Miss Ball solved the problem…", "Ball's Method"; real page shown), and University of Hawaiʻi pages.
- **Feedback applied:** one moving idea per scene, at most one short label, chemistry shown by motion, a bold frame-0 thumbnail.
- **Verification:** both ASR models match the script word for word except the app name; there was no human listening. One video-only re-render for frame-0 spacing.
- No automation; no other episode started; earlier outputs, batch 19 included, untouched.

## 2026-11-18: english-21 #01 (COMPLETE; second under the 2026-11-17 feedback addendum in context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-18-english-21/aarambh-30s-english21-01.mp4`, sha256 `e132744578a44a691b074beee86056e1ab6c1af4cc37b55e7dad911e3be78439`, plus the thumbnail `aarambh-30s-english21-01-thumbnail.png` (= frame 0, "THE HANDS THEY FORGOT"). Vivien Thomas and the blue-baby shunt (English). 30.000 s, 900 frames, −15.0 LUFS, −1.7 dBTP, full decode OK.
- **Verified facts:** PBS (his role; testing in animals; advising over Blalock's shoulder), ACC (about 200 dogs; the stepstool; classed as a janitor; the 1976 doctorate), JAMA 2008 (the 1945 Blalock–Taussig paper "did not acknowledge" him), J Med Biogr 2017 (a laboratory technician without a college education) and StatPearls (the subclavian-to-pulmonary shunt improves lung blood flow and reduces cyanosis).
- **Brief correction:** Thomas is not called a surgeon.
- **Portrait:** the only portrait found carries a weak public-domain basis (Commons "PD-because"); this is flagged in 35, with a recommendation to confirm before release.
- **Verification:** both ASR models match the script word for word except homophone spellings and the app name; there was no human listening. Two video-only re-renders (counter fade; caption start after an ASR mis-stamp).
- No automation; no other episode started; earlier outputs, batch 20 included, untouched.

## 2026-11-19: english-22 #01 (COMPLETE; third under the 2026-11-17 feedback addendum in context/25)
- **Output:** `videos/aarambh/production/30s/2026-11-19-english-22/aarambh-30s-english22-01.mp4`, sha256 `0a8731d84956ce6b8f34604c875123f0bf5bcf1ca1639bf38826ea83b6485db7`, plus the thumbnail `aarambh-30s-english22-01-thumbnail.png` (= frame 0, "SHE READ THEIR SECRETS"). Elizebeth Friedman, codebreaker (English). 30.000 s, 900 frames, −15.0 LUFS, −1.5 dBTP, full decode OK.
- **Topic:** the brief's Hedy Lamarr subject was already covered (04 English, 07 Hindi), so a fresh person was chosen with the same lesson; reasons in 36.
- **Verified facts:** Marshall Foundation (simple encryptions; mono-alphabetic ciphers; she and her aide solved more than 12,000 coded messages, 1928–1930; her team broke the Enigma), PBS (spies' Enigma radio traffic from 1942; three Enigma machines broken), Smithsonian Magazine and National Geographic (the smugglers' coded radio messages), Cambridge (Enigma's substitution changes on every key press) and Oxford (frequency analysis cracks substitution ciphers). NSA, USCG and Smithsonian institutional pages were blocked (403).
- **Verification:** whisper small matches the script word for word except the TTS spelling and the app name; there was no human listening. One video-only re-render (empty page during the push into Enigma; early counter).
- No automation; no other episode started; earlier outputs, batch 21 included, untouched.
