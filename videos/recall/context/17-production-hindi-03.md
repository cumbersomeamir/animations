# 17 — Hindi 03 (2026-11-03): "गीली स्क्रीन अजीब क्यों चलती है?" (why a wet touchscreen behaves strangely)

- **Output:** `videos/recall/production/30s/2026-11-03-hindi-03/recall-30s-hindi03-01.mp4`
- **Format:** 11, with this round's language correction recorded there. **Style:** 15, unchanged.
- Previous MP4s preserved. No automation.

## Request essentials (user, 2026-11-03; facts about the brief)
- One new 30 s educational video for Recall on why a wet touchscreen behaves strangely: capacitive touch, the electrical changes from fingers and water, and a practical dry-screen takeaway. No quiz.
- Keep the accepted cinematic performer and scene style from the QR episode, with no new character. CTA meaning: "Download Recall for learning any new subject with AI." Verify product facts and make no learning guarantee.
- Keep the accepted renderer, style, assets, caption treatment, voice, pacing and character; update only the requested corrections. 65–75 natural words. Captions at y 340–520 (or 350–470), x 90–990, max 2 lines. Exactly 30.000 s, 1080x1920, 30 fps, H.264 yuv420p / AAC.
- **Latest correction (overrides older language instructions):**
  - All spoken narration and captions must be natural Hindi in Devanagari.
  - Use a genuinely Hindi-capable local voice, and do not feed Hindi to the English-only Kokoro blend.
  - Check pronunciation, words, dates and currency, intelligibility, and speech/caption alignment.
  - Render real Hindi glyphs, with no missing squares.
  - No celebrity voice clone and no paid API. State a concrete blocker if Hindi audio can't be made.

## Topic history check
"touchscreen", "capacitive" and "टच" appear nowhere in this app's context or episodes, so the topic is new and was kept.

## Hindi voice: what was available and what was chosen (verification results)
- **Installed:** kokoro-onnx 0.6.1, which ships espeak-ng with Hindi G2P data (`hi_dict`). The cached voices.npz held only four English voices.
- **Fetched:** Kokoro-82M v1.0's **official Hindi voice packs** (hf_alpha, hf_beta, hm_omega, hm_psi; Apache-2.0) from onnx-community/Kokoro-82M-v1.0-ONNX into `production/30s/2026-11-03-hindi-03/audio/.cache/kokoro-hi/`, with sha256 values recorded in `audio/fetch_models.sh`. The cached English model.onnx is reused (sha256 8fbea51e…34cb), and the shared pilot cache was not modified.
- **Intelligibility check.** I cannot listen, so each candidate was scored with multilingual Whisper **medium** (faster-whisper, language `hi`). Mean CER on the full script:

  | voice | mean CER | speech length |
  |---|---|---|
  | hf_alpha | 0.10 | 29.9 s (too long for 30 s) |
  | hf_beta | 0.16 | |
  | hf_beta 0.7 + hm_omega 0.3 | 0.15 | 27.6 s |
  | hf_alpha 0.7 + hm_psi 0.3 | 0.14 | |

  Most residual "errors" are spelling only: Whisper writes AI, Recall and download in Latin script, and splits क्षेत्र as "क शेत्र".
- **Chosen:** **hf_beta 0.7 + hm_omega 0.3, lang `hi`, speed 0.98** (CTA line 1.05). This keeps the accepted female-led 0.7/0.3 structure, uses only Hindi voices, and fits the 30 s budget.
- **Wording fixes from the check:**
  - "झूठे" → "नकली" (weak aspiration).
  - "छूते ही" → "स्पर्श होते ही" ("छूते" was heard as "चूते").
  - "पारदर्शी" → "बारीक" (source support).
- **Final per-line CER** (`audio/narration/asr.json`, loanwords mapped back to Devanagari): 0.048 / 0.077 / 0.043 / 0.141 / 0.065 / 0.114, mean 0.081. The script has no numbers, dates or currency.

## Final script (74 Hindi words, 26.7 s of speech)
| id | start (s) | Hindi | gloss | dur (s) |
|---|---|---|---|---|
| l01 | 0.20 | गीली उंगलियों से स्क्रीन अजीब हरकतें क्यों करती है? | Why does the screen act strangely with wet fingers? | 3.43 |
| l02 | 3.90 | शीशे के नीचे बारीक इलेक्ट्रोड का जाल विद्युत क्षेत्र बनाता है। | Under the glass, a fine electrode grid creates an electric field. | 4.31 |
| l03 | 8.45 | उंगली बिजली की सुचालक है; स्पर्श होते ही वहां क्षेत्र बदलता है, और फ़ोन जगह पहचान लेता है। | The finger conducts electricity; at a touch the field there changes, and the phone finds the place. | 6.49 |
| l04 | 15.15 | पर पानी भी क्षेत्र बदलता है; बूंदें नकली टच बना सकती हैं, या असली टच छिपा सकती हैं। | But water also changes the field; drops can make fake touches, or hide real ones. | 6.04 |
| l05 | 21.95 | तो पहले स्क्रीन और उंगलियां सुखा लें। | So first dry the screen and your fingers. | 2.40 |
| l06 | 25.80 | कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें। | Download Recall for learning any new subject with AI. | 4.00 |

