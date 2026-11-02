# Sources and claim map — Recall 30 s production 01

All sources are public, checked 2026-11-02 in this session (quotes as retrieved). Short phrases are cited for
verification only; no source text or images are reproduced in the video.

| id | source | used for |
|---|---|---|
| S1 | OpenStax, *College Physics 2e*, §11.7 "Archimedes' Principle" — https://openstax.org/books/college-physics-2e/pages/11-7-archimedes-principle | "The buoyant force on an object equals the weight of the fluid it displaces." · "Drop a lump of clay in water. It will sink. Then mold the lump of clay into the shape of a boat, and it will float. Because of its shape, the boat displaces more water than the lump and experiences a greater buoyant force. The same is true of steel ships." · "The average density of an object is what ultimately determines whether it floats. If its average density is less than that of the surrounding fluid, it will float." · "Since the object floats, its mass and that of the displaced fluid are equal" |
| S2 | OpenStax, *College Physics 2e*, §11.2, Table 11.1 "Densities of Various Substances" — https://openstax.org/books/college-physics-2e/pages/11-2-density | iron or steel 7.8 × 10³ kg/m³; water (4 °C) 1.000 × 10³ kg/m³; sea water 1.025 × 10³ kg/m³ |
| S3 | OpenStax, *University Physics Volume 1*, §14.4 "Archimedes' Principle and Buoyancy" — https://openstax.org/books/university-physics-volume-1/pages/14-4-archimedes-principle-and-buoyancy | same principle; "The average density of an object is what ultimately determines whether it floats." |
| S4 | Gard, "Why do ships float?", Gard Insights, 15 Aug 2012 — https://gard.no/insights/why-do-ships-float/ | "Much of the interior of a ship is air (compared with a bar of steel, which is solid)"; "a floating object displaces its own weight in water" |
| S5 | Texas Administrative Code, 19 TAC §112.7 Science, Grade 5 (adopted 2021; Texas Register 47(16), eff. 26 Apr 2022), via Cornell LII — https://www.law.cornell.edu/regulations/texas/19-Tex-Admin-Code-SS-112-7 | (b)(6)(A) "compare and contrast matter based on … physical properties, including mass, magnetism, relative density (sinking and floating using water as a reference point), …" — supports the "fifth-grade science question" framing. LII is a reproduction; the official SOS site only showed a "site has moved" notice. England's Year 5 programme of study does **not** list floating/sinking (it is at KS3), so the claim is limited to "a grade-5 topic in the Texas standards". |

S1–S3 are OpenStax books (CC BY-NC-SA 4.0 per the page). They are cited and linked only, not reproduced.

## Claim → source
| # | claim (narration / on screen) | t (s) | sources |
|---|---|---|---|
| 1 | "A steel ball sinks." | 0.4 | S2 (steel 7.8 > water 1.0), S1 (a lump sinks; denser than the fluid → sinks) |
| 2 | "A steel ship floats." | 1.85 | S1/S3 ("The same is true of steel ships.") |
| 3 | "Same material." Ball and ship are the same steel (equal weight in this model) | 3.3 | modelling choice: equal steel volume, shown by equal "weight" arrows |
| 4 | "Q1 · Grade 5 science" badge / "fifth-grade science question" in the title | 0.6+ | S5 (Texas Grade 5 TEKS: sinking and floating, relative density) |
| 5 | "the ship's hollow shape displaces much more water for its weight" | 8.65 | S1 ("Because of its shape, the boat displaces more water than the lump") |
| 6 | Markers: ship raises the water ≈ 8× more than the ball (1× vs ≈8×) | 11.05 | computed: floating ship displaces its own weight of water = 7.8 × steel volume (S1 + S2 ratio, fresh water); the ball displaces 1 × steel volume. Level rise = displaced volume ÷ chamber area (`qa/physics.json`: 0.00695 vs 0.0542, ratio 7.80). |
| 7 | "The water pushes upward." (lime arrows up) | 13.75 | S1 (buoyant force) |
| 8 | Ball's push arrow = 1/7.8 of its weight; resting ball shows push only | 13.75 | S1 + S2 |
| 9 | "When that buoyant force balances the ship's weight, it floats." (push = weight, "=") | 15.3 | S1 ("its mass and that of the displaced fluid are equal"), S4 ("a floating object displaces its own weight in water") |
| 10 | "Fill the hull with water, and the situation changes." Plug pulled → water enters from the same chamber → the ship rides lower, floods over the rim, sinks; the chamber level stays put while it is afloat, then falls to the ball's 1× level | 18.65 | S1/S3 (average density decides; with the air replaced by water, the average density of hull + contents exceeds water's), S4 (interior mostly air); level behaviour computed by conservation of water volume (`web/physics.js`) |
| 11 | "It's not that the steel became lighter." (equal weight arrows, "same weight") | 22.6 | model: same steel mass throughout; S2 (the density of steel is a material property) |
| 12 | "The shape changed the balance." / takeaway "A hollow shape displaces more water for its weight." | 24.85 / 26.4 | S1 |

## Disclosed simplifications
- Illustration, not experiment data: scale of Kip, tank, wall thickness and the plug are illustrative; the fresh-water
  ratio 7.8 uses OpenStax's rounded steel density.
- The "replay" runs the flooding backwards as a storytelling device (clearly marked REPLAY! with a rewind glyph).
- The floating ship's push arrow is drawn under the hull at its centre line; real pressure acts over the whole hull.
