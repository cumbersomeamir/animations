# Production notes — Ideaverse 30s english19-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
Where a phone's crisp moon detail comes from: on Samsung Galaxy phones Scene Optimizer recognizes the moon, merges more than
ten shots to cut noise, then a deep-learning engine enhances detail; Samsung says it is still reducing confusion between the
real moon and a picture of it; payoff: for only what the lens caught, turn Scene Optimizer off. Record context/34.
Proposed topic (removing a stranger from a photo) replaced: it repeats hindi03-01 (Magic Eraser).
- Beats: 0–4.6 hook (crisp moon on DOCKET's phone vs a small soft moon in the window; DETAIL FROM WHERE? from frame 0) ·
  4.6–9.75 viewfinder: soft grainy moon → MOON box · 9.75–12.6 12 grainy shots merge · 12.6–16.85 sweep adds crisp
  detail (AI DETAIL) · 16.85–22.05 a monitor's moon picture gets the same box (SKY OR SCREEN?) · 22.05–26.85 toggle off →
  plain capture (WHAT THE LENS CAUGHT) · CTA.
- Illustrative: all moons are procedural drawings; the settings screen is generic (EXAMPLE), not Samsung's UI.
- Thumbnail: `render.mjs --thumb` (hook scene, camera raised + "DETAIL / FROM WHERE?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
