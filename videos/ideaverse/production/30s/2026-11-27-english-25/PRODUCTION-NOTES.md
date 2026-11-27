# Production notes — Ideaverse 30s english25-01 (English, lesson style, 2026-11-27 brief + first-frame rule)
How a phone knows it was just snatched: Android's Theft Detection Lock uses AI and the motion sensors to recognise the jolt of a
grab, then running, biking or driving away, and locks the screen in a moment; to avoid false alarms it may not trigger with a
steady Wi-Fi or Bluetooth connection. Payoff: check it's on — Settings › Google › All services › Theft protection. Record context/40.
Proposed topic (AI object removal reinventing the wall behind a stranger) replaced: the mechanism is already covered by
hindi03-01 (context/17, Magic Eraser: AI predicts what would be there; the fill is a guess) and the same proposal was already
replaced in english-08, -11, -13 and -19.
- New setting (choreography varied, identity kept): a night street of shop fronts and lamp posts on the newsroom floor; the thief
  is only a dark sleeve and glove (no person shown, no violence).
- Beats: 0–4.35 hook (a gloved hand reaches for DOCKET's phone; it is yanked away, the camera pans with it, the screen locks
  itself; IT LOCKS / ITSELF?) · 4.35–8.6 card: phone with AI chip + motion axes (Wi-Fi, Bluetooth dim) (AI + MOTION SENSORS) ·
  8.6–13.55 card: calm trace → GRAB spike; RUN / BIKE / DRIVE patterns (THEFT MOTION) · 13.55–15.75 chase close-up: the running
  phone locks with a flash (LOCKED) · 15.75–21.3 card: steady Wi-Fi + Bluetooth links → greyed lock with "?" (FEWER FALSE ALARMS →
  MAY NOT TRIGGER) · 21.3–26.85 DOCKET's phone: Settings › Google › All services › Theft protection → Theft Detection Lock ON
  (CHECK IT'S ON) · CTA.
- Illustrative: the street, the snatch, the sensor traces and their shapes, the lock screens, the settings screen (EXAMPLE;
  generic, not Android's UI — only the documented menu names are used).
- Thumbnail: `render.mjs --thumb` (hook scene + "IT LOCKS / ITSELF?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin; 7 narration clips), qa.sh (ASRPY=<python with faster-whisper>).
