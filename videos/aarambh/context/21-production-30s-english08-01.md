# 21 — English-08 30 s #01: Samuel F. B. Morse, painter turned telegraph inventor (U.S. Patent 1,647, 1840)

- **Batch:** 2026-11-07-english-08
- **Output:** `videos/aarambh/production/30s/2026-11-07-english-08/aarambh-30s-english08-01.mp4`
- **sha256:** `7ae642a952e47114de2e4ebb5256a4a5b1ee0a7696e1f2cc9a0f5d5523f71aec`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only. No Hindi audio was reused.
- **Recipe:** the most recently accepted English style (english-06/07 → `11`).
  - Archive Light Table, app palette, paper pages, page turns, slide swap, hard cut, single magnifier, Aarambh CTA card.
  - Mono kickers and stamps, Fraunces titles, Inter 800 at 54 px for captions; Meshline voice; no mascot (as in every accepted episode since the genre change).
  - Renderer: `production/30s/2026-11-07-english-08/src/render.mjs`, built from the english-07 core. No Three.js and no Blender.
- **Pre-flight (2026-11-07):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin, clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished job existed (english-07 was pushed), and earlier renders are untouched.

## Subject change (why this is not Lamarr & Antheil)
- **The suggested topic was already covered twice in this app's history:**
  - Hedy Lamarr & George Antheil's frequency-hopping patent was episode 04 (round-02, English, 2026-11-03, `15`).
  - It was episode 07 again (feedback-05, Hindi, 2026-11-05, `18`).
- **The brief's rule:** "if this topic was covered choose a different subject in the same fixed genre", so a third version was not made.
- **Replacement:** Samuel F. B. Morse, never covered (grep for morse/telegraph found nothing). It is chosen to keep what the brief asked for:
  - a famous person with a real communication patent and authentic patent images on distinct pages;
  - a simple signal mechanism;
  - historical significance (the 1844 Washington–Baltimore line);
  - the same lesson, combining ideas across disciplines: a former portrait painter with little electrical training.
  - No Wi-Fi/Bluetooth-style overclaim applies, and none is made.

## Feedback applied
- **Real photographs, real patent images, distinct pages:**
  - a Brady-studio portrait (Library of Congress);
  - Brady's 1857 photo of Morse with his recorder;
  - patent sheet 3 (the register), under the magnifier;
  - patent sheet 1, the "System of Signs" letters strip, on the demonstration page.
