# 16 — Hindi-03 30 s #01: Katherine Johnson and the hand-check behind John Glenn's orbital flight

- **Output:** `videos/aarambh/production/30s/2026-11-03-hindi-03/aarambh-30s-hindi03-01.mp4`
- **sha256:** `86011cfc47afec81facec81b1fc356d19535a70ad9089dea0780b4cb74c1a383`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Recipe:** the accepted Archive Light Table recipe (`11-production-format.md`). Source: `production/30s/2026-11-03-hindi-03/src/render.mjs`, started from `production/30s/2026-11-03-round-02/src/render.mjs`. Only the language and fonts changed.
- **Topic history:** new. Earlier episodes covered the lockstitch pilot, Curie, Lovelace, de Mestral, and Lamarr & Antheil.

## Brief and the specific corrections applied
1. **Language (overrides older instructions):** all spoken narration and all captions are natural Hindi in Devanagari. No English narration is used anywhere.
2. **Hindi-capable voice:** the previous English-only Kokoro blend (af_bella + am_puck, en-us) was **not** used for Hindi. The voice is Kokoro-82M's Hindi-trained voice `hf_alpha`, with `lang="hi"` (espeak-ng Hindi G2P). The rule is in `11` (Hindi-language note).
3. **Real photographs:** real, recognisable NASA photographs of Katherine Johnson appear on three pages (1966, 1962, 1971), each credited on the print as "फ़ोटो: NASA/बॉब नाय, <date>".
4. **No exaggeration:** the video says only that she ran the same equations by hand at Glenn's request, and that the flight succeeded after the check. It does **not** claim that she found an error, "saved" the mission, or that the computers were wrong.
5. **CTA:** the Hindi rendering of the verified CTA, "आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें।" (Download Aarambh, support livelihood tools). The card adds the listing line in Hindi. Aarambh is never called a biography or learning app.
6. **Style unchanged:** 7 pages, 2 page turns, 3 slide swaps (including the CTA), 1 hard cut, and the magnifier used once (on the real calculating machine in the 1962 photo). There is no bobbing on static pages, and the captions are in the upper safe area.

## Final script (Hindi; 60 words; 26.4 s of speech)
Captions show the `text`. The voice reads the `tts` form only where a written form would be misread: the year is spelled out, and a comma is added for phrasing.

| id | start (s) | caption / spoken text | English gloss (for the record only, not in the video) |
|---|---|---|---|
| S1 | 0.30 | 1962 में, जॉन ग्लेन की उड़ान के अंक आईबीएम कंप्यूटरों ने निकाले। (TTS: उन्नीस सौ बासठ में, जॉन ग्लेन की उड़ान के अंक, आईबीएम कंप्यूटरों ने निकाले।) | In 1962, IBM computers worked out the numbers for John Glenn's flight. |
| S2 | 6.35 | पर उस दौर के कंप्यूटर कभी-कभी अटक जाते थे। | But computers of that era sometimes stalled. |
| S3 | 10.66 | ग्लेन के कहने पर, नासा की गणितज्ञ कैथरीन जॉनसन ने वही समीकरण हाथ से हल किए। | At Glenn's request, NASA mathematician Katherine Johnson solved the same equations by hand. |
| S4 | 17.50 | जाँच के बाद उड़ान सफल रही। | After the check, the flight was a success. |
| S5 | 20.36 | सीख: ज़रूरी गणना की अलग से जाँच कराइए। | Lesson: get important calculations checked independently. |
| S6 | 25.43 | आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें। | Download Aarambh, support livelihood tools. |

**Trims made to fit 30 s:** the narration ran 34.4 s, then 28.55 s, and now 26.43 s. To get there I removed "कक्षीय" from S1 (it stays on screen on page 1) and "दोबारा", and shortened the lesson and the CTA.

