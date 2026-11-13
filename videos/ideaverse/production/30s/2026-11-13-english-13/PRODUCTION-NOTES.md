# Production notes — Ideaverse 30s english13-01 (English, lesson style, 2026-11-11 rules)
TOPIC CORRECTION (user, 2026-11-13, same job): why AI-powered hearing aids try to separate speech from a crowded room, and
why two people talking at once remains difficult. Replaces the first english-13 draft (Face ID depth dots, which itself
replaced the inpainting proposal = repeat of hindi03-01); that draft was stopped before render completion and is kept only
in git history (commit 3b655d1). Record context/28.
- Beats: 0–3.7 hook (noisy-room card: voices + clatter flow into a hearing aid → WHICH VOICE?) · 3.7–7.3 escalation
  (DOCKET holds a generic AI chip; hologram SPEECH ✓ / NOISE ✕) · 7.3–13.9 SOUND (one blurred smear) → sliced into a
  PITCH × TIME grid (speech tiles mint, noise brown, clatter white) → KEEP SPEECH mask · 13.9–16.2 clatter falls away,
  VOICES STAY · 16.2–21.9 a SECOND VOICE (amber) lands in the same tiles → split tiles + "?" → OVERLAP (push-in) ·
  21.9–27.15 the same two voices take turns (tiles slide apart) → ONE AT A TIME ✓✓ · CTA.
- No medical outcomes, no performance percentages, no brand on screen; the chip and grid are illustrations of the published
  idea (time-frequency units classified as speech or not), not of any one product's internals.
- Thumbnail: `render.mjs --thumb` (the noisy-room card at 2.6 s + "WHICH / VOICE?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
