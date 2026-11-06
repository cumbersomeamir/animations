# 20 — English-07 30 s #01: Garrett Morgan's all-stop traffic signal (U.S. Patent 1,475,024, 1923)

- **Batch:** 2026-11-06-english-07
- **Output:** `videos/aarambh/production/30s/2026-11-06-english-07/aarambh-30s-english07-01.mp4`
- **sha256:** `3eabf720bfdc3fa01913368adc6933044d2f718c99223a1754aa4525fec5362e`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only. No Hindi audio was reused.
- **Recipe:** the most recently accepted English style (english-06 → `11`).
  - Archive Light Table, app palette, paper pages, page turn, slide swap, hard cut, single magnifier, Aarambh CTA card.
  - Mono kickers and stamps, Fraunces titles, Inter 800 at 54 px for captions; Meshline voice.
  - Renderer: `production/30s/2026-11-06-english-07/src/render.mjs`, built from the english-06 core.
  - No mascot appears, because accepted episodes since the genre change use none (the pilot's Bindu belonged to the rejected lockstitch direction). No Three.js and no Blender.
- **Pre-flight (2026-11-06):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin, clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished job existed (english-06 was pushed), and earlier renders are untouched.
- **Topic history:** new. No earlier episode mentions Morgan or traffic signals (checked by grep over `videos/aarambh`).

## Feedback applied
- **Real photographs of Morgan:** a portrait, plus the 1916 newspaper photo of his tunnel rescue. **Authentic patent imagery:** the real drawing sheet 1 of US 1,475,024, from the USPTO PDF.
- **His improvement, not "the traffic light":**
  - S1 states that early signals existed and gave only STOP and GO (NIHF: "Though rudimentary traffic lights existed at the time, they only displayed two signals: stop and go").
  - S2 says he "patented an improvement", the patent's own word: "a certain new and useful Improvement in a Traffic Signal".
  - P2 carries the label "an improvement, not the first signal".
  - The video never claims he invented traffic lights or the yellow light.
- **The pause between flows, shown on distinct pages:** before (two-step, near miss) → patent (crank and raised arms) → the all-stop demo (crossing car clears) → turn, then slow lowering (dash-pot) → lesson.
- **Lesson about improving an existing system:** "improve a system by adding the step it was missing". The visual shows STOP→GO becoming STOP→ALL STOP→GO.
- **Immediate hook:** cars move from frame 0, and the signal flips straight to GO at 3.35 s, causing a near miss.
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.85 s (last 3.15 s), with the card sliding in at 26.35 s. No other app name appears.
- **Voice:** the Meshline/Recall character. Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98; local and free; no imitation.
- **Music:** quiet under speech (accepted ducking).

## Final script (English; 71 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | Many early traffic signals showed only two commands: stop and go. | comma "stop, and go" |
| S2 | 4.75 | In 1923, Cleveland inventor Garrett Morgan patented an improvement. | "nineteen twenty-three" |
| S3 | 10.07 | A hand crank first raised the arms, stopping traffic in every direction. | — |
| S4 | 15.07 | That pause let cars already crossing clear the intersection. | — |
| S5 | 18.64 | Then the signal turned, and the arms lowered slowly for the other street. | — |
| S6 | 23.15 | Lesson: improve a system by adding the step it was missing. | — |
| S7 | 26.85 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

## Sources and claim map (accessed 2026-11-06)
- **[P] U.S. Patent 1,475,024, Garrett A. Morgan, of Cleveland, Ohio, "Traffic Signal".**
  - Application filed February 27, 1922; patented November 20, 1923.
  - USPTO full-image PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/1475024 (6 pages, read 2026-11-06). Record: https://patents.google.com/patent/US1475024A/en
- **[N] National Inventors Hall of Fame, Garrett Morgan** (inducted 2005; patents 1,090,936 and 1,475,024): https://www.invent.org/inductees/garrett-morgan

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| Many early signals showed only STOP and GO | N | "Though rudimentary traffic lights existed at the time, they only displayed two signals: stop and go." |
| Near miss when the signal changes at once (P1 illustration) | P | "thus avoiding accidents which frequently occur by reason of the over-anxiety of the waiting drivers, to start as soon as the signal to proceed is given" |
| 1923; Cleveland inventor; patented an improvement; 1,475,024; Nov. 20, 1923 | P; N | P: "GARRETT A. MORGAN, OF CLEVELAND, OHIO … have invented a certain new and useful Improvement in a Traffic Signal"; header "Patented Nov. 20, 1923. 1,475,024"; "Application filed February 27, 1922" |
| 1877–1963 (name plate) | N | "Born March 4, 1877 - Died July 27, 1963" |
| A hand crank first raised the arms, stopping traffic in every direction | P | "the crank 28 is turned, whereupon the arms 13 are immediately raised … Thus, traffic is stopped in all directions"; "manually operable for directing the flow of traffic" |
| "Fig. 2: arms raised, STOP every way" | P (drawing) | Fig. 2 shows the arms raised beside the box, all faces reading "STOP" |
| The pause lets cars already crossing clear the intersection | P | "a visible indicator which is useful in stopping traffic in all directions before the signal to proceed in any one direction is given. This is advantageous in that vehicles which are partly across the intersecting streets are given time to pass the vehicles which are waiting to travel in a transverse direction" |
| Then the signal turned, and the arms lowered slowly | P | "as the crank is turned still further … the indicators are revolved while the arms are still held in vertical position … allowing the arms to drop to horizontal position. The dash-pot controlled by the piston 45 permits the arms to descend with slow motion" |
| Lesson: improve a system by adding the missing step | interpretive, from P (an all-stop step added to a STOP/GO cycle) and N ("existed … only … stop and go") | — |
| Photo caption: 1916 Lake Erie tunnel rescue | N | "In 1916 … Following an explosion at the Cleveland Waterworks … a gas-filled tunnel collapsed under Lake Erie … volunteers — including Morgan himself — put on safety hoods". Commons dates the photo 1917; NIHF's 1916 is used. |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that he invented the traffic light or the yellow/amber light (NIHF calls his signal's third position the equivalent of a "caution" light; the video shows the patent's all-stop instead)
- the sale of the rights to General Electric for $40,000 (NIHF; not needed)
- any quote attributed to Morgan
- safety statistics
- that his signal was adopted at any particular place

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/garrett-morgan-portrait-commons.jpg` | oval portrait of Garrett A. Morgan | Wikimedia Commons "File:Morgan5.jpg" (294x365); Commons cites a U.S. NHTSA page | Commons {{PD-old}}; author and date unknown. **Identity:** labelled Garrett Augustus Morgan on Commons and by its NHTSA source. |
| `assets/garrett-morgan-1916-rescue-newspaper.jpg` | 1916 newspaper photo captioned "MORGAN BRINGING FIRST MAN OUT OF TUNNEL" | Wikimedia Commons "File:Morgan rescue.jpg" (500x377) | Commons {{PD-US}} (a newspaper published in 1916, before 1931). **Identity:** given by the newspaper's own caption. |
| `assets/us1475024-sheet1-fig1-fig2.png` | patent drawing sheet 1: header ("Nov. 20, 1923 · G. A. MORGAN · TRAFFIC SIGNAL · Filed Feb. 27, 1922 · 1,475,024"), Figs. 1–4 | cropped from the USPTO PDF above | U.S. patent drawings are generally not subject to copyright; the same pages are also on Commons as CC0 |

- **Rejected:** "Garrett Morgan.gif", the bow-tie portrait NIHF uses. It is an English-Wikipedia local file whose public-domain claim rests on a U.S. DOT reprint, which is a weaker basis. Library of Congress and Chronicling America searches gave nothing usable (no result / 403).
- **Other visuals:** the intersection, cars, signal elevation and lesson rows are original Canvas2D drawings, labelled "ILLUSTRATION". The semaphore follows patent Figs. 1–2 (box 12, arms 13, bell cap 65, crank 28).

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–4.75 | P1 before | table on; traffic moving from frame 0 | top-view intersection with "↕ GO / ↔ STOP" chips; "only two commands: STOP · GO" on "two" (2.01); on "stop" (3.35) the chips flip straight to the other flow, the waiting car launches while the gold car is still crossing, then brakes: red ring and "NEAR MISS" stamp (3.90) |
| 4.75–10.07 | P2 Morgan | **page turn** (4.40–4.75) | portrait plus the 1916 newspaper rescue photo; the "Garrett A. Morgan · inventor · 1877–1963 · Cleveland, Ohio" plate on "Garrett" (7.25); the "PATENT 1,475,024 · NOV. 20, 1923" stamp on "patented" (8.24); "an improvement, not the first signal" on "improvement" (8.88) |
| 10.07–15.01 | P3 the 1923 patent | **slide swap** (9.72–10.07) | the real drawing sheet; the **magnifier (only use)** lands on crank 28 on "crank" (10.75), then moves to Fig. 2's raised arms on "raised the arms" (11.17–11.92); "Fig. 2: arms raised, STOP every way" on "every" (13.50) |
| 15.01–18.64 | P4 the pause | **hard cut** on "That" (15.01) | all chips STOP; "ALL STOP" on "pause" (15.18) and a pause timer fills; the gold car, already partly across, keeps going ("already crossing", 16.13) while the waiting cars hold; check and "intersection clear" on "clear" (17.08) |
| 18.64–23.15 | P5 then | **page turn** (18.29–18.64) | Morgan-style semaphore (after Figs. 1–2): arms raised, "1 arms up: all stop"; the box turns STOP→GO on "turned" (19.25); the arms descend slowly on "lowered slowly" (20.78–22.6; "patent: a dash-pot slows the arms"); the mini top view shows the other street moving on "other" (21.80) |
| 23.15–26.85 | P6 lesson | **slide swap** (22.80–23.15) | "TWO STEPS: STOP → GO" on "Lesson"; "THREE STEPS" row on "system" (24.36); "ALL STOP" slides in on "adding" (24.99) and glows with a check on "missing" (25.92); "same signal, one added step" |
| 26.85–30 | P7 CTA card | **slide swap** (26.35–26.85) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −1.5 dBTP true peak, LRA 2.9.
- **Captions:** 13 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 781 px, so the plate runs x 118–962 and y 350–510; the top 300 px stays clear.
- **ASR on the export:**
  - faster-whisper **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script word for word except "RUMB" for Aarambh. The card shows the name.
  - **tiny.en** (`qa/asr_final.txt`) hears "lit" for "let", which the small model hears correctly.
- **Word-to-event sync** (`qa/sync.txt`): 25 events, each 0–0.3 s before or on its word. The CTA card lands at the placed S7 start of 26.85; ASR stamps "Download" early, at 26.42.
- **Contact sheets:** `qa/contact_representative.jpg` and `qa/contact_transitions.jpg`.
- **Fix before the final render:** in the P1 hook, the waiting car barely moved before the near-miss ring. It now launches when the signal flips and stops ~24 px short of the crossing car. One full render; no defects on the final sheets.

## Remaining limits
- **No human listening:** I can't listen here. The voice was checked by ASR and espeak phonemes only.
- **Portrait licence:** it rests on the Commons {{PD-old}} tag (unknown author and date, sourced via an NHTSA page). The rescue photo has the stronger basis (a 1916 newspaper).
- **Simplified illustrations:** the semaphore follows the patent drawings, but the arm lettering is simplified (STOP when raised, GO when lowered for the street being released).
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
