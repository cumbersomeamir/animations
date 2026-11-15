# Sources and claim check — Recall english-17 "That hole is on purpose" (why a tiny hole in an airplane window matters)

Read on 2026-11-15: the FAA advisory circular as its PDF (pdftotext), the Airbus patent as page text in headless Chromium
(Google Patents), the AviationPros article as page text. The eCFR page for 14 CFR 25.775 returned a "Request Access" bot
check; it was not retried or circumvented and is not cited (the rule text the video relies on is restated in the advisory
circular). Quotes are verbatim (including typos in the patent's OCR text).

## Topic check
The suggested topic (airplane window breather hole) was never covered. No earlier episode is about aircraft, windows or cabin
pressure; E13 (elevator, normal force) and E15 (condensation) are different mechanisms. The topic was kept.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | FAA Advisory Circular **AC 25.775-1 "Windows and Windshields"** (17 Jan 2003), https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25_775-1.pdf | cabin window build-up: two structural panes (main + fail-safe) separated by an air gap, plus inner facing panes; the fail-safe pane is unloaded unless the main pane fails; fail-safe requirement |
| S2 | **US Patent 5,988,566 "Aircraft window construction"** (Airbus Operations GmbH; priority DE 196 50 416.3, 5 Dec 1996), https://patents.google.com/patent/US5988566A/en | the conventional design: thick outer main pane carries cabin pressure; a small bore connects the gap to the cabin for pressure equalisation; the inner (auxiliary) pane takes the load only if the outer breaks; moist cabin air entering the gap fogs the panes |
| S3 | AviationPros, "Window Repair Basics: A clear view of window maintenance requirements", https://www.aviationpros.com/engines-components/aircraft-airframe-accessories/windows/article/10388949/ | supporting trade source: vent holes equalise the window's dead airspace with the cabin; the inner panel is the backup after an outer-panel failure |

## Verbatim quotes
- **S1:** "Cabin window designs are typically multi-paned construction consisting of two structural panes (a main load bearing pane and a fail-safe pane), inner facing panes, protective coatings, and mounting structure. Generally, the two structural panes are made from polymethyl-methacrylate and separated by an air gap." "The designs with the structural panes separated by an air gap usually are such that the fail-safe pane is not loaded unless the main pane has failed." "The windshield and window panels must be capable of withstanding the maximum cabin pressure differential loads combined with critical aerodynamic pressure and temperature effects for intact and single failure conditions…"
- **S2:** "Conventional aircraft windows comprise two window panes for an increased reliability. One of these window panes, namely the outside main pane, is relatively thick…" "The construction is conventionally such that the strong outer window pane takes up the cabin interior pressure in normal operating condition. The inner auxiliary pane is not required to take up the inner cabin pressure under normal operating conditions since the cabin pressure is effective between the inner and outer window panes." "…the space between the panes is conventionally connected to the interior of the cabin through a small diameter bore so as to provide a pressure equalization between the space between the panes and the interior of the cabin." "It the exterior main pane should break, it is necessary that the auxiliary pane takes up the entire anterior cabin pressure." "…the connection of the space between the panes to the cabin facilitates fogging of the window panes when moist air enters into the space between the panes…"
- **S3:** "This window is normally vented with small holes that prevent the pane from fogging and allow pressure to equalize between the dead airspace in the window and the cabin during climb and decent." (about a cockpit side window) "…it is a crucial backup in the event of an outer panel failure."

## Measured facts, estimates and illustrative assumptions
| item | status |
|---|---|
| Typical cabin window: outer (main, load-bearing) pane, middle (fail-safe) pane, inner facing pane | stated by S1 (two structural panes + inner facing panes); S2 for main/auxiliary roles |
| The small hole connects the gap to the cabin and equalises pressure, so the outer pane carries the pressure difference and the middle pane carries none | stated by S2 (and S1: the fail-safe pane is not loaded unless the main pane fails) |
| Middle pane = backup if the outer pane breaks | stated by S1, S2 (S3 supporting) |
| Fog between the layers comes from moist cabin air entering through that connection | stated by S2. **Not used:** the popular claim that the hole *prevents* fog (S3 says that about a cockpit window's vents; S2 says the cabin connection lets moist air in and can cause fogging), so the video only explains where the fog's moisture comes from |
| "Three layers" | **typical**, not universal (S1: "typically"; some designs laminate the structural panes) |
| Dot counts (density), the outside air thinning to ~30 % of the cabin's dots, dot speeds | **illustrative**; no pressure numbers are claimed |
| Layer thicknesses and gaps in the section; the size of the glowing hole marker (a real breather hole is tiny) | **illustrative** (drawn larger for a phone screen) |

## Claim → source map (narration)
| narration | support |
|---|---|
| "That hole is on purpose." | S2 (the bore is a deliberate design feature) |
| "It decides which layer holds the cabin in." | S2 (outer pane carries cabin pressure because the bore equalises the gap; inner auxiliary pane unloaded) |
| "Up high, cabin air pushes out much harder than the thin air outside." | S1 ("maximum cabin pressure differential loads"); pressurised cabin vs thin air at altitude |
| "The thick outer layer takes that push." | S2 ("the strong outer window pane takes up the cabin interior pressure"; "relatively thick") |
| "The hole lets cabin air into the gap behind the middle layer." | S2 ("connected to the interior of the cabin through a small diameter bore") |
| "Equal pressure on both sides means that layer carries no load. It's the backup." | S2 ("not required to take up the inner cabin pressure … since the cabin pressure is effective between the … panes"; takes the load if the main pane breaks); S1 (fail-safe pane not loaded unless the main pane fails) |
| "See fog between the layers? That's moist cabin air that came in through the hole." | S2 ("fogging … when moist air enters into the space between the panes") |
| "Download Recall to turn your study material into lessons." | `assets/listing.json` (approved): "Turn your study material into lessons, practice and spaced reviews." (same verified CTA as E13–E16) |

## What the video does not claim
- No pressure numbers, aircraft models or failure stories; no claim that the hole prevents fog; no safety advice.
