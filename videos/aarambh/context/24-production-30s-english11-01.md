# 24 — English-11 30 s #01: Gideon Sundback, the 1917 "Separable Fastener" and the slider that designs the transition (U.S. Patent 1,219,881)

- **Batch:** 2026-11-09-english-11
- **Output:** `videos/aarambh/production/30s/2026-11-09-english-11/aarambh-30s-english11-01.mp4`
- **sha256:** `00156882edde88febff20428b144be783d3152faee907f982017d47ad3e9353f`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only. No Hindi audio was reused.
- **Recipe:** the most recently accepted English style (english-06 to 10 → `11`).
  - Archive Light Table, app palette, paper pages, page turns, slide swap, hard cut, single magnifier, Aarambh CTA card.
  - Mono kickers and stamps, Fraunces titles, Inter 800 at 54 px for captions; Meshline voice; no mascot (as in every accepted episode since the genre change).
  - Renderer: `production/30s/2026-11-09-english-11/src/render.mjs`, built from the english-10 core. No Three.js and no Blender.
- **Pre-flight (2026-11-09):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `a9e9173` (english-10), clean tree; account checked against CLAUDE.md; commits authored as "Claude". No unfinished or queued job existed (english-10 was pushed), and earlier renders are untouched.

## Subject change (why this is not Garrett Morgan)
- **Already covered:** Garrett Morgan's three-position traffic signal with its all-stop phase (U.S. 1,475,024) was episode 09 (english-07, 2026-11-06, record `20`).
- **The brief's rule:** "if this topic was covered choose a different subject in the same fixed genre", so a second Morgan episode was not made.
- **Replacement:** Gideon Sundback, never covered (grep for sundback/zipper found nothing). It keeps everything the brief asked for:
  - a famous inventor with a real licensed portrait and authentic patent pages, on distinct pages;
  - careful credit: he did not invent the first slide fastener. He made Whitcomb Judson's earlier one reliable, just as Morgan improved, rather than invented, traffic signals.
  - the requested lesson, carried by a mechanism. Open and closed rows of teeth are the endpoints; the slider is the designed transition between them.
- **Candidate considered:** Theophilus Van Kannel's revolving door (NIHF: "It served as an airlock") fits the lesson too. No openly licensed portrait was found, so Sundback was chosen.

## Feedback applied
- **Real licensed portrait:** Gideon Sundback, c. 1920, public domain (Wikimedia Commons, PD-old). It matches the likeness of NIHF's own (different) photo of him.
- **Authentic patent pages on distinct pages:**
  - P2: the full drawing sheet with gold underlines on "G. SUNDBACK." and "Patented Mar. 20, 1917.", plus Fig. 4 (the member) and Fig. 9 (the nested members).
  - P3: Fig. 1 (the slider on the stringers) under the single magnifier, with Fig. 2 ("the manner of locking and unlocking").
- **Immediate, intriguing first second:** a brass-toothed zipper closes from frame 0. The slider rises and the teeth snap shut behind it with gold flashes. The portrait is on screen by 0.5 s and the name plate by 0.85 s.
- **Credit stated first:** S1 says he "made Whitcomb Judson's earlier fastener reliable". A card reads "BEFORE · WHITCOMB JUDSON · clasp locker, 1890s · it lacked reliability (NIHF)", and a stamp reads "MADE IT RELIABLE".
- **Concrete demonstration:**
  - P3: on the real Fig. 1, gold arrows run down both stringer arms into the slider. The magnifier moves from the Y-shaped channel and cap point, to the throat where the rows meet, to the nested teeth.
  - P4: the slider is pulled back, the diverging channels part the rows, and a TEETH PARTED counter climbs tooth by tooth (0 → 48), with a soft tick per tooth.
- **Lesson:** "Lesson: design the transition between states, not just the two endpoints."
  - Diagram: open (endpoint) → the transition, the slider (gold, animated) → closed (endpoint); the endpoints dim on "not just".
  - Then a prompt: "Your turn: what is the in-between step?"
- **CTA:** Aarambh only, "Download Aarambh to support livelihood tools." It is spoken from 26.60 s (last 3.4 s), with the card sliding in at 26.10 s. No other app name appears.
- **Voice:** the Meshline/Recall character. Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98; local and free; no imitation.
- **Music:** quiet under speech, ducked.

## Final script (English; 65 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.30 | Gideon Sundback made Whitcomb Judson's earlier fastener reliable. | — |
| S2 | 4.59 | His 1917 patent uses identical, cup-shaped teeth that alternate between two tapes. | "nineteen seventeen" |
| S3 | 11.16 | The slider's Y-shaped channel steers both rows together, so each tooth nests in the next. | — |
| S4 | 16.99 | Pull it back, and the diverging channels part them again, tooth by tooth. | — |
| S5 | 21.36 | Lesson: design the transition between states, not just the two endpoints. | — |
| S6 | 26.60 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

