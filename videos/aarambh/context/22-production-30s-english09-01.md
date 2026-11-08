# 22 — English-09 30 s #01: Percy Spencer, radar magnetrons and microwave cooking (U.S. Patent 2,495,429)

- **Batch:** 2026-11-08-english-09
- **Output:** `videos/aarambh/production/30s/2026-11-08-english-09/aarambh-30s-english09-01.mp4`
- **sha256:** `eaf06c952e37f760a356850b3b07af044db2d6bcb5e3e57599fc993cabfb06fc`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only.
- **Recipe:** the most recently accepted English style (english-06/07/08 → `11`).
  - Archive Light Table, app palette, paper pages, page turns, slide swap, hard cut, single magnifier, Aarambh CTA card.
  - Mono kickers and stamps, Fraunces titles, Inter 800 at 54 px for captions; Meshline voice; no mascot.
  - Renderer: `production/30s/2026-11-08-english-09/src/render.mjs`, built from the english-08 core. No Three.js and no Blender.
- **Pre-flight (2026-11-08):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `9d04640` (english-08), clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished job existed, and earlier renders are untouched.
- **Duplicate check:** Spencer, microwave, magnetron and Raytheon do not appear in the episode log or in `videos/aarambh`, so the suggested subject was used.

## Feedback applied
- **Immediate, intriguing first second:** from frame 0, gold waves pulse out of Spencer's real magnetron patent drawing toward a candy bar in a lab-coat pocket. The bar starts to drip at 0.4 s, and drips run over the pocket while S1 is spoken.
- **Authentic device and patent images on distinct pages:**
  - P1: his magnetron patent drawing (2,408,235, Fig. 1).
  - P2: the real header of the cooking patent (2,495,429).
  - P3: the full 2,495,429 drawing, explored with the magnifier.
  - P5: the Smithsonian's CC0 photo of a 1956 Tappan RL-1, the first microwave oven designed for home use.
- **Portrait: none could be used.** No openly licensed portrait of Percy Spencer was found:
  - English Wikipedia's "Percy Spencer" article has no image at all (API check), and no free photo of him was found on Wikimedia Commons.
  - The Smithsonian Open Access search returned no Spencer portrait.
  - The Linda Hall Library's photo is credited "Spencer Family Archives via the Smithsonian Institution", so its rights are not open.
  - NIHF's inductee photo carries no open licence.
  - Following the accepted rule (never fake a likeness), P1 uses a typeset name plate, "Percy L. Spencer · radar engineer · Raytheon · 1894–1970", with no drawn or generated face.
- **Documented history vs the candy-bar anecdote:**
  - S1 attributes the story to him ("recalled"), and the P1 stamp reads "HIS OWN ACCOUNT".
  - S2 says "Retellings change the snack; the documented record is his 1945 patent." On P2, three snack tags (chocolate bar, peanut-cluster bar, Payday bar) flip in turn above the real patent header, which gets a "DOCUMENTED · FILED OCT. 8, 1945" stamp.
  - This takes one sentence. It is not a long disclaimer.
- **How radar magnetrons led to food heating:**
  - S1: a radar engineer, near a magnetron.
  - S3: the patent's own system (magnetrons → wave guide → food on a conveyor), with the magnifier following that path on the drawing.
  - P4: the patent's reason, in its own words: waves of about 10 cm, close to the size of the food, heat it intensely.
- **Concrete payoff:** the patent's own measurement. An egg is hard-boiled with 2 kW·s, against 36 kW·s cooked conventionally. Bars are drawn to scale, with an "about 1/18 of the energy" pill.
- **Lesson:** "when something odd happens, test it and measure it." P5 shows three steps: odd result (candy melted) → test (popcorn, an egg, from his own account per the Linda Hall Library) → measure (2 vs 36).
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.60 s (the last 3.4 s), with the card sliding in from 26.10 s. No other app name appears.
- **Voice:** the Meshline/Recall character. Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98; local and free; no imitation.
- **Music:** quiet under speech. A low magnetron hum plays under P1.

