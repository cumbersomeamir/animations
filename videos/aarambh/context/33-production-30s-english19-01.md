# 33 — English-19 30 s #01: Mary Anning and her first ichthyosaur, "A MONSTER IN THE CLIFF?" (fifth episode under the first-frame addendum, `25`)

- **Batch:** 2026-11-17-english-19 (the user's brief "NEXT EDUCATIONAL EPISODE … next batch19 on 17 November 2026")
- **Video:** `videos/aarambh/production/30s/2026-11-17-english-19/aarambh-30s-english19-01.mp4`
  - sha256 `b75dd5278810de64499fb4179985f17de5e608304dd7ff99d6e5024e10a24d7e`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-17-english-19/aarambh-30s-english19-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `8ad6da84666d60a5f35dd139def2128b854b91dd84d01ae7d7a5752ebbce7513`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-17):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `27bb08d` (english-18), clean tree; account checked against CLAUDE.md. The batch folder was created after `test ! -e`. Batch 18 was already delivered and was not touched; earlier outputs are untouched.
- **Topic:** fresh. A grep for anning, ichthyosaur, plesiosaur and "lyme regis" over `videos/aarambh` matched only "planning"/"hanning" substrings, so the brief's subject was used.
- **Topic line vs brief:** the title says "a creature nobody believed existed". The sources support a narrower version: when her first ichthyosaur was dug out, "scientists thought it was a crocodile" and "most people assumed that unearthed, unrecognisable creatures had simply migrated to far-off lands" (NHM). Cuvier's suspicion that a find was fake concerns her later plesiosaur (1823), which was not voiced. The narration therefore says "Locals called it a monster; scientists guessed a crocodile", not "nobody believed".

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real portrait of Mary Anning (before 1842, Natural History Museum, London; shown cropped to her face, cape and hammer) as a tilted print;
  - in front of it, Everard Home's real 1814 plate of the ichthyosaur skull that Joseph and Mary found;
  - the words "A MONSTER / IN THE CLIFF?" (5 words, large) below.
- **No intro:** no logo, flicker, fade from black or fade-in. The scene's first state is drawn complete.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.09 s (`qa/first_frame.txt`).
- **Thumbnail = frame 0:** rendered from the same `drawFrame(0)`. Frame 0 of the export differs from it by 1.44/255 mean absolute difference (H.264 encoding only). Mean luminance 77.9/255.
- **Truthful words:** NHM: "everyone in town thought that she'd discovered what must have been a monster". The question mark keeps it a question; the story answers it (an extinct sea reptile).

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| hook | 0.05–4.55 | "As a girl, fossil hunter Mary Anning dug a five-metre skeleton from a cliff." | frame-0 composition; slow push; light sweeps over the portrait and the skull plate |
| escalation and question | 4.85–9.20 | "Locals called it a monster; scientists guessed a crocodile. What was it?" | hard cut with flash (4.79) to the skull plate, close; plates "monster?", "crocodile?"; they give way to a big "?" |
| proof 1: who found what | 9.50–12.70 | "Her brother found the skull; she spent months freeing the body." | whip pan (9.30–9.50) to the dig: the skull plate above, plate "JOSEPH · skull · 1811"; below, Home's plate of part of the skeleton under rock; plate "MARY · body · 1812"; the rock is chipped away to free the body |
| proof 2: what it was | 13.00–17.01 | "Experts later named it Ichthyosaurus: an extinct sea reptile." | push (12.70–12.95): a stylised ichthyosaur glides in (its big ringed eye echoes the skull plate); "Ichthyosaurus", "fish lizard"; the animal turns to stone; stamp EXTINCT / SEA REPTILE |
| proof 3: what it changed | 17.30–21.82 | "Her finds inspired the first scene of ancient life drawn from fossils." | push (17.00–17.30) to De la Beche's real *Duria Antiquior* (1830); slow push to its ichthyosaur; gold ring; plate "Duria Antiquior · 1830 / drawn from fossils" |
| payoff | 22.15–25.97 | "Yet papers often skipped her name. Lesson: credit the finder." | page turn (21.80–22.15) to a cream page: her own 1823 letter with her plesiosaur sketch ("her own sketch, 1823"); circular portrait; MARY ANNING dims and is struck through, then is restored in gold with the card "credit the finder" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) to the Aarambh card |

