# 30 — english-17 (2026-11-15, batch 17) 30 s #01 — English: "One step. Zero access." — a wheelchair needs a 1-in-12 ramp

**Status: DONE.** `videos/help/production/30s/2026-11-15-english-17/help-30s-english17-01.mp4` · SHA-256 `b1463217e515bc69c1d630f426ec9808c2826cc1fc19895e94227a6ddd664fe5`.
Thumbnail `help-30s-english17-thumbnail.png` (frame 0 + "ONE STEP. ZERO ACCESS.") · SHA-256 `aa4636a7600291c2d235c2d4ff204084c0e5181970f91e73e0a374452b5f633a`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`78dcb0a`; batch 16 delivered — not repeated); no render/voice/ffmpeg job running.

## Topic check
Proposed: "Why a wheelchair can be useless without one small change" (doorstep step; ramp gradient and safe design via a miniature home; what a donor
can fund; Indian accessibility guidance). **Not covered** — no earlier script mentions wheelchairs, ramps, steps or accessibility (checked every
`src/script.json`). Used as proposed.

## Store / icon check (2026-11-15)
Play listing "Updated on Sep 15, 2026"; icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); description "Donate essentials in Lucknow
with next-day delivery and verified proof." CTA = verified capability.

## First frame
Frame 0 is the composed hook image at full lamp level: a close-up (camera 1.4×) of a wheelchair user — upright, profile, dignified — whose front
caster has stopped against one lit stone step below a closed door, under "ONE STEP. ZERO ACCESS." (4 words). No caption on frame 0; narration from
0.10 s promises the fix ("Here's the fix") that scenes C–G deliver.

## Story (Theory of Marketing) and final script (English; 74 words; 26.4 s of speech)
| Beat | Start–end (s) | Line |
|---|---|---|
| Hook | 0.10–2.80 | One step can stop a wheelchair. Here's the fix. |
| Open question | 3.10–4.81 | So how gentle must the ramp be? |
| Proof 1 (standard) | 5.10–9.39 | India's accessibility standard: at most 1 in 12 for short ramps. |
| Proof 2 (meaning) | 9.70–12.63 | Every centimetre up needs twelve centimetres along. |
| Proof 3 (example) | 12.95–17.14 | A fifteen-centimetre step needs about 1.8 metres of ramp. |
| Proof 4 (safe design) | 17.45–20.66 | With handrails, a non-slip surface and a level landing. |
| Payoff | 21.00–25.84 | Giving a wheelchair? Check the doorstep: funding a proper ramp may be the real gift. |
| CTA | 27.10–29.67 | To donate essentials in Lucknow, download Help. |

