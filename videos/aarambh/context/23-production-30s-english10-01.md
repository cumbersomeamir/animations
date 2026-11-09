# 23 — English-10 30 s #01: Josephine Cochran and her 1886 hand-operated dish-washing machine (U.S. Patent 355,139)

- **Batch:** 2026-11-09-english-10
- **Output:** `videos/aarambh/production/30s/2026-11-09-english-10/aarambh-30s-english10-01.mp4`
- **sha256:** `f001542cafcba4b5244ab060dac91fc0d369483581f4097ca1021754e7ca8eaf`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only. No Hindi audio was reused.
- **Recipe:** the most recently accepted English style (english-06 to 09 → `11`).
  - Archive Light Table, app palette, paper pages, page turns, slide swap, hard cut, single magnifier, Aarambh CTA card.
  - Mono kickers and stamps, Fraunces titles, Inter 800 at 54 px for captions; Meshline voice; no mascot (as in every accepted episode since the genre change).
  - Renderer: `production/30s/2026-11-09-english-10/src/render.mjs`, built from the english-09 core. No Three.js and no Blender.
- **Pre-flight (2026-11-09):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `bb36b17` (english-09), clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished or queued job existed (english-09 was pushed), and earlier renders are untouched.

## Subject change (why this is not Mary Anderson)
- **Already covered:** Mary Anderson and the 1903 windshield-wiper patent (U.S. 743,801) was episode 08 (english-06, 2026-11-06, record `19`).
- **The brief's rule:** "if this topic was covered choose a different subject in the same fixed genre", so a second Anderson episode was not made.
- **Replacement:** Josephine Cochran (also spelled Cochrane), never covered (grep for cochran/dishwash found nothing). It keeps everything the brief asked for:
  - a famous inventor with a real licensed portrait and authentic patent imagery on distinct pages;
  - an everyday problem (chipped heirloom china, tedious hand-washing);
  - a hand-operated solution explained from the patent itself;
  - the same lesson: noticing an everyday friction can inspire an invention.
- **No rejection anecdotes:** none are told. The USPTO story mentions investors who wanted her to hand over control; it is left out as off-lesson.

## Feedback applied
- **Real licensed portrait:** a 19th-century photo of her as a young woman, public domain (Wikimedia Commons, PD-US-expired / PD-old-70). The USPTO story page shows the same photo, captioned "Josephine Cochran as a young woman".
- **Authentic 1886 patent imagery on distinct pages:**
  - P2: drawing sheet 1 (Fig. I with the operating lever and handle 17), with gold underlines on "J. G. COCHRAN." and "Patented Dec. 28, 1886."
  - P3: three rack figures under the single magnifier: Fig. XI (plates), Fig. XIII (glasses) and Fig. IX (knives).
- **Immediate, intriguing first second:** from frame 0, a brush scrubs a blue-rimmed heirloom plate in suds and a hairline crack grows. On "chipping" (1.21 s) a chip snaps off the rim and flies, with a "CHIPPED" stamp. The portrait is on screen by 0.5 s and the name plate lands at 1.33 s.
- **Problem → hand-operated solution, verified in the patent:**
  - P2: her machine cleaned with water pressure, where earlier machines used scrubbers (USPTO).
  - P3: wire racks fitted to plates, glasses and knives held them in place inside a crate.
  - P4 demonstration, after patent Figs. I–II: the hand lever strokes a force-pump, soap-suds jets spray up from the jet pipe, and the crate turns slowly. A small selector then switches the lever to the clear hot-water pump (the heater is under that tank) for the rinse. When the strokes stop, steam rises as the dishes dry from their own heat.
  - One explanation pill changes with each spoken step.
- **Lesson:** "Lesson: notice everyday friction; it can inspire an invention."
  - Cards: FRICTION (chipped heirloom china) → FIX (fitted racks + water jets) → INVENTION (U.S. Patent 355,139, 1886).
  - Then a prompt: "Your turn: which chore keeps going wrong?"
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.60 s (last 3.4 s), with the card sliding in at 26.10 s. No other app name appears.
- **Voice:** the Meshline/Recall character. Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98; local and free; no imitation.
- **Music:** quiet under speech, ducked.