## Voice, pronunciation and fonts
- **Voice:** Kokoro-82M ONNX v1.0 (`kokoro-onnx`, model and voices `model-files-v1.0`, Apache-2.0), Hindi voice `hf_alpha`, speed 0.98, `lang="hi"`. It is a stock synthetic voice; no voice was cloned or imitated. Script: `audio/tts_kokoro_hi.py`.
- **Voice choice by Hindi ASR character error rate** (faster-whisper small, language hi, same script):

| voice | CER |
|---|---|
| hf_alpha (chosen) | 0.280 |
| hf_beta | 0.289 |
| 0.7 hf_alpha + 0.3 hm_omega | 0.305 |

- **Rejected for licence reasons:**
  - Piper `hi_IN` voices pratham and priyamvada are CC BY-NC-SA 4.0 (non-commercial).
  - Piper `hi_IN` voice rohan uses the IITM IndicTTS licence.
- **Pronunciation check (espeak-ng Hindi phonemes used by the voice):**
  - उन्नीस सौ बासठ → ʊnnˈiːs sˈɔː bˈaːsəʈʰ
  - सफल → sʌpʰəl
  - थे → tʰeː
  - गणना → ɡʌɳnaː
  - औज़ारों → ɔːzaːɾõ
  - समीकरण → səmˈiːkəɾəɳ
  - आरंभ डाउनलोड करें → aːɾˈʌmbʰ ɖaːʊnlˈoːɖ kˈʌɾẽː
  - Approximations: गणितज्ञ → ɡəɳɪtˈʌɡj, and जॉनसन → ɟˈɔnəsən (a light extra schwa).
- **Fonts:** Noto Sans Devanagari 700/800 and Noto Serif Devanagari 800 via `@fontsource` 5.3.0 (SIL OFL). Their Latin subsets are registered as fallback families so that digits, punctuation and "NASA" render (this fixed the earlier tofu). Mono digits use JetBrains Mono, and the wordmark uses Fraunces. No missing-glyph boxes appear in any inspected frame.

## Sources and claim map (accessed 2026-11-03)
- **[B] NASA, "Katherine Johnson Biography"** (Langley; Margot Lee Shetterly, 2016): https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/
- **[K] NASA KSC-62PC-0011**, 20 Feb 1962: "Launch of Friendship 7, the first manned orbital space flight. Astronaut John Glenn aboard…" Photo credit: NASA. https://images.nasa.gov/details/KSC-62PC-0011
- **[J] NASA S64-14854**: "Astronaut John H. Glenn Jr. and technicians inspect a decal ready for application to the side of his Mercury spacecraft prior to launch on Feb. 20, 1962." https://images.nasa.gov/details/s64-14854
- **[M] NASA NHQ202409180013** (NASA/Joel Kowsky, 2024-09-18), caption: "The Congressional Gold Medal in recognition of Katherine Johnson in recognition of her service to the United States as a Mathematician…" https://images.nasa.gov/details/NHQ202409180013 (caption text only; the photo is not used).
- **[G] Google Play listing:** https://play.google.com/store/apps/details?id=in.aarambh.app ("Fund verified livelihood tools and follow their impact.")
- **[R] NASA Images and Media Usage Guidelines:** https://www.nasa.gov/nasa-brand-center/images-and-media/ NASA content is generally not subject to U.S. copyright; NASA should be acknowledged as the source; use must not imply endorsement.

