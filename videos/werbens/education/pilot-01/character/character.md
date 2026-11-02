# Cast bible — Werbens education series

Original designs created for this series (2026-11-02). Model sheet: `model-sheet.png` (rendered from the production rig by
`node src/render.mjs --sheet && bash character/make-sheet.sh`). Rig code: `../src/rig/character.js` (reusable), cast specs:
`../src/rig/cast.js`. Units ≈ metres; table top at 0.90.

## Pip — host / ad director (speaks)
- **Silhouette:** violet capsule (r 0.36, body 1.22 tall, on 0.40 legs) + tilted lavender beret with ink stalk + ink headset
  with boom mic to the right mouth corner. Reads at thumbnail size from the beret tilt and the boom.
- **Colours:** body `#6234FB` (Werbens icon violet), limbs `#5328EA`, beret `#CCC0F7`, hands `#FEFEFD`, details/shoes `#1B1433`.
- **Face:** large glossy eyes (rx .088 / ry .112) with glints, upper + lower lids, short ink brows, wrap-around mouth shape.
- **Personality:** showman, curious, a little smug when the trick lands; presents with open palms, winks at the payoff.
- **Voice:** Kokoro-82M (Apache-2.0) style-vector blend af_bella 0.7 + af_heart 0.3, speed 0.94 — warm, clear, unhurried.
  Original synthetic voice; not modelled on any actor or existing character.
- **Signature moves:** "ta-da" two-hand present, eager hand-rub, pull-cord yank, waiter hold, wink.

## Quibble — sceptical customer (silent)
- **Silhouette:** tall pale rounded block (0.60 × 1.30 × 0.46) on short legs + round ink glasses + single ink curl on top.
- **Colours:** body `#EEE9FB`, lids `#E2DAFA`, sleeves `#C9BDF4`, hands white, glasses/brows/shoes `#1B1433`.
- **Face:** smaller eyes behind round glasses, heavy brows that carry most of the acting; glasses can slide down the nose.
- **Personality:** arms crossed by default, one brow up; judges fast, gets surprised, admits it (sheepish).
- **Signature moves:** squint-lean, smug point, strain-lift, delighted squeeze, "meh" shrug, glasses slide.

## Expression presets (`EXPR` in rig/character.js)
neutral · presenter · sceptic · squint · curious · delight · meh · shock · sheepish · smug · wink — each is a set of brow
angle/raise, upper/lower lid, mouth open/smile/skew/width values; blended over 0.12–0.16 s with `exprAt()`.

## Rig parameters (per frame, pure function of t)
position/yaw · lean · tilt · twist · squash/stretch · bob · look (pupils) · blink · talk (lip-sync from the narration RMS
envelope in `src/words.json`) · world-space hand targets with analytic 2-bone IK (elbow pole, `elbowUp` for pointing) ·
index finger extension · accessory params (beret tilt; glasses slip, curl bounce).

## Continuity rules for future episodes
Keep proportions, colours, accessories and voice blend fixed. Vary situations, props, camera and choreography. Quibble stays
silent; Pip narrates. Keep the backstage studio (flats, ladder, bulb string, tape marks) but redress it per lesson.
