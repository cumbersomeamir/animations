# 31 — english-18 (2026-11-15, batch 18) 30 s #01 — English: "Same sun. Two roofs." — cool roofs and the heat burden on low-income homes

**Status: DONE.** `videos/help/production/30s/2026-11-15-english-18/help-30s-english18-01.mp4` · SHA-256 `198bd1a31888e452fff08ad137bfafed2ea36e6a2aa3e14bfff06b2a82ab466e`.
Thumbnail `help-30s-english18-thumbnail.png` (frame 0 + "SAME SUN. TWO ROOFS.") · SHA-256 `6530d8f459e70306290fda5af52e33bee3fe6e1d9d475a55839baf5042aadc9b`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`363669c`; batch 17 delivered — not repeated); no render/voice/ffmpeg job running.

## Topic check
Proposed: "Why a cheap white roof can make a home easier to live in" (cool roofs; heat burden on low-income households; absorption vs reflection;
documented programmes; what a donor can fund; no invented temperature drop). **Not covered** — no earlier script mentions roofs, heat or cooling
(checked every `src/script.json`). Used as proposed; "cheap" is not claimed (no prices).

## First frame
Frame 0 is the composed split-roof image at full lamp level: one sun; the left home's dark roof glows hot and its room is lit orange with heat
ripples; the right home's white roof sends the sun's rays back up; a resident stands in each room; plaque "SAME SUN. TWO ROOFS." (4 words). No
caption on frame 0; narration from 0.10 s asks the question the episode answers ("Why is one room hotter?").

## Story (Theory of Marketing) and final script (English; 75 words; 25.1 s of speech)
| Beat | Start–end (s) | Line |
|---|---|---|
| Hook | 0.10–2.89 | Same sun, same home. Why is one room hotter? |
| Escalation | 3.20–6.26 | A dark roof soaks up sunlight and passes heat inside. |
| Open question | 6.55–7.94 | Can white paint change that? |
| Proof 1 (mechanism) | 8.30–11.68 | A cool roof reflects more sunlight, so less heat gets in. |
| Proof 2 (programme) | 12.00–17.47 | In Ahmedabad, Mahila Housing Trust coats low-income homes with white reflective paint. |
| Proof 3 (city) | 17.85–20.44 | The city added cool roofs to its heat action plan. |
| Payoff | 21.30–25.17 | Results vary, but suitable paint and labour are practical to fund. |
| CTA | 27.10–29.67 | To donate essentials in Lucknow, download Help. |
Voice-only spelling: "Mahilaa" (captions "Mahila").

## Sources (accessed 2026-11-15) and claim status
- **E1** U.S. Environmental Protection Agency, "Using Cool Roofs to Reduce Heat Islands" (last updated 18 June 2026),
  https://www.epa.gov/heatislands/using-cool-roofs-reduce-heat-islands (local HTML SHA-256 prefix a8b4e4a2…): "A cool roof absorbs and transfers less heat from
  the sun to the building compared with a more conventional roof. A high solar reflectance, or albedo, is the most important characteristic …" ·
  "Together, these properties reduce temperatures on the roof, inside the building, and in the surrounding ambient air." · product list includes
  "Liquid-applied roof coatings with light or cool colors" and metal roofing "coated with reflective paint". (The page also states that in
  non-air-conditioned homes cool roofs "can lower maximum indoor temperatures by 1.2–3.3°C" — **not used**, per brief.)
- **D1** Down To Earth, "Beyond the thermometer: Ahmedabad uses cool roofs, misting bus stops & heat insurance for climate resilience" (16 Jun 2025)
  (local HTML SHA-256 prefix 129e164f…): "Mahila Housing Trust (MHT), headquartered in Ahmedabad, is an organisation focused on providing housing and community
  support to low-income women." · "Cool roofs are among the measures being implemented. These systems make use of reflective materials such as coatings
  of white reflective paint on the roofs. This helps deflect the sunlight falling on the houses, reducing the heat being transferred inside" · MHT's
  programme manager: "now the Ahmedabad Municipal Corporation (AMC) has included this in the city's Heat Action Plan."
