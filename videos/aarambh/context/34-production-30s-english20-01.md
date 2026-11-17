# 34 — English-20 30 s #01: Alice Ball and chaulmoogra oil, "HER METHOD. HIS NAME." (first episode under the 2026-11-17 feedback addendum in `25`)

- **Batch:** 2026-11-17-english-20 (the user's brief "NEXT EPISODE — English batch20")
- **Video:** `videos/aarambh/production/30s/2026-11-17-english-20/aarambh-30s-english20-01.mp4`
  - sha256 `4725b3937de045c986a7fefc0a589447021a0087d9883f78c0613e284c3f4d4a`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-17-english-20/aarambh-30s-english20-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `a7c3cc4815f8e74648797c9ad213c4021702f72f180bea104d24f93cf98c2747`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-17):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `c658329` (english-19), clean tree; account checked against CLAUDE.md. Disk had 21 GB free, so no RAM frame cache was needed. The batch folder was created after `test ! -e`. Batch 19 and all earlier outputs are untouched.
- **Topic:** fresh. A grep for "alice ball", chaulmoogra, leprosy, hansen, "arthur dean" and hollmann over `videos/aarambh` found nothing, so the brief's subject was used.
- **Isolation:** the brief also contained style notes for other apps. They were not used or recorded here; only Aarambh's own context, skill, palette, narrator and CTA were applied.
- **Feedback applied:** "too much information being displayed at once, too much text, motion graphics can be more appealing also need a super cool thumbnail". It is persisted as the 2026-11-17 addendum in `25` (summary in `11`) and applied as follows:
  - every scene has one moving idea and at most one short label (several scenes have none);
  - the chemistry is shown by moving objects;
  - frame 0 is a bold hero composition: a big glowing drop on a syringe needle beside the real portrait, with 4 huge two-colour words.

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real 1915 photograph of Alice Ball (left, tilted print);
  - a large glowing drop of amber oil hanging from a syringe needle (right, illustration);
  - the words "HER METHOD. / HIS NAME." (4 words) below.
- **No intro:** no logo, flicker, fade from black or fade-in.
- **No caption at frame 0:** the first caption appears at 0.22 s. The syringe was shortened so that later captions never overlap it.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.08 s.
- **Thumbnail = frame 0:** rendered from the same `drawFrame(0)`; frame 0 differs from it by 1.44/255 (H.264 encoding only). Mean luminance 59.7/255.
- **Truthful words:**
  - "Her method": Hollmann's 1922 paper calls the preparation "Ball's Method".
  - "His name": Dean and his coauthors published on the esters without crediting her, and the esters "came to be referred to as Dean's derivatives" (Parascandola). The University of Hawaiʻi's own Dean Hall page says Dean "plagiarized the groundbreaking work of Alice Ball".

## Story structure (rules `25`, incl. the 2026-11-17 addendum)
| beat | time (s) | narration | picture (on-screen text) |
|---|---|---|---|
| hook | 0.05–4.94 | "At 23, Alice Ball made a leprosy oil usable, then lost the credit." | frame-0 composition; the drop swells and glints; slow push (none beyond frame 0) |
| the obstacle | 5.20–9.32 | "Swallowed, it caused nausea; injected, it hurt and barely absorbed." | hard cut with flash (5.14): a spoon of thick oil, a slow heavy drip, queasy waves; then tissue layers, the needle from above, the oil sits as a lump with a red pain pulse (none) |
| proof 1: the fix | 9.60–14.34 | "She turned its fatty acids into ethyl esters: thin oils the body absorbs." | whip pan (9.40–9.60): the oil molecule's three chains split off ("fatty acids"); a teal ethyl cap snaps onto each ("ethyl esters"); then thin droplets flow from the needle and spread out and fade into the tissue (absorbed) |
| proof 2: credit lost | 14.62–19.08 | "She died at 24; her supervisor published the work without crediting her." | push (14.32–14.57): her portrait and plate "ALICE BALL 1892–1916"; pages slide over her name; it dims; "Dean's derivatives" appears on the pages |
| proof 3: credit given | 19.36–22.54 | "A 1922 paper called it Ball's Method." | push (19.06–19.36): Hollmann's real 1922 page; gold underlines on "Miss Alice Ball" and "BALL'S METHOD" ("Dr. Harry Hollmann, 1922") |
| payoff | 22.84–25.91 | "Lesson: a remedy only helps if patients can take it." | page turn (22.49–22.84): circular portrait, ALICE BALL, card "make it usable", a small glowing drop |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) |

