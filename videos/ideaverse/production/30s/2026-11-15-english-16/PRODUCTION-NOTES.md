# Production notes — Ideaverse 30s english16-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
Why a smart speaker wakes when nobody said the wake word: on standby a tiny on-device model checks short snippets of
sound for the wake word and sends nothing until a snippet sounds close enough; researchers played TV at smart speakers and
every show woke one up ("Maybe I don't like the cold" woke a Google speaker). Payoff: if a Google speaker wakes too
often, lower its sensitivity in the Home app. Record context/31.
Proposed topic (hum to search) replaced: it repeats english11-01 ("Name a song you can only hum").
- Narration never speaks a real wake phrase (so the video cannot wake viewers' speakers); the phrase appears only as text.
- Beats: 0–3.85 hook (TV line on screen, the speaker's ring lit, DOCKET puzzled; WHO WOKE IT? from frame 0) ·
  3.85–12.7 x-ray of the speaker: a small chip glows (ON DEVICE); sound snippets fly from the TV into it, are checked and
  dropped; the cloud stays dim (NOTHING SENT); a match meter gets its wake line (CLOSE ENOUGH?) · 12.7–17.3 card: 12 TV
  show tiles, then a lit-ring badge on every one (12 TV SHOWS → 12 OF 12) · 17.3–20.85 the line plays again: its snippet
  pushes the meter over the line, the ring lights, the audio flies to the cloud (SENT) · 20.85–25.4 settings phone:
  Sensitivity slider Default → Less (LESS SENSITIVE) · 25.4–26.85 the same line stays under the raised line (STAYS
  ASLEEP) · CTA.
- Illustrative: the TV show and its figures, the speaker design (generic puck + ring), the chip, snippet tiles, the meter,
  its values and the threshold positions, the settings screen (labelled EXAMPLE; not Google Home's UI).
- Thumbnail: `render.mjs --thumb` (hook scene, camera raised + "WHO / WOKE IT?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
