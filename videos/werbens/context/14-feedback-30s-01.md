# 14 — Feedback round 30 s #01: "The decoy effect" (round `production/30s/2026-11-02-feedback-round`)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · workspace `videos/werbens/`.
Output: `videos/werbens/production/30s/2026-11-02-feedback-round/werbens-30s-feedback-01.mp4`
Durable format + style recipe: `context/11-production-format.md` (section "Update — feedback round"). Copy of this file in
the output folder: `feedback-30s-01.md`. Earlier deliverables (pilot 01, 30 s #01, 30 s #02) preserved, not regenerated.

## 1. Brief + user feedback (2026-11-02; supersedes conflicting earlier format directions)
- ONE new 30.000 s ready-to-post portrait video, English voiceover, genre "Mad over marketing" (marketing/brand strategy
  education, not an app ad). Topic: why a terrible-looking price option can make another look attractive — **the decoy effect**.
- Style **"Satisfying Product Theatre"** (recipe in context/11): uncluttered physical 3D hero objects, clean studio ground,
  strong soft contact shadows, tactile motion, deliberately timed shape/scale changes, no presenter/mascot, violet hero
  accents on white/light-neutral negative space. A rendering library is not the style.
- Reference posts (Instagram DegdItcojM7, De167Hmhesj, DfKtydOo3hP, DeOBTsOIedf): borrow staging and anticipation only —
  isolated hero object with near-impact anticipation; clean suspended-ball suspense; tactile slicing progression; a simple
  ball breaking a rhythmic pattern. **Not viewed or downloaded in this session**; only the brief's description of their staging
  was used. No objects, layouts or footage copied; all geometry is original procedural code.
- Illustrative coffee menu (prices invented, labelled "Illustrative menu" once): small 150 ml Rs90, large 300 ml Rs160,
  medium 280 ml Rs155. Three purple cups land with clear labels; medium is introduced last beside large; show the extra
  20 ml for Rs5 in a physical measuring/cup transform; strip the distraction away; return to the quantity the buyer needs.
- Voice: cached Meshline/Recall voice, Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. Subtle music, clear voice,
  no repetitive loops. No paid API, no Blender. Research claims against reliable original sources; no filler, no empty
  motivational lines, no long disclaimers (brief qualifications inside the relevant sentence). No invented app capability,
  guarantee, statistic, income or testimonial. Exactly 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC. Captions in the upper
  safe region (y < 300 clear, captions ≈ y 340–520, x 90–990, ≤ 2 lines, no overlaps); crucial diagrams out of side/bottom UI
  zones; short natural brand/action CTA in the final 3–4 s. Re-render if text is small, obstructed or scenes are static.
- Delivery: MP4 attached in chat + pushed to the path above. Notes/source/QA in the repo only (the local Desktop/video-review
  folder named in the brief does not exist in this cloud container, so nothing was written outside the repo).

## 2. Facts used (verified) — kept separate from creative decisions
| Claim on screen / in voice | Source (accessed 2026-11-02; metadata via Crossref, abstracts via OpenAlex) |
|---|---|
| A decoy is an option that can make another look better by comparison; adding a dominated option "can increase" choice of the option that dominates it | Huber, J., Payne, J. W., & Puto, C. (1982). Adding Asymmetrically Dominated Alternatives: Violations of Regularity and the Similarity Hypothesis. *Journal of Consumer Research*, 9(1), 90–98. https://doi.org/10.1086/208899 — abstract: "An asymmetrically dominated alternative is dominated by one item in the set but not by another. Adding such an alternative to a choice set can increase the probability of choosing the item that dominates it." |
| Background: "attraction effect" naming | Huber, J., & Puto, C. (1983). Market Boundaries and Product Choice: Illustrating Attraction and Substitution Effects. *Journal of Consumer Research*, 10(1), 31–44. https://doi.org/10.1086/208943 |
| Qualification "can" (not "will"); no universal claim | Frederick, S., Lee, L., & Baskin, E. (2014). The Limits of Attraction. *Journal of Marketing Research*, 51(4), 487–507. https://doi.org/10.1509/jmr.12.0061 — abstract: the effect "may be restricted to stylized product representations in which every product dimension is represented by a number"; "Such effects do not typically occur when consumers experience the product (e.g., taste a drink) or when even one of the product attributes is represented perceptually". |
| Menu numbers | **Invented for illustration** (brief); labelled "Illustrative menu" on screen 0.7–8.2 s. Arithmetic: medium→large = +20 ml for +Rs5; small→large = +150 ml for +Rs70. |
Honest notes: (1) The brief's medium (Rs155) is slightly *cheaper* than the large, so it is a near-dominated decoy, not a
strictly dominated one in the 1982 sense; the narration says exactly what is shown ("almost at the same price").
(2) Frederick et al. found the effect often absent for experienced/perceptual products — hence "can" in L3/L4 and no claim that
real cafés use or profit from this. (3) No revenue, conversion or psychology statistics are stated.

## 3. Final script (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us) — 62 words, 18.9 s of speech
| Line | On air (s) | Text |
|---|---|---|
| L1 | 0.30–2.09 | Why would a menu include a bad deal? |
| L2 | 3.10–8.06 | A medium drink sits just below the large in size, but almost at the same price. |
| L3 | 9.30–11.90 | Now the large can feel like the obvious upgrade. |
| L4 | 13.20–17.44 | That's a decoy: an option that can make another look better by comparison. |
| L5 | 20.60–23.61 | Before paying extra, ask how much you actually want. |
| L6 | 26.50–28.82 | Follow Werbens to decode how brands sell. |
Edits vs the draft: "the large feels like" → "the large **can** feel like"; "an option that makes another look better" →
"an option that **can** make another look better" (brief qualification inside the sentence, per Frederick et al. 2014). All
other words verbatim. Pronunciation: brand override `wˈɜːbənz → wˈɜɹbɛnz` (5 variants tested; Whisper still writes
"Warbins"/"Wurbins" because "Werbens" is not in its vocabulary — the spelling is on screen in the caption and wordmark).

## 4. Creative decisions (style applied to this episode)
- Hero objects: three geometrically similar violet takeaway cups (scale ∝ ∛ml, so size differences are physically honest),
  lavender lids, white sleeves with S / L / M; clean light sweep (#F4F2F8); soft key + rim light, PCF shadows plus radial
  contact-shadow decals that tighten and darken as objects near the floor.
- Object changes tied to the words: cups land on "deal"/"medium"; guide line at the large's rim on "below…size"; price
  connector "+Rs5" on "same price"; lids pop and cups become measuring glass, the 20 ml top band lifts out of the large
  (which then matches the medium's level, dashed line) with "+20 ml"; the Rs5 coin lands, then hops into the large on
  "obvious upgrade"; DECOY tag flips and the medium greys on "decoy"; the large hops on "better"; a suspended ball crushes the
  decoy (distraction stripped away); takeaway: glasses + "Need 150 ml?" line on "how much you actually want"; a violet ring
  tightens on the large's 150 ml line and the extra 150 ml is lifted off and set down: "+150 ml for +Rs70"; CTA: the cut
  large slides off, the small becomes a cup again, the Werbens icon tile drops beside it, wordmark on "Werbens".
- Captions: dark-violet pill, 54/62 px Inter Display ExtraBold, word groups, words brighten as spoken, lavender highlights.
- Sound: one held pad chord per scene (no beat grid, no loops) + event-tied piano notes; foley matched to each object action;
  voice ducks music −10 dB and SFX −4 dB.

## 5. Storyboard (as built)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Hook | 0–3 s | wide, slow push | small cup drops (near-impact slow-mo, squash, dust), large follows; tags pop; "Illustrative menu" chip; medium's shadow grows on the empty floor (anticipation) | air, cup thuds, tag flicks, landing piano notes |
| Setup | 3–8.2 s | wide → close on large + medium | medium drops last beside large on "medium"; rim guide line; tags pulse and "+Rs5" connector between prices | thud, ticks |
| Measure | 8.2–12.6 s | close two-cup shot | lids pop off, cups turn to glass (latte liquid), 20 ml violet band lifts out of the large, "+20 ml"; coin drops, rocks, "+Rs5"; coin hops in on "obvious upgrade", band sinks back, large pulses; lids return | pops, shimmer, pour, glow, coin clink, bloop, plink |
| Decoy | 12.6–17.9 s | back to wide, slow push | DECOY tag flips, medium greys; beam from decoy to large; large hops on "better" | flip, glow, settle |
| Strip away | 17.9–20.8 s | wide | suspended ball lowers (suspense, music drops to a fifth), crushes the decoy, bounces away; flattened decoy slides off; cups regroup | creak, whoosh, squash, slide; music cut on impact, D-major resolve |
| Takeaway | 20.8–25.85 s | wide | small + large become glass; "Need 150 ml?" + dashed line at the large's 150 ml; the extra 150 ml glows; ring tightens and snaps; slice lifted and set down, "+150 ml for +Rs70" | shimmer, tick, glow, zip + snap, settle |
| CTA | 25.85–30 s | push-in | cut large + slice slide off, small turns back into a cup with its lid, Werbens icon tile drops beside it, "Werbens · Decoding how brands sell", caption "Follow Werbens to decode how brands sell." | slide, tile thud, D-major piano spread |

## 6. QA — see section 7 (filled after the final render) and the output folder's `QA.md`
