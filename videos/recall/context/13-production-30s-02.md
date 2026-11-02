# 13 — Production batch `production-30s-2026-11-02-batch-02`: 30 s knowledge challenge 02

Output folder: `videos/recall/production/30s/2026-11-02-batch-02/` · deliverable `recall-30s-production-02.mp4`.
Format: 11 (updated with this batch's feedback). Previous episode 01 (context 12) is reviewed and preserved, and its
topic is not repeated. No automation created.

## Brief (user-authorised, essentials)
- ONE new 30.000 s English educational video; locked genre: knowledge challenges viewers can try answering; exact style
  module: Microgame Frenzy STYLE.md (read-only; latest user feedback overrides earlier style details).
- Topic: **Which is heavier: a kilo of steel or feathers?** Draft: "Which is heavier: one kilogram of steel, or one
  kilogram of feathers? Take a moment. They have the same mass. But the feathers take up far more space because their
  bulk density is lower. Now try the reverse: equal-sized boxes filled with steel and feathers. Those would usually have
  very different masses. The trick is to notice what the question keeps equal: mass, or volume. Change that condition,
  and you change the answer."
- Feedback: kilogram-labelled balance; three-second visible choose/think beat; payoff equal balance; same-volume boxes in
  round two; plays independently (no app interaction); question worded as MASS; no buoyancy distraction; scientifically
  precise explanation; research each claim; 65–80 words naturally in 30 s; keep Kip/app identity.
- Voice: "Meshline" Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us, cached model; quiet original music,
  event-linked SFX; −14 to −16 LUFS, true peak ≤ −1 dBTP; one ASR + timing pass.
- 1080×1920, 30 fps, 900 frames, H.264 yuv420p, AAC 48 kHz stereo, exact 30 s; caption ink y 350–470, margins ≥ 80 px,
  ≤ 2 lines; top 300 px clear; essentials above the bottom overlay region; storyboard hook 0–3 / setup 3–8 /
  mechanism 8–23 / takeaway 23–29 / end 29–30.

## Final script (71 words, 21.67 s of speech, 2.37 words/s overall)
| id | text | start–end (s) |
|---|---|---|
| l01 | Which has more mass: a kilogram of steel, or a kilogram of feathers? | 0.35–4.29 |
| l02 | Take a moment. | 4.60–5.38 |
| — | *(3.0 s visible think beat: fuse 5.0–8.0 s, 6 knots)* | |
| l03 | Same mass: one kilogram each. | 8.45–10.50 |
| l04 | The feathers just take up far more space. As a pile, their density is much lower. | 10.85–15.86 |
| l05 | Now flip it: two boxes of the same size. | 16.15–18.66 |
| l06 | The steel box has far more mass. | 19.45–21.15 |
| l07 | The trick: notice what the question keeps equal, mass or volume. | 23.05–26.81 |
| l08 | Change that, and you change the answer. | 27.15–29.08 |
Edits vs the draft (and why): question worded as **mass** (user feedback; NIST: use "mass" when mass is meant);
"They have the same mass" → "Same mass: one kilogram each" (payoff on the beat); "because their bulk density is lower"
→ "As a pile, their density is much lower" (no fetchable institutional definition of "bulk density"; OpenStax's own
riddle wording is "a much bigger pile because they have a much lower density"); "Now try the reverse: equal-sized boxes
filled with steel and feathers. Those would usually have very different masses." → "Now flip it: two boxes of the same
size. The steel box has far more mass." (shorter and definite; follows from ρ = m/V with steel 7.8 × 10³ kg/m³);
"Change that condition" → "Change that" (timing). ASR (faster-whisper base.en) matched every line.

## Claim citations (full map: `production/30s/2026-11-02-batch-02/docs/SOURCES.md`)
- Kilogram = SI unit of mass; mass vs weight; "mass used when mass is meant": NIST OWM, "SI Units – Mass".
- Density = mass/volume; "the masses are the same, but the volume occupied by the feathers is much greater, since their
  density is much lower"; steel 7.8 × 10³ kg/m³: OpenStax College Physics 2e §11.2 (+ Table 11.1).
- Air counts in a pile's bulk volume: FAO Soils Portal ("Pore space is that part of the bulk volume … occupied by either
  air or water"). Feather volume per mass varies (IDFL fill power): pile size illustrative, no number claimed.
- Disclosed: 1 kg steel cube at true size (5.04 cm); feather pile illustrative (≈ 430× the cube's volume); air buoyancy
  on a real balance not shown (feedback: avoid the distraction; question is about mass).

## Storyboard (120 BPM; cues in timeline.json)
| time | segment | picture | sound |
|---|---|---|---|
| 0.0–3.0 | hook | LOAD! slam; Kip sets a true-size 1 kg steel cube on the left pan and a big 1 kg feather sack on the right; feathers puff; kg balance, kg dial, Q2 badge | stab, clunk + pan ring, flump, feather puff |
| 3.0–8.0 | setup + think | lock pin holds the beam level (lock glyph); GUESS!; chips A Steel / B Feathers / C Same; **3.0 s fuse with 6 beat knots**; Kip thinks, glances at each pan | chip flips; groove → heartbeat + knot ticks only |
| 8.0–16.0 | mechanism (round 1) | WEIGH! (biggest stab); Kip pulls the pin; beam wobbles and stays **level**; ✓ chip C; "=" + "same mass"; dashed volume boxes: small volume vs big volume; Kip pokes the sack; "feathers + air"; chip "density = mass ÷ volume" | crash, pop, creak, ding, ticks, air puff |
| 16.0–23.0 | mechanism (round 2) | FLIP! — Kip slaps the swap button; contents tile-flip to two boxes of the same size (bracket + "same size"); WEIGH! — pin out, beam slams to the steel side; ✓ STEEL; feathers puff | button thunk, flip whoosh, clunk, stamp |
| 23.0–29.0 | takeaway | recap chips SAME MASS → TIE / SAME SIZE → STEEL; Kip slaps the button on "mass" (level), "volume" (tips) and again at 28 s (level); thumbs-up | flips, clunk/creak per toggle, hop |
| 29.0–30.0 | end | button chord; level balance with "same mass"; small Recall signature under the UI row | chord rings out |

## QA
Filled from the final exported file in `production/30s/2026-11-02-batch-02/qa/QA.md` (see progress below).

## Progress / state
- 2026-11-02: verified repo/branch and that batch-02 did not exist; research (2 web-fetch passes); narration + ASR;
  balance scene, choreography, overlay, mix; stills reviewed and fixed (label placement, duplicate tag); full render 1
  started with 3 workers.