**Wording changes:** both were found by ASR testing, with tiny.en and small, before placement.
- **S1:** the first draft named Judson's "clasp locker", which both models heard as "class blocker", a wrong word. It became "Judson's earlier fastener", and the term "clasp locker" stays on screen only.
- **"Sundback":** a hyphenated spelling and an "Engineer" prefix were tried. The plain spelling is heard exactly by small; tiny.en, which lacks the name, hears "Gideon's son back". On the final mix small heard "Sundbeck".
- **Lesson and demo lines:** tested in two lengths each. The 4.57 s lesson and the 4.07 s demo line ("…tooth by tooth") fit 30 s.

## Sources and claim map (accessed 2026-11-09)
- **[P] U.S. Patent 1,219,881, Gideon Sundback, of Meadville, Pennsylvania, assignor to Hookless Fastener Company, "Separable Fastener".**
  - Application filed August 27, 1914; patented Mar. 20, 1917.
  - USPTO full-image PDF (5 pages, incl. a 1932 disclaimer by the assignee limiting claims 1–3): https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/1219881 . Record: https://patents.google.com/patent/US1219881A/en
- **[N] National Inventors Hall of Fame, Gideon Sundback, "Modern Zipper", U.S. Patent No. 1,219,881:** https://www.invent.org/inductees/gideon-sundback
- **[C] Wikimedia Commons, File:Gideon Sundback.jpg:** https://commons.wikimedia.org/wiki/File:Gideon_Sundback.jpg ({{PD-old}}; "Gideon Sundback (1880-1954)", c. 1920, author unknown; uploaded from a news-site copy)
- **[N2] NIHF, Theophilus Van Kannel (considered, not used):** https://www.invent.org/inductees/theophilus-van-kannel

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| Gideon Sundback, engineer, 1880–1954 | N | "Swedish-born engineer Gideon Sundback"; "Born April 24, 1880 - Died June 21, 1954" |
| Meadville, Pennsylvania; 1910s | P | "Gideon Sundback, a subject of the King of Sweden, residing at Meadville, in the county of Crawford and State of Pennsylvania"; filed Aug. 27, 1914 |
| Made Whitcomb Judson's earlier fastener reliable; Judson's clasp locker, 1890s, lacked reliability | N | "improved on Whitcomb Judson's work, making the zipper practical and commercially successful"; "Judson, in 1891, created a clasp locker … Although initially successful, Judson's locker lacked reliability, so he hired Sundback to make it reliable and practical." |
| His 1917 patent; 1,219,881; Mar. 20, 1917; filed Aug. 27, 1914 | P | "1,219,881. Specification of Letters Patent. Patented Mar. 20, 1917. Application filed August 27, 1914"; drawing "G. SUNDBACK. SEPARABLE FASTENER. APPLICATION FILED AUG. 27, 1914." |
| Identical teeth ("every tooth alike") | P | "The locking members are all alike, and therefore interchangeable"; an object is "to provide one form of locking member for both stringers … instead of the different forms heretofore employed on the respective stringers" |
| Cup-shaped; each cup nests in the next | P | "projecting locking portions of elongated cup shape, so that the outside of one member nests within the recess of an adjoining member when in locked relation" |
| That alternate between two tapes | P | "the members on one stringer alternate with those on the other"; stringers "made of woven tape" |
| The slider's Y-shaped channel; the point between the channels | P | "6 represents the sliding cam operating device, which consists of two stamped sides 7 each having a Y-shaped channel forming a tongue"; "8 represents a cap having a point to fit between the diverging channels" |
| Steers both rows together, so each tooth nests in the next | P | "two flexible stringers are locked and unlocked by a sliding cam device mounted on both members"; "when the sliding operating device is moved back and forth, the locking members will be engaged and disengaged according to the direction of movement" |
| Pull it back, and the diverging channels part them again, tooth by tooth | P | "the locking being effected by movement in one direction and unlocking by an opposite movement"; "diverging channels". "Tooth by tooth" describes the members disengaging one after another as the slider passes them. |
| Fig. 2: "the manner of locking and unlocking" | P | "Fig. 2 is a detail view showing the manner of locking and unlocking" |
| National Inventors Hall of Fame, 2006 | N | "Inducted in 2006" |
| Lesson: design the transition between states, not just the two endpoints | interpretive, from P (open and closed rows are the endpoints; the sliding cam device performs the change between them) | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that Sundback invented the zipper outright (Judson's clasp locker and Elias Howe's 1851 closure came first)
- who coined the word "zipper" (NIHF names B. F. Goodrich; not used)
- teeth-per-inch figures, the S-L machine and World War I use (true per NIHF, but not needed)
- any quote from Sundback