- Background only (not scripted): The Climate Group, "Telangana's cool roof policy: pilot demonstration to policy implementation" (16 Jan 2024) — Telangana
  Cool Roof Policy 2023-28 "mandates cool roofs for all the government, non-residential, and commercial buildings"; it also quotes an indoor-temperature
  range (not used). NRDC's Ahmedabad cool-roof pages returned 403 to automated fetches (not quoted).

| Claim (spoken) | Status | Support |
|---|---|---|
| Same sun, same home. Why is one room hotter? | illustrative premise (two identical homes, different roofs) | — |
| A dark roof soaks up sunlight and passes heat inside | documented mechanism | E1 (a conventional roof absorbs and transfers more of the sun's heat than a cool roof) |
| A cool roof reflects more sunlight, so less heat gets in | documented mechanism | E1, D1 |
| In Ahmedabad, Mahila Housing Trust coats low-income homes with white reflective paint | documented (reported) | D1 |
| The city added cool roofs to its heat action plan | **reported statement** (MHT programme manager, quoted by D1) | D1 |
| Results vary, but suitable paint and labour are practical to fund | editorial takeaway; no guarantee, no prices | E1 (effects depend on roof/coating) |
| To donate essentials in Lucknow, download Help | verified capability | Play listing |
Estimates: none. Not claimed: any temperature drop, energy saving, cost, or that Help paints roofs.

## Storyboard (8 cue scenes on 3 stages; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–3.05 | Frame 0 split roof (above); rays flow continuously: absorbed with a hot flare on the dark roof, bounced away off the white one. |
| B Dark roof | 3.05–6.4 | Camera moves onto the dark-roof home: the roof glows, heat ripples sink into the room ("SOAKS UP HEAT" → "HEAT INSIDE"). |
| C Question | 6.4–8.15 | Back to both homes; a WHITE paint can appears between them ("WHITE PAINT?"). |
| D Reflects | 8.15–11.85 | Camera moves onto the white-roof home: rays bounce away, the room stays light ("REFLECTS MORE" → "LESS HEAT IN"). |
| E Ahmedabad | 11.85–17.65 | A row of small homes with dark roofs ("AHMEDABAD", "MAHILA HOUSING TRUST", "LOW-INCOME HOMES"); a roller coats them white one by one ✓. |
| F City plan | 17.65–21.15 | "HEAT ACTION PLAN": a second, farther row of roofs turns white across the city. |
| G Payoff | 21.15–26.9 | A home with a hot dark roof; reflective paint can + roller with the helper; the roof turns white, the room cools ("RESULTS VARY" → "PAINT + LABOUR" → "PRACTICAL TO FUND") ✓. |
| I CTA | 26.9–30 | Helper + neighbour with the essentials sack; real Help icon + name; "LUCKNOW". |

## Captions (English; zone x 100..900, y 230..1500)
| Time (s) | Card |
|---|---|
| 0.07–1.49 | Same sun, same home. |
| 1.56–3.02 | Why is one room hotter? |
| 3.09–6.32 | A dark roof soaks up sunlight and passes heat inside. |
| 6.39–8.12 | Can white paint change that? |
| 8.19–11.78 | A cool roof reflects more sunlight, so less heat gets in. |
| 11.85–14.24 | In Ahmedabad, Mahila Housing Trust |
| 14.31–17.63 | coats low-income homes with white reflective paint. |
| 17.70–20.79 | The city added cool roofs to its heat action plan. |
| 21.15–22.46 | Results vary, but |
| 22.53–25.52 | suitable paint and labour are practical to fund. |
| 26.97–28.67 | To donate essentials in Lucknow, |
| 28.74–29.70 | download Help. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean · AAC-LC 48 kHz stereo · −15.1 LUFS / −1.6 dBTP · captions
x 122–878, y 376–496, 0 violations · frame 0 = hook image (no fade, no caption) · **not listened to** (ASR-only). Details: output `QA.md`.
