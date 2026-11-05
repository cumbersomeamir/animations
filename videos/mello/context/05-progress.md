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
