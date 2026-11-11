# Progress

## Verified facts
- App Mello, package `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`.
- Listing (`assets/listing.json`, sha256 matches 03-assets.json) says: "Guided relaxation, calming exercises, wellness challenges and progress tools." Health & Fitness, rated 3+, price 0 INR, author Tensorblue AI.
- Icon (`assets/icon.png`, sha256 matches): lavender ghost-like character on deep navy/indigo with gold sparkles.
- Unknowns kept unknown: no outcome, metric, pricing or endorsement claims; pronunciation of "Mello" not documented.

## Creative decisions (30 s production video)
- Stickman story: thought threads tangle him, a tap on the phone brings out a Mello character (an original vector take on the icon), a calm wave turns the world from paper to night, two breath cycles release the threads, he hops three platforms (one per listing feature), and the end card shows the icon, "Mello" and "Explore on Google Play".
- Palette: paper `#F4EDE1` with ink `#2A2340` for stress; navy `#110D25`→`#2D2459` with lavender `#CDB8F4`, gold `#F7C548` and mint `#B6D7C2` for calm.
- Font Nunito (OFL) from npm `@fontsource/nunito@5.2.7`, converted to TTF and committed.
- Narration: Kokoro-82M (Apache-2.0) through kokoro-onnx 0.4.9, voice `af_heart`, speed 0.9, local CPU.
- Score and SFX are all synthesized in numpy/scipy (`project/src/audio.py`), with no samples.

## Completed (30 s)
- Final: `videos/mello/output/mello-30s.mp4`, sha256 `b167aa03…5fc4ada`, 1080x1920, 30 fps, 900 frames, H.264 + AAC 48 kHz, 30.0 s.
- QA: `videos/mello/output/QA.md` and `output/qa/*`. Full decode clean, −16.0 LUFS, −1.4 dBTP, ASR 48/48 words.
- Commands:
  - `cd videos/mello/project && ./setup.sh` (one time; needs `apt-get install libegl1` on minimal Linux)
  - `./build.sh` (TTS → audio → frames → mux → QA)
  - Optional ASR check: `python src/asr_check.py ../output/mello-30s.mp4 <model_dir>` in a faster-whisper venv.
- Fix loop: camera tightened for the stress scenes; ring moved up; platform C delayed; the character's path lowered; end-card micro-motion added; limiter changed to soft-knee for true peak under −1 dBTP; QA script bugs fixed (last-frame seek, spectrogram scale).

## Unresolved
- Nobody has listened to the audio; it was checked with numbers only.

## Next
- 30 s production video is done. A separate 15 s geomotion style test is tracked in `07-test-progress.md`.

---

# Feedback round 2026-11-02: episode feedback-01 "A thought is not automatically a fact"
New isolated Mello Code chat. Durable rules: `10-format-and-style-rules.md`. Episode brief, research and script: `11-episode-thought-is-not-a-fact.md`.

## Verified facts (this round)
- `assets/listing.json` and `assets/icon.png` hashes match `03-assets.json`. The verified brand accent is lavender #D9BCF5, sampled from the icon. The mint #B6D7C2 comes from an older brief.
- Technique sources:
  - Luoma & Hayes, "Cognitive Defusion" (Wiley chapter; lists "I'm having the thought that" and "Just noticing");
  - NHS Northern Cancer Alliance ACT slides (2023): "I notice that I'm having the thought that…", "We don't argue with the thought";
  - TherapistAid defusion sheet hosted by Homerton NHS FT.
- No statistics or outcome claims are used.

