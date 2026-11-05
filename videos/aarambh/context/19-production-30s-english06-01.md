# 19 — English-06 30 s #01: Mary Anderson and the windshield wiper (U.S. Patent 743,801, 1903)

- **Batch:** 2026-11-06-english-06
- **Output:** `videos/aarambh/production/30s/2026-11-06-english-06/aarambh-30s-english06-01.mp4`
- **sha256:** `72f3928d01b1cfd605fc2960422635c6f5abeb3eb51e46cb00e158474c03ee42`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only. No Hindi audio was reused.
- **Recipe:** the accepted Archive Light Table recipe (`11`).
  - Renderer: `production/30s/2026-11-06-english-06/src/render.mjs`.
  - The core (light table, paper pages, page turn, slide swap, hard cut, single magnifier, captions, CTA card) comes from the feedback-05 renderer.
  - The English typography is round-02's: Mono kickers, footers and stamps; Fraunces titles; Inter 800 at 54 px for captions.
  - No Three.js and no Blender; Canvas2D is only the tool.
- **Pre-flight (2026-11-06):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin, clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished job existed (feedback-05 was pushed), and earlier renders are untouched.
- **Topic history:** new. The app's episodes cover lockstitch, Curie, Lovelace, de Mestral, Lamarr & Antheil (×2), Katherine Johnson and Braille; none mentions Mary Anderson or wipers.

## Feedback applied
- **Real portrait:** Mary Anderson, c. 1910, public domain (see Images).
- **Distinct pages:** 7 animated pages, changed by 2 page turns, 3 slide swaps (one is the CTA card) and 1 hard cut. The magnifier is used once, on the real rubber cleaners (T) of patent Fig. 2. Nothing bobs on a static page.
- **Immediate hook:** snow falls in a night street panel from frame 0, with the portrait landing by 0.6 s and a trolley rolling in on "trolley" (1.04 s).
- **The four required parts:** the problem she observed (P2), the 1903 patent (P3), how the mechanism worked (P4 handle, swing, springs and cleared arc; P5 counterweight), and one lesson about noticing everyday problems (P6).
- **No invented quotes:** the only quotations are from the patent text, and they are in this record, not in the video.
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.40 s (last 3.6 s), with the card sliding in at 25.90 s. No other app or company name appears anywhere.
- **Voice:** the approved Meshline/Recall character. This is Kokoro-82M, blend 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98, local and free; no celebrity imitation.
- **Music:** quiet under speech (accepted ducking).

## Final script (English; 72 words; ~25.8 s of speech plus pauses)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | On a snowy New York trolley ride, Mary Anderson noticed a problem. | — |
| S2 | 4.98 | Drivers had to open their windows, sometimes stopping to clear the glass. | — |
| S3 | 9.90 | Her 1903 patent put rubber blades on an arm outside the glass. | "nineteen-oh-three" |
| S4 | 14.58 | Turn a handle inside, and springs press the rubber as it sweeps. | — |
| S5 | 18.83 | A counterweight kept the swinging arm balanced. | — |
| S6 | 21.63 | Lesson: the hassles everyone accepts are problems waiting for a tool. | — |
| S7 | 26.40 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" (espeak gives ˈɑːɹˈʌmb, closer to आरंभ than ˈɑːɹɹæmb) |

**Script drafts:** the first draft was 64 words and left ~5 s unused. A fuller counterweight-and-removal line made 77 words, which was too long, so S5 was shortened to the counterweight only.

## Sources and claim map (accessed 2026-11-06)
- **[P] U.S. Patent 743,801, Mary Anderson, of Birmingham, Alabama, "Window-Cleaning Device".**
  - Application filed June 18, 1903; patented November 10, 1903.
  - USPTO full-image PDF: https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/0743801 (read 2026-11-06). Record: https://patents.google.com/patent/US743801A/en (returned 503 today).
