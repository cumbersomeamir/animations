# 31 — English-17 30 s #01: Stephanie Kwolek and Kevlar, "A THREAD THAT SAVED LIVES" (third episode under the first-frame addendum, `25`)

- **Batch:** 2026-11-15-english-17 (the user's brief "NEXT EDUCATIONAL EPISODE … next batch17 on 15 November 2026")
- **Video:** `videos/aarambh/production/30s/2026-11-15-english-17/aarambh-30s-english17-01.mp4`
  - sha256 `b2b0f2bd7d411d9a4f3400aa2e4e7f07ac84c266d20a16e60e3ba10818a8c2b0`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-15-english-17/aarambh-30s-english17-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `d7a5453a8ae716db09ebaab300e328b1461859c9b146f45a34f1e1a1cc2d0e03`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-15):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `9f6defa` (english-16), clean tree; account checked against CLAUDE.md. The batch folder was created after `test ! -e`. Batch 16 was already delivered and was not touched; earlier outputs are untouched.
- **Topic:** fresh. A grep for kwolek/kevlar/aramid over `videos/aarambh` found nothing, so the brief's subject was used.
- **Topic line vs brief:** the topic line ("made firefighters harder to burn") does not match the detailed brief (strength, the spaghetti analogy, strength vs bulletproof). As with the english-14 note in `11`, the detailed, verifiable brief was followed and no firefighting claim was made. SHI does list Kevlar among DuPont's heat-resistant fibres, but heat resistance is not in the video.

## First frame (rule)
- **Frame 0 (t = 0):**
  - Harry Kalish's real photograph of Stephanie Kwolek (left, tilted print);
  - an enormous golden thread hanging from the top of the frame and holding a cast-iron weight (right, illustration);
  - the words "A THREAD THAT / SAVED LIVES" (5 words, large) below.
- **No intro:** no logo, flicker, fade from black or fade-in. The scene's first state is drawn complete.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.09 s (`qa/first_frame.txt`).
- **Thumbnail = frame 0:** rendered from the same `drawFrame(0)`. Frame 0 of the export differs from it by 1.54/255 mean absolute difference (H.264 encoding only). Mean luminance 56.7/255.
- **Truthful words:** NIJ credits ballistic-resistant soft body armour with saving more than 3,000 police officers, and the IACP/DuPont Kevlar Survivors' Club has recognised more than 3,100. NIHF calls Kevlar "the material of choice for bullet-resistant vests". The weight is illustrative; no load figure is claimed.

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| hook | 0.05–4.36 | "This thread has helped save police lives, and it began as a cloudy liquid." | frame-0 composition; slow push; the weight sways and a glint runs down the thread; light sweep over the portrait; hard cut with flash (3.46) to a beaker of thin, cloudy, shimmering liquid being stirred |
| super hook / question | 4.70–6.32 | "How did a liquid get that strong?" | big gold "?" under the beaker |
| proof 1: her discovery | 6.65–10.81 | "In 1965, Stephanie Kwolek had it spun into fibre." | whip pan (6.45–6.65) to the real first page of U.S. Patent 3,671,542 ("OPTICALLY ANISOTROPIC AROMATIC POLYAMIDE DOPES", inventor Stephanie Louise Kwolek, assignee E. I. du Pont de Nemours); gold underline under her name; a spinneret rises in; the liquid flows through its holes and the filaments merge into one yarn; "spun" |
| proof 2: why it is strong | 11.15–16.16 | "Its rod-like chains lie side by side, like dry spaghetti, not a tangle." | push (10.85–11.10) to the real museum sample of 100% Kevlar yarn; the camera dives into a strand; rod-like chains slide in side by side; "dry spaghetti"; a grey tangle, "not a tangle", struck through |
| proof 3: what that buys | 16.50–20.72 | "Pull, and they share the load: by weight, five times stronger than steel." | push (16.20–16.50) to a pull test: clamps pull, every chain lights up, "load shared"; then (a sequential swap, 17.92–18.36) bars at "same weight": steel 1×, Kevlar grows to 5× |
| payoff | 21.10–25.60 | "Lesson: strong isn't bulletproof; ask which threats a vest is rated for." | page turn (20.75–21.10) to a cream page: circular portrait, "STEPHANIE KWOLEK", a vest (illustration); "STRONG ISN'T / BULLETPROOF"; a tag swings in: "RATED FOR / which threats?" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) to the Aarambh card |

