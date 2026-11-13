# Production notes — Ideaverse 30s english13-01 (English, lesson style, 2026-11-11 rules)
How Face ID knows it's you in total darkness, and why a photo can't fool it: thousands of invisible dots map the face's
3D shape, which is compared with the face stored at setup; a flat photo has no depth, so it fails. Payoff (Apple's own
guidance): twins, look-alike siblings and kids under 13 are more likely to unlock it — if that worries you, use a passcode.
Batch 2026-11-13-english-13 · record context/28 (proposed inpainting topic replaced: repeat of hindi03-01).
- Beats: 0–3.3 dark hook (dots sweep a mannequin face, LOCKED → UNLOCKED) · 3.3–6 escalation (a printed photo of the face
  in front of it → NOPE, "Why?") · 6–11.4 INVISIBLE DOTS (drawn in red) → 3D SHAPE (depth colours + orbit) · 11.4–15.2
  STORED AT SETUP slides in and lines up → MATCH ✓ · 15.2–19.2 dots on the photo lie in one flat sheet (side view) → NO
  DEPTH ✕ · 19.2–24.3 twin + child busts → MAY UNLOCK · 24.3–26.95 passcode → USE A PASSCODE · CTA.
- Depth/lighting: the hook and dot shots dim the key/fill/environment ("total darkness" illustration); the dots are raycast
  from the phone position onto the bust geometry, so their depth colours are real distances in the scene.
- Labels: one large label at a time, fixed at the lower middle of the frame (≈ y 1350 px); captions in the x 100..900 pill.
- Thumbnail: `render.mjs --thumb` (dot-covered face at 10.4 s + "DOTS YOU / CAN'T SEE").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