## Final script (English; 67 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | Radar engineer Percy Spencer recalled a candy bar melting in his pocket near a magnetron. | — |
| S2 | 6.95 | Retellings change the snack; the documented record is his 1945 patent. | "nineteen forty-five" |
| S3 | 12.77 | It sends magnetron microwaves down a guide to food on a conveyor. | comma after "guide" |
| S4 | 17.69 | His test: an egg hard-boiled with 2 units of energy, instead of 36. | "two … thirty-six" |
| S5 | 22.93 | Lesson: when something odd happens, test it and measure it. | comma after the first "test it" |
| S6 | 26.60 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

**Wording changes:** both were found by ASR testing, with tiny.en and small, before final placement.
1. **S1:** the first draft used "…and he said a candy bar…". Both models heard "he set", so it became "Radar engineer Percy Spencer recalled…", which both heard correctly.
2. **S4:** the first draft used "about one-eighteenth of the usual energy". Both models heard "one-eighth", which would be a factual error. It became "with two units of energy, instead of thirty-six", which both heard correctly. The screen carries the units (kW·s) and "about 1/18".

## Sources and claim map (accessed 2026-11-08)
- **[P] U.S. Patent 2,495,429, Percy L. Spencer, "Method of Treating Foodstuffs".**
  - Application October 8, 1945, Serial No. 620,919; patented Jan. 24, 1950; assignor to Raytheon Manufacturing Company.
  - USPTO full-image PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/2495429 . Record: https://patents.google.com/patent/US2495429A/en
- **[M] U.S. Patent 2,408,235, P. L. Spencer, "High Efficiency Magnetron".**
  - Filed Dec. 31, 1941; patented Sept. 24, 1946.
  - USPTO PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/2408235
- **[N] National Inventors Hall of Fame, Percy L. Spencer:** https://www.invent.org/inductees/percy-l-spencer
- **[S] Smithsonian NMAH, "Tappan Model RL-1 Microwave Oven".**
  - Record nmah_1088040, ID 1991.0727.01, gift of Frigidaire Company; media NMAH-RWS2012-04354, CC0.
  - Found via the Smithsonian Open Access API; ark https://n2t.net/ark:/65665/ng49ca746a9-3a4c-704b-e053-15f76fa0b4fa