## Final script (English; 68 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | Hand-washing was chipping Josephine Cochran's heirloom china. | — |
| S2 | 3.84 | Her 1886 patent cleaned dishes with water pressure, instead of scrubbing. | "eighteen eighty-six" |
| S3 | 9.05 | Wire racks held plates, glasses and knives in place inside a crate. | — |
| S4 | 13.55 | A hand lever pumped soapy jets while the crate slowly turned; then hot water rinsed, and the dishes dried from their own heat. | — |
| S5 | 21.70 | Lesson: notice everyday friction; it can inspire an invention. | — |
| S6 | 26.60 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

**Pronunciation and ASR checks:** every line was synthesised and checked with tiny.en and small before placement. Both models heard "Cochran's", "heirloom", "1886" and "friction" correctly.
- A longer opening ("In the eighteen-eighties, hand-washing…", 4.78 s) was also heard correctly, but it did not fit 30 s. The 1880s date is on screen instead.
- Two S3 variants were tested; both were heard correctly.

## Sources and claim map (accessed 2026-11-09)
- **[P] U.S. Patent 355,139, Josephine G. Cochran, of Shelbyville, Illinois, "Dish-Washing Machine".**
  - Letters Patent dated December 28, 1886; application filed December 31, 1885, Serial No. 187,276; 8 drawing sheets.
  - USPTO full-image PDF (11 pages): https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/0355139 . Record: https://patents.google.com/patent/US355139A/en (Google Patents returned 503 from this container, so the USPTO scan was read directly).
