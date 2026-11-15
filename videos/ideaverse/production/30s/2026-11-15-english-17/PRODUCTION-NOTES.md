# Production notes — Ideaverse 30s english17-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
How a phone keeps the moment from before you pressed: the camera keeps shooting into a loop of recent frames from the moment
it opens, and the shutter picks frames already taken (zero shutter lag); Live Photos and Top Shot keep 1.5 s on each side;
Top Shot's on-device model suggests a sharper frame; payoff: open the motion frames and pick the jump yourself. Record context/32.
- Beats: 0–3.85 hook (phone shows the mid-air jump, touch dot on the shutter, BEFORE YOU CLICKED from frame 0) · 3.85–8.45
  frame ring (ALREADY SHOOTING → ON A LOOP) · 8.45–10.85 the press: latest frames fly into one photo, the dog already
  landing (ALREADY TAKEN) · 10.85–15.3 card: 7 frames around the press, ±1.5 s (1.5 S EACH SIDE) · 15.3–19.9 scan, ✓ on the
  mid-air frame (AI SUGGESTS) · 19.9–26.85 frame picker: drag back to the jump, "Use this frame" → ✓ (PICK THE FRAME) · CTA.
- The buffer (all phones' zero-shutter-lag idea, documented for Pixel) and the AI suggestion (Top Shot only) are told apart.
- Illustrative: the dog scene, the ring and its capture rate, the 7-frame spacing, blur levels, the picker UI (EXAMPLE).
- Thumbnail: `render.mjs --thumb` (hook scene, camera raised + "BEFORE YOU / CLICKED").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
