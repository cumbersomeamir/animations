# Production notes — Ideaverse 30s english14-01 (English, lesson style, 2026-11-11 rules)
Why a robot vacuum can dodge a sock but swallow a cable: a camera only names what it was trained on; a laser measures
shape, and a thin flat cable gives it almost nothing to measure; the lists differ by model; payoff: check your model's
list and clear cables before the first mapping run (some models switch avoidance off while learning). Record context/29.
- Beats: 0–4.5 hook (high floor view: the vacuum swerves round a sock, rolls onto a thin cable → STUCK!, "Why?") ·
  4.55–9.5 camera view (frustum; boxes SHOE ✓, SOCK ✓, CORD? on the words; TRAINED TO NAME) · 9.55–14.3 laser (a red line
  sweeps the floor: it rises over the sock with many registered points; push-in to the cable: a ~4 mm bump, one point →
  FEW POINTS) · 14.35–21 card: DEPENDS ON MODEL — Roomba j7 cords ✓ socks ✓ / Roomba j6 cords ✓ socks ✗ / no camera ✗ ✗ →
  CHECK YOURS · 21–26.85 DOCKET gathers the cable; the vacuum starts FIRST MAPPING RUN → AVOIDANCE OFF · CTA.
- Model-specific claims only from iRobot's own support table and Eufy's own support pages; no model is called best/worst.
- Thumbnail: `render.mjs --thumb` (the stuck vacuum at 3.4 s + "SOCK: DODGED / CABLE: EATEN").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
