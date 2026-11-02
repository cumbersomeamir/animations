# 12 · Production 30s-01 — "What airplane mode actually switches off"

Round: production-30s-2026-11-02 (user-approved). Output folder: `videos/media-diet/production/30s/2026-11-02/`.
Final file: `media-diet-30s-production-01.mp4`. Format rules: context/11-production-format.md.

## Brief (as approved, condensed)
Genre: tech news & breakthroughs / everyday tech explained. Skill: Visual Investigation STYLE.md (read-only).
Episode: what airplane mode actually switches off. Visual story: navy/violet/cyan examination bench with phone controls,
radio layers and headphone/Wi-Fi props; one event clock toggles cellular, then Wi-Fi/Bluetooth separately; freeze and
highlight differences; no presenter. Claims verified against current Apple/Android support; device defaults vary; do not
generalise flights or imply forbidden use is allowed.

## Final script (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us) — 67 words, 24.0 s of speech
| id | start | end | line | edit vs draft |
|---|---|---|---|---|
| V1 | 0.30 | 2.91 | Airplane mode doesn't turn your phone into a brick. | contraction only |
| V2 | 3.25 | 5.22 | It switches off cellular connectivity. | unchanged |
| V3 | 5.85 | 11.91 | Wi-Fi and Bluetooth may go off too. Depending on the device, each can be turned back on separately. | accuracy: by default Wi-Fi (iPhone) or Wi-Fi + Bluetooth (Pixel) also switch off; "depending on the device and settings" kept as "depending on the device" (settings covered on the board) |
| V4 | 12.55 | 18.12 | So wireless headphones, or an airline's Wi-Fi, can still work, if the airline allows it. | accuracy: Apple's own condition "if the airline allows it" added; timing |
| V5 | 18.75 | 22.17 | The icons are different radios, not one internet switch. | timing ("describe" → "are", "single" dropped) |
| V6 | 23.10 | 27.46 | Follow the airline's instructions, and check which connections are actually on. | timing ("your phone has actually enabled" → "are actually on") |
Draft was 74 words / 27.2 s of speech at the agreed voice speed — too dense for 30 s with breathing room.

## Research (sources checked 2026-11-02; verbatim quotes and claim map in production/30s/2026-11-02/SOURCES.md)
- Apple Support 108785 (published 2026-02-11): "With Airplane Mode, you can turn off cellular and Wi-Fi…", "This turns off all
  radios except for Bluetooth.", "If the airline allows it, you can still use Wi-Fi and Bluetooth in Airplane Mode."
- Google Pixel Phone Help 12639358: "When you first turn on Airplane mode on your Android phone, Wi-Fi and Bluetooth turn off."
  You can change this; "your phone will remember your previous setting"; some steps Android 11+.
- FAA InFO 13010 (2013-10-28): "Airplane Mode" (cellular transmitters off); operators set when passengers may connect to on-board wireless.
- EASA (2014-09-26): "Passengers must at all times follow the airline crew instructions."; "It is up to each airline to decide…"
Claim → source mapping: C1–C9 in SOURCES.md (every voice line and on-screen claim covered; inferences listed separately).

## Storyboard (as rendered; one bench, one event clock, hard cuts on a 0.5 s grid)
| time | layout | finding / action | clock |
|---|---|---|---|
| 0.0–5.5 | L1 bench: switch-on | Hook: all three radio plates transmit; 0.60 airplane button flips (flash + ring); cellular plate OFF, Wi-Fi/Bluetooth dashed "MAY BE OFF"; ghost brick (1.35) struck through (2.45) while the phone screen keeps playing (✓). Setup: cellular plate ringed (3.95). | T−00.6 → T+04.9, tick per second |
| 5.5–9.5 | L2 two sources at T+00.0 | Apple card (highlight "except for Bluetooth") → chips cell OFF / Wi-Fi OFF / BT ON; Google card (highlight "Wi-Fi and Bluetooth turn off") → all OFF; sync line; Bluetooth difference ringed: "differs by device". | frozen T+00.0, no ticks |
| 9.5–12.5 | L3 bench: back on, one by one | Wi-Fi button on (10.25) → Wi-Fi plate transmits; Bluetooth on (11.15); freeze (11.75) + ring: cellular "still off". | T+08.9 → frozen T+11.2 |
| 12.5–18.5 | L4 props | Headphones linked to the Bluetooth plate (13.25), cabin Wi-Fi access point linked to the Wi-Fi plate (14.75), ✓ ✓ (15.9); dashed "airline rules" frame (16.75) + Apple card "If the airline allows it…" | T+11.9 → T+17.9 |
| 18.5–23.0 | L5 freeze + magnify (×2, schematic) | Each control button → its own radio module (leaders 19.2/19.6/20.0); airplane button dashed to all three; ghost "INTERNET" switch (20.75) struck (21.65). | — |
| 23.0–27.5 | L6 KNOWN / DEPENDS | ✓ Cellular switches off (FAA · Apple); ✓ Crew instructions come first (EASA · FAA); ⬚ Wi-Fi & Bluetooth defaults (Apple vs Google); ⬚ When cabin Wi-Fi may be used (FAA · airline); ringed real-state row ON/OFF/ON/ON (25.6). Board held 3.15 s whole. | — |
| 27.5–30.0 | L7 evidence map | Four source tags linked to the final radio stack; signature icon + "Media Diet" + "tech, explained"; Dm add9 + vibraphone; fade 29.2–30.0. | — |
Captions: 10 cues, word groups ≤ 2 short lines, upper-centre (src/data/cues.json; boundaries snapped to speech pauses).

## QA summary (final export; full report production/30s/2026-11-02/QA.md)
- `media-diet-30s-production-01.mp4` SHA-256 `b3bbbf4c2e9b2ed6f40de763479e95178ec0f53d9ab9f5909d98f685c14c9763`
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −15.0 LUFS / −1.9 dBTP · caption ink y 361–462, 0 safe-area violations in 900 frames.
- One ASR + timing pass (faster-whisper base.en): word recall 1.0; every line heard inside its scripted window.
- Contact sheets (representative + all 6 cut boundaries) inspected; fixes listed in QA.md.

## Limits / next
- Meshline Kokoro cache absent here → same public model + stated config rebuilt (possible minor pronunciation differences).
- Not automated (per brief). Next production: reuse context/11 rules, new topic, new research + facts file first.
