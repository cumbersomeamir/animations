# Production notes — Ideaverse 30s english24-01 (English, lesson style, 2026-11-23 brief + first-frame rule)
Why an iPhone charges to 80% overnight and then waits: Optimized Battery Charging. Batteries age faster when they sit at full
charge, so on-device machine learning learns your daily charging routine; after at least 14 days and at least 9 charges of 5 h+
in one place, it holds at 80% and finishes shortly before you usually need it. Payoff: need it full now? Touch and hold the
notification, then tap Charge Now. Record context/39.
Proposed topic (phone camera reading/translating a menu) replaced: it repeats round02-01 (context/16: photo text → copy or
translate a menu, with a Spanish menu flipping to English), and the same proposal was already replaced in english-15 (context/30).
- New setting (choreography varied, identity kept): a bedside at night on the newsroom floor — nightstand, a phone on a stand,
  an alarm clock, a lamp, a window from night to dawn.
- Beats: 0–4.95 hook (1:10, phone at 80%; the clock races to 3:40 on "then waits"; WHY STUCK / AT 80%?) · 4.95–6.55 close-up:
  a shield closes over the 80% ring (NOT BROKEN) · 6.55–9.45 card: 100% battery, hours at full tick, aging bar grows
  (FULL = FASTER AGING) · 9.45–15.55 card: ON THE PHONE; 14 nights of plug-in bars; "usually unplugged"; ✓ 14+ DAYS,
  ✓ 9+ CHARGES, 5 H+, ✓ SAME PLACE (LEARNS YOUR ROUTINE) · 15.55–20.6 the night: clock runs, ring amber + pause (HOLDS AT 80%),
  then 80 → 100 by 6:55, dawn, the 7:00 alarm (FULL WHEN YOU WAKE) · 20.6–26.85 DOCKET's phone: "Charging paused at 80% · full
  by 6:55" → touch and hold → Charge Now → "Charging now 81%" (NEED IT NOW? → CHARGE NOW) · CTA.
- Illustrative: all times (1:10, 6:55, 7:00), the 8-hour counter, the aging bar, the 14 plug-in bars, the generic lock screen and
  notification (EXAMPLE; not Apple's UI). Documented: the learning, the 14-day / 9-charge / 5-hour / same-location conditions,
  holding past 80%, finishing shortly before you need it, touch-and-hold → Charge Now.
- Thumbnail: `render.mjs --thumb` (hook scene + "STUCK AT / 80%?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin; 8 narration clips), qa.sh (ASRPY=<python with faster-whisper>).