The CTA is a compact, literal Hindi rendering of the user's English CTA; the brand is written रिकॉल in captions, and the end pill keeps the official "Recall" mark. The 4.0 s CTA line runs in the final 4.2 s, a little over the 3–4 s target because the Hindi sentence is longer.

## Sources (details and quotes in the output folder's `docs/SOURCES.md`)
- **NXP AN11122 (Rev. 3, 2014):** water's high dielectric constant raises capacitance and "a false switch could be triggered".
- **Freescale/NXP AN4781 (2013):** a droplet's capacitance increase "could cause false touches"; a water film can look "as large as produced by a fingertip touch" → "false continuous touches"; a suppressed touch "cannot be detected".
- **US10754438B2 (Parade Technologies):** row/column electrodes; a finger changes the capacitance at the crossing; X/Y location; water can be reported as a touch.
- **Sony help guide and Huawei support:** wet fingertips and droplets can make the screen not react; dry fingertips, wipe droplets, use completely dry hands.
- Britannica, Sony Xperia and Xiaomi returned 403 to automated fetches and are not cited.

## Product-fact check (CTA)
This is the same evidence as context 16, checked the same day. The approved listing says "Turn your study material into lessons, practice and spaced reviews." (developer "Tensorblue AI"). The rendered developer site text does not mention AI. "With AI" is the user's own wording, used as instructed, and is not independently confirmed. There is no learning guarantee.

## Creative decisions (choices, not facts)
- **Same performer, café and lime phone as F01** (code identical). New props: an iced glass with condensation, a lime-striped napkin, screen drops, a real-scale finger and a generic sketch app ("स्केच"), not Recall's UI.
- **Mechanism object:** a giant touchscreen cross-section.
  - Cover glass over a fine grid of electrode rows and columns, with lime field arcs at every crossing.
  - A giant finger shrinks the arcs and lights one signal disc; its row and column glow and a lime ring marks the spot.
  - Water drops add coral fake-touch rings, and a water film blurs the signals until the real ring flickers out.
  - A cloth wipes the glass, and one tap gives one clean ring.
- **Captions:** the accepted pill treatment and position, with **Baloo 2** (OFL, Devanagari + Latin) replacing Fredoka for Hindi text because Fredoka has no Devanagari glyphs. Line height is raised to 1.32 for Devanagari vowel marks, and the size floor is 46 px. The end pill keeps Fredoka "Recall".
- **Audio:** the accepted score engine, retimed. The bed is +4 dB because the Hindi voice packs render hotter, which keeps the accepted voice-over-bed of about +15–18 dB. Foley follows each action.

## Progress
- 2026-11-03: context reread; nothing active; topic new; Hindi tools checked; voices fetched and verified; research done; Hindi narration generated and ASR-checked; scene built from F01/R02 tooling; preview stills reviewed and fixed (glass grab, POV palm occlusion, water look, wipe orientation, cloth timing, CTA pill clearance); mix −14.55 LUFS, −1.6 dBTP, voice +15.4…+17.6 dB over bed.
- 2026-11-03: render run 1 — 24/25 checks (Devanagari caption ink top 331 < 340); captions re-centred at y 413; run 2
  (`WORKERS=3 ./build.sh`, 16 m 36 s): all 25 checks + narration sync + caption sync pass. Committed, pushed and attached.
  No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `1f7e882fc5719bbea9bbeeed6866426783a68bd8c5dfc911ce32f981462127dd` (10,988,644 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full
  FFmpeg decode clean.
- Hindi ASR on the final mix (Whisper medium, `hi`): CER 0.092; narration lines within 0.1 ms of plan; all 11 spoken
  caption groups appear 0.00–0.11 s before their first word (one 0.01 s after) and stay past their last word.
- −14.6 LUFS, −1.6 dBTP, 0 clipped samples; voice +15.4…+17.6 dB over bed.
- Captions all Devanagari (no Latin words), ink x 164–907, y 341–485, ≤ 2 lines; font coverage check true; nothing above
  y 300; labels central; no overlaps.
- Limits: no native-listener review (I cannot listen); CTA occupies the final 4.2 s; "with AI" is the user's wording;
  visuals are illustrative.

## Exact commands
`cd videos/recall/production/30s/2026-11-03-hindi-03 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `audio/fetch_models.sh` fetches/verifies the Hindi voice packs; `TTS=1`
regenerates narration and runs the Hindi ASR check (`audio/asr_words.py`).

## Next
Only on user request: the next episode (Hindi or English as the user specifies) in the Low-poly Everyday Discovery format.