- **[U] USPTO, Journeys of Innovation, "I'll do it myself"** (story by Eric Atkisson and Jocelyn Ram): https://www.uspto.gov/learning-and-resources/journeys-innovation/historical-stories/ill-do-it-myself
- **[C] Wikimedia Commons, File:Josephine Garis Cochrane.png:** https://commons.wikimedia.org/wiki/File:Josephine_Garis_Cochrane.png (licence templates {{PD-US-expired}}{{PD-old-70}}; "Portrait of Josephine Garis Cochrane as a young woman", 19th century)

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| Hand-washing was chipping her heirloom china | U | "she loved to use a collection of heirloom dishes … but was distressed when she discovered the servants had chipped the dishes while washing them. … Initially, Josephine resolved to wash the fine china herself, but soon became tired of this tedious task." |
| Shelbyville, Illinois; 1880s | P; U | P: "residing at Shelbyville, in the county of Shelby and State of Illinois"; U: widowed "in 1883 shortly after conceiving the idea of a dishwasher"; application filed Dec. 31, 1885 |
| 1839–1913 (name plate) | U | "Born March 8, 1839 in Ashtabula County, Ohio"; "On August 3, 1913, at age 74, she died at home in Chicago" |
| Patent 355,139, Dec. 28, 1886; filed Dec. 31, 1885; "J. G. COCHRAN." | P | header "Specification forming part of Letters Patent No. 355,139, dated December 28, 1886. Application filed December 31, 1885"; drawing sheets "J. G. COCHRAN. DISH WASHING MACHINE. No. 355,139. Patented Dec. 28, 1886." |
| Cleaned with water pressure, instead of scrubbing; earlier machines used scrubbers | U; P | U: "Although she was not the first to invent a dishwashing machine, hers was the first to use water pressure rather than scrubbers to clean the dishes, and it had racks specifically fitted to hold the dishes in place."; P: "a continuous stream of either soap-suds or clear hot water is supplied to a crate holding the racks or cages containing the dishes while the crate is rotated" |
| Wire racks held plates in place (Fig. XI: "wires hold plates") | P | Figs. XI and XII, "a rack for plates, saucers, &c.": wires 60 "serve as supports for the plates placed in the cage in vertical position" |
| … glasses (Fig. XIII: "springs grip glasses") | P | Figs. XIII–XV, "a rack for glass and other hollow articles": spiral springs 69 "surround the necks and bases of hollow articles, and by pressing them gently against the top and bottom of the cage hold them in position while the cage is being turned within the crate" |
| … and knives (Fig. IX: "clamp bars hold knives") | P | Figs. IX and X, "A rack or cage for knives and similar articles": "Articles to be washed are laid upon the bars 56 of the frame, and the clamp-bars 54 are then placed over them and are held down by the racks 57" |
| … inside a crate | P | "38 … is a cylindrical wire crate, wherein the cages containing the dishes to be cleaned are placed." |
| A hand lever pumped | P | "15 is the main operating-lever of the machine, pivoted at 16 to the frame of the box, and provided at its other end with a handle, 17"; the lever works pump-pistons 3 4 through segment-racks 19 |
| Soapy jets | P | "water-jet pipes extending from the pumps 3 4 … provided with a series of jet-holes"; "soap-suds from one pump" |
| While the crate slowly turned | P | "During the continuous operation of the lever 15, and while one of the pumps 3 4 is supplying a steady stream of water through the pipes 7 to dishes in the crate 38, the shaft 46 is by its connection with the lever 15 rocked, and the disk 45 and crate 38 slowly rotated, so that all the dishes in the crate are exposed to the stream of water and cleaned." |
| Then hot water rinsed (selector switch) | P | "After they are thoroughly cleaned by soap-suds from one pump, the racks 11 19 are shifted so as to bring the other clear-hot-water pump into operation … a stream of hot rinsing-water is poured onto the dishes until they are perfectly clean." The small lever 21 throws one segment-rack 19 into gear with its pump's piston-rod rack 11. |
| Heater under the hot-water tank (demo) | P | "An oil or other stove or heater may be placed under one or other of the tanks 2 2, which it is preferred to employ for containing the hot water." |
| The dishes dried from their own heat | P | "When they are dry from their own heat they are ready to be put away or immediately again used upon the table, no draining or drying being necessary after their removal from the machine." |
| 1893 World's Fair: her machine won the highest award (P5 note) | U | "The exposition's judges were so impressed with the dishwashing machine that they awarded it the highest prize for 'best mechanical construction, durability, and adaptation to its line of work.'" |
| Lesson: notice everyday friction; it can inspire an invention | interpretive, from U (chipped china and a tedious chore led to her machine) | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that she invented the first dishwasher (the USPTO says she was not the first)
- the "I'll do it myself" quotation (the USPTO attributes it, but it is not voiced)
- any rejection, investor or sales anecdotes
- KitchenAid, Hobart or company lineage
- prices, the 1917 second patent, or electric models
- her NIHF induction: invent.org slugs returned 404 here, so it is not cited

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/josephine-cochran-portrait-pd.jpg` | portrait of Josephine Cochran as a young woman (19th century) | Wikimedia Commons "File:Josephine Garis Cochrane.png", 500 px rendition (the original returned 429) | {{PD-US-expired}}{{PD-old-70}} on Commons. **Identity:** the same photo is on the USPTO story page [U], captioned "Josephine Cochran as a young woman". |
| `assets/us355139-sheet1-fig1-lever.png` | patent drawing sheet 1: header and Fig. I (operating lever, handle 17, pumps) | cropped from the USPTO PDF [P] | U.S. patent drawings are generally not subject to copyright |
| `assets/us355139-fig11-plate-rack.png` | Fig. XI, the rack for plates and saucers (sheet 6) | as above | as above |
| `assets/us355139-fig13-glass-rack.png` | Fig. XIII, the rack for glass and hollow articles, with springs 69 (sheet 7) | as above | as above |
| `assets/us355139-fig9-knife-rack.png` | Fig. IX, the rack for knives and similar articles (sheet 5); a fragment of Fig. VIII above the label was masked white | as above | as above |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Original Canvas2D drawings, labelled "ILLUSTRATION":** the hook (plate, brush, suds, chip), the water-pressure/scrubbers cards, the working-machine demonstration (after patent Figs. I–II, simplified) and the lesson cards.

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–3.84 | P1 the chore | table lights flicker on (0–0.4); scrubbing from frame 0 | portrait lands (0.02–0.5); a brush scrubs the blue-rimmed plate in suds and a crack grows (0.3–1.2); on "chipping" the chip snaps off and flies (1.21), with a CHIPPED stamp (1.31); name plate "Josephine Cochran · inventor · Shelbyville, Illinois · 1839–1913" (1.33); "heirloom china" pill (2.61) |
| 3.84–9.05 | P2 the 1886 patent | **page turn** (3.49–3.84) | the real sheet 1; gold underline on "J. G. COCHRAN." (3.83), then on "Patented Dec. 28, 1886." (4.08); "PATENT 355,139 · DEC. 28, 1886" stamp on "patent" (4.82); the HERS card lights and jets spray a plate on "water" (6.39), with a check (6.78); the EARLIER MACHINES (scrubbers) card dims and a red X is drawn over "instead of scrubbing" (7.75–8.84) |
| 9.05–13.49 | P3 the racks | **slide swap** (8.70–9.05) | Fig. XI on the page; the **magnifier (only use)** lands on its plate-support wires (9.63); "wires hold plates" (9.88); Fig. XIII drops in on "glasses" (10.82), and the magnifier glides to its springs (10.97–11.42), "springs grip glasses"; Fig. IX drops in on "knives" (11.28), "clamp bars hold knives"; "racks go in the crate" (12.71) |
| 13.49–21.70 | P4 how it worked | **hard cut** (13.49, light flash) | the lever strokes every 0.77 s from 13.74 and the active piston moves: "a hand lever works a pump"; soap-suds jets spray the crate, "soap-suds jets from below" (14.59); the crate turns slowly, with a rotation arrow, "the crate turns slowly" (15.71); the selector flips to the hot-water pump and the jets turn clear (17.47), "switch: clear hot-water rinse"; the strokes stop (19.62) and steam rises, "dishes dry from their own heat" (19.47) |
| 21.70–26.60 | P5 the lesson | **page turn** (21.35–21.70) | FRICTION card on "everyday" (22.54); FIX card on "inspire" (24.22); INVENTION card on "invention" (24.78), plus a chime; the portrait and the 1893 award note; "Your turn: which chore keeps going wrong?" (25.03) |
| 26.60–30 | P6 CTA card | **slide swap** (26.10–26.60) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.1 LUFS integrated, −1.5 dBTP true peak, LRA 2.8.
- **Captions** (`qa/caption_bounds.txt`): 13 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 761 px, so the plate runs x 127–953 and y 350–510; the top 300 px stays clear.
- **ASR on the export:**
  - **tiny.en** (`qa/asr_final.txt`) matches the script word for word except "Hand washing" (no hyphen) and "RM" for Aarambh.
  - **small (en)** (`qa/asr_small_crosscheck.txt`) gives the same except "Handwashing", "China" and "RUM".
  - The card shows the app name.
- **Word-to-event sync** (`qa/sync.txt`): 29 events, each from 0.55 s before to 0.15 s after its word. The hard cut is at 13.49, 0.19 s before "A hand lever".
- **Contact sheets:** `qa/contact_representative.jpg` (every 1 s, at x.5) and `qa/contact_transitions.jpg` (18 transition, event and edge frames).
- **Fixes:**
  - **Before the full render:**
    - P1: the plate and portrait were enlarged, and the brush now fades out after the chip so it no longer covers the stamp.
    - P2: the date underline was moved under the text, not through it, and the sheet was enlarged.
    - P3: the magnifier was raised off the knives pill.
    - P4: the tank labels moved into the tanks, a pipe was re-routed off the "soap-suds" label, and the ILLUSTRATION note moved out of the lever's swing.
    - Fig. IX was re-cropped so its label is whole without the Fig. VIII fragment.
  - **After the first full render** (one video-only re-render): the "pumps" label's descenders touched the active cylinder's outline, so the label was raised 12 px. The audio stream is unchanged (md5 `ee9392f2f78d192cebe65bca38c201ce` before and after), so the ASR files apply to the final export.
  - No defects on the final sheets.

## Remaining limits
- **No human listening:** I can't listen here. The voice was checked by two ASR models only.
- **Simplified demo:** it is a schematic, not a scale drawing.
  - The patent's lever drives the pumps through segment-racks and rocks the crate through a friction disk and clutches.
  - The demo shows the lever, the active piston, the jets, the turning crate and the selector, but not every linkage.
- **Hall of Fame record not opened:** the NIHF inductee page could not be opened (404 on the tried slugs), so the record relies on the patent and the USPTO's own story.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
