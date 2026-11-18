# Production notes — Ideaverse 30s english20-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
Why Face ID's "under one in a million" does not hold for your twin: Face ID maps the face in 3D with thousands of invisible
dots; a neural network turns the depth map into numbers and compares them with the enrolled face; Apple says the odds rise for
twins, look-alike siblings and children under 13, and rise again with Face ID with a mask; payoff: if that is your home, use a
passcode, or turn mask mode off. Record context/35.
Proposed topic (reading a handwritten shopping list from a photo) replaced: it repeats english07-01 (context/22). A Face ID draft
was started and stopped in english-13 (git 3b655d1) and never delivered, so no published episode covers it.
- Beats: 0–4.6 hook (two near-identical busts, DOCKET's phone locked; 1 IN A MILLION? from frame 0) · 4.6–5.75 superhook
  ("Your twin's?" — the twin lights up) · 5.75–10.1 scan: beam, depth colours (3D MAP), dot grid (THOUSANDS OF DOTS) ·
  10.1–14.5 card: face → bars (FACE → NUMBERS), compared with the saved row → ✓ (MATCH) · 14.5–19.9 the twin's row lands
  almost on top (TOO CLOSE) + TWIN / SIBLING / UNDER 13 chips · 19.9–22 a mask covers the lower face, its dots go out
  (MASK MODE: HIGHER) · 22–26.85 DOCKET's phone: passcode keypad (USE A PASSCODE) → "Face ID with a Mask" toggle off
  (MASK MODE OFF) · CTA.
- Illustrative: busts, depth colours, dot pattern, bar rows and their values, all phone screens (EXAMPLE; not Apple's UI).
- Thumbnail: `render.mjs --thumb` (hook scene, camera raised + "1 IN A / MILLION?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
