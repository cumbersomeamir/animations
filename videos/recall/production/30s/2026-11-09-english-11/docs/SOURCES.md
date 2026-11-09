# Sources and claim check — Recall english-11 "Why is the food steaming but the plate still cool?"

Sources were read on 2026-11-09. Quotes are verbatim: the FDA, HyperPhysics and Digitalfire pages were read as page text in
headless Chromium; the CTAHR fact sheet was read from its PDF with `pdftotext` (PDF sha256 867f17de…ccaf, "Revised 1/10").

## Topic choice
The batch suggested this subject (why a microwave heats food while the plate can stay cooler; dielectric heating vs heat
conducted into the plate; why some ceramics heat). The history has **R02** (2026-11-03, context 16): why microwaved leftovers
have **cold patches** (standing waves, outer layers heated first, stir and stand). Plates, containers, ceramics, glazes and
dish tests appear in no earlier episode (`plate`, `ceramic`, `dish`, `glaze`, `dielectric` searched in contexts 11–24). The
everyday question and the payoff differ (why the plate stays cooler, which pottery heats itself, a dish test), so the topic
was kept, as E09 was kept beside H03. The mechanism visuals are new (water molecules on a food cross-section, a plate
cross-section with a fixed lattice and a heat glow, a cut-away porous mug, a thermal-camera view) rather than R02's cavity
and standing-wave pattern.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | U.S. FDA, "Microwave Ovens" — https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens | microwaves pass through glass/paper/plastic and are absorbed by food; they make the water molecules in food vibrate, producing heat; containers are not heated by microwaves but can become hot from the food |
| S2 | HyperPhysics (Georgia State University), "Microwave Ovens" — http://hyperphysics.phy-astr.gsu.edu/hbase/Waves/mwoven.html | dielectric heating; torques on the water molecules' dipoles; the main heating effect is on the water in the material; resonance is not the mechanism |
| S3 | Digitalfire Reference Library (Tony Hansen), glossary "Microwave Safe" — https://digitalfire.com/glossary/microwave+safe | porous clay soaks up water (through an unglazed foot ring or crazed glaze) and the water heats the piece; iron-rich bodies and high-iron-oxide glazes heat up |
| S4 | University of Hawai'i at Manoa, CTAHR Cooperative Extension, "Microwave Cooking" (fact sheet, revised 1/10) — https://nutritioncenter.ctahr.hawaii.edu/wp-content/uploads/2022/06/6SeniorsOnlyMicrowaveCooking.pdf | the dish test: empty dish beside 1 cup of water, 1 minute on high; cool = safe; warm or hot = do not use |

**Attempted but not usable (not cited):** University of Maryland Extension "Cooking 1" PDF (TLS certificate chain refused
through the proxy), Michigan State University Extension article (page did not load), London South Bank University "Water and
microwaves" (HTTP 502), a course-site copy of Vollmer's "Physics of the microwave oven" (returned an HTML page, not the PDF).
No bot checks were circumvented.

## Verbatim quotes
- **S1:**
  - "Microwaves have three characteristics that allow them to be used in cooking: they are reflected by metal; they pass through glass, paper, plastic, and similar materials; and they are absorbed by foods."
  - "Microwaves cause water molecules in food to vibrate, producing heat that cooks the food."
  - "Glass, paper, ceramic, or plastic containers are used in microwave cooking because microwaves pass through these materials."
  - "Although such containers cannot be heated by microwaves, they can become hot from the heat of the food cooking inside."
- **S2:**
  - "The major mechanism for heating water in a microwave oven is described as dielectric heating."
  - "The microwaves exert torques exerted on the molecular dipole moments of the water molecules and other molecules and that would be expected to cause some heating."
  - "Usually, the major heating effect of microwaves in an oven is the heating of the water included in the material."
  - "…such resonant interactions are not a major factor in the heating of liquids and solids in a microwave oven."
  - Caveat on the same page: "…the detailed modeling of water heating described in Chaplin suggests that the major effect of the microwaves is from work done on the hydrogens rather than invested in the reorientation of the molecular dipoles of the water molecules."
- **S3:**
  - "Earthenwares, for example, can have 10% or more, so they can soak up a lot of water."
  - "But porous bodies that can only absorb water into the matrix if part of the surface is not glaze covered (e.g. the foot ring)."
  - "If the glaze is crazed water can also enter through the crack lines."
  - "Obviously this water is going to turn into steam in a microwave and that will certainly super-heat the piece."
  - "Notwithstanding this, bodies of higher iron content do heat up so common sense is needed."
  - "Those of of high iron oxide content (or other metal oxide) will clearly be an issue (e.g. tenmokus)." (sic)
- **S4 ("Microwave Test #1: Is a container safe?"):** "Place the empty dish in the microwave oven next to 1 cup of water in a glass measure. Microwave on high for 1 minute. If the dish stays cool, it is safe to microwave. If the dish gets warm or hot to the touch, it should not be used for microwaving."

## Claim → source map (narration)
| narration | support |
|---|---|
| "Why is the food steaming but the plate still cool?" | S1 (containers are not heated by microwaves; they warm from the food). The hook shows the plate cooler than the food, not cold |
| "Microwaves tug the water molecules inside food back and forth, and that makes heat." | S1 ("cause water molecules in food to vibrate, producing heat"); S2 (dielectric heating; torques on the dipoles; heating of the water in the material). "Tug back and forth" is the everyday picture of S2's mechanism; S2's caveat (much of the work is done on the hydrogens) does not change it |
| "Glass and microwave-safe ceramics barely absorb them; the hot food warms the plate." | S1 ("pass through glass … ceramic …"; containers "can become hot from the heat of the food"). "Barely absorb" is softer than S1's "cannot be heated" |
| "But water soaked into porous clay or an iron-rich glaze can make pottery heat itself." | S3 (porous bodies soak up water through the foot ring or crazed glaze; that water heats the piece; high-iron bodies and high-iron-oxide glazes heat up). "Can": not every pot does |
| "To test a dish, heat it empty beside a cup of water for one minute. If it stays cool, it's safe." | S4, verbatim procedure and result (on high; a glass measure of water) |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in contexts 16 and 25 |

- **On-screen tags (no VO):** "1 minute (sped up)" — the timer is shown as a time-lapse; "dish stays cool = safe" and
  "gets warm? don't use it" — S4.

## How the animation uses the sources (illustrative, not measured)
- **Thermal view:** a false-colour pass (cool navy → hot white) drawn by swapping materials, not a real thermal image or a
  measurement: food hot, steam and hands warm, the plate warm under the food and cool at the rim (S1), the test cup hot and
  the empty dish cool (S4).
- **Water molecules:** O (red) + two H (white) on the food's cut face, turned back and forth by the field (S1, S2); the motion
  is slowed down enormously (the real field reverses billions of times a second) and the molecules are drawn huge.
- **Plate cross-section:** its own atoms are a fixed lattice that does not move as the waves pass (S1); a glow spreads from
  under the food into the plate and the rim stays cool (S1).
- **Pottery:** a cut-away porous mug with an iron-rich (dark) glaze, crazing on the inner glaze and a bare foot ring; water
  dots soak into the pores, then jostle and glow with the clay and glaze (S3).
- The microwave, plate, cup and café are original low-poly models; no brand or real product.

## What the video does not claim
- No claim that every ceramic is safe or unsafe, no brand or product claims, no cooking times or food-safety temperatures,
  and no claim that microwaves heat food "from the inside out".