- **[L] Linda Hall Library, Scientist of the Day, "Percy Spencer"** (July 9, 2019): https://www.lindahall.org/about/news/scientist-of-the-day/percy-spencer
- **[U] University of Maine (Raymond H. Fogler Library) research guide, "Percy Spencer":** https://libguides.library.umaine.edu/percyspencer
- **[B] Business Insider (India edition), "How the microwave was invented by a radar engineer who accidentally cooked a candy bar in his pocket":** https://www.businessinsider.in/how-the-microwave-was-invented-by-a-radar-engineer-who-accidentally-cooked-a-candy-bar-in-his-pocket/articleshow/47928989.cms
  - The page itself returned a proxy 502 from this container. Its quote was read from a search-result excerpt, and it is used only as one example of a varying retelling.

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| Radar engineer | N; L | N: Spencer's magnetron work "led to significant advances in radar"; L: "When Raytheon was awarded a contract from the Rad Lab at M.I.T. in 1939 to develop radar, Spencer was put in charge." |
| Recalled a candy bar melting in his pocket near a magnetron ("HIS OWN ACCOUNT") | L | "By his own account, he was standing near an operating magnetron with a candy bar in his pocket, when he noticed that the candy had melted." |
| Retellings change the snack (chocolate bar / Payday bar / peanut-cluster bar) | U; B; L | U: "the chocolate bar in his pocket had melted" and "he always brought a Payday candy bar to work"; B (grandson Rod Spencer): "the peanut-cluster bar in his pocket started to melt"; L: "a candy bar" (unspecified). N and S do not mention candy at all. |
| The documented record is his 1945 patent; "FILED OCT. 8, 1945" | P; N; L | P: "Application October 8, 1945"; N: "In 1945, Spencer created a device to cook food using microwave radiation."; L: "He applied for his first patent on Oct. 8, 1945". "1945" is the filing year; the header on screen shows the grant date, Jan. 24, 1950. |
| Magnetron microwaves go down a guide to food on a conveyor | P | "said devices alternately deliver hyper-frequency energy to a common, hollow wave guide 23"; "an appropriate, transversely-moving conveyor system 28 for carrying the foodstuff to be cooked into a region where it will be exposed to the energy emanating from said wave guide" |
| Egg hard-boiled with 2 units vs 36 (2 kW·s vs 36 kW·s; about 1/18) | P (cols. 2–3) | "I have found that an egg may be rendered hardboiled with the expenditure of 2 kw.-sec. This compares with an expenditure of 36 kw.-sec. to conventionally cook the same." (2/36 = 1/18) |
| Waves of about 10 cm, near the size of the food, heat it intensely | P (col. 1) | "wave lengths of the order of 10 centimeters or less. By so doing, the wave length of the energy becomes comparable to the average dimension of the foodstuff to be cooked, and as a result, the heat generated in the foodstuff becomes intense" |
| His magnetron patent (P1 print) | M; N | M header: "High Efficiency Magnetron", filed Dec. 31, 1941; N: "High-Efficiency Magnetron U.S. Patent No. 2,408,235" |
| 1894–1970; Raytheon (name plate) | N | "Born July 19, 1894 - Died Sept. 8, 1970"; "while working for the Raytheon Company". L gives July 9 for the birth day; only the years are shown. |
| Test step: popcorn, an egg | L | "Curious, he put other objects in the path of the microwaves, and discovered that popcorn kernels popped, and eggs exploded." |
| Tappan RL-1, the first microwave oven designed for home use (P5 photo note) | S | "Developed by Tappan in conjunction with Raytheon, the RL-1 was the first microwave oven designed for home use."; S also: "Engineer Percy Spencer (1894–1970) suggested using magnetrons for heating food." |
| Lesson: when something odd happens, test it and measure it | interpretive, from L (noticed → put other objects in the path) and P (the measured kW·s comparison) | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that the candy-bar moment is verified, or which snack it was
- a date for the candy incident
- that he "invented the microwave oven" alone, or the Radarange's details
- Amana, sales figures or "200 million" ovens
- that he never finished grammar school (true per N, but not needed)
- anything about his personality

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/us2408235-sheet1-magnetron.png` | U.S. 2,408,235 drawing sheet 1 (header + Fig. 1, the magnetron), crop 900x1116 | USPTO full-image PDF [M] | U.S. patent drawings are generally not subject to copyright |
| `assets/us2495429-header.png` | U.S. 2,495,429 drawing-sheet header (Jan. 24, 1950 · P. L. Spencer · Method of Treating Foodstuffs · Filed Oct. 8, 1945 · 2,495,429) | USPTO PDF [P] | as above |
| `assets/us2495429-drawing-cooking.png` | U.S. 2,495,429 single figure: magnetron oscillators, wave guide, food to be cooked, conveyor system | USPTO PDF [P] | as above |
| `assets/tappan-rl1-1956-nmah-cc0.jpg` | Tappan RL-1 microwave oven, made 1956 | Smithsonian NMAH, media NMAH-RWS2012-04354 via `ids.si.edu` [S] | CC0 (Smithsonian Open Access) |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Original Canvas2D drawings, labelled "ILLUSTRATION":** the waves, the pocket and candy bar, the egg, the bars and the lesson cards.
- **No portrait:** see Feedback applied. The name plate is typeset text only.

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–6.95 | P1 the anecdote | table lights flicker on (0–0.4); waves from frame 0 | gold waves pulse from the magnetron drawing (2,408,235 Fig. 1) toward a pocketed candy bar; the bar melts and drips (0.4–5.2) under a low hum; "Percy L. Spencer" plate on "Percy" (1.13); "HIS OWN ACCOUNT" stamp on "recalled" (2.28); melt sweep on "melting" (3.88) |
| 6.95–12.77 | P2 story vs record | **page turn** (6.60–6.95) | "THE STORY · retellings vary": the chocolate / peanut-cluster / Payday tags flip in turn (6.88–8.53); the real 2,495,429 header slides in under "THE RECORD" on "documented" (8.98); "DOCUMENTED · FILED OCT. 8, 1945" stamp on "patent" (11.45) |
| 12.77–17.69 | P3 the 1945 patent | **slide swap** (12.42–12.77) | the full patent drawing; the **magnifier (only use)** lands on the magnetron oscillator on "magnetron" (13.45), glides along the wave guide on "down a guide" (14.66–15.26), then to the food on the conveyor (15.48–16.22); "magnetrons, wave guide, food on a conveyor" pill on "conveyor" (16.39) |
| 17.69–22.93 | P4 his measurement | **hard cut** (17.63, light flash) | "An egg: 2 versus 36": the egg cooks under the waves; the 2 kW·s bar on "two" (19.91); the 36 kW·s bar grows over "instead of 36" (21.30); "about 1/18 of the energy" (21.80); the patent's 10 cm reason line; footer "U.S. Patent 2,495,429, columns 1–3" |
| 22.93–26.60 | P5 the lesson | **page turn** (22.58–22.93) | "Test the odd result": step 1 "candy melted" on "odd" (23.90), step 2 "popcorn, an egg" on "test" (24.86), step 3 "2 vs 36" plus a chime on "measure" (25.44/25.64); the Tappan RL-1 photo with its Smithsonian note |
| 26.60–30 | P6 CTA card | **slide swap** (26.10–26.60) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −1.7 dBTP true peak, LRA 3.3.
- **Captions** (`qa/caption_bounds.txt`): 11 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 769 px ("Retellings change the snack;"), so the plate runs x 124–956 and y 350–510; the top 300 px stays clear.
- **ASR on the export:**
  - **tiny.en** (`qa/asr_final.txt`) matches the script except "Retelling's changed" for "Retellings change", "hard -boiled" and "RM" for Aarambh.
  - **small (en)** (`qa/asr_small_crosscheck.txt`) gives the same except "Retellings changed" and "RUMB".
  - "change"/"changed" is a liaison with the following "the". The caption shows "change", and the card shows the app name.
- **Word-to-event sync** (`qa/sync.txt`): 22 events, each from 0.52 s before to 0.26 s after its word. The hard cut is at 17.63, 0.13 s before "His", and the 36 kW·s bar grows across "instead of 36".
- **Contact sheets:** `qa/contact_representative.jpg` (every 1 s, at x.5) and `qa/contact_transitions.jpg` (17 transition and edge frames).
- **Fixes:**
  - **Before the full render:** the P1 pocket was redrawn so the drips run over the fabric; the waves were made bolder; the P4 egg was enlarged; the magnetron crop was extended so the Fig. 1 ring is not clipped.
  - **After the first full render** (two video-only re-renders; the audio stream's md5 is unchanged, `b64336beed881107bac7d396ac64fe8a`):
    1. The P5 photo credit "Tappan RL-1, 1956 (Smithsonian, CC0)" overflowed its print border, and the note "first oven designed for home use" misquoted NMAH ("first *microwave* oven"). The credit was shortened, and the corrected note moved under the steps.
    2. The P4 footer cited "columns 1–2", but the egg measurement is in columns 2–3, so it became "columns 1–3".
  - No defects on the final sheets.

## Remaining limits
- **No portrait:** no openly licensed photograph of Percy Spencer was available, so the episode uses a typeset name plate. If a licensed portrait is later supplied (for example by the Spencer family or Raytheon), it could replace the plate on P1.
- **No human listening:** I can't listen here. The voice was checked by two ASR models only.
- **One retelling not opened directly:** the Business Insider page could not be opened from this container (proxy 502). The peanut-cluster wording comes from a search-result excerpt quoting his grandson, and it is shown only as one of the varying retellings.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
