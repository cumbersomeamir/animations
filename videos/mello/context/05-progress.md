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

# English-11, 2026-11-09: episode english11-01 "environmental friction" (English)
Episode record: `21-episode-environmental-friction.md`. The established format (sections 1–7 of `10-format-and-style-rules.md`) is unchanged; a bed and nightstand were added to the room.

## Verified facts (this round)
- Environmental friction is new for this app. Sources read (PubMed abstracts):
  - Maas et al. 2012 (PMID 21678172): snacks at 70 or 140 cm vs 20 cm meant lower probability and amount of intake; distance changed perceived effort, not salience.
  - Background, not spoken: Hollands et al. 2019 Cochrane review (PMID 31482606), low-certainty evidence that food placed farther away is eaten less.

## Creative decisions (this round)
- English only, 71 words. Hook: "Your phone is within reach all night. Your book isn't."
- Demonstration: phone to a charger across the room, book into the phone's old spot. `BED_GAIN` 0.40 (13.5 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-09-english-11/mello-30s-english11-01.mp4`
  - sha256 `5aae62b321037a83dbcedd67b48bfdbfdfd03081a7d8a3c3aab2e88a41d99808`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed on render 2 (`production/30s/2026-11-09-english-11/qa/QA.md`).
- Render 1 failed `moving_every_second` (static last 3 s); fixed with a camera drift under the lock-up and fully re-rendered.

## Unresolved
- Nobody has listened by ear (ASR-only). The Desktop/video-review folder is not reachable from this cloud session.

## Next
- english-12 (2026-11-11, unfinished tasks / park one, new rules): final render running.

# English-12, 2026-11-11: episode english12-01 "an unfinished task follows you into bed; park it" (English)
Episode record: `22-episode-unfinished-task-park-it.md`. First episode under the 2026-11-11 approved feedback rules, persisted in `10-format-and-style-rules.md` section 8.

