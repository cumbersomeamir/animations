# Sources — Media Diet english-18 (30 s): "Copper isn't magnetic." — a 3D-printed hoverboard that floats over copper

Topic selected 15 Nov 2026 (batch 18, after batch 17 was delivered). Excluded: tensegrity robots/claws (english-17), COMAC CE-25A
(english-16), the Bean, Starship catch (english-15), BYD 503 km/h, wheeled Atlas, MIT metamaterials and every earlier topic in the
context/11 log. Benchmark used: the Bean episode's clear question → physical stakes → first-principles answer.

**Event and true date (inside the 72-hour window):** YouTuber Jake Rogers (channel "aprotohype") published "I Built a REAL Hoverboard from
Scratch" on **13 Nov 2026, 02:17 UTC** (12 Nov in U.S. time zones), per the channel's YouTube RSS feed. Coverage: Hackster.io and
TechEBlog **14 Nov 2026**, Interesting Engineering **15 Nov 2026**. The demonstration footage belongs to the creator and is not licensed
for reuse, so the film is an editorial reconstruction; none of his footage or photos is used.

Checked in the window and rejected:
- China's "Light Cavalry" solar drone maiden flight — Global Times dated 11 Nov 2026 (outside 72 h); design endurance only, and battery
  physics overlaps english-16.
- Airbus A350-1000ULR 14,388-mile record flight (IE, 11 Nov) — outside 72 h; range physics overlaps english-16.
- BYD nine-minute charging SUV (IE, 14 Nov) — a target, not a demonstration; BYD was english-12.
- 30 MWh battery, wireless-charging alignment, micro-hydro study, WAAM patch case study (IE, 13–15 Nov) — studies/products without a
  tangible "impossible-looking" moment or with no primary demonstration.
- Kestrel soaring robot (paper 21 Jun 2026), carrier drone launch (military, 5 Nov release), rocket launches (genre covered by english-15).

## Primary / demonstration
1. Jake Rogers, "I Built a REAL Hoverboard from Scratch", YouTube, published 2026-11-13T02:17:31Z — https://www.youtube.com/watch?v=LDp9qqaX-sU
   (title/author confirmed via YouTube oEmbed; date via https://www.youtube.com/feeds/videos.xml?channel_id=UC2zwppr1Jj1m74o8AkWe7IQ).
   The video itself could not be played or transcribed from this environment; its content is taken from the three write-ups below.
2. aprotohype.com (the creator's site) — HALO–1 full-size concept "Requires a conductive surface. Rideability and payload are not yet
   validated"; fingerboard concept "Requires a conductive play pad".

## Coverage (describing the video)
- Hackster.io, Nick Bild, 14 Nov 2026 — https://www.hackster.io/news/this-homemade-hoverboard-floats-on-magnets-b78b1d63ba45 :
  "When a magnetic field moves across a conductive material, it generates electrical currents called eddy currents. These currents produce
  magnetic fields of their own that oppose the original field, creating a repulsive force"; two counter-rotating rotors cancel reaction
  torque; two 3S LiPo packs in series, 22.2 V nominal.
- TechEBlog, Jackson Chung, 14 Nov 2026 — https://www.techeblog.com/real-life-hoverboard-project/ : palm-sized board a few millimetres above
  a thick copper plate; two rotors spinning in opposite directions, each with a ring of twelve N52 magnets in a Halbach arrangement; magnets
  cut from sixteen to twelve per rotor because centrifugal force kept flinging them outward (~40% less outward force at the same speed).
- Interesting Engineering, 15 Nov 2026 — https://interestingengineering.com/innovation/3d-printed-hoverboard-prototype : same build; Rogers'
  estimates: "a force of around 61 newtons was exerted on a 3.84-gram magnet rotating at 8,000 rpm"; one rotor ~941 grams-force of lift at
  3,000 rpm with a 5 mm gap — he said not to rely on these numbers because the device rattled; not completely steady yet.

## Physics
- OpenStax *University Physics Vol. 2* §12.7 Magnetism in Matter (Table 12.1): copper is diamagnetic, χ = −9.7 × 10⁻⁶ (a magnet does not
  stick to it) — https://openstax.org/books/university-physics-volume-2/pages/12-7-magnetism-in-matter
- §13.1 Faraday's Law — a changing magnetic flux induces an emf — https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law
- §13.2 Lenz's Law — the induced current "always oppose[s] the change in magnetic flux that causes the emf" —
  https://openstax.org/books/university-physics-volume-2/pages/13-2-lenzs-law
- §13.5 Eddy Currents — a moving field sets up eddy currents in a conductor; the conductor feels a force opposing the relative motion —
  https://openstax.org/books/university-physics-volume-2/pages/13-5-eddy-currents
- *University Physics Vol. 1* §6.3 Centripetal Force, F = mω²r — https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-force
  Check of the creator's number: 8,000 rpm = 837.8 rad/s; 61 N ÷ (0.00384 kg × 837.8²) → r ≈ 22.6 mm, a plausible rotor radius
  (radius not published, so this is a consistency check, not a measurement). 61 N ÷ 9.81 m/s² ≈ 6.2 kg-force ≈ 1,600× the magnet's weight.

## Facts vs. estimates vs. illustration
| Claim (narration) | Kind | Source |
|---|---|---|
| Copper isn't magnetic. | measured material property (diamagnetic, χ ≈ −10⁻⁵) | OpenStax 12.7 |
| Yet this hoverboard by Jake Rogers floats over it. | demonstrated (creator video; three independent write-ups) | 1, Hackster, TechEBlog, IE |
| Two rings of magnets spin, driving swirling currents in the copper. | reported build (two rotors, 12 magnets each) + induction physics | TechEBlog, IE, OpenStax 13.1/13.5 |
| Those currents make their own magnet, and it pushes back. | physics (Lenz's law), as explained in coverage | OpenStax 13.2, Hackster |
| Stop spinning, and it drops. | physics: no changing flux → no eddy current → no lift | OpenStax 13.1/13.5 |
| at 8,000 rpm, a 4-gram magnet pulls outward like 6 kilos | **creator's estimate** (61 N on 3.84 g at 8,000 rpm), converted (≈ 6.2 kgf); on screen labelled "creator's estimate" | IE; F = mω²r check |
| So the lift needs motion and metal: no copper, no hover. | physics + the creator's own requirement ("requires a conductive surface") | OpenStax 13.5, 2 |

Not claimed: flight time, payload, top speed, height, price or release dates of any product (the creator's site lists waitlists and target
prices; none are mentioned), the lift figures (creator says they are unreliable), heating of the plate. Visuals: generic paper reconstruction
(pink shell, two 12-magnet rotors, schematic red/blue pole colours), the hover gap is exaggerated for visibility, eddy-current loops and
arrows are schematic, the on-screen spin is slowed so the magnets read, the 6 kg weight is a scale comparison.