## Images (real archival objects; drawings labelled "ILLUSTRATION")
| file | what | source | licence and identity |
|---|---|---|---|
| `assets/gideon-sundback-portrait-pd.jpg` | portrait of Gideon Sundback, c. 1920 (430x573) | Wikimedia Commons "File:Gideon Sundback.jpg" | {{PD-old}} on Commons. **Identity:** the Commons title; the likeness matches NIHF's photo of Sundback (a different image, not reused). |
| `assets/us1219881-sheet1.png` | the full drawing sheet: header, Figs. 1–9 | cropped from the USPTO PDF [P] | U.S. patent drawings are generally not subject to copyright |
| `assets/us1219881-fig1-slider.png` | Fig. 1, the slider (6, 7, 8) on the two stringers | as above | as above |
| `assets/us1219881-fig2-locking.png` | Fig. 2, the locking and unlocking detail; stray Fig. 8 labels at the right edge masked white | as above | as above |
| `assets/us1219881-fig4-member.png` | Fig. 4, one locking member with its recess | as above | as above |
| `assets/us1219881-fig9-nesting.png` | Fig. 9, the members nested; a Fig. 3 fragment above masked white | as above | as above |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Original Canvas2D drawings, labelled "ILLUSTRATION":** the zipper hook, the alternating-teeth strip, the opening demo (after patent Fig. 1, simplified) and the lesson diagram.

## Storyboard (as rendered; times from the English ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–4.59 | P1 the fastener | table lights flicker on (0–0.4); the zipper closes from frame 0 | the slider rises 0–3.9 and the teeth snap shut behind it with gold flashes; portrait lands (0.02–0.5); name plate "Gideon Sundback · engineer · Meadville, Pennsylvania · 1880–1954" (0.45); Judson card on "Whitcomb" (1.46); "MADE IT RELIABLE" stamp on "reliable" (3.56) |
| 4.59–11.16 | P2 the 1917 patent | **page turn** (4.24–4.59) | the real sheet; gold underlines on "G. SUNDBACK." (4.55) and "Patented Mar. 20, 1917." (4.72); "PATENT 1,219,881 · MAR. 20, 1917" stamp on "patent" (5.58); Fig. 4 lights, "every tooth alike", on "identical" (6.48); Fig. 9 lights, "each cup nests in the next", on "cup" (7.62); the two tapes slide together with alternating teeth, "teeth alternate sides", on "alternate" (8.86) |
| 11.16–16.93 | P3 the slider | **slide swap** (10.81–11.16) | real Fig. 1 and Fig. 2; the **magnifier (only use)** lands on the Y-shaped channel and cap point (11.91), "Y-shaped channel"; gold arrows run down both arms into the slider on "steers" (12.81), "rows steered together"; the magnifier glides to the throat on "together" (13.80–14.10), then to the nested teeth on "nests" (15.35–15.75), "each tooth nests" |
| 16.93–21.36 | P4 how it opens | **hard cut** (16.93, light flash) | the slider is pulled back from 17.05; the rows part above it with gold flashes on the teeth just released; "diverging channels" pill and leader follow the slider (17.94); the TEETH PARTED counter climbs 0 → 48 with ticks; legend: above slider open, below slider closed |
| 21.36–26.60 | P5 the lesson | **page turn** (21.01–21.36) | open → transition → closed diagram; the transition box turns gold on "design" (21.84), with a chime; arrows on "transition" (22.68); the endpoints dim and are labelled "endpoint" on "not" (24.34); "Your turn: what is the in-between step?" (24.54); portrait with NIHF 2006, the patent and the Judson credit |
| 26.60–30 | P6 CTA card | **slide swap** (26.10–26.60) | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −2.0 dBTP true peak, LRA 2.7.
- **Captions** (`qa/caption_bounds.txt`): 12 groups of at most 2 lines, Inter 800 at 54 px. The widest line is 737 px, so the plate runs x 139–941 and y 350–510; the top 300 px stays clear.
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script except "Sundbeck", "rose" (a homophone of "rows"), "end points" and "RUMB" for Aarambh.
  - **tiny.en** (`qa/asr_final.txt`) also hears "Gideon's son back", "all turn it" for "alternate" and "RM". tiny.en lacks the name, and small hears "alternate" correctly.
  - The captions show the right words, and the card shows the app name.
- **Word-to-event sync** (`qa/sync.txt`): 24 events. Word-triggered events lead their words by 0.10–0.59 s. The hard cut is at 16.93, 0.17 s before "Pull".
- **Contact sheets:** `qa/contact_representative.jpg` (every 1 s, at x.5) and `qa/contact_transitions.jpg` (18 transition, event and edge frames).
- **Fixes before the full render:**
  - Fig. 2 and Fig. 9 were re-cropped and masked so no neighbouring figure labels show.
  - The header underlines were moved below the text.
  - The magnifier's first stop moved to the cap point and channel mouth.
  - The demo's zipper box was shortened so it no longer overlaps the footer.
  - One full render; no defects on the final sheets.

## Remaining limits
- **Portrait provenance:** the Commons file is c. 1920 by an unknown author, uploaded from a news-site copy and tagged PD-old. A photo of that age published before 1931 is public domain in the U.S.; the publication record itself is not documented.
- **Simplified demo:** it is a schematic of the slider and teeth, not a scale drawing of the stamped members.
- **No human listening:** I can't listen here. The voice was checked by two ASR models only.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