## Sources (accessed 2026-11-15) and claim status
- **I1** Bureau of Indian Standards, IS 4963:1987 "Recommendations for Buildings and Facilities for the Physically Handicapped" (public-safety standard
  published by Public.Resource.Org, https://archive.org/details/gov.in.is.4963.1987 ; local SHA-256 d085368b…f5c12):
  - 3.2: "Considerable energy is needed to propel a wheelchair manually up ramps, over changes in level or over soft or uneven surfaces. Thresholds and
    changes in level should be avoided."
  - 5.1.1: "A ramp when provided should not have a slope greater than 1 in 20 or maximum of 1 in 12 for short distance up to 9 000 mm."
  - 5.1.2: "A ramp shall have handrails on at least one side, and preferably two sides, that are 900 mm high … that extend 300 mm beyond the top and
    bottom of the ramp."
  - 5.1.3: "A ramp shall have a surface that is non-slip …" · 5.1.4: "A ramp shall have a level platform at the top which is at least 1 800 mm long, if a
    door swings out onto the platform or towards the ramp." · 5.3.3: raised thresholds "should not exceed 25 mm".
- **T1** Barrier Free Consultancy Cell, College of Engineering Trivandrum (Kerala; set up under a Social Justice Department grant), "Ready Reference for
  Barrier-Free Built Environments" (October 2021; local SHA-256 7f57aebb…a8534): ramp table — level difference ≥150 ≤300 mm: 1:12, 1200 mm wide;
  ≥300 ≤750 mm: 1:12, 1500 mm, landings every 5 m; handrails "on both sides at heights between 760 mm and 900 mm". (Secondary cross-check.)
- Not readable here: the Harmonised Guidelines and Standards for Universal Accessibility in India 2021 (MoHUA) — divyangjan.depwd.gov.in returned 503 to
  the fetch tool and failed TLS verification for curl; mowr.nic.in / financialservices.gov.in / sports.yas.gov.in failed TLS or reset; not worked around.

| Claim (spoken) | Status | Support |
|---|---|---|
| One step can stop a wheelchair | documented principle | I1 3.2 (changes in level should be avoided; manual propulsion over level changes takes considerable energy) |
| India's accessibility standard: at most 1 in 12 for short ramps | documented (IS 4963 5.1.1; consistent with T1) | I1, T1 |
| Every centimetre up needs twelve centimetres along | arithmetic restatement of 1:12 | I1 |
| A fifteen-centimetre step needs about 1.8 metres of ramp | **calculation** (15 cm × 12 = 180 cm) on an **illustrative** step height | I1 |
| With handrails, a non-slip surface and a level landing | documented (handrails at least one side, preferably two; non-slip; level platform at the top where a door opens onto it) | I1 5.1.2–5.1.4, T1 |
| Giving a wheelchair? Check the doorstep: funding a proper ramp may be the real gift | editorial donor takeaway (no construction instructions) | — |
| To donate essentials in Lucknow, download Help | verified capability | Play listing |
Estimates: none. Not claimed: costs, DIY instructions, ramp widths/landing sizes, that Help builds ramps.

## Storyboard (8 cue scenes on 3 continuous stages; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–2.95 | Frame 0 close-up: the rider's front caster stops against one lit step below a door; "ONE STEP. ZERO ACCESS."; camera eases out. |
| B Question | 2.95–4.95 | A steep wedge appears against the step and gets ✗ ("HOW GENTLE?"). |
| C Standard | 4.95–9.55 | "INDIA'S STANDARD" + "IS 4963"; a to-scale wedge: rise 1 (yellow), run 12 (green blocks) ("MAX 1 IN 12"). |
| D Meaning | 9.55–12.8 | Same diagram: "1 CM UP", the 12 run blocks recount ("12 CM ALONG", "GENTLE BY DESIGN"). |
| E Example | 12.8–17.3 | The house again (to scale): "15 CM" dimension; the ramp unrolls 180 cm from the door ("ABOUT 1.8 M"). |
| F Safe design | 17.3–20.85 | Handrails rise along the ramp; non-slip texture; the level landing at the door glows (labels in turn). |
| G Payoff | 20.85–26.9 | "GIVING A WHEELCHAIR?" → "CHECK THE DOORSTEP" → "FUND THE RAMP": the rider rolls up the ramp unaided; the door opens into light ✓. |
| I CTA | 26.9–30 | Helper + neighbour with the essentials sack; real Help icon + name; "LUCKNOW". |

## Captions (English; zone x 100..900, y 230..1500)
| Time (s) | Card |
|---|---|
| 0.07–1.76 | One step can stop a wheelchair. |
| 1.83–2.90 | Here's the fix. |
| 2.97–4.91 | So how gentle must the ramp be? |
| 4.98–7.10 | India's accessibility standard: |
| 7.17–9.50 | at most 1 in 12 for short ramps. |
| 9.57–12.77 | Every centimetre up needs twelve centimetres along. |
| 12.84–14.54 | A fifteen-centimetre step |
| 14.61–17.21 | needs about 1.8 metres of ramp. |
| 17.28–19.49 | With handrails, a non-slip surface |
| 19.56–20.78 | and a level landing. |
| 20.85–22.04 | Giving a wheelchair? |
| 22.11–23.33 | Check the doorstep: |
| 23.40–26.18 | funding a proper ramp may be the real gift. |
| 26.97–28.67 | To donate essentials in Lucknow, |
| 28.74–29.70 | download Help. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean · AAC-LC 48 kHz stereo · −15.1 LUFS / −1.7 dBTP · captions
x 129–871, y 376–496, 0 violations · frame 0 = hook image (no fade, no caption) · **not listened to** (ASR-only). Details: output `QA.md`.