## Final script (English; 71 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | At 23, Alice Ball made a leprosy oil usable, then lost the credit. | — |
| S2 | 5.20 | Swallowed, it caused nausea; injected, it hurt and barely absorbed. | — |
| S3 | 9.60 | She turned its fatty acids into ethyl esters: thin oils the body absorbs. | — |
| S4 | 14.62 | She died at 24; her supervisor published the work without crediting her. | — |
| S5 | 19.36 | A 1922 paper called it Ball's Method. | — |
| S6 | 22.84 | Lesson: a remedy only helps if patients can take it. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

Drafts were about 2 s too long. These were cut: a separate question line ("What was wrong with the oil?"), the "The problem:" lead-in, and "A doctor's" before "1922 paper". The visuals carry the question.

## Sources (accessed 2026-11-17)
- **[PAR] John Parascandola, "Chaulmoogra Oil and the Treatment of Leprosy"** (Pharmacy in History, 2003; PDF hosted by the U.S. National Library of Medicine): https://lhncbc.nlm.nih.gov/LHC-publications/PDF/pub2003048.pdf
- **[HOL] Harry T. Hollmann, "The fatty acids of chaulmoogra oil in the treatment of leprosy and other diseases",** *Archives of Dermatology and Syphilology*, 1922 (p. 95 shown). The arboretum page (UH-A) links a copy: https://scispace.com/pdf/the-fatty-acids-of-chaulmoogra-oil-in-the-treatment-of-133erdu3mq.pdf
- **[UH-A] University of Hawaiʻi at Mānoa Campus Arboretum, "Chaulmoogra Tree":** https://manoa.hawaii.edu/campusarboretum/chaulmoogra-tree/
- **[UH-D] University of Hawaiʻi at Mānoa, "Dean Hall":** https://manoa.hawaii.edu/campus-environments/dean-hall/
- **[UH-N1] UH News, "UH celebrates Alice Augusta Ball Day in Hawaiʻi, February 28" (2022):** https://www.hawaii.edu/news/2022/02/28/alice-ball-day-february-28/
- **[UH-N2] UH News, "UH graduate honored alongside Madam Curie and Florence Nightingale" (2020):** https://www.hawaii.edu/news/2020/02/04/alice-ball-honored-london-building-facade/
- **[POR] Wikimedia Commons, "Alice Augusta Ball.jpg"** (photograph, 1915; public domain; 269x381): https://commons.wikimedia.org/wiki/File:Alice_Augusta_Ball.jpg
- Smithsonian Magazine's article returned 403 to the fetcher and was not used.

## Claim map (documented, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| At 23 | documented | UH-N1: "at the age of 23 discovered an effective treatment for Hansen's disease (leprosy) using oil from the Chaulmoogra tree"; UH-A: born July 24, 1892, died December 31, 1916. |
| made a leprosy oil usable | documented | HOL: "Miss Ball solved the problem for me by making the ethyl esters of the fatty acids found in chaulmoogra oil"; PAR: the esters "lent themselves readily to intramuscular injections and were readily absorbed". Scope: PAR notes that, since she did not publish, "it is not certain exactly how far she got"; the video relies on Hollmann's contemporary credit. |
| then lost the credit | documented | PAR: "Dean and his coauthors do not credit Ball for any of the work that they reported in a series of publications on Chaulmoogra between 1920 and 1922"; UH-A: "her work was credited to her supervisor and dean of the college"; UH-D: "Arthur Dean plagiarized the groundbreaking work of Alice Ball". |
| Swallowed, it caused nausea | documented | PAR: "effective doses of the oil tended to have a very nauseating effect on the patient". |
| injected, it hurt and barely absorbed | documented | PAR: injection "could be very painful. The injections often produced severe local reactions"; earlier hypodermic use "did not work well because the oil was not satisfactorily absorbed". |
| She turned its fatty acids into ethyl esters | documented | HOL (above) and the heading "BALL'S METHOD OF MAKING ETHYL ESTERS OF THE FATTY ACIDS OF CHAULMOOGRA OIL". |
| thin oils the body absorbs | documented | PAR, on the esters as described by Dean and coworkers: "thin fluid oils that lent themselves readily to intramuscular injections and were readily absorbed". The popular "water-soluble" wording (UH-A) was not used. |
| She died at 24 | documented | PAR: she "died at the very young age of 24 on December 31, 1916". The cause is not stated. |
| her supervisor published the work without crediting her | documented | PAR: "Her work on Chaulmoogra was then taken up by her supervisor, Arthur Dean … Dean and his coauthors do not credit Ball"; "The ethyl esters came to be referred to as Dean's derivatives" (shown on screen). |
| A 1922 paper called it Ball's Method | documented | HOL (the real page is shown and underlined); PAR: "Hollmann clearly gives her credit". |
| Lesson: a remedy only helps if patients can take it | interpretive | A teaching takeaway from the story: the oil was known, but patients could not tolerate or absorb it until it was made usable. |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative:** the drop, syringe, spoon, queasy waves, tissue layers, pain glow, molecule (three chains on a backbone, a simplified picture of an oil molecule), the ethyl caps, the spreading droplets, the pages (blank lines, no invented text), plates and cards.
- **Deliberately NOT claimed:**
  - "cure" (UH-N2 quotes a UH librarian: "not a cure, but a treatment that worked"; chaulmoogra was abandoned for sulfones in 1947 at Carville, per PAR);
  - "water-soluble";
  - any cause of her death;
  - a number of patients treated or released;
  - that she was the first to use chaulmoogra oil (it had been used for a long time);
  - "Dean Method" as a historical name (PAR documents "Dean's derivatives");
  - any portrait of Dean or Hollmann (none in the public domain was found; Dean is not depicted).