## Final script (English; 74 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | This thread has helped save police lives, and it began as a cloudy liquid. | — |
| S2 | 4.70 | How did a liquid get that strong? | — |
| S3 | 6.65 | In 1965, Stephanie Kwolek had it spun into fibre. | "Kwo-leck" (pronounced KWO-lek; Kokoro said "Quollock" for the plain spelling) |
| S4 | 11.15 | Its rod-like chains lie side by side, like dry spaghetti, not a tangle. | — |
| S5 | 16.50 | Pull, and they share the load: by weight, five times stronger than steel. | — |
| S6 | 21.10 | Lesson: strong isn't bulletproof; ask which threats a vest is rated for. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

The first draft was about 3 s too long. "DuPont chemist" (shown on the patent instead) and "Inside," were cut. "A vest stops only the threats it's rated for" was replaced by "ask which threats a vest is rated for": NIJ's wording is about ratings, and a vest may stop rounds it was not rated for, so "only" would overstate it.

## Sources (accessed 2026-11-15)
- **[SHI] Science History Institute, "Stephanie L. Kwolek"** (scientific biography): https://www.sciencehistory.org/education/scientific-biographies/stephanie-l-kwolek/
- **[NIHF] National Inventors Hall of Fame, "Stephanie Louise Kwolek"** (inducted 1995; Kevlar fiber, U.S. Patent Nos. 3,819,587 and RE30352): https://www.invent.org/inductees/stephanie-louise-kwolek
- **[LEM] Lemelson-MIT Program, "Stephanie Kwolek":** https://lemelson.mit.edu/resources/stephanie-kwolek
- **[PAT] U.S. Patent 3,671,542, "Optically anisotropic aromatic polyamide dopes",** S. L. Kwolek, assigned to E. I. du Pont de Nemours and Company, June 20, 1972 (filed May 23, 1969; continuation-in-part chain back to June 13, 1966): https://patents.google.com/patent/US3671542A/en (page image from patentimages.storage.googleapis.com).
- **[NIJ-18] National Institute of Justice, "Body Armor: Protecting Our Nation's Officers From Ballistic Threats"** (Mark Greene, November 14, 2018): https://nij.ojp.gov/topics/articles/body-armor-protecting-our-nations-officers-ballistic-threats
- **[NIJ-T] NIJ topic page "Body Armor":** https://nij.ojp.gov/topics/equipment-and-technology/body-armor
- **[NIJ-95] NIJ Technology Assessment Program body-armour brochure** (PDF created 1995): https://www.ojp.gov/pdffiles/bodyarmr.pdf
- **[POR] Wikimedia Commons, "Stephanie Kwolek at Spinning Elements by Harry Kalish.TIF"** (Science History Institute, CC BY-SA 3.0): https://commons.wikimedia.org/wiki/File:Stephanie_Kwolek_at_Spinning_Elements_by_Harry_Kalish.TIF
- **[SAMPLE] Wikimedia Commons, "Staal van aramidevezel van het merk Kevlar.jpg"** (Industriemuseum Gent, CC0): https://commons.wikimedia.org/wiki/File:Staal_van_aramidevezel_van_het_merk_Kevlar.jpg

