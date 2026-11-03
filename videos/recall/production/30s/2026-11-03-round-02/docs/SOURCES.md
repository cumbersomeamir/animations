# Sources and claim check — Recall round 02 "Why a microwave leaves cold patches in food"

All pages were fetched on 2026-11-03, and the quotes are verbatim from the fetched text.

## Pages read
| # | URL | page title | used for |
|---|---|---|---|
| S1 | https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens (moved from …/microwave-oven-radiation; content current as of 10/12/2023) | Microwave Ovens \| FDA | reflection off the metal interior; heating mechanism; outer layers vs. inside in thick food |
| S2 | https://interactivetextbooks.tudelft.nl/showthephysics/demos/demo49/demo49.html (© Delft University of Technology & NVON, CC BY-NC 4.0) | 15.15. Hot spots in the microwave — ShowingPhysics | standing waves, nodes and antinodes (weak and strong spots); turntable |
| S3 | https://hgic.clemson.edu/factsheet/microwave-food-safety/ (HGIC 3586; header "Updated: Jun 30, 2026") | Microwave Food Safety \| Home & Garden Information Center | uneven heating and cold spots; stir midway; arrange evenly; standing time |

**Attempted but not usable:**
- **USDA FSIS "Cooking Safely in the Microwave Oven"** (https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/cooking-safely-microwave-oven): HTTP 403 to automated fetches. The UNT End of Term archive copies returned 503.
- **FoodSafety.gov** (https://www.foodsafety.gov/food-safety-charts/microwave-food-safety): HTTP 403.

Neither is quoted.

## Verbatim quotes
- **S1:**
  - "The microwaves reflect off the metal interior of the oven and cause the water molecules in food to vibrate. This vibration results in friction between molecules, which produces heat that cooks the food."
  - "they are reflected by metal; they pass through glass, paper, plastic, and similar materials; and they are absorbed by foods."
  - "Although heat is produced directly in the food, microwave ovens do not cook food from the "inside out." When thick foods are cooked, the outer layers are heated and cooked primarily by microwaves while the inside is cooked mainly by the conduction of heat from the hot outer layers."
- **S2:**
  - "The dimensions of the microwave are chosen so that standing waves of microwave radiation occur. In the nodes, the food is not heated, and in the antinodes, the heating is maximal."
  - "In other places, the papadums will remain cold."
  - "To achieve somewhat even heating, the food must rotate."
- **S3:**
  - "Microwave ovens are convenient and safe when used properly, but they can heat food unevenly."
  - "Uneven heating can create “cold spots” where harmful bacteria may survive."
  - "Stir or rotate foods midway through heating to reduce cold spots."
  - "Arrange food evenly in a microwave-safe dish."
  - "Allow food to stand for several minutes after microwaving. Standing time allows heat to distribute evenly and finish cooking."
  - "Use a food thermometer and check the temperature in several places because microwave ovens heat unevenly."

## Claim → source map
| narration | support | note |
|---|---|---|
| "Why are microwaved leftovers hot at the edge, cold in the middle?" | S3 (heat unevenly, cold spots); S1 (outer layers first) | A question; the hook shows steam only off the rim. |
| "Waves bounce off the metal walls and overlap, leaving strong and weak spots." | S1 (reflect off the metal interior); S2 (standing waves; nodes not heated, antinodes maximal) | "Overlap" is a plain word for the standing-wave pattern formed by reflections. |
| "The turntable carries food through them," | S2 ("the food must rotate" for "somewhat even heating") | No claim that it makes heating even. |
| "but in thick food the waves mostly heat the outer layers; the middle waits for heat to spread inward." | S1 (outer layers heated primarily by microwaves; inside mainly by conduction) | The qualifier "in thick food" is the source's own condition. |
| "So stir halfway, spread food evenly, and let it stand so the heat evens out." | S3 (stir midway; arrange food evenly; standing time lets heat distribute evenly) | No times or temperatures are given. |
| "Download Recall for learning any new subject with AI." | user's instruction (product owner); see the product-fact check below | No learning guarantee. |

## What the video deliberately does not claim
- No cooking times, power levels or safe temperatures. The microwave display shows words only ("END", "PAUSED" with a half-way bar).
- No numeric hot-spot spacing or penetration depth.
- No claim that the turntable removes cold spots.
- The giant cavity, wave trails, spot pattern and heat colours are an **illustration** of the sourced ideas, not a measurement or a simulation of a real oven (`web/heat.js`).
- No hazardous demonstration: no metal in the oven, no empty running, no superheated liquids. The spoon is used only outside the oven.

## Product-fact check (CTA)
- **`videos/recall/assets/listing.json`:** "Turn your study material into lessons, practice and spaced reviews." (Education; Android; free; developer "Tensorblue AI").
- **Developer site from the listing** (https://recall-api.20.115.41.13.sslip.io), rendered in headless Chromium on 2026-11-03. Visible text includes:
  - "Recall — Knowledge that stays"
  - "Turn a chapter into clear ideas. Understand the why, connect the concepts, and make the knowledge yours."
  - "Start with your textbook"
  - "Find the core ideas"

  No sentence mentions AI.
- **Google Play page:** returned no readable text to automated fetch.
- **Result:** "with AI" is the product owner's own wording for the CTA. It is used as instructed and is not independently confirmed by the public text above.