- **Immediate, intriguing first second:** light pulses race along a wire between WASHINGTON and BALTIMORE from frame 0. A pen marks a moving paper tape, then the real first message "WHAT HATH GOD WROUGHT!" types out.
- **Concrete payoff:** a working circuit demonstration. Key down → current → the magnet pulls the lever → the pen drops onto the moving paper. Short presses make dots, long presses make lines, matching the narration word for word.
- **Lesson:** "combine what you know with a field you are new to". Cards show painting + electricity = a recording telegraph.
- **No over-claims:**
  - not "invented the telegraph" or "invented Morse code" outright (others worked on telegraphs; Alfred Vail's role in the code is debated);
  - no claim that the 1840 letter signs equal modern international code;
  - no money figures.
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.75 s (last 3.25 s), with the card sliding in at 26.25 s. No other app name appears.
- **Voice:** the Meshline/Recall character. Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98; local and free; no imitation.
- **Music:** quiet under speech.

## Final script (English; 70 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | In 1844, a message flashed by wire between Washington and Baltimore. | "eighteen forty-four" |
| S2 | 5.95 | It ran on the telegraph of Samuel Morse, a former portrait painter with little electrical training. | — |
| S3 | 12.41 | His 1840 patent describes a register: a magnet that presses a pen onto moving paper. | "eighteen-forty" |
| S4 | 18.76 | Short pulses of current leave dots; longer ones leave lines. | — |
| S5 | 22.89 | Lesson: combine what you know with a field you are new to. | comma after "know" |
| S6 | 26.75 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

**Wording change:** S2 first said "once a portrait painter", which tiny.en heard as "one support trip painter". Three variants were tested with tiny.en and small, and "a former portrait painter" was recognised correctly by both, so it was used.

## Sources and claim map (accessed 2026-11-07)
- **[P] U.S. Patent 1,647, Samuel F. B. Morse, of New York, N.Y., "Improvement in the mode of communicating information by signals by the application of electro-magnetism".**
  - Dated June 20, 1840; the drawings are headed "Telegraph Signs".
  - USPTO full-image PDF (9 pages): https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/0001647 . Record: https://patents.google.com/patent/US1647A/en
- **[N] National Inventors Hall of Fame, Samuel F. B. Morse** (inducted 1975; Telegraph, U.S. Patent No. 1,647): https://www.invent.org/inductees/samuel-f-b-morse

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| 1844, message by wire between Washington and Baltimore; "WHAT HATH GOD WROUGHT!"; May 24, 1844 | N | "A line was constructed between Baltimore and Washington, D.C. and the first message, sent on May 24, 1844, was 'What hath God wrought!'" |
| It ran on Morse's telegraph | N; P | N: the line follows his telegraph's development; P: "I denominate said invention the 'American Electro-Magnetic Telegraph'" |
| A former portrait painter with little electrical training | N | "Samuel F.B. Morse, once a portrait painter, turned to inventing … Morse had little training in electricity but realized that pulses of electrical current could convey information over wires." |
| 1791–1872 (name plate) | N | "Born April 27, 1791 - Died April 2, 1872" |
| 1840 patent 1,647; June 20, 1840 (stamp) | P | "Letters Patent No. 1,647, dated June 20, 1840"; drawing sheets "No. 1,647 · Patented Jun. 20, 1840" |
| The patent describes a register | P | parts list: "sixth, a register which records permanently the signs communicated"; sheet 3 "Example 10. Register" |
| A magnet that presses a pen onto moving paper | P | "As said armature is drawn or attracted … toward the said magnet when the latter is charged from the circuit of conductors, said lever is turned upon its fulcrum, and the opposite end thereof necessarily descends and brings the pen, or marking-instrument which it contains in contact with the paper … on the revolving cylinder"; the paper "is drawn … forward" |
| Short pulses leave dots, longer ones leave lines | P | the pen stays down while the current flows and lifts "as soon as said magnet ceases to be charged"; sheet 1 "Example 3, For Letters" shows the signs as dots and lines; the specification: numerals of "dots or punctures" ("one dot … for the numeral 1, two dots … for 2…") |
| The key opens and closes the circuit (demo) | P | "a signal-lever which breaks and connects the circuit of conductors" (simplified in the demo to a hand key) |
| Lesson: combine what you know with a field you are new to | interpretive, from N (a portrait painter with little electrical training who built a telegraph) | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that Morse invented the telegraph or the code alone
- that his 1840 signs equal today's international code
- the direction of the 1844 message or who keyed it (NIHF gives neither)
- money figures, the 1858 European gratuity, or later company history

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/samuel-morse-brady-loc-cwpbh00853.jpg` | portrait of Samuel F. B. Morse, Brady studio, c. 1855–65 | Library of Congress, Brady-Handy collection, cwpbh.00853, from `tile.loc.gov` (650x1024); the same image is Commons "File:Samuel Morse.jpg" | Commons {{PD-old-100-1923}}; LOC record. **Identity:** the LOC/Commons title. |
| `assets/samuel-morse-with-recorder-brady-1857.jpg` | Morse with his recorder, Mathew Brady, 1857 | Wikimedia Commons "File:Samuel Morse with his Recorder by Brady, 1857.png" (1280 px rendition; source credited there: Christie's) | {{PD-old-100}} |
| `assets/us1647-sheet3-register.png` | patent drawing sheet 3, "Example 10. Register" (Figs. 1–5), with header | cropped from the USPTO PDF above | U.S. patent drawings are generally not subject to copyright |
| `assets/us1647-sheet1-example3-letters.png` | patent drawing sheet 1, "Example 3, For Letters" (dot-and-line signs) | cropped from the USPTO PDF above | as above |

- **Wanted but blocked:** Morse's self-portrait and *Gallery of the Louvre* (both PD-Art on Commons) returned HTTP 429 at every thumbnail size throughout the session. The "former portrait painter" card therefore uses a palette icon labelled "icons: ILLUSTRATION", not a reproduction of his painting.
- **Other visuals:** the map/wire, tape, circuit demo and lesson cards are original Canvas2D drawings, labelled "ILLUSTRATION". The P1 tape marks are illustrative, not the real 1844 tape.

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–5.95 | P1 the message | table on; pulses from 0.12 | gold pulses race along a wire from WASHINGTON to BALTIMORE; the register pen ticks dots and lines onto a moving tape; "MAY 24, 1844" stamp on "1844" (0.46); "WHAT HATH GOD WROUGHT!" types out from "message" (2.12) |
| 5.95–12.41 | P2 the inventor | **page turn** (5.60–5.95) | Brady portrait (LOC); "Samuel F. B. Morse · 1791–1872" plate on "Samuel" (7.37); "FORMER portrait painter" card on "portrait" (9.18); "LITTLE TRAINING in electricity" card on "electrical" (10.50); "painter turned inventor" |
| 12.41–18.70 | P3 the 1840 patent | **slide swap** (12.06–12.41) | the real register sheet beside the 1857 photo of Morse with his recorder; "PATENT 1,647 · JUNE 20, 1840" stamp on "patent" (13.24); the **magnifier (only use)** lands on Fig. 4 on "register" (14.91) and moves from the magnet to the pen over the paper roller (15.85–17.14); "register: records the signs", "Fig. 4: the magnet moves the lever; the pen meets the paper" |
| 18.70–22.89 | P4 how it worked | **hard cut** on "Short" (18.70) | the real "Example 3, For Letters" strip on top; the demo circuit below; each key press lights the wire, the magnet lifts the armature end and the pen drops onto the moving paper: short presses (19.1, 19.5, 20.2) leave dots and long presses (21.3, 21.9) leave lines; "short pulse = dot", "long pulse = line" |
| 22.89–26.75 | P5 the lesson | **page turn** (22.54–22.89) | "WHAT HE KNEW · painting" on "combine" (23.50); "+ A NEW FIELD · electricity" on "field" (24.98); "NEW TOOL · a recording telegraph" plus a check on "to" (25.61); "what you know + a new field" |
| 26.75–30 | P6 CTA card | **slide swap** (26.25–26.75) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.1 LUFS integrated, −1.4 dBTP true peak, LRA 3.1.
- **Captions:** 11 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 749 px, so the plate runs x 134–946 and y 350–510; the top 300 px stays clear.
- **ASR on the export:**
  - **tiny.en** (`qa/asr_final.txt`) matches the script word for word except "RM" for Aarambh.
  - **small (en)** (`qa/asr_small_crosscheck.txt`) gives the same except "lessen" for "Lesson" (a homophone) and "RUMB" for Aarambh.
  - The card shows the app name.
- **Word-to-event sync** (`qa/sync.txt`): 23 events, each 0–0.42 s before or on its word. The hard cut lands at S4's placed start, 18.70–18.76.
- **Contact sheets:** `qa/contact_representative.jpg` and `qa/contact_transitions.jpg`.
- **Fixes before the full render:**
  1. The P4 demo was too small: the key, magnet, lever, paper and marks were enlarged.
  2. The P2 portrait was enlarged.
  3. The P2 name overran its plate: 40 → 36 px.
  - One full render; no defects on the final sheets.

## Remaining limits
- **No human listening:** I can't listen here. The voice was checked by ASR and espeak phonemes only.
- **No painting shown:** Morse's paintings could not be downloaded this session (Commons 429), so his painting career is shown with an icon, not one of his works.
- **Simplified demo:** it uses a hand key. The 1840 patent sends signs with type set in a "port-rule" that moves a signal-lever. The register side follows the patent.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