## Final script (English; 74 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | As a girl, fossil hunter Mary Anning dug a five-metre skeleton from a cliff. | — |
| S2 | 4.85 | Locals called it a monster; scientists guessed a crocodile. What was it? | — |
| S3 | 9.50 | Her brother found the skull; she spent months freeing the body. | — |
| S4 | 13.00 | Experts later named it Ichthyosaurus: an extinct sea reptile. | — (the plain spelling was pronounced well; a respelling was worse) |
| S5 | 17.30 | Her finds inspired the first scene of ancient life drawn from fossils. | — |
| S6 | 22.15 | Yet papers often skipped her name. Lesson: credit the finder. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

The first draft (about 2 s too long) also said "since early childhood" and "Locals saw a monster" (misheard by ASR). Childhood is carried by "As a girl, fossil hunter…" and the visuals.

## Sources (accessed 2026-11-17)
- **[NHM] Natural History Museum, London, "Mary Anning: the unsung hero of palaeontology":** https://www.nhm.ac.uk/discover/mary-anning-unsung-hero.html
- **[UCMP] University of California Museum of Paleontology, "Mary Anning (1799–1847)":** https://ucmp.berkeley.edu/history/anning.html
- **[POR] Wikimedia Commons, "Mary Anning painting.jpg"** (portrait with her dog Tray and Golden Cap, before 1842, Natural History Museum, London; artist uncertain, credited to "Mr. Grey" in Tickell's biography): https://commons.wikimedia.org/wiki/File:Mary_Anning_painting.jpg
- **[HOME] Everard Home, *Philosophical Transactions of the Royal Society*, 1814: plates of the skull and part of the skeleton.** Commons "AnningIchthyosaurSkull.jpg" (https://commons.wikimedia.org/wiki/File:AnningIchthyosaurSkull.jpg) and "Anning 1st ichthyosaur skeleton.jpg" (https://commons.wikimedia.org/wiki/File:Anning_1st_ichthyosaur_skeleton.jpg).
- **[DURIA] Henry De la Beche, *Duria Antiquior* (1830):** https://commons.wikimedia.org/wiki/File:Duria_Antiquior.jpg
- **[LETTER] Mary Anning, autograph letter with a sketch of her plesiosaur, 26 December 1823** (Wellcome Collection, https://wellcomecollection.org/works/cezbevj4): https://commons.wikimedia.org/wiki/File:Mary_Anning_Plesiosaurus.jpg

## Claim map (documented, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| As a girl, fossil hunter Mary Anning | documented | NHM: "By the time she was five or six, Mary was his [her father's] fossil-collecting sidekick"; "In the autumn of 1811, when Mary was 12…". Sources differ on her exact age at the find (UCMP: "between 1809 and 1811, when Mary was only 10 to 12"), so the narration says "as a girl". |
| dug a five-metre skeleton from a cliff | documented | NHM: "in November 1812, Mary searched for and painstakingly dug the outline of its five-metre-long skeleton"; UCMP: "The cliffs at Lyme Regis were -- and still are -- rich in spectacular fossils". |
| Locals called it a monster | documented | NHM: "everyone in town thought that she'd discovered what must have been a monster". |
| scientists guessed a crocodile | documented | NHM: "Scientists thought it was a crocodile. At the time most people assumed that unearthed, unrecognisable creatures had simply migrated to far-off lands." |
| Her brother found the skull; she spent months freeing the body | documented | NHM: "Joseph found a strange-looking fossilised skull. About a year later … Mary searched for and painstakingly dug the outline … By the time she was done, several months later"; UCMP: "while Mary did find the majority of the remains, her brother had discovered part of the beast twelve months earlier". |
| Experts later named it Ichthyosaurus: an extinct sea reptile | documented | NHM: "The mysterious specimen was studied and debated for years. By 1820, it was recognised as being an extinct marine reptile and named Ichthyosaurus, or 'fish lizard' – though we now know it was neither fish nor lizard, but a marine reptile". Today the specimen is classed as *Temnodontosaurus platyodon* (Commons descriptions); not voiced. |
| Her finds inspired the first scene of ancient life drawn from fossils | documented | NHM: "Her discoveries inspired famous geologist and her childhood friend Henry De la Beche, to paint 'Duria Antiquior – A More Ancient Dorset' in 1830 … the very first pictorial representation of prehistoric life based on fossil evidence." |
| Yet papers often skipped her name | documented | NHM: "Male scientists – who frequently bought the fossils Mary would uncover, clean, prepare and identify – often didn't credit her discoveries in their scientific papers, even when writing about her groundbreaking ichthyosaur find." |
| Lesson: credit the finder | interpretive | A teaching takeaway, not a statistic. |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative:** the stylised ichthyosaur (a modern outline, not drawn from her specimen), its turning to stone, the rock and its chipping, plates, rings, the stamp, and the strike-through and restoration of her name.
- **Deliberately NOT claimed:**
  - that she found the first ichthyosaur ever (NHM: it "wasn't the first ichthyosaur to be found, it was the first to be scientifically studied and described");
  - "nobody believed it existed";
  - Cuvier's doubts (they concern the 1823 plesiosaur; not voiced);
  - quotations from her letter;
  - her exact age at the find;
  - that De la Beche painted her specimen in particular;
  - any sum of money.

## Images (real archival objects; public domain)
| file | what | source | licence |
|---|---|---|---|
| `assets/mary-anning-portrait-before-1842-nhm-pd.jpg` | Mary Anning with her dog Tray and Golden Cap (1920x2482; cropped twice in the renderer) | Commons (POR), standard 1920 px rendering | public domain |
| `assets/home-1814-ichthyosaur-skull-plate-pd.jpg` | Everard Home's 1814 plate of the skull found by Joseph and Mary Anning (960x370) | Commons (HOME), 960 px rendering of the 885 px original | public domain |
| `assets/home-1814-ichthyosaur-skeleton-plate-pd.jpg` | Home's 1814 plate of part of the skeleton found in 1812 (960x608) | Commons (HOME), 960 px rendering of the 685 px original | public domain |
| `assets/de-la-beche-duria-antiquior-1830-pd.jpg` | Henry De la Beche, *Duria Antiquior* (1920x1325) | Commons (DURIA) | public domain |
| `assets/mary-anning-plesiosaur-letter-1823-wellcome-pd.jpg` | her autograph letter with a plesiosaur sketch, 26 Dec 1823 (1280x1976) | Wellcome Collection via Commons (LETTER) | public domain |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Upscaled plates:** the two Home plates are small originals. They are shown at up to 920 px wide (about 1.0–1.3× their Commons rendering) and read clearly on a phone.

## Style (rule `25` + first-frame addendum; approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("A MONSTER IN THE CLIFF?", "monster?", "crocodile?", "?", "JOSEPH · skull · 1811", "MARY · body · 1812", "Ichthyosaurus", "fish lizard", "EXTINCT / SEA REPTILE", "Duria Antiquior · 1830 / drawn from fossils", "her own sketch, 1823", "MARY ANNING", "credit the finder"). No paragraph cards and no source footers.
- **Motion that explains:** the rock is chipped away to free the body (credited to Mary, the skull to Joseph); the living animal glides in and turns to stone at "extinct"; the camera pushes into the painting her finds inspired; her name is struck out, then restored at "credit the finder".
- **Transitions:** hard cut with flash (4.79), whip pan (9.30–9.50), push (12.70–12.95), push (17.00–17.30), page turn (21.80–22.15), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 16.2 MB.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 3.1.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.50 dBFS, flat factor 0; audio md5 `4f8e014499ff1dc42170262169cc818e`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.44/255); mean luminance 77.9/255 (no fade from black); audio audible from 0.09 s.
- **Captions** (`qa/caption_bounds.txt`): 14 groups of at most 2 lines. The widest line is 649 px ("support livelihood tools."), so the plate runs x 145–855 and y 330–490.
- **ASR on the export:** both **small (en)** (`qa/asr_small_crosscheck.txt`) and **tiny.en** (`qa/asr_final.txt`) match the script word for word, except the app name ("RUM"/"RM") and spelling ("meter" for "metre"; tiny.en writes "Mary, anning").
- **Word-to-event sync** (`qa/sync.txt`): 20 events. Word-triggered events lead their words by 0.10–0.58 s. Pacing windows are met (hook 0.05–4.55, escalation and question 4.85–9.20, proof 9.50–21.82, payoff 22.15–25.97, CTA 27.10–29.87).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (28 frames, including t = 0); both reviewed on the final export, no defects found.
- **Fixes:**
  - **Before the first full render:**
    - the frame-0 portrait crop was tightened so her face reads;
    - the ichthyosaur outline was refined (clear flippers, outline, deeper body);
    - the "crocodile?" plate was moved inside x 900.
  - **After the first full render** (two video-only re-renders; audio md5 unchanged at `4f8e0144…`):
    - the caption plate touched the top of the frame-0 portrait, so the portrait and skull prints were moved down;
    - the skull print was then reduced (920 → 880 px) to keep a gap above "A MONSTER".

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done.
- **Illustrated animal:** the ichthyosaur is a modern stylised outline, not her specimen.
- **Small plates:** the Home plates are small originals shown slightly enlarged.
- **Age and date:** her age and the year of the first find differ between sources; the narration avoids an exact age.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
