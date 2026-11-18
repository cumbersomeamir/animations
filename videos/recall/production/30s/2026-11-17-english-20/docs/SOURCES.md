# Sources and claim check — Recall english-20 "This straw isn't broken" (why a straw looks broken in water)

Read on 2026-11-17 as page text in headless Chromium. The LibreTexts page "Real and Apparent Depth" (Geometric Optics, Tatum)
returned HTTP 403; it was not retried or circumvented and is not cited. Quotes are verbatim.

## Topic check → topic changed (why)
The suggested topic, "Why noise-cancelling headphones struggle with sudden voices" (inverse sound waves, delay, unpredictable
noise), is already covered by **F05** (2026-11-05, context 19, `production/30s/2026-11-05-feedback-05/`): why noise-cancelling
headphones reduce a steady engine hum but struggle with sudden voices. The same suggestion was also declined for E08 and E14 for
the same reason. An English remake would repeat F05's mechanism, visual and takeaway. Per the brief's rule, a **genuinely different
everyday-science topic in the same genre** was chosen: **why a straw looks broken in water** (refraction: light speeds up and
changes direction as it leaves water, the brain traces it back in a straight line, so the underwater part, and a pool's floor,
look higher). No earlier episode covers refraction or apparent depth; E10 (polarized sunglasses) is about polarization, not
refraction. Refraction appeared before only as an unproduced idea in `context/08-educational-strategy.md`. It also differs from
E19's subject (boiling point and pressure).

## Sources read
| # | source | used for |
|---|---|---|
| S1 | OpenStax, *College Physics 2e*, §25.3 "The Law of Refraction", https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction | definition of refraction; n(fresh water) = 1.333 (light is slower in water); a ray moves away from the perpendicular when it speeds up; the lawn-mower picture (grass → footpath); the broken-pencil take-home experiment |
| S2 | OpenStax, *University Physics Volume 3*, §2.3 "Images Formed by Refraction", https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction | a submerged rod looks bent at the surface because its underwater image forms closer to the surface; apparent depth; seen from above, about 3/4 of the real depth |
| S3 | schoolphysics, "Real and apparent depth" (age 11–14, Light), https://schoolphysics.co.uk/age11-14/Light/text/Real_and_apparent_depth/index.html | ponds and swimming pools appear shallower; refractive index = real depth / apparent depth |

## Verbatim quotes
- **S1:** "The changing of a light ray’s direction (loosely called bending) when it passes through variations in matter is called
  refraction." Table: "Water, fresh 1.333". "Conversely, as shown in Figure 25.12(b), the direction of the ray moves away from the
  perpendicular when it speeds up. The path is exactly reversible. In both cases, you can imagine what happens by thinking about
  pushing a lawn mower from a footpath onto grass, and vice versa. Going from the footpath to grass, the front wheels are slowed and
  pulled to the side as shown. … When going from the grass to the footpath, the front wheels can move faster and the mower changes
  direction as shown." "TAKE-HOME EXPERIMENT: A BROKEN PENCIL — A classic observation of refraction occurs when a pencil is placed
  in a glass half filled with water."
- **S2:** "If you look at a straight rod partially submerged in water, it appears to bend at the surface (Figure 2.13). The reason
  behind this curious effect is that the image of the rod inside the water forms a little closer to the surface than the actual
  position of the rod, so it does not line up with the part of the rod that is above the water. The same phenomenon explains why a
  fish in water appears to be closer to the surface than it actually is." "Thus, a fish appears at 3/4 of the real depth when
  viewed from above."
- **S3:** "The refraction of light at the surface of water makes ponds and swimming pools appear shallower than they really are."
  "It also explains why flat-based swimming pools appear to get shallower as you look towards the end furthest from you."
  "Refractive index = real depth/apparent depth".

## Measured facts, estimates and illustrative assumptions
| item | status |
|---|---|
| Light travels slower in water than in air (n ≈ 1.333) and changes direction at the surface | textbook (S1) |
| Leaving the water it speeds up and bends away from the perpendicular | textbook (S1) |
| Lawn-mower picture: one side reaches the faster surface first, so the mower turns | S1's own analogy; the mower's speeds and angles in the video are **illustrative** (heading changes per Snell's law with the same 1.333 ratio) |
| The brain/eye traces light back in a straight line, so the underwater part's image is closer to the surface ("looks higher") | S2 (image forms closer to the surface); the narration's "your brain traces the light back in a straight line" is the standard plain-language reading of S2's ray construction (the virtual image lies on the straight-back extension of the refracted rays) |
| A straight straw looks broken at the surface | S1 (broken pencil), S2 (rod appears to bend) |
| A pool looks shallower from above, "about three quarters of its real depth" | S2 (3/4 when viewed from above, n = 4/3), S3 (real/apparent = n). **Applies when looking roughly straight down**; at a slant the floor looks even shallower (S3 notes pools look shallower towards the far end), so the narration says "from above" |
| Ray path in the giant water section | **computed** with Snell's law (n = 1.333) by bisection in `web/lowpoly.js` (`snellPath`); the dashed back-line is the exact straight extension of the refracted ray |
| The café glass's break offset, the eye model, pulse speeds (drawn with a 1 : 1.333 ratio), sizes, the pool's ladder and lane rope | **illustrative** |

## Claim → source map (narration)
| narration | support |
|---|---|
| "This straw isn't broken." | S1 (broken-pencil observation), S2 (rod appears to bend; it is straight) |
| "So why does it snap at the water's surface?" | question; S2 |
| "Light from the straw speeds up as it leaves the water, and changes direction." | S1 |
| "Like a mower rolling from grass to pavement: one side speeds up first." | S1 (lawn-mower picture, grass → footpath) |
| "Your brain traces the light back in a straight line, so the underwater part looks higher." | S2 (image forms closer to the surface) |
| "That's why a pool looks shallower from above: about three quarters of its real depth." | S2 (3/4 from above), S3 (pools appear shallower; n = real/apparent) |
| "Download Recall to turn your study material into lessons." | `assets/listing.json` (approved): "Turn your study material into lessons, practice and spaced reviews." (same verified CTA as E13–E19) |

## What the video does not claim
- No exact angles, speeds or depths for a real glass or pool beyond the textbook 3/4 ratio; no swimming or diving advice; no
  product or brand.