## Verified facts (this round)
- Not covered before. Closest earlier episodes: english09 (finish one task at day's end), hindi04 (implementation intentions for acting).
- Sources (PubMed abstracts):
  - Masicampo & Baumeister 2011 (PMID 21688924): unfinished goals caused intrusive thoughts during unrelated reading; specific plans eliminated the effects.
  - Scullin et al. 2018 (PMID 29058942): a 5-minute specific to-do list before bed meant faster sleep onset than a completed-activities list; n = 57.
- Palette sampled from the current Play icon (identical to `assets/icon.png`) and seven current screenshots: #EDE8FE, #191632, #633BFE, #E6D2FC, #5B45A3, #060513, #FEC357.

## Creative decisions (this round)
- English only, 70 words. Structure: hook → escalation → proof → payoff → CTA.
- The open-loop metaphor, the dark in-app card, a note card for the written plan, and the lamp dimming at the resolution.
- Captions inside x 100–900, key words in violet.
- An original soothing evening bed (filtered air swells) under the pad; the whole bed sits 13.1 dB under the voice.
- Thumbnail "STILL IN YOUR HEAD?".

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-11-english-12/mello-30s-english12-01.mp4`
  - sha256 `4922cce1f6db0ff9deed422eda335d6abe610ebf85881ccf182a0ddd794cff5c`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english12-01-thumbnail.png` (1080x1920).
- QA: 16/16 checks passed (`production/30s/2026-11-11-english-12/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.5 dBTP;
  - cuts on plan;
  - 0 safe-zone issues in 300 samples with the new x 100–900 caption zone;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- All queued episodes (english-09, -10, -11, -12) are delivered. Wait for the next request or feedback.

# English-13, 2026-11-13: episode english13-01 "why trying not to think of something can bring it back" (English)
Episode record: `23-episode-ironic-thought-suppression.md`. The 2026-11-11 rules (`10-format-and-style-rules.md` section 8) and the latest feedback (store palette, soothing sound) are retained.

## Verified facts (this round)
- Not covered before. Closest is feedback-01 (cognitive defusion); this episode covers suppression backfiring and focused distraction.
- Sources (PubMed abstracts):
  - Wegner et al. 1987 (PMID 3612492): white bear, bell rings, rebound; a specific distracter reduced later preoccupation.
  - Wegner 1994 (PMID 8121959): the monitoring process.
  - Abramowitz et al. 2001 (PMID 11434226): small to moderate rebound.
  - Wang et al. 2020 (PMID 32286932): rebound consistently detected.

## Creative decisions (this round)
- English only, 66 words, fresh narration.
- A pink elephant pushed off the desk keeps popping back; a "checking" beam; the rebound; noticed and shrunk to the corner; "ONE JOB / Draft the intro".
- Thumbnail "DON'T PICTURE THIS.". `BED_GAIN` 0.38 (13.3 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-13-english-13/mello-30s-english13-01.mp4`
  - sha256 `c5b4a1294d2ed78c1111c3ecc8aeb5cadfd24475a88552763e609f47f39431cd`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english13-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-13-english-13/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.4 dBTP;
  - cuts on plan;
  - 0 safe-zone issues in 300 samples (captions x 100–900);
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-14, 2026-11-14: episode english14-01 "why a friend's problem is easier to untangle than your own" (English)
Episode record: `24-episode-solomons-paradox.md`. The 2026-11-11 rules and the latest feedback (store palette, soothing sound) are retained.

## Verified facts (this round)
- The proposed topic (Zeigarnik effect + "write the next action and when") overlaps english12-01, so a different same-genre topic was chosen: Solomon's paradox / self-distancing.
- Sources (PubMed abstracts):
  - Grossmann & Kross 2014 (PMID 24916084): three experiments, N = 693; wiser reasoning about others' problems; self-distancing eliminated the asymmetry.
  - Kross et al. 2014 (PMID 24467424): own name / non-first-person self-talk; better rated performance and less distress.

## Creative decisions (this round)
- English only, 72 words, fresh narration.
- Two knots (the friend's loosens, yours stays tangled); a Solomon's-paradox card with a wise-reasoning gap that closes as the camera steps back; a self-talk bubble "I" → "Alex"; the note "Alex, what would you tell a friend?" loosens his knot.
- Thumbnail "EASIER FOR FRIENDS?". `BED_GAIN` 0.42 (13.4 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-14-english-14/mello-30s-english14-01.mp4`
  - sha256 `079d0bd63228fb6617ce26a7c4350f02ffd0cda9d8e49e92c9dae7cd4675299f`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english14-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-14-english-14/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.5 dBTP;
  - cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-15, 2026-11-15: episode english15-01 "why tomorrow-you feels like a different person" (English)
Episode record: `25-episode-future-self.md`. New durable rule: `10-format-and-style-rules.md` section 9 (first frame). The 2026-11-11 rules and the latest feedback are retained.

## Verified facts (this round)
- Not covered before (checked context 11–24). Sources (PubMed abstracts):
  - Pronin et al. 2008 (PMID 18156588): decisions for future selves resemble decisions for others; the experiments include a disgusting drink.
  - Peters & Büchel 2010 (PMID 20399735): episodic cues gave more future-minded choices.
  - Hershfield et al. 2011 (PMID 24634544): age-progressed future selves gave more later-reward choices.
  - Rung & Madden 2018 (PMID 30148386): most methods reduced discounting, with effects varying.

## Creative decisions (this round)
- English only, 70 words, hook audio at 0.15 s.
- Frame 0 = the thumbnail composition: two versions of the character across TODAY | TOMORROW, "Who is tomorrow-you?".
- The card shows future-you = a stranger. A balance shows now vs later. Tomorrow's page fills in. Shoes by the door.
- `BED_GAIN` 0.50 (13.2 dB under the voice).

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-15-english-15/mello-30s-english15-01.mp4`
  - sha256 `3f732e1ae600849119494d8f761f4abdd91b303d025cc1e885a3933ba7133b13`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english15-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-15-english-15/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.7 dBTP;
  - cuts on plan;
  - 0 safe-zone issues in 300 samples (both heads checked);
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-16, 2026-11-15: episode english16-01 "why feel small on purpose" (awe walks, English)
Episode record: `26-episode-awe-walks.md`. Durable rules: `10-format-and-style-rules.md` sections 8 and 9. The latest feedback (store palette, soothing bed, psychology insight with a demonstration) is retained.

## Verified facts (this round)
- The proposed topic ("why a tiny unfinished task keeps interrupting your evening") is already covered by english12-01 (`22`), so a fresh same-genre topic was chosen: awe walks. Not covered in context 11–25.
- Sources (PubMed abstracts):
  - Sturm et al. 2022 (PMID 32955293): 60 older adults, weekly 15-min walks for 8 weeks, randomized to awe vs control walks. Awe walkers showed a smaller self and bigger smiles in their selfies, and greater decreases in daily distress. Anxiety, depression and life satisfaction did not change.
  - Piff et al. 2015 (PMID 25984788): background for the "small self" and the grove; not spoken.

## Creative decisions (this round)
- English only, 68 words, hook audio at 0.15 s.
- Frame 0 = the thumbnail composition: a tiny figure on a dusk hill under a big moon, "Why feel small / on purpose?".
- Outdoors with the same rig (room hidden, sky dome, stars, grove, a far skyline band). A study card and a photo card hang in the sky. The payoff is a walk that stops under the tallest tree.
- Captions are white with gold key words on the dark sky. `BED_GAIN` 0.39 (13.0 dB under the voice).
- Thumbnail "WHY FEEL SMALL?".

## Completed (this round)
- Render 1 passed 16/16, but ASR heard "It's called awe" as "It's cold awe" on the mix. The line was reworded to "That feeling is awe: what you feel near something vast, like a night sky." and the video was fully re-rendered. Render 1 is not in the repo.
- Final (render 2): `videos/mello/production/30s/2026-11-15-english-16/mello-30s-english16-01.mp4`
  - sha256 `97bd8f9999c1a412dae3cb1948ce61c27cce99cb327f99cb7fdc3fb6575c0b39`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english16-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-15-english-16/qa/QA.md`):
  - full decode clean; −16.1 LUFS, −1.3 dBTP;
  - cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.
- From 2.25 s to about 3.0 s the gold "awe" sits on the moon's halo (legible; the colon is faint).

## Next
- Wait for the next request or feedback.

# English-17, 2026-11-15: episode english17-01 "waiting for the perfect words" (undervaluing gratitude, English)
Episode record: `27-episode-thank-you-notes.md`. Durable rules: `10-format-and-style-rules.md` sections 8 and 9. The latest feedback (store palette, soothing bed, psychology insight with a demonstration) is retained.

## Verified facts (this round)
- The proposed topic ("why a tiny first step can beat waiting for motivation": implementation intentions, shoes by the door) is already covered: hindi04-01 (`14`), and shoes by the door in english15 (`25`). A fresh same-genre topic was chosen that keeps the "stop waiting to feel ready" spirit: people undervalue a thank-you. Not covered in context 11–26.
- Source: Kumar & Epley 2018, *Psychological Science* 29(9), doi 10.1177/0956797618772506, read in full (PDF copy, DOI matched; PubMed and SAGE refused automated access, so no PMID).
  - Experiments 1, 2 and 4: recipients felt more positive and less awkward than writers predicted.
  - Experiment 4: wording rated 9.28 vs a predicted 6.99 out of 10.
  - Willingness to write is correlated with these expectations.

## Creative decisions (this round)
- English only, 70 words, hook audio at 0.15 s.
- Frame 0 = the thumbnail composition: the writer at his desk beside a heap of crumpled drafts taller than his head, pen over a blank card, "Waiting for the / perfect words?".
- Seven shots: the drafts, the toss, the handover with a "?" guess, the feelings card (guess vs actual), the wording card (7 → 9.3), a flat-lay of him writing "Thank you," and the handover with the lock-up.
- `BED_GAIN` 0.37 (12.9 dB under the voice). Thumbnail "PERFECT WORDS?".

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01.mp4`
  - sha256 `01155602871dd0f31dc91680b3334c5a3ac59a5ead1784d2984717725c0bfb44`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english17-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-15-english-17/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.4 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.
- About 2 frames of a faint grey card fade-in before the 9.05 s cut. In the flat-lay the card is turned to the camera (staging).

## Next
- Wait for the next request or feedback.

# English-18, 2026-11-17 (batch18 dated 15 November): episode english18-01 "can they tell you're nervous?" (illusion of transparency, English)
Episode record: `28-episode-illusion-of-transparency.md`. Durable rules: `10-format-and-style-rules.md` sections 8 and 9. The latest feedback (store palette, soothing bed, psychology insight with a demonstration) is retained.

## Verified facts (this round)
- The requested topic (the illusion of transparency in public speaking) is new. hindi03-01's spotlight effect (`13`) is a sibling about appearance, kept separate.
- Sources:
  - Gilovich, Savitsky & Medvec 1998 (PMID 9731312, PubMed abstract): the definition, and anchoring on one's own experience.
  - MacInnis, Mackinnon & MacIntyre 2010 (*CRSP* 15(4), full text): class speeches. Speakers felt 24.0, expected the audience to rate 23.3, the audience rated 17.3 (6–42 scale).
  - Savitsky & Gilovich 2003: not readable here (403, archive host blocked, dead link). Its finding that telling speakers about the illusion helped is used only as described by MacInnis et al.

## Creative decisions (this round)
- English only, 70 words, hook audio at 0.15 s. "Rated their nerves" → "scored their own nerves" (an ASR fix).
- Frame 0 = the thumbnail composition: the speaker at a lectern beside a giant thought bubble with a pounding heart, "Can they tell / you're nervous?".
- The card draws the three averages to scale with no numbers. A camera swing from behind him to the audience's side fades the bubble out. In the payoff the heart slows and shrinks.
- A muffled heartbeat follows the on-screen heart. `BED_GAIN` 0.50 (13.1 dB under the voice). Thumbnail "CAN THEY TELL?".

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-15-english-18/mello-30s-english18-01.mp4`
  - sha256 `3555be7c9d2651c58d399efbfb3f8a6f84ee3565e5c126b6e5ce9b761a1340db`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english18-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-15-english-18/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.6 dBTP;
  - five cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.
- The 2003 paper's full text was not accessible.

## Next
- Wait for the next request or feedback.

# English-19, 2026-11-17: episode english19-01 "why do Mondays feel new?" (the fresh start effect, English)
Episode record: `29-episode-fresh-start-effect.md`. Durable rules: `10-format-and-style-rules.md` sections 8 and 9. The latest feedback (store palette, soothing bed, psychology insight with a demonstration) is retained.

## Verified facts (this round)
- The proposed topic (if-then plans, implementation intentions) is already covered: hindi04-01 (`14`), swapped in english10 and english17, and shoes by the door in english15. A fresh same-genre topic was chosen: the fresh start effect.
- Source: Dai, Milkman & Riis 2015 (*Psychological Science*, PMID 26546079, PMC full text):
  - Study 1A: "first day of spring" vs "third Thursday": 25.61% vs 7.23% chose March 20 for a goal reminder.
  - Study 1B: "first day of summer break" vs "administrative day": 28.57% vs 4.35%.
  - Study 4: the effect works in part through distance from the "imperfect past self".
- The effect's name comes from Dai et al. 2014 (*Management Science*), with the citation verified in the 2015 reference list.

## Creative decisions (this round)
- English only, 86 words, hook audio at 0.15 s.
- Frame 0 = the thumbnail composition: SUNDAY's page with slip-ups swinging open like a door onto MONDAY 1, "Why do Mondays / feel new?".
- The card shows real figures (7% vs 26%). The calendar swings to SUMMER BREAK, DAY 1, the old page drifts away, and a gold DAY 1 tag goes on a nearby Monday.
- `BED_GAIN` 0.44 (12.9 dB under the voice). Thumbnail "WHY MONDAYS FEEL NEW?".

## Completed (this round)
- Render 1 failed only `cuts_on_plan` (8.8 at the card-to-card cut). S4 moved to a low angle; render 2 is final.
- Final: `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01.mp4`
  - sha256 `a075e8c6c7e8025ec10a290c01bd6a35bf7a5bb57b6c732e73213b17e6a0b533`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- Thumbnail: `…/mello-30s-english19-01-thumbnail.png`.
- QA: 16/16 checks passed (`production/30s/2026-11-17-english-19/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.5 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-20, 2026-11-17/18: episode english20-01 "does naming a feeling help?" (affect labeling, English)
Episode record: `30-episode-affect-labeling.md`. Live feedback for this app ("No, match the colors of the published app, soothing audio also add") is applied explicitly: the store-sampled palette (`22`) and an original soothing bed about 13 dB under the voice.

## Verified facts (this round)
- Topic as requested. It is distinct from feedback-01's cognitive defusion of a thought (`11`): this is putting a feeling into words.
- Sources (PubMed abstracts):
  - Lieberman et al. 2011 (*Emotion*, PMID 21534661): labeling lowered self-reported distress vs passive watching, similar to reappraisal and distraction. People predicted it would increase distress.
  - Lieberman et al. 2007 (*Psych Sci*, PMID 17576282): labeling diminished the amygdala response.
  - Kircanski et al. 2012: mixed results; background only.

## Creative decisions (this round)
- English only, 70 words. Frame 0: a spiky storm over him and "We need to talk."; caption "Does naming / a feeling help?".
- A ghost storm for "worse?"; two direction-only cards; a brain whose amygdala glow dims; the "I feel anxious" tag; the storm softens but stays.
- `BED_GAIN` 0.37 (13.1 dB). Thumbnail "DOES NAMING HELP?".

## Completed (this round)
- Render 1 failed 2 checks (the message screen in the right rail in S2; the card fade-out softening the S4→S5 cut). Render 2 passed but hid part of the payoff tag. Render 3 is final.
- Final: `videos/mello/production/30s/2026-11-17-english-20/mello-30s-english20-01.mp4`
  - sha256 `edd65fef19664df77080972df35ab73cb4c2ca762b06e7cb8ba488481ec9e3fc`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed (`production/30s/2026-11-17-english-20/qa/QA.md`):
  - full decode clean; −16.1 LUFS, −1.5 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through. The video-review folder is not reachable from this cloud session.

# English-21, 2026-11-18: episode english21-01 "keep good news to yourself?" (capitalization, English)
Episode record: `31-episode-sharing-good-news.md`. The same live feedback is applied (store palette + soothing bed).

## Verified facts (this round)
- The proposed topic (an unfinished task interrupting the evening + a next-action plan; Zeigarnik vs plan evidence) is english12-01 (`22`), and was swapped out twice since. A genuinely different evening insight was chosen: sharing good news (capitalization).
- Sources (PubMed abstracts):
  - Gable et al. 2004 (*JPSP*, PMID 15301629): sharing was associated with more daily positive affect beyond the event itself; active-constructive responses enhanced this.
  - Reis et al. 2010 (*JPSP*, PMID 20658846): in 4 experiments, sharing increased the perceived value of good news, especially with enthusiastic responses.

## Creative decisions (this round)
- English only, 66 words. Frame 0: him holding a small gold orb by the closed laptop while his friend looks at her phone; caption "Keep good news / to yourself?".
- The orb grows when shared, most with her enthusiasm. A diary card (kept vs shared, direction only). The roles swap: he responds with real interest.
- `BED_GAIN` 0.44 (13.1 dB). Thumbnail "KEEP GOOD NEWS QUIET?".

## Completed (this round)
- Final: `videos/mello/production/30s/2026-11-18-english-21/mello-30s-english21-01.mp4`
  - sha256 `9ca227ded90f1a900665a0c31c407131c420591a945179d930e1576bd27ea682`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 checks passed on the first full render (`production/30s/2026-11-18-english-21/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.6 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues;
  - English ASR CER 0.000 / WER 0.000.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-22, 2026-11-19: episode english22-01 "too hard on yourself?" (self-compassion after a mistake, English)
Episode record: `32-episode-self-compassion.md`. The same live feedback is applied (store palette + soothing bed). New durable caption rule: `10-format-and-style-rules.md` section 10 (captions inside x 100–900, y 280–460).

## Verified facts (this round)
- The proposed topic (talk to yourself as if advising a friend; third-person self-talk, "What should Alex do next?") is english14-01 (`24`): self-distancing, own-name self-talk, "Alex, what would you tell a friend?". A genuinely different subject was chosen: self-compassion after a mistake.
- Source (PubMed abstract; full text closed access): Breines & Chen 2012 (*PSPB*, PMID 22645164). Compared with a self-esteem control and a no-intervention or positive-distraction control, self-compassion led to:
  - more motivation to make amends (Exp 2);
  - more time studying after an initial failure (Exp 3).

## Creative decisions (this round)
- English only, 69 words.
- **New character:** lilac figure, indigo bun, gold scarf.
- **Frame 0:** she stands small inside her own huge outlined thought, with racing scribbles around her; caption "Too hard / on yourself?". The brief's words "BORROW YOUR OWN ADVICE" were dropped because they name the swapped-out technique; the brief's image is kept.
- **Story:** the snippy message → a dark card (amends, then study time; direction only) → the thought shrinks and softens → she types and sends a short apology.
- **Audio and thumbnail:** `BED_GAIN` 0.36 (13.0 dB). Thumbnail "TOO HARD ON / YOURSELF?".

## Completed (this round)
- Final (render 2): `videos/mello/production/30s/2026-11-19-english-22/mello-30s-english22-01.mp4`
  - sha256 `7b01d3bfbda895f08dbb53f67dc5e81fd16af8cfac4f3ee818b2f29920a6a8b3`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 17/17 checks passed (`production/30s/2026-11-19-english-22/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.0 dBTP;
  - six cuts on plan; no non-cut jump;
  - 0 safe-zone issues;
  - English ASR CER 0.000 / WER 0.000.
- Render 1 passed the automated checks but strobed at 3.1–3.6 s (a scribble phase jump) and had framing faults. All were fixed; `qa.py` gained `no_jump_between_cuts`.
- Commands: `production/30s/2026-11-19-english-22/notes/production-notes.md`.

## Unresolved
- No listen-through (ASR and measurements only). The hook was transcribed with a full stop; whether it sounds like a question needs a human ear. The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-23, 2026-11-21: episode english23-01 "stop pushing the idea" (creative incubation, English)
Episode record: `33-episode-incubation.md`. The same live feedback is applied (store palette + soothing bed). Captions: `10-format-and-style-rules.md` section 10.

## Verified facts (this round)
- Prior topic records 11–32 were all read. Incubation and mind-wandering were not covered.
  - Batch22's actual replacement subject was self-compassion after a mistake (`32`).
  - This episode differs in core question, setting (puzzle desk) and mechanism (incubation), so it was made as requested.
- Sources:
  - Baird et al. 2012 (*Psych Sci*, PMID 22941876; abstract): an undemanding task during incubation beat a demanding task, rest or no break on previously encountered Unusual Uses problems.
  - Sio & Ormerod 2009 meta-analysis (PMID 19210055): a positive incubation effect overall; high-demand fillers gave smaller effects.
  - Limits: Murray et al. 2021 (N = 443, no evidence); Teng & Lien 2022 (PMC9053813: the 0-back group did not beat control); McDaniel et al. 2025 (no task differences; mind wandering predicted improvement on the same prompt).

## Creative decisions (this round)
- English only, 74 words.
- **Character:** the approved performer (english20/21 tones).
- **Frame 0:** he forces violet and gold puzzle pieces together, tab against tab, while the wall shows the third shape they make once one is turned; caption "Stop pushing / the idea.".
- **Story:** pushing → set down → study card (try 1 / in between / try 2; then the easy-task bar pulls ahead, direction only) → ball toss with a wandering dotted trail that greys with a "?" for the limit → note on the piece, water a plant → back, turn B, click.
- **Audio and thumbnail:** Dm9 → Fmaj7 → Am7 → Cadd9; `BED_GAIN` 0.375 (13.0 dB). Thumbnail "STOP PUSHING / THE IDEA".

## Completed (this round)
- Final (render 2): `videos/mello/production/30s/2026-11-21-english-23/mello-30s-english23-01.mp4`
  - sha256 `41b85ca99502eca2e22f8cfd4842cb873d671a909535feeaf4606af29b0960b4`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 17/17 checks passed (`production/30s/2026-11-21-english-23/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.5 dBTP;
  - six cuts on plan; no non-cut jump;
  - 0 safe-zone issues;
  - English ASR CER 0.000 / WER 0.000.
- Render 1 passed all checks; its watering beat was made readable in render 2.
- Commands: `production/30s/2026-11-21-english-23/notes/production-notes.md`.

## Unresolved
- No listen-through (ASR and measurements only). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.

# English-24, 2026-11-23 → 25: episode english24-01 "still rereading your notes?" (the testing effect, English)
Episode record: `34-episode-testing-effect.md`. The same live feedback is applied (store palette + soothing bed). Captions: `10-format-and-style-rules.md` section 10.

## Verified facts (this round)
- The proposed topic (affect labelling: naming "frustrated") is english20-01 (`30`), so an unrelated subject in the same genre was chosen: the testing effect / retrieval practice.
  - It is not covered in 11–33. It differs from batch23 (incubation, `33`) in question, setting (a reading corner, no desk) and mechanism.
- Sources:
  - Roediger & Karpicke 2006 (*Psych Sci*, PMID 16507066; abstract): restudy was better at 5 min; testing was substantially better at 2 days and 1 week; restudy raised confidence.
  - Karpicke & Roediger 2008 (*Science*); Rowland 2014 meta-analysis; Dunlosky et al. 2013 (practice testing high utility, rereading low).
  - Limit: Sigayret et al. 2026 (PMC12894256), no testing effect online.

## Creative decisions (this round)
- English only, 68 words.
- **Character:** the approved performer.
- **Frame 0:** he rereads an open notebook while lilac lines lift off and fade; caption "Still rereading / your notes?".
- **Story:** the pages glow, then the lines drift away → study cards (reread vs tried recalling; 5-minute vs 1-week bars, direction only) → lilac strips fade while the gold ones last → close the notes, write on a gold card, peek, fill the missed line.
- **Audio and thumbnail:** Fmaj7 → Dm7 → Am7 → Cadd9; `BED_GAIN` 0.375 (13.1 dB). Thumbnail "STILL REREADING / YOUR NOTES?".

## Completed (this round)
- Resumed on 2026-11-25 from the checkpointed sources (commits c2e24f5, da3a5a3). The recall card's entrance was fixed (audit 2 → 0 issues).
- Final: `videos/mello/production/30s/2026-11-23-english-24/mello-30s-english24-01.mp4`
  - sha256 `15d5a3f957408b4d0e531557716e533a129c4da0523035bbd0f7ef9f0eba8d77`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 17/17 on the first full render (`production/30s/2026-11-23-english-24/qa/QA.md`):
  - full decode clean; −16.1 LUFS, −1.4 dBTP;
  - six cuts on plan; no non-cut jump;
  - 0 safe-zone issues;
  - English ASR CER 0.000 / WER 0.000.
- Commands: `production/30s/2026-11-23-english-24/notes/production-notes.md`.

## Unresolved
- No listen-through (ASR and measurements only). The hook may sound like a statement rather than a question (ASR punctuation). The video-review folder is not reachable from this cloud session.

## Next
- Wait for the next request or feedback.
