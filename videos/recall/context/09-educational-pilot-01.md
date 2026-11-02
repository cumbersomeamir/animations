# 09 — Educational Pilot 01: Why a steel ship floats but a small steel ball sinks

Brief received 2026-11-02 (user-approved). Governs this pilot only; strategy in 08, progress in 10.

## Brief essentials
- NEW 15-second educational pilot, not an app ad. Exactly 15.000 s, 1080×1920, 30 fps, H.264 + AAC.
- Output: `videos/recall/education/pilot-01/recall-education-pilot-01.mp4`; new source and render in that folder.
- Physical story: the explorer drops a compact steel ball (sinks), then reshapes the same illustrative material
  into a hollow hull that displaces more water; show upward buoyancy.
- Accuracy: explain displacement and **overall average density with the air space in the hull**; never
  imply the steel's own density changes; forces directionally correct; water volume visually meaningful.
- Question → mechanism → concise takeaway. Small unobtrusive app signature only. No CTA, slogan, feature tour,
  unverified claims; the scene is an illustration, not app UI or experiment data.
- Deliverables: source, reproducible build, storyboard, character sheet, sources with dates + claim map,
  license notes, representative + boundary contact sheets, ffprobe metadata, QA.md; full decode; commit/push.

## Script (one concept; ~37 words / 15 s ≈ 2.5 words/s)
| id | text | role |
|---|---|---|
| n1a | "Steel sinks." | puzzle (said as the ball sinks) |
| n1b | "So how do steel ships float?" | question |
| n2 | "A ball pushes aside only a little water." | displacement, small |
| n3a | "Same steel, as a hollow hull," | reshaping, same material |
| n3b | "pushes aside much more water." | displacement, large → bigger upward push |
| n4 | "Steel plus air is, on average, less dense than water." | takeaway: average density |

Final measured timings are in `education/pilot-01/timeline.json` (generated from TTS durations) and in 10.

## Physical model used for the illustration (computed, see docs/SOURCES.md)
- Steel ρ ≈ 7.8 × 10³ kg/m³, water ρ ≈ 1.000 × 10³ kg/m³ (OpenStax Table 11.1) → ratio 7.8.
- Submerged ball displaces its own volume V. Floating hull made from the same steel displaces 7.8 V
  (floating: displaced water's mass = object's mass). Tank water rise is computed as displaced volume ÷ tank
  area, so the hull raises the level 7.8× more than the ball. A gauge on the tank shows 1 tick vs 7.8 ticks.
- Arrows: weight (down) has the same length for ball and hull (same steel). Water's upward push = weight ÷ 7.8
  for the submerged ball; equals the weight for the floating hull.
- The ball is shown in a brief "rewind + pause" while fully submerged so that only weight and water's push act
  (no floor support arrow needed). Hull wall thickness and Kip's scale are illustrative.

## Storyboard (provisional beats; final cue times in timeline.json)
| time (s) | shot / camera | action (verbs) | caption | SFX |
|---|---|---|---|---|
| 0.0–3.2 | A. Medium: Kip behind glass tank on clay table; toy steel ship bobs on clay-wave diorama behind; slow push-in | Kip **holds** ball high, **drops** it; splash, ball **sinks**, clunks on floor; Kip **startles**, then **turns and points** at the floating toy ship | "Steel sinks." → "So how do steel ships float?" | whoosh, plop+splash, bubbles, clunk, tiny horn toot |
| 3.2–6.6 | B. Push in to tank; Kip leans in with magnifier | Kip **twirls finger** → **rewind**: ball rises to mid-water and **pauses**; lime ghost of the displaced water **lifts out** beside it; arrows: long weight ↓, tiny push ↑; gauge +1 tick; **unpause**: ball drops, clunk | "A ball pushes aside only a little water" | rewind zip, pause tick, pop, clunk |
| 6.6–9.4 | C. Rise to Kip's hands | Kip **reaches in**, **lifts** dripping ball, **presses thumbs** in and **pinches** it into a hollow hull (same steel colour/material) | "Same steel → a hollow hull…" | splash, drips, clay squish ×3, stretch creak |
| 9.4–11.6 | D. Pull back to tank | Kip **lowers** hull; it **dips, bobs, settles**; water rises 7.8 ticks; submerged volume glows lime; push arrow **grows** to equal weight | "…pushes aside much more water" | water slap, slosh, balance ding |
| 11.6–15.0 | E. Orbit to ¾ high angle into hull | "air" revealed inside hull; Kip **plants** lime flag on the rim, **thumbs up**; small Recall signature fades in bottom | TAKEAWAY: "Steel + air: less dense than water, on average" | flag pop, soft chime |

## Isolation and sources
Only Recall's own context, icon and listing; public physics sources cited in `pilot-01/docs/SOURCES.md`.