## Claim map (documented, measured, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| This thread has helped save police lives | documented | NIJ-18: "the International Association of Chiefs of Police/DuPont Kevlar Survivors' Club has recognized more than 3,100 officers who have been saved from death or serious injury by wearing body armor"; NIJ-T: "ballistic-resistant soft body armor has saved the lives of more than 3,000 police officers"; NIHF: Kevlar is "the material of choice for bullet-resistant vests" and "thousands of police can attest to the value of" her research. Scope: vests also use other fibres (NIJ-95 lists several), so the narration says "helped". |
| it began as a cloudy liquid | documented | SHI: "In 1965 Stephanie Kwolek … looked into a thin, cloudy liquid and discovered something new"; LEM: "an aramid polymer that most researchers would have rejected, since it was fluid and cloudy, rather than viscous and clear" |
| In 1965, Stephanie Kwolek had it spun into fibre | documented | SHI dates the discovery to 1965 ("something five times stronger than steel"); LEM: "Kwolek, acting on instinct, insisted on spinning out the solution, and the result was astonishing: synthetic fibers much stiffer and stronger than any created before"; SHI: "to everyone's surprise, these liquid crystalline solutions spun beautifully". No source gives a separate date for the first spin; the year is SHI's discovery year. A technician ran the spinneret (secondary sources name him), so the narration says she "had it spun". |
| the patent on screen | documented | PAT: her patent for the optically anisotropic dopes (the liquid itself), issued 1972. It is shown as her document, not as a 1965 record; the date on the page is visible. Patent 3,819,587 (the fibre, 1974) prints her name "Kwoleck", so it was not shown. |
| Its rod-like chains lie side by side | documented | SHI: "large numbers of the molecules of these rodlike polyamides become lined up in parallel under certain conditions: they formed liquid crystalline solutions that could be spun directly into fibers of very high strength and stiffness"; PAT abstract: fibres "of unique internal structure (evidenced by low orientation angle …) and exceptionally high tensile properties" |
| like dry spaghetti, not a tangle | illustrative analogy | Dry spaghetti = straight parallel rods; cooked tangle = flexible coiled chains in ordinary polymer solutions. A teaching picture of the documented alignment, not a measurement. |
| Pull, and they share the load | interpretive (simplified mechanism) | SHI links the parallel alignment to "very high strength and stiffness". "Share the load" is a simplified teaching explanation: with the chains aligned along the fibre, a pull is carried along many chain backbones at once instead of first straightening a tangle. |
| by weight, five times stronger than steel | documented claim | NIHF: "a polymer fiber five times stronger than the same weight of steel"; SHI: "five times stronger than steel". A strength-to-weight comparison; the exact ratio depends on which steel is compared. The bars show these sources' 5× at "same weight" and claim nothing more precise. |
| strong isn't bulletproof | documented | NIJ-18: "Although there is no such thing as bulletproof armor, ballistic-resistant body armor can protect against many types of handgun and rifle ammunition"; NIJ-95: "No body armor is bulletproof." |
| ask which threats a vest is rated for | documented basis, interpretive takeaway | NIJ-95: "Manufacturers rate armor in accordance with the NIJ standard threat levels"; "Soft body armor is not designed to protect against rifle bullets or edged or pointed weapons." The takeaway is practical advice, not a safety guarantee. |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative:** the thread and weight, the beaker, the spinneret, the chains (rings along a backbone, not an exact chemical structure), the tangle, clamps, arrows, bars and the vest and tag.
- **Deliberately NOT claimed:**
  - any firefighting or heat claim (the topic line's framing);
  - a precise load the thread holds;
  - a strength figure in pascals or a specific steel;
  - that Kevlar is bulletproof or that vests stop all threats;
  - any quotation from her;
  - her awards, e.g. the National Medal of Technology (documented by LEM, not voiced for time).

## Images (real archival objects)
| file | what | source | licence |
|---|---|---|---|
| `assets/stephanie-kwolek-harry-kalish-shi-cc-by-sa-3.jpg` | Stephanie Kwolek, photograph by Harry Kalish, taken at "Spinning Elements", Chemical Heritage Foundation (now Science History Institute) (1280x1546; undated) | Science History Institute via Commons (POR), 1280 px rendering of the TIF | CC BY-SA 3.0, Science History Institute; attribution in the publishing caption and here |
| `assets/us-patent-3671542-kwolek-1972-p1-pd.jpg` | first page of U.S. Patent 3,671,542 (1400x2056; shown cropped to the header, title, inventor and assignee) | Google Patents page image (PAT) | public domain (U.S. patent) |
| `assets/kevlar-yarn-sample-industriemuseum-gent-cc0.jpg` | museum sample box of 100% Kevlar yarn (1280x853) | Industriemuseum Gent via Commons (SAMPLE) | CC0 |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Not used:**
  - the 1986 SHI portrait (its download returned an error page);
  - Commons "Aramid fiber.jpg" (CC BY-SA; the CC0 museum sample was preferred);
  - patent 3,819,587 (name misprinted "Kwoleck").
- **Licence note:** this is the first CC BY-SA portrait in this app's episodes. The photographer and institution are credited in the publishing caption, and the image is shown as a cropped print.

## Style (rule `25` + first-frame addendum; approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("A THREAD THAT SAVED LIVES", "?", "spun", "dry spaghetti", "not a tangle", "load shared", "same weight", "steel", "Kevlar", "1×", "5×", "STEPHANIE KWOLEK", "STRONG ISN'T BULLETPROOF", "RATED FOR which threats?"). No paragraph cards and no source footers.
- **Motion that explains:** the liquid is spun through a spinneret into one yarn; the camera dives from the real yarn into its chains; the chains slide in side by side; a pull lights every chain; the Kevlar bar grows to 5×; the rating tag swings onto the vest.
- **Transitions:** hard cut with flash (3.46), whip pan (6.45–6.65), push (10.85–11.10), push (16.20–16.50), a sequential in-scene swap (17.92–18.36), page turn (20.75–21.10), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 2.6.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.53 dBFS, flat factor 0; audio md5 `0516c79260b4498610529105fc9b19f3`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.54/255); mean luminance 56.7/255 (no fade from black); audio audible from 0.09 s.
- **Captions** (`qa/caption_bounds.txt`): 12 groups of at most 2 lines. The widest line is 649 px ("support livelihood tools."), so the plate runs x 145–855 and y 330–490.
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script except "Kowlek" (surname), "of vest" for "a vest", "fiber" (spelling) and "RUMB" for Aarambh. On the narration-only pass and the previous mix, small heard "a vest" correctly.
  - **tiny.en** (`qa/asr_final.txt`) matches except "Quolek", "its" for "it", "lyside" for "lie side" and "RM" for Aarambh.
