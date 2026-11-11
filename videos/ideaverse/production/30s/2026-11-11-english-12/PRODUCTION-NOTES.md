# Production notes — Ideaverse 30s english12-01 (English, lesson style, 2026-11-11 feedback rules)
Why a cloned voice can sound like someone you know: a short clip → the software learns how the voice sounds → it says
brand-new words in that voice → familiarity feels believable; it copies the sound, not what the person knows (family code
word); payoff: hang up and call back on a number you already know. Batch 2026-11-11-english-12 · record context/27.
- Story beats per the new pacing: 0–3 hook ("A familiar voice is no longer proof." + NOT PROOF stamp) · 3–5 escalation
  (the call: "Need money, fast!" → NEVER SAID) · 5–21 mechanism + proof (SHORT CLIP → VOICE PATTERN → NEW WORDS →
  SOUNDS LIKE SAM → SOUND ✓ / WHAT SAM KNOWS ✕ code word) · 21–26 payoff (hang up → contacts → saved number → "I'm fine")
  · 27–30 CTA "Download the Ideaverse app." One idea per card, large 1–3-word labels; voice carries the detail.
- Captions moved to the 2026-11-11 safe area: pill centred at x 500, max 800 wide (x 100..900), top y 344 (inside y 230..1500,
  top 300 px clear). QA checker updated to the new spec.
- Separate thumbnail: `render.mjs --thumb` (window.renderThumb: two-shot at 4.9 s + "THAT VOICE LIED.").
- Kept: english-11 src (accepted renderer = pilot-01 engine), DOCKET, newsroom, approved English Kokoro voice, quiet
  event-linked score (stings placed in pauses), −15 LUFS master.
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