| claim (on screen or spoken) | source | wording relied on |
|---|---|---|
| Friendship 7, 20 February 1962, John Glenn, orbital flight | K | "Launch of Friendship 7, the first manned orbital space flight. Astronaut John Glenn aboard" (1962-02-20) |
| IBM computers worked out the flight's numbers | B | "linking tracking stations around the world to IBM computers in Washington, Cape Canaveral in Florida, and Bermuda"; "The computers had been programmed with the orbital equations that would control the trajectory of the capsule in Glenn's Friendship 7 mission" |
| Computers of that era sometimes stalled | B | "the electronic calculating machines, which were prone to hiccups and blackouts" (also quoted on the P2 footer) |
| At Glenn's request, Johnson solved the same equations by hand | B | "As a part of the preflight checklist, Glenn asked engineers to 'get the girl'—Johnson—to "run the same numbers through the same equations that had been programmed into the computer, but by hand, on her desktop mechanical calculating machine" |
| "मेज़ की गणना-मशीन" label (desk calculating machine) | B | "desktop mechanical calculating machine"; the machine is visible in photo LRC-1962-B701_P-09381 |
| NASA mathematician ("नासा की गणितज्ञ"); at Langley from 1953 | B; M | B: "Hired by NACA: June 1953"; "Katherine began work at Langley in the summer of 1953" (the biography does not use the word "mathematician"). M: Congressional Gold Medal "in recognition of her service to the United States as a Mathematician" |
| After the check the flight succeeded | B; K | B: "'If she says they're good,' … 'then I'm ready to go.' Glenn's flight was a success" (the quote is not used in the video) |
| Lesson: get important calculations checked independently | interpretive, drawn from B (an independent hand run of the same equations before the flight) | — |
| CTA | G | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:** that she found or fixed an error, that the computers were wrong, that she "saved" the mission, any quote attributed to her or to Glenn, or any number from the real trajectory.

## Photographs (all NASA; credited on the print and in README/publishing caption)
| page | NASA ID | NASA title / date | photographer | on-screen credit |
|---|---|---|---|---|
| P1 | KSC-62PC-0011 | Launch of Friendship 7, 1962-02-20 | NASA | फ़ोटो: NASA |
| P3 | LRC-1966-B701_P-06717 | Katherine Johnson At Her Desk at NASA Langley Research Center, 1966-09-08 | NASA, Bob Nye | फ़ोटो: NASA/बॉब नाय, 1966 |
| P4 | LRC-1962-B701_P-09381 | Katherine G. Johnson at Work, 1962-12-07 | NASA, Bob Nye | फ़ोटो: NASA/बॉब नाय, दिसंबर 1962 |
| P5 | S64-14854 | Glenn inspects the Friendship 7 decal, Feb 1962 | NASA | फ़ोटो: NASA · ग्लेन और "फ़्रेंडशिप 7", फ़रवरी 1962 |
| P6 | LRC-1971-B701_P-03033 | Portrait Katherine G. Johnson, 1971-03-18 | NASA, Bob Nye | फ़ोटो: NASA/बॉब नाय, 1971 |

- Downloaded from `images-assets.nasa.gov` (the `~large.jpg` renditions) into `assets/`.
- **Dating honesty:** the 1962 working photo is dated December 1962, after the February flight. It is labelled with its real date and is not presented as the check itself. The 1966 and 1971 photos are labelled with their years.