- **Word-to-event sync** (`qa/sync.txt`): 24 events. Word-triggered events lead their words by 0.05–0.57 s. Pacing windows are met (hook 0.05–4.36, question 4.70–6.32, proof 6.65–20.72, payoff 21.10–25.60, CTA 27.10–29.87).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (26 frames, including t = 0); both reviewed on the final export, no defects found.
- **Fixes:**
  - **Before the first full render:**
    - the patent crop was tightened twice, to the left column only, so the text is legible on a phone;
    - the inventor underline was moved off the "Del." line;
    - the chain rings were enlarged (9 → 7 chains);
    - the frame-0 portrait was enlarged;
    - the liquid was made more opalescent.
  - **After the first full render** (one re-render; audio rebuilt because the chain click cues moved):
    - the pull-test → bars swap was a cross-fade in which labels, rods and bars overlapped, so it is now sequential (out, then in), with each label and rod given the group fade;
    - a 0.2 s empty frame before the chains appeared was removed;
    - the yarn photo now cross-fades instead of popping off.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done. The surname is a TTS respelling. Both models hear a close variant ("Quolek"/"Kowlek"), and the on-screen caption and patent show "Kwolek".
- **1965:** the year comes from SHI's dating of the discovery; no primary source dates the first spin separately.
- **Illustrative strength picture:** "share the load" is a simplified mechanism, and the 5× bar restates NIHF/SHI's comparison (steel type unspecified).
- **CC BY-SA portrait:** attribution is given; the share-alike terms of CC BY-SA 3.0 apply to adaptations of that photograph.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
