# 08 · Educational strategy (active direction)

Status: user-approved direction, recorded 2026-11-02 in the Claude Code session on branch
`claude-video/wastepaisa`. This supersedes the campaign-style brief (02) **for educational
pilots only**. 02 remains the historical brief for any future campaign ad.

## Goal
Grow a niche audience with short, genuinely useful lessons. Each video must teach one thing
a viewer can use even if they never install the app. Relevant WastePaisa app posts come
later and only occasionally. They are separate posts and are not mixed into lessons.

## Channel niche
**Hidden materials in everyday waste**: what things are really made of, and how that affects
sorting, repair, reuse and recycling.

Audience promise: *"15 seconds, one object, one hidden material, one useful takeaway."*

## Series identity
| Element | Decision |
|---|---|
| Series tag | "Hidden materials · NN" (top-right, small) |
| Performer | **Tinku**, an original tin-can scrap creature (model sheet: `education/pilot-01/character/`) |
| Set | Material dissection lab: dark roasted-brown stage, cutting-mat table, jars of sorted materials |
| Palette | Cream / brown / metallic, with accents sampled from the app icon (orange #E8741C, green #1F6B3A) |
| Typography | Baloo 2 ExtraBold captions (OFL) and Inter for small notes (OFL) |
| App signature | Small icon + "WastePaisa" top-left, ~78 % opacity. No CTA, no feature tour |
| Sound | Original synthesized "curious lab" cue (96 BPM), action-timed SFX, Tinku's treated synthetic voice |

## Format rules (every episode)
1. **Question → mechanism → takeaway.** Open on a physical puzzle, demonstrate the mechanism
   with the performer, and end on one concise, useful takeaway.
2. **One concept.** If it doesn't fit in about 15 s at a comfortable pace (about 3 words/s or
   less, with 0.3 s or more between lines), narrow the topic. Never speed up the voice and never
   simplify into something false.
3. **The performer performs.** Tinku taps, cuts, pours, tugs, reacts and investigates. He
   never stands next to text. Situations, camera and choreography change every episode, while the
   design stays stable.
4. **Honest visuals.** Exaggerated scale is labelled (e.g. "Exploded view · thickness not to
   scale"). Illustrative outcomes are labelled ("Illustration · acceptance varies by area").
   Nothing pretends to be app UI, experiment data or an impact report.
5. **Captions mirror narration** for sound-off viewing, kept inside 40 px safe margins.

## Accuracy rules
- Research each topic from public sources, cite them with access dates, and map every on-screen
  claim to a source (see `education/pilot-NN/sources.md`).
- Use hedged quantifiers that match the evidence ("many", "some", "often"). Never say "all"
  without proof.
- Recycling acceptance varies by place and facility. **No universal disposal instruction.**
  The safe, useful takeaway is to check local rules.
- **No product claims inside lessons.** No payouts, prices, allowances (the user-described
  allowance is unverified and must never be advertised), impact numbers or guaranteed recycling.
- App facts, when an app post is eventually made, come only from `assets/listing.json`
  ("Check recycling prices, sort waste, book pickups and track every payout.").

## Reference handling
The user named two Instagram accounts (battysticky, breakingbreach) as **quality**
references: an expressive recurring performer, a dimensional dark stage, physical demonstrations,
dimensional objects and mechanism explanations. They were **not viewed** in this session.
We use only the user's description, and copy no characters, scripts, logos, assets, voices or
palettes from them. Tinku's look, palette and voice are original. No named actor or character
voice is imitated.

## Reusable production kit (in `education/pilot-01/`)
- `src/rig/tinku.js`: rig with pose parameters (body, hands, face, ears, loupe, antenna).
- `src/rig/lab.js`: stage, lights and facility cut-outs. `src/rig/cup.js` is an example of a
  dissectable object (exploded halves, film, stain, stretch).
- `src/choreo.js`: choreography as data (camera keys, root path, pose keys, captions, chips).
- `audio/`: Piper TTS with ASR-selected takes, numpy music/SFX, ducked mix and loudnorm.
- `tools/`: contact sheets, ASR intelligibility check, model-sheet composer.

## Ten follow-on episode titles (planned only, not rendered)
Each needs its own public research and claim mapping before production. Situations and
choreography are deliberately different from pilot 01.

| # | Working title | Mechanism / staging idea | Research flags |
|---|---|---|---|
| 02 | **The magnet test: steel can or aluminium can?** | Tinku "fishes" with a magnet over a can line-up; steel clings, aluminium doesn't | Can composition varies by market |
| 03 | **A juice carton is a layered sandwich** | Carton "deck of cards" peel: paperboard, plastic, foil | Many aseptic cartons use foil; not all cartons do |
| 04 | **Why a crisp packet is shiny inside** | Torch-and-mirror demo on a metallised film | Metallised vs foil laminates differ |
| 05 | **Bottle and cap: two plastics, one drink** | Float/sink tank: shredded bottle sinks, cap flakes float | Polymer types and cap guidance vary locally |
| 06 | **Why grease worries the paper mill** | Pizza-box oil spot spreading on a pulping-vat model | Acceptance of food-soiled card varies |
| 07 | **What a charging cable hides** | Wire-stripping dissection reveals copper strands and insulation | Route cables to e-waste per local rules |
| 08 | **Toothpaste tubes and the laminate problem** | Squeezed-tube cutaway; layered vs single-material tubes | Newer single-material tubes exist |
| 09 | **Receipts aren't plain paper** | Warm lamp darkens a heat-sensitive coating | Avoid chemical-hazard claims without strong sources |
| 10 | **Fix it first: the loose zipper slider** | Repair: pliers gently re-tighten a gaping slider | Repair technique safety; works for some slider types |
| 11 | **Drinking glass vs glass bottle** | Two "glasses" in a kiln model melt differently | Many schemes exclude drinkware; local rules vary |

## Not doing
No campaign ads in this educational direction. No forced Google Play CTA, no generic
motivational slogans, no feature tours. No reuse of other apps' material.
