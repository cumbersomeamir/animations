# Facts, model assumptions and calculations — Media Diet 45 s Bean physics special (checked 2026-11-09/10)

Event: hundreds of people gathered at Millennium Park on **Sunday, Nov 8, 2026** to "push the Bean seven inches to the left"
(date shown small on screen over the real footage: "Millennium Park · Sunday, Nov 8, 2026"). The Bean did not move.

## Sources (read directly)
| id | source | date | what it supports (verbatim quotes) |
|---|---|---|---|
| N1 | CBS Chicago, *Hundreds gather in Millennium Park to try to push The Bean seven inches to the left*, https://www.cbsnews.com/chicago/news/hundreds-millennium-park-push-the-bean-sunday/ | Nov 9, 2026 5:13 AM CST | "Hundreds of people gathered in downtown Chicago Sunday to try to push the Bean seven inches to the left." · "The plan was simple: Push Chicago's famous Bean (officially a statue named Cloud Gate by Anish Kapoor) seven inches to the left." |
| N2 | WXRT (Audacy), *Push The Bean! Social Media Meme Turns Into Crazy Gathering at Millennium Park*, https://www.audacy.com/wxrt/news/local/push-the-bean-social-media-meme-turns-into-crazy-gathering-at-millennium-park | published 2026-11-08T22:59Z | "…on Sunday afternoon…" · "…push "The Bean" seven inches to the left at exactly 12:47 p.m." · ""The Bean," which weighs about one-hundred tons, did not budge" |
| P1 | Public Building Commission of Chicago (primary), *Millennium Park Sculpture Named Cloud Gate By Artist Anish Kapoor*, https://pbcchicago.com/press_releases/millennium-park-sculpture-named-cloud-gate-by-artist-anish-kapoor/ | Jun 29, 2004 | "elliptical stainless steel sculpture" · "Cloud Gate is one of the world's largest outdoor sculptures, at 110 tons, 66 feet long, 42 feet wide and 33 feet high." · "a seamless series of 168 highly polished, stainless steel 'plates'" · "With a 12-foot high concave area underneath" |
| P2 | Aerotrope (design engineers), *Cloudgate*, https://www.aerotrope.com/what-we-do/art/cloudgate-anish-kapoor-chicago.html | n.d. | "'Cloudgate' is a permanently installed stainless steel sculpture." · "a 6mm thick outer shell of seamless high polished steel, supported by a temperature-responsive inner shell." · "An interior structure provides the frame for the outer shell" · "a suspension system based around two large steel rings" · "Thirty-two custom-made suspension units bear the entire 80 tons weight of the work" |
| P3 | Stuart Dean (maintenance contractor), *Cloud Gate aka the 'Bean'*, https://www.stuartdean.com/resource/cloud-gate-aka-the-bean/ | 2023 (mod. 2026) | "At 66 feet long, 33 feet high, 42 feet wide and weighing in at 110 tons (yes – 220,000 lbs!) the sculpture is comprised of 168 stainless steel plates welded together" |

**Mass used:** 110 US short tons = 220,000 lb = **99,790 kg ≈ 100,000 kg** (P1, P3; N2 "about one-hundred tons"). Not 110,000 kg.
**Discrepancy noted:** Aerotrope (P2) gives "80 tons" for the weight borne by the suspension units; with 80,000 kg the same idealised
model would give ≈ 1,300 people instead of ≈ 1,600. The episode uses the 110-short-ton figure the user specified and P1/P3 report.
**Structure:** a hollow shell on an interior frame (two rings, 32 suspension units — P2), permanently installed; the episode shows
this only as a labelled schematic ("structural supports + foundation (schematic)"), with no engineering detail, anchor strengths or
dismantling information. The real sculpture's resistance depends on its supports/foundation connections, which are not public here,
so no real-world people count is claimed; pushing could damage the structure rather than slide it.

## IMAGINARY LOOSE BEAN — idealised model (labelled on screen on every model page)
Assumptions (illustrative, NOT measured on the Bean): flat ground, no lifting; static friction coefficient **μs = 0.5**; each person
pushes horizontally with **300 N**, all aligned and simultaneous. A block with a Bean silhouette stands in for the shape; no contact
shape or friction of the real object is claimed.

## Calculations (independently re-computed)
| quantity | working | result shown |
|---|---|---|
| mass | 220,000 lb × 0.45359237 kg/lb | m ≈ 99,790 kg |
| weight = normal force (flat ground) | N = m·g = 99,790 × 9.81 | ≈ 978,900 N → "≈ 979,000 N" / "979 kN" |
| start-to-slide threshold | F_start = μs·N = 0.5 × 978,943 | ≈ 489,500 N → "≈ 490,000 N" / "490 kN" |
| people | n > 489,472 ÷ 300 = 1,631.6 → n ≥ 1,632 | "n > 490,000 ÷ 300 ≈ 1,632 · about 1,600 — idealised estimate" |
| sensitivity | μs 0.3 → 979; μs 0.6 → 1,958 | "μs 0.3–0.6 → roughly 1,000–2,000" |
| example crowd | 250 × 300 N = 75,000 N = 75 kN (≈ 15 % of 490 kN) | "example only, not the real crowd size" |
| angled push | sideways part = F·cos θ (e.g. θ = 50°: 300 N → 193 N) | "F_sideways = F·cos θ" |
| distance | 7 in × 0.0254 m/in = 0.1778 m | "7 in = 0.178 m — a distance, not a force" |
| once moving | ΣF = m·a (the 0.178 m depends on how long net force acts, not on the start threshold) | "once moving: ΣF = m·a" |
Opposite pushes cancel (vector sum ≈ 0). Real crowds are limited by traction, space, reach and coordination — most people cannot touch
the surface at all. Real case: the support/foundation reaction balances the push; a reliable answer needs anchor strength and contact
geometry, not "110 tons ÷ 300 N".

## Narration (spoken = captions; numerals in captions)
| id | line |
|---|---|
| V1 | Chicago tried to move the Bean seven inches. The Bean declined. |
| V2 | How many people would it actually take? |
| V3 | The real one is structurally supported, so imagine a loose Bean. |
| V4 | Assume friction resists half its weight, and each person pushes 300 newtons. |
| V5 | That's 490,000 newtons: about 1,600 perfectly coordinated people. |
| V6 | Perfectly is doing a lot of work. |
| V7 | Opposite pushes cancel. Angled ones only partly help. Most people can't reach it. |
| V8 | Seven inches is a distance, not the starting force. |
| V9 | The real Bean needs an anchoring calculation. |
| V10 | Chicago brought the squad. The Bean brought a foundation. |
| V11 | Follow Media Diet for the physics behind the headlines. |
"Friction resists half its weight" = μs·N with μs = 0.5 and N = mg (weight is a force; kilograms are mass — the VO avoids "weighs …
kilos"). "Angled ones only partly help" (not "barely") because F·cos θ is still a real contribution.

## Footage
User-supplied event video committed on this branch: `videos/media-diet/assets/user-footage/2026-11-10-chicago-bean.mp4`
(720×1280, 30 fps, 14.83 s; SHA-256 0a631a1f186d797b03cbf1106d571fb83d4aeae146db7b93a212eebfb249a362). Used: frames 180–284
(6.0–9.5 s, the crowd pressed against the Bean), scaled 1.5× to 1080×1920 with a gentle 5 % push-in; its baked label "100s of
Chicagoans vs. one giant Bean" is kept and sits above our caption band (y ≈ 150–250 px vs captions 378–488 px); the large baked
caption in its first 5 s is not used. Original audio is not used (replaced by narration, a quiet synthesized pad and foley).