- **[N] National Inventors Hall of Fame, Mary Anderson** (inducted 2011): https://www.invent.org/inductees/mary-anderson

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| A snowy New York trolley ride; she noticed the problem | N | "While touring New York City in a trolley car on a snowy day in the early 1900s, Mary Anderson conceived her idea…" |
| Drivers opened their windows, sometimes stopping to clear the glass | N | "streetcar drivers often had to open their windows in order to see during inclement weather, sometimes even stopping the streetcar to go outside to clear the window" |
| 1866–1953; Birmingham, Alabama (name plate) | N; P | N: "Born Feb. 19, 1866 - Died June 27, 1953"; P: "MARY ANDERSON, OF BIRMINGHAM, ALABAMA" |
| 1903 patent 743,801; Nov. 10, 1903 (stamp) | P | "Specification forming part of Letters Patent No. 743,801, dated November 10, 1903. Application filed June 18, 1903." |
| Rubber blades on an arm outside the glass | P | "a device operating on the outside of the glass to remove snow, rain, or sleet"; "wooden strips H, which carry a rubber T, adapted to sweep across and clean the window-pane"; cleaners "one or more, preferably two" |
| A handle inside turns the arm | P | "a radially-swinging arm is actuated by a handle from the inside of a car-vestibule"; "simply necessary for him to take hold of the handle L and turn it in one direction or the other to clean the pane" |
| Springs press the rubber as it sweeps; cleared arc (Fig. 2, area a) | P | "Springs i i … maintain the rubbers T T with yielding and uniform pressure upon the glass, so that when the arm is swung … the cleaner sweeps and cleans an area, as indicated by the hatched lines a in Fig. 2" |
| A counterweight kept the arm balanced | P; N | P: "To counterbalance the arm, a counterweight c is adjustably connected with the extension C of the arm. In this way the weight is equally balanced on each side of the pivotal support of the arm"; N: "with a counterweight to keep the wiper in contact with the window" |
| Lesson: the hassles everyone accepts are problems waiting for a tool | interpretive, from N (an everyday nuisance observed, then an invention) | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- any quote from Mary Anderson
- that she earned money from it, or that modern car wipers descend directly from her design
- "the first wiper ever" (NIHF says "the first windshield-clearing device to be effective"; not used)
- Cadillac 1922 and other later history
- any exact date of the New York trip (NIHF: "early 1900s")

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/mary-anderson-c1910-commons.jpg` | portrait of Mary Anderson, c. 1910 | Wikimedia Commons "File:MaryAnderson(inventora).jpg" (724x884); Commons cites the Spanish Patent and Trademark Office historical virtual museum, which no longer resolves | Commons tag {{PD-old}}, author unknown, c. 1910. **Identity:** NIHF's own inductee image for Mary Anderson is the same photograph (compared 2026-11-06). |
| `assets/us743801-sheet1-fig1-fig2.png` | patent drawing sheet: header ("No. 743,801 · PATENTED NOV. 10, 1903 · M. ANDERSON · WINDOW CLEANING DEVICE · APPLICATION FILED JUNE 18, 1903"), Fig. 1 and Fig. 2 | cropped from the USPTO PDF above | U.S. patent drawings are generally not subject to copyright |

**Other visuals:** the trolley, snow, window, handle, spring and counterweight scenes are original Canvas2D drawings, labelled "ILLUSTRATION". The window scene follows Fig. 2: the pivot at the top-right corner and the swept area a.

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–4.98 | P1 the observer | table on; snow from frame 0 | the portrait lands (0.12–0.6); a snowy street panel with falling snow; the trolley rolls in on "trolley" (1.04) as snow builds on its windshield; the "Mary Anderson · inventor · 1866–1953 · Birmingham, Alabama" plate on "Mary" (2.59); "the problem: snow on the glass" on "problem" (3.66) |
| 4.98–9.90 | P2 the problem | **page turn** (4.63–4.98) | the trolley drives in snow (street lines slide) while the windshield ices over; on "open" (5.72) the side window slides down, the driver's head comes out, and "window opened to see" appears; on "stopping" (7.66) the street stops and the "STOPPED · to clear the glass" stamp lands; on "clear" (8.26) a mitten wipes an oval clear |
| 9.90–14.52 | P3 the 1903 patent | **slide swap** (9.55–9.90) | the real patent sheet (header, Fig. 1, Fig. 2); the "PATENT 743,801 · NOV. 10, 1903" stamp on "patent" (10.72); the **magnifier (only use)** lands on the rubber cleaners (T) on "rubber" (11.97) and tracks down the arm to 13.9; note "Fig. 2: rubber blades (T) on a swinging arm" |
| 14.52–18.83 | P4 how it worked | **hard cut** on "Turn" (14.52) | the window from Fig. 2 with snow; the INSIDE handle inset lights on "handle" (14.75); the arm swings from the top-right pivot (period 1.7 s) and the swept arc clears, with one swish per half swing; on "springs" (16.15) a side-view inset shows a spring pressing the rubber onto the glass; "cleared arc (patent Fig. 2, area a)" label on "sweeps" (17.60) |
| 18.83–21.63 | P5 balance | **page turn** (18.48–18.83) | the arm sags to the blade side ("heavy on the blade side"); counterweight c slides onto the extension on "counterweight" (19.02); the arm levels and a balance bubble centres on "balanced" (20.68): "balanced on both sides of the pivot" |
| 21.63–26.40 | P6 the lesson | **slide swap** (21.28–21.63) | small portrait; cards land: "EVERYONE ACCEPTED · stopping to clear snow" on "hassles" (22.38), "SHE SAW · a problem worth a tool" on "problems" (24.04), "HER TOOL · a wiper worked from inside" plus a check on "tool" (25.11) |
| 26.40–30 | P7 CTA card | **slide swap** (25.90–26.40) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.1 LUFS integrated, −1.9 dBTP true peak, LRA 3.2.
- **Captions:** 12 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 676 px, so the plate runs x 170–910 and y 350–510; the top 300 px stays clear.
- **English ASR on the export** (faster-whisper tiny.en; `qa/asr_final.txt`):
  - It matches the script word for word for S1–S6.
  - The CTA came out as "Download RM to support lively hadtools".
  - On the isolated CTA segment (25.5–30 s) of the same export, tiny.en heard "Download RM to support livelihood tools." and small (en) heard "Download RUMB to support livelihood tools.", so the full-file slip is the tiny model's context error. "Aarambh" is shown on the CTA card.
- **Word-to-event sync** (`qa/sync.txt`): 23 events, each 0–0.3 s before or on its word. The CTA card lands at the placed S7 start of 26.40; ASR stamps "Download" early, at 25.72.
- **Contact sheets:** `qa/contact_representative.jpg` and `qa/contact_transitions.jpg`.
- **Fix before the final render:** on P2, the driver's lean and the hand-wipe did not read clearly. Now a head appears at the opened side window and a mitten wipes a growing oval. Previews were checked before the single full render.

## Remaining limits
- **No human listening:** I can't listen here. The voice was checked by ASR and espeak phonemes only.
- **Portrait licence:** it rests on the Commons {{PD-old}} tag for an unknown-author photo of c. 1910, plus its identity match with NIHF's image. The original source page (OEPM museum) no longer resolves, so the PD basis is the Commons record's and could not be re-checked at the source.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