## Images
| file | what | source | licence |
|---|---|---|---|
| `assets/alice-ball-1915-pd.jpg` | Alice Augusta Ball, photograph, 1915 (269x381, original) | Commons (POR) | public domain |
| `assets/alice-ball-1915-pd-2x-lanczos.jpg` | the same image scaled 2x with Lanczos and a mild unsharp mask (538x762; no detail added) | made here from the above | public domain |
| `assets/hollmann-1922-archives-of-dermatology-p95-pd.jpg` | Hollmann 1922, p. 95, rendered at 200 dpi; the scan's download stamp at the foot of the page was cropped off | HOL | public domain (published 1922) |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

## Style (rule `25`, incl. the 2026-11-17 addendum; approved animation-direction skill, editorial mode)
- **On-screen words across the whole video:**
  - frame 0: "HER METHOD. HIS NAME.";
  - one label each: "fatty acids", "ethyl esters", the "ALICE BALL 1892–1916" plate, "Dean's derivatives" and "Dr. Harry Hollmann, 1922";
  - the lesson card: "ALICE BALL" and "make it usable".
  - Two scenes carry no label at all.
- **Motion that explains:** the drip and lump show why the oil failed; split, cap and spread show the fix; pages sliding over her name show the lost credit; underlines on the real paper show the credit given.
- **Transitions:** hard cut with flash (5.14), whip pan (9.40–9.60), push (14.32–14.57), push (19.06–19.36), page turn (22.49–22.84), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 6.4 MB.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 4.4.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.49 dBFS, flat factor 0; audio md5 `9742e3ac3e93e07df8ba26521756c143`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.44/255); mean luminance 59.7/255 (no fade from black); audio audible from 0.08 s.
- **Captions** (`qa/caption_bounds.txt`): 14 groups of at most 2 lines. The widest line is 649 px ("support livelihood tools."), so the plate runs x 145–855 and y 330–490.
- **ASR on the export:** both **small (en)** (`qa/asr_small_crosscheck.txt`) and **tiny.en** (`qa/asr_final.txt`) match the script word for word, except the app name ("RUMB"/"RM").
- **Word-to-event sync** (`qa/sync.txt`): 21 events. Word-triggered events lead their words by 0.05–0.57 s. Pacing windows are met (hook 0.05–4.94, obstacle 5.20–9.32, proof 9.60–22.54, payoff 22.84–25.91, CTA 27.10–29.87).
- **Frames:**
  - `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (28 frames, including t = 0).
  - All frames were reviewed on the first export.
  - After the frame-0 fix, the final export's opening frames and transitions were reviewed again. Scenes 2–7 are unchanged code (deterministic rendering), and their frames were spot-checked on the regenerated sheets.
- **Fixes:**
  - **Before the first full render:**
    - the drop now hangs from a downward needle;
    - the injections in scenes 2 and 3 come from above;
    - the Hollmann crop and both underlines were placed from PDF word boxes, so "Miss Alice Ball" and "BALL'S METHOD" are exact.
  - **After the first full render** (one video-only re-render; audio md5 unchanged at `9742e3ac…`): the caption plate overlapped the syringe top during 0.2–4.7 s, so the syringe was shortened and lowered.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done.
- **Small portrait:** the only public-domain portrait found is 269x381, shown at about 420 px from a 2x Lanczos copy, so it is slightly soft.
- **How far she got:** PAR notes "it is not certain exactly how far she got"; the narration follows Hollmann's contemporary credit.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
