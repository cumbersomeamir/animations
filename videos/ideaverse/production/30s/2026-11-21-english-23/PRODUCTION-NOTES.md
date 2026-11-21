# Production notes — Ideaverse 30s english23-01 (English, lesson style, 2026-11-21 brief + first-frame rule)
AI that cuts your stops at red lights without driving a car: Google's Project Green Light reads anonymous, aggregated Google
Maps driving trends, finds crossings where cars keep stopping, and suggests new signal timing to city engineers (a little more
green, or neighbouring lights that turn green in a wave). Measured example with its scope: in Boston's pilot, one crossing
(Atlantic Ave & Richmond St) saw 33% fewer unnecessary stops. Payoff: results vary; if one light always stops you, report it
to your city. Record context/38.
Proposed topic (Project Green Light) was new → used as briefed (english10-01 was a different question: the map's ETA/jam
prediction for the driver; see context/38).
- New setting (choreography varied, identity kept): a tiny night city on the newsroom floor — one avenue, three signalised
  crossings, ~25 cars from a deterministic car-following simulation (stop lines obey the signals; same result on every worker).
- Signal timing (illustrative): cycle 4 s, green 2 s (incl. 0.35 s amber). Hook = green-wave offsets 0/2/4 s; trends shot =
  old timing (all three switch together, offsets 2/2/2 s) so cars stop at crossing 2 and 3; from 13.0 s crossing 2 turns green
  early ("+6 s green") and the offsets become −1/1/3 s (a wave matching the 2 s drive between crossings).
- Beats: 0–4.6 hook (high view down the avenue, green band travelling with the released cars; AI THAT CHANGES / YOUR COMMUTE)
  · 4.6–9.95 top-down: red dots where past trips stopped, a red heat at each crossing, the worst pulses (MAPS DRIVING TRENDS,
  MOST STOPS HERE) · 9.95–12.55 DOCKET's phone: engineer view, Crossing 2 · Suggestion +6 s green (+ wave) → ACCEPT
  (ENGINEERS DECIDE) · 12.55–16.1 street level: crossing 2 turns green (+6 s GREEN), crossing 3 turns green as the cars arrive
  (GREEN WAVE) · 16.1–21.45 card: BOSTON PILOT · one crossing (Atlantic Ave & Richmond St) · −33% unnecessary stops, before/after
  bars, "Source: City of Boston, May 2025 (evaluated with INRIX)" (ONE CROSSING, ONE PILOT) · 21.45–26.85 DOCKET's phone:
  report a traffic-light timing problem → SENT (RESULTS VARY, REPORT A BAD LIGHT) · CTA.
- Illustrative: the city, cars, timings, dots, heat, the "+6 s" value, the engineer and report screens (EXAMPLE; generic, not
  Google's dashboard or any city's 311 app). Only the Boston −33% (one crossing, pilot) is a measured figure.
- Thumbnail: `render.mjs --thumb` (hook scene + "GREEN / WAVE").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