## Creative decisions (this round)
- Style "Thoughts in a Quiet Room": a real 3D miniature (three.js 0.170.0, headless Chromium SwiftShader). Faceless capsule figure, white sweep stage, soft VSM + blob contact shadows, Instrument Serif headlines, lavender only on the thought frame.
- Five shots: S1 0–3.8, S2 3.8–9.7, S3 9.7–18.6, S4 18.6–24.3, S5 24.3–30.
- Script: the user's draft, except "This technique is called cognitive defusion" became "This is a cognitive defusion technique". Defusion is the process; this wording is one technique within it.
- Voice: Kokoro 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98. "defusion" phonemes are forced to /diːˈfjuːʒən/.
- Music: synthesized pad following story beats, no loops. Bed about 12 dB under the voice; master −16 LUFS.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-02-feedback-round/mello-30s-feedback-01.mp4`
  - sha256 `e3865266f62d422b9134aa69fd1c96dcd34a43dbf54b652bedd31ea896476f46`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz stereo, 30.000 s.
- QA (`production/.../qa/QA.md`):
  - 16/16 automated checks passed: full decode clean; −16.1 LUFS; −1.6 dBTP; cuts on plan; 0 safe-zone issues in 300 samples; ASR recall 98.6 %.
  - Contact sheet, transition frames and beat frames inspected.
- Previous MP4 `output/mello-30s.mp4` untouched.
- Commands:
  - `cd videos/mello/project && ./setup.sh` (shared venv + Kokoro model, hash-checked)
  - `cd videos/mello/production/30s/2026-11-02-feedback-round/project && npm ci && ./build.sh`
  - Optional ASR: `ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh`
  - Preview: `node render.mjs --stills 0,8.6,23.1 --out generated/stills --guides`
  - Audit only: `node render.mjs --layout ../qa/layout.json`
- Fix loop: 13 items in `production/.../notes/production-notes.md`. Two full renders: the first failed the layout audit, the second passed.

## Unresolved
- Nobody has listened to the audio yet; it was checked by measurements, spectrogram and ASR only. ASR spells "defusion" as "diffusion" (its vocabulary prefers the common word) even with the corrected phonemes.
- "Mello" is pronounced like "mellow"; the official pronunciation is unknown.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for user review before any new episode, and do not start another one unprompted.

---

# Round 02, 2026-11-03: episode round02-01 "A short sensory grounding break"
Episode record (script, storyboard, citations, adjustments): `12-episode-grounding-break.md`. The established format (`10-format-and-style-rules.md`) is unchanged.

## Verified facts (this round)
- Topic history: breathing (stickman) and cognitive defusion (feedback-01) were covered before. Sensory grounding is new.
- Sources:
  - NHS inform, "Grounding exercises" (5,4,3,2,1 method; "Grounding aims to take your mind off of uncomfortable symptoms or thoughts").
  - Cwm Taf psychological therapies grounding pack (hosted by NHS Forth Valley): "bringing you back to the present moment"; a one-see / one-hear / one-feel exercise.
  - Hull NHS 5-4-3-2-1 leaflet ("a clock ticking").

## Creative decisions (this round)
- Sheet feedback: Satisfied = Yes. The accepted room, performer, lavender/ivory identity, typography, staging, caption treatment, voice, audio chain and the "Take a mindful break with Mello" CTA were kept.
- The source was copied from the feedback-01 project; only episode code is new.
- 3-see / 2-hear / 1-feel is presented as a short grounding break: a shortened sense count of the NHS 5,4,3,2,1 method, not a named protocol.
- Additions:
  - a desk clock (a wall clock would have sat in the caption zone);
  - three navy thought chips that settle and remain;
  - lavender rings and number tabs;
  - a low under-desk feet shot plus a 4 s crane.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-03-round-02/mello-30s-round02-01.mp4`
  - sha256 `8d3c94bd3d8e58e7a6adaf98f6ac250423b86c1d2c15af5b6c1c461f9b67d0d4`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/.../qa/QA.md`).
  - Full decode clean; −16.0 LUFS; −1.6 dBTP.
  - Cuts are the four largest frame changes; every second moves.
  - 0 safe-zone issues in 300 samples; ASR recovered 69/69 words.
- Commands:

```bash
cd videos/mello/production/30s/2026-11-03-round-02/project && npm ci && ./build.sh
```

  Optional ASR: `ASR_PY=<venv with faster-whisper==1.1.1>/bin/python`.
- Three full renders: render 1 had a static S4 hold, render 2 a whip-fast crane, render 3 is final.

## Unresolved
- Nobody has listened to the audio yet; it was checked by measurements, spectrogram and ASR only.
- "Mello" is pronounced like "mellow".
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# Hindi-03, 2026-11-03: episode hindi03-01 "स्पॉटलाइट इफ़ेक्ट" (spotlight effect, Hindi)
Episode record (script, gloss, storyboard, citations, voice choice, adjustments): `13-episode-spotlight-effect-hindi.md`. The established format is unchanged.

## Verified facts (this round)
- The spotlight effect is a new topic for this app.
- Primary source read: Gilovich, Medvec & Savitsky (2000), JPSP 78(2), 211–222.
  - Study 1: 46% estimated vs 23% actual ("exactly twice as high").
  - Mechanism: anchoring on one's own experience with insufficient adjustment.
- Hindi voices available locally:
  - Kokoro v1.0 has hf_alpha, hf_beta, hm_omega and hm_psi, plus espeak-ng Hindi data.
  - Piper hi_IN priyamvada and pratham were also tested.

## Creative decisions (this round)
- The latest user correction applies: all narration and captions in Hindi (Devanagari).
- Voice is Kokoro hf_beta, lang hi, speed 1.05, chosen by Whisper turbo Hindi CER. The English blend is not used.
- Font: Tiro Devanagari Hindi as a fallback after Instrument Serif.
- CTA in Hindi: "मेलो के साथ एक माइंडफुल ब्रेक लीजिए।". Lock-up line: "Google Play पर".
- Scene:
  - four seated room-mates at a long table, as in the study's setup; the back wall moved to z −4.2;
  - imagined: spotlight, lavender tint and halos;
  - actual: heads down on their tasks;
  - Hindi labels for what each is busy with.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-03-hindi-03/mello-30s-hindi03-01.mp4`
  - sha256 `010a3d64c0bd8280b5d784cf2cf0b7894d60318cba5b3b51a54599660fb064d6`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/.../qa/QA.md`).
  - Full decode clean; −16.0 LUFS; −1.9 dBTP.
  - Cuts are local peaks; every second moves.
  - 0 safe-zone issues in 300 samples.
  - Hindi ASR on the final file: CER 0.023, WER 0.06.
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-03-hindi-03/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the Hindi audio by ear; it was checked by ASR round-trip, phoneme review and loudness. A native Hindi speaker should give it a listen.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# Hindi-04, 2026-11-04: episode hindi04-01 "अगर… तो…" (implementation intentions, Hindi)
Episode record (script, gloss, storyboard, citations, voice, adjustments): `14-episode-implementation-intentions-hindi.md`. The established format is unchanged.

## Verified facts (this round)
- Implementation intentions are a new topic for this app.
- Primary sources:
  - Gollwitzer (1999), full text via KOPS: "Whenever situation x arises, I will initiate the goal-directed response y!"; control is delegated to anticipated situational cues.
  - Gollwitzer & Sheeran (2006) meta-analysis abstract: 94 tests, medium-to-large effect (d = .65).
- Voice: the same Kokoro hf_beta Hindi voice verified in hindi03-01.

## Creative decisions (this round)
- Psychology hack, not guided meditation. The vague "मैं स्क्रॉल करना बंद करूँगी" becomes "रात के खाने के बाद, मैं फ़ोन दस मिनट के लिए शेल्फ़ पर रख दूँगी".
- 73-word Hindi script; one qualification ("हालाँकि हर बार नहीं"); no numbers spoken; accepted Hindi CTA.
- Room at the accepted depth. New props: plate and fork, phone with a scrolling feed and buzz, birch side shelf.
- In-scene text: intention card, if-then plan card, "संकेत" / "काम" rings, "10 मिनट" timer ring. All face the camera.
- Five shots: S1 over the right shoulder, S2 rear-left, S3 rear-right pan, S4 high right three-quarter, S5 accepted wide.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-04-hindi-04/mello-30s-hindi04-01.mp4`
  - sha256 `ccd34a3ffa97157753bfa314da4e11b28d63146530bfd6bd00c7249cc7a3709c`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-04-hindi-04/qa/QA.md`).
  - Full decode clean; −16.0 LUFS; −2.2 dBTP; voice 12.6 dB over the bed.
  - The four cuts are the only detected cuts; every second moves.
  - 0 safe-zone issues in 300 samples; no head or in-scene text behind caption text.
  - Hindi ASR on the final file: CER 0.033, WER 0.095.
- One full render (about 37 min). Defects were fixed earlier on stills and the layout audit.
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-04-hindi-04/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the Hindi audio by ear. It was checked by ASR round-trip and loudness measurements. A native Hindi speaker should give it a listen.
- In S4 the head is out of frame, so the buzz glance reads through the phone light and the pen pause.
- The plan card's bottom-right border sits behind the head from about 9.7 s. The text is unaffected.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# Feedback-05, 2026-11-05: episode feedback05-01 "प्लानिंग फ़ैलेसी" (planning fallacy, Hindi)
Episode record (script, gloss, storyboard, citations, performance snapshot, adjustments): `15-episode-planning-fallacy-hindi.md`. The established format is unchanged.

## Verified facts (this round)
- The planning fallacy is a new topic for this app.
- Sources read:
  - Buehler (2019, SPSP *Character & Context*), full text: definition; "events usually don't unfold exactly as people imagine"; the outside view bases predictions on prior experiences.
  - Roy, Christenfeld & McKenzie (2005, *Psychological Bulletin*), PubMed abstract: memories of past durations are underestimates.
- Not read in full: Kahneman & Tversky (1979) is cited through Buehler. The only open copy of Buehler, Griffin & Ross (1994) failed TLS via the proxy (not bypassed), so no study numbers are used.
- User-supplied performance snapshot: 13/13 reels show plays, 414 plays, 2 likes (2/13 visible), median 10. Not causal; treated as a topic and opening test only.

## Creative decisions (this round)
- Psychology hack, not meditation or motivation. Hook: "“बस दस मिनट का काम है…” — और एक घंटा निकल गया।"
- Fix shown: use the actual time of a similar past task (time log, "पिछली बार: 55 मिनट") instead of a perfect imagined plan.
- One concrete action: book a full hour in the calendar, then write down the actual time.
- 74 Hindi words; no guarantee language; accepted Hindi CTA.
- Visual hook from frame 0: a flat desk clock races through the hour past a "10 मिनट" note.
- Scene props: thought card (सोचा vs असल with phone/tea/search interruptions acted in the room), notebook time log, calendar card.
- Music is quieter than in earlier episodes: `BED_GAIN` 0.5, bed 12.9 dB under the voice.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-05-feedback-05/mello-30s-feedback05-01.mp4`
  - sha256 `856948f5a6dccae982dc33d78ef40049f0b8df1665ee31eb06e46f4d979fb1cd`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-05-feedback-05/qa/QA.md`).
  - Full decode clean; −16.1 LUFS; −1.6 dBTP.
  - The four cuts are the detected cuts; every second moves.
  - 0 safe-zone issues in 300 samples, with the stricter audit (oriented boxes, head and clock-dial checks, no shot exemption).
  - Hindi ASR on the final file: CER 0.012, WER 0.027 (six of seven lines exact).
- Two full renders (about 19 min each). Render 2 fixed a small overlap between the S3 note and a log row.
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-05-feedback-05/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the Hindi audio by ear. It was checked by ASR round-trip and loudness measurements. A native Hindi speaker should give it a listen.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# English-06, 2026-11-06: episode english06-01 "the beautiful mess effect" (owning a small mistake, English)
Episode record (topic swap, script, sources, storyboard, adjustments): `16-episode-beautiful-mess-effect.md`. The established format is unchanged.

## Verified facts (this round)
- The suggested spotlight effect already exists in this app (hindi03-01). Per the batch rule, a fresh subject in the same genre was chosen: the beautiful mess effect. It is new for this app.
- Sources read:
  - Bruk, Scholl & Bless (2018, JPSP 115(2)), PubMed abstract: seven studies; taking responsibility for a mistake is one example of showing vulnerability.
  - Bruk, Scholl & Bless (2022, PSPB 48(7)), open-access full text. Study 3 = confessing a mistake to one's boss: others' admissions rated more positively than one's own, 4.92 vs 4.65 on 1–7 (modest).
- Voice: Mello's accepted English Kokoro blend (0.7 af_bella + 0.3 am_puck, en-us, 0.98), synthesized fresh. No Hindi audio was reused.

## Creative decisions (this round)
- English narration and captions only, 74 words.
- Hook: "You hit send to the whole team... then you spot the mistake." (the wrong file to 12 people).
- One study sentence and the name. Action: "own it in one plain line, and send the fix". Ends on the question "If a colleague owned this mistake, what would I think of them?". No anxiety claims.
- Scene:
  - the stylised mail laptop;
  - the accepted navy thought card turning into schematic harsher↔kinder sliders;
  - a second desk with one colleague (the hindi-03 room-mate figure) who receives the correction while busy.
- Music: `BED_GAIN` 0.34, 13.0 dB under the sparser English voice.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-06-english-06/mello-30s-english06-01.mp4`
  - sha256 `95a6f89abde3649f38945ce0a58d631dc855fd486a1a544d14664884e99e299d`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-06-english-06/qa/QA.md`).
  - Full decode clean; −16.0 LUFS; −1.5 dBTP.
  - The four cuts are the detected cuts; every second moves.
  - 0 safe-zone issues in 300 samples. The audit checks each crucial text object on its own and uses projected-sphere boxes for both heads.
  - English ASR on the final file: CER 0.000, WER 0.000 (all 8 lines exact).
- One full render (about 26 min).
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-06-english-06/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the audio by ear. It was checked by ASR round-trip and loudness measurements.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# English-07, 2026-11-06: episode english07-01 "temptation bundling" (English)
Episode record (topic swap, script, sources, storyboard, adjustments): `17-episode-temptation-bundling.md`. The established format is unchanged.

## Verified facts (this round)
- The suggested implementation intentions already exist in this app (hindi04-01). Per the batch rule, a fresh subject in the same genre was chosen: temptation bundling. It is new for this app.
- Sources read:
  - Milkman, Minson & Volpp (2014, *Management Science* 60(2)), PubMed abstract: gym-only audiobooks initially gave 51% more gym visits, encouragement only gave 29%, and the effects declined over time.
  - Kirgios et al. (2020, OBHDP 161), abstract: N = 6,792; audiobooks plus encouragement raised the weekly-workout likelihood by 10–14%; the effect of encouragement alone was modest.
- Voice: Mello's accepted English Kokoro blend, synthesized fresh. No Hindi audio was reused.

## Creative decisions (this round)
- English narration and captions only, 74 words.
- Hook: "New rule: this podcast only plays on walks." One study sentence with "though the boost faded". Action: pick one treat, then the rule "it only plays when your walking shoes are on", and "Lace up."
- Scene, in the accepted room and style:
  - a phone with a padlock on Play;
  - the bundle card turning into a schematic chart;
  - the pick screen;
  - the performer standing, stepping into the walking shoes, the status flipping to "now playing" with headphones on, lacing up, and walking in the wide CTA shot.
- Music: `BED_GAIN` 0.48, 13.3 dB under the voice (re-measured for this narration).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-06-english-07/mello-30s-english07-01.mp4`
  - sha256 `e697e31e41f97619bc8a730397148be5ee08c9f43767c98c98e8586e50703dee`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-06-english-07/qa/QA.md`).
  - Full decode clean; −16.1 LUFS; −1.7 dBTP.
  - The detected cuts are exactly the planned cuts; the largest non-cut change is 3.2.
  - 0 safe-zone issues in 300 samples.
  - English ASR on the final file: CER 0.000, WER 0.000.
- Two full renders. Render 2 fixed a 2-frame phone jump before the S3→S4 cut. Render 1 outputs were not committed.
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-06-english-07/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the audio by ear. It was checked by ASR round-trip and loudness measurements.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

---

# English-08, 2026-11-07: episode english08-01 "the illusion of explanatory depth" (English)
Episode record (script, sources, storyboard, adjustments): `18-episode-illusion-of-explanatory-depth.md`. The established format is unchanged.

## Verified facts (this round)
- The illusion of explanatory depth is new for this app (history checked), so the suggested topic was kept.
- Sources read:
  - Rozenblit & Keil (2002, *Cognitive Science* 26(5)), PubMed abstract.
  - Meyers et al. (2023, *Judgment and Decision Making* 18:e24), open-access full text: the standard zipper procedure (rate, try to explain, re-rate) gives lower ratings after explaining; explanation exposes knowledge gaps; people neglect hidden parts.
  - Sundback, US 1,219,881 (1917): the slider's Y-shaped channel.
- Voice: Mello's accepted English Kokoro blend, synthesized fresh. No Hindi audio was reused.

## Creative decisions (this round)
- English narration and captions only, 76 words.
- Hook: "Quick: how well do you understand a zipper?" over a big brass zipper zipping itself shut from frame 0.
- Before/after confidence on a 1–7 card with the stalled step-by-step attempt. The trick: "explain it out loud". The payoff: "where you get stuck is what to learn next", shown as the hidden Y-shaped channel in an X-ray slider.
- Music: `BED_GAIN` 0.45, 13.1 dB under the voice. Each tooth click is generated from the scene's slider curve.

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-07-english-08/mello-30s-english08-01.mp4`
  - sha256 `e9beb123d8173e4a450e572d2fad000b30e50a2a069aed7a32ec687e4ada30a3`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-07-english-08/qa/QA.md`).
  - Full decode clean; −16.0 LUFS; −1.6 dBTP.
  - The detected cuts are exactly the planned cuts; every second moves.
  - 0 safe-zone issues in 300 samples, including the new zipper-behind-caption check.
  - English ASR on the final file: CER 0.000, WER 0.000.
- Two full renders. Render 2 made the S3 speech bubble readable; render 1 outputs were not committed.
- A container restart came after render 2 had been muxed; only the audit/ASR/QA steps were re-run.
- Command (needs a faster-whisper venv for `ASR_PY`):

```bash
cd videos/mello/production/30s/2026-11-07-english-08/project && npm ci && ASR_PY=<faster-whisper venv>/bin/python ./build.sh
```

## Unresolved
- Nobody has listened to the audio by ear. It was checked by ASR round-trip and loudness measurements.
- The local Desktop/video-review folder is not reachable from this cloud session. The MP4 is delivered as a chat attachment and on the branch.

## Next
- This round's single episode is done. Wait for sheet feedback before any new episode.

# English-09, 2026-11-08: episode english09-01 "the peak-end rule" (English)
Episode record (script, sources, storyboard, adjustments): `19-episode-peak-end-rule.md`. The established format is unchanged.

## Verified facts (this round)
- The peak-end rule is new for this app (history checked), so the suggested topic was kept.
- Sources read (PubMed abstracts): Redelmeier & Kahneman 1996 (PMID 8857625), Fredrickson & Kahneman 1993 (PMID 8355141), Redelmeier, Katz & Kahneman 2003 (PMID 12855328). The 1993 cold-water paper was not used (abstract withheld).

## Creative decisions (this round)
- English narration and captions only, 73 words. Hook: "A long queue, yet you remember a great day out?" over a card already drawing at frame 0.
- Practical tip: end the workday by finishing one small, meaningful task; close the loop, then the laptop. `BED_GAIN` 0.45 (13.7 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-08-english-09/mello-30s-english09-01.mp4`
  - sha256 `422778a388074bc2042d59466b2a5426079ce5e1eba9a34e60e19c86c6541156`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-08-english-09/qa/QA.md`): full decode clean; −16.0 LUFS; cuts on plan; 0 safe-zone issues in 300 samples; English ASR CER 0.000 / WER 0.000.

## Unresolved
- Nobody has listened by ear (ASR-only). The Desktop/video-review folder is not reachable from this cloud session; the MP4 is delivered as a chat attachment and on the branch.

## Next
- Queued, in order: english-10 (2026-11-09, habit formation time and one missed day; implementation intentions already covered), english-11 (2026-11-09, environmental friction), then the 2026-11-11 episode (unfinished tasks / parking one).

# English-10, 2026-11-09: episode english10-01 "how long a habit takes, and one missed day" (English)
Episode record: `20-episode-habit-formation-time.md`. The established format (sections 1–7 of `10-format-and-style-rules.md`) is unchanged.

## Verified facts (this round)
- Suggested topic (implementation intentions) was already covered (hindi04-01), so a fresh topic in the same genre was chosen.
- Source read: Lally, van Jaarsveld, Potts & Wardle (2010), *EJSP* 40(6):998–1009, abstract via Crossref (18–254 days to 95% of the automaticity asymptote; one missed opportunity did not materially affect habit formation).

## Creative decisions (this round)
- English narration and captions only, 73 words. Hook: "Twenty-one days to build a habit? Not quite." over a calendar crossing itself off.
- The brief's evening cue (work bag down → walk) is the demonstration. `BED_GAIN` 0.40 (13.0 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-09-english-10/mello-30s-english10-01.mp4`
  - sha256 `2b170188e1cb98343fc0f595157443bdea2c22b197acc8f3902cb7a8be1643a5`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-09-english-10/qa/QA.md`): full decode clean; −16.0 LUFS; cuts on plan; 0 safe-zone issues in 300 samples; English ASR CER 0.000 / WER 0.000.

## Unresolved
- Nobody has listened by ear (ASR-only). The Desktop/video-review folder is not reachable from this cloud session.

## Next
- english-11 (environmental friction), then the 2026-11-11 episode (english-12, unfinished tasks).