## Storyboard (as rendered; times from the Hindi ASR word pass on placed narration)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–6.35 | P1 Friendship 7 · 20 फ़रवरी 1962 | table on | launch photo; "जॉन ग्लेन · कक्षीय उड़ान"; the illustrated computer printout scrolls out at "आईबीएम कंप्यूटरों" (3.8), labelled "आईबीएम कंप्यूटर की गणना" |
| 6.35–10.66 | P2 समस्या: मशीनें कभी-कभी अटक जाती थीं | **page turn** | tape reels spin, then wind down and the lamps stall; the "रुकावट!" stamp lands at "अटक" (9.06); the footer quotes "hiccups and blackouts" |
| 10.66–14.66 | P3 ग्लेन का अनुरोध | **slide swap** | the 1966 desk photo of Johnson; the name plate "कैथरीन जॉनसन · नासा की गणितज्ञ · लैंगली, 1953 से" lands at her name (12.76) |
| 14.66–17.50 | P4 वही समीकरण, हाथ से | **hard cut** on "वही" | the 1962 working photo, with a ledger of computer vs. hand columns that tick as they match (illustrative numbers, labelled "चित्रण: अंक प्रतीकात्मक हैं"); the **magnifier (only use)** lands on her desk calculating machine (15.59–16.93) with the label "मेज़ की गणना-मशीन" |
| 17.50–20.36 | P5 नतीजा | **page turn** | Glenn and technicians with the Friendship 7 decal; the "सफल उड़ान · 20 फ़रवरी 1962" stamp lands at "सफल" (19.12) |
| 20.36–25.43 | P6 सीख: ज़रूरी गणना की अलग से जाँच | **slide swap** | the 1971 portrait; "कंप्यूटर" and "हाथ से" paths light up (21.9) and converge on one check (23.24): "मेल खाया, तभी भरोसा" (it matched, only then trust) |
| 25.43–30 | P7 CTA card | **slide swap** (24.93) | app icon, "Aarambh", "आरंभ डाउनलोड करें", "आजीविका के औज़ारों का साथ दें", the listing line "सत्यापित आजीविका औज़ारों के लिए योगदान दें और उनका असर देखें।", "Google Play पर उपलब्ध" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −3.0 dBTP true peak, LRA 4.4.
- **Captions:**
  - 8 groups, each at most 2 lines, in Noto Sans Devanagari 800 52 px.
  - The widest line is 701 px ("आजीविका के औज़ारों का साथ दें।"), so the plate runs x 157–923 and y 350–510.
  - The top 300 px stays clear.
- **Hindi ASR on the export** (faster-whisper small, language hi; `qa/asr_final.txt`):
  - 0.00–5.82: उन्नीस्व्श्व्बास्ध्छ में जों गलें की उर्दान के अंक अईबिम कमपुट्रो ने निकाले
  - 5.82–10.02: पर उस दोर के कमपुटर कभी कभी अटक जाते दे
  - 10.02–16.98: गलें के कहने पर नासा की गनितगे केट्रीन जोनसन ने वही समीकरन हाथ से हलकिए
  - 16.98–23.68: जांच के बाद उर्दान सबहल रही सीक जरूरी गरना की अलक से जांच कराए
  - 25.02–29.56: आरंभ डाउनलोड करे आजीविका के अजारो का साथ दे
  - Every sentence is recognised in order. The mis-hearings are the small model's spelling errors on correct phonemes: उर्दान for उड़ान, सबहल for सफल, गरना for गणना, अजारो for औज़ारों. The spoken year is garbled by the ASR, but its phonemes are correct and the caption shows "1962".
- **Speech/caption sync** (`qa/sync.txt`): caption windows come from the ASR word times of the placed narration. Each sentence's caption and scene change land within 0.2–0.45 s before the first recognised word: S2 6.35/6.56, S3 10.66/11.00, S4 17.50/17.92, S5 20.36/20.78. S6 is at 25.43, and ASR reports 25.02 (ASR drift on the leading vowel).
- **Contact sheets:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (every boundary).
- **Fixes before the final render:**
  1. Devanagari tofu on digits, punctuation and Latin: fixed by adding Latin-subset fallback families.
  2. Ledger ticks overlapped the hand column: the ledger was widened.
  3. The 1971 portrait was too small: enlarged to 290 px.
  4. On P6, the check badge covered the 1971 photo credit: the diagram moved 90 px down.
  5. On P4, the magnifier label's leader line crossed the 1962 photo credit: that credit is now right-aligned on the print.

## Remaining limits
- **No human listening:** I can't listen here. Intelligibility, words and pronunciation were checked by Hindi ASR and espeak phoneme output only, and voice quality is TTS-grade. A native speaker should give it one listen before posting.
- **Pronunciation approximations:** गणितज्ञ and जॉनसन are close approximations (see above).
- **Illustrative content:** the ledger numbers and the printout, console and reels are illustrations, labelled on screen.
- **No review folder:** this is a cloud container, so no local Desktop/video-review folder exists. The MP4 is attached in chat and pushed to the app branch.
