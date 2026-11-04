# 17 — Production 30 s, Hindi batch #04 (2026-11-04): "सौ ग्राम उबले हुए चने में क्या है?" (cooked chickpeas / chana)

Output: `videos/nutriai/production/30s/2026-11-04-hindi-04/nutriai-30s-hindi04-01.mp4`. QA + hash: `production/30s/2026-11-04-hindi-04/QA.md`. Sources: `.../SOURCES.md`. Publishing copy (Hindi): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks and topic
- No generation was active (no render/ffmpeg/TTS process; branch equal to origin at `fcdc123`, the completed Hindi orange episode #03).
- Topic history: chickpeas / chana had not been covered (episodes: mango, guava, pomegranate, papaya, orange; oats cancelled). The requested topic was used as given.

## Brief (user, 4 November 2026)
One new 30.000 s Hindi (Devanagari) educational video for CalMeter: cooked chickpeas with a clearly stated cooked serving; credible energy, protein and fibre values; compare volume vs grams; no miracle claims or repeated disclaimers; accepted engraving/cutaway style, high contrast, quiet accepted audio, CalMeter CTA in the last 3–4 s; 60–75 natural Hindi words; Hindi-capable local voice and font; ASR-only limitation recorded if listening is not possible.

## Kept from the accepted recipe (reference the code, not a library; no Three.js)
- Renderer: `production/30s/2026-11-03-hindi-03/source/render.mjs` (Hindi orange #03, itself the guava → pomegranate → papaya Canvas2D engraving renderer) copied to this episode with only the food geometry, the protein motif and the balance contents swapped. Unchanged: burin swell/taper, three hatch families, ring-clipped multiply washes, roundels flown on arcs with leaders, balance vignette, camera keys, ivory plate + ruled border + cut title, Hindi caption layout (Noto Sans Devanagari Black 56 px, baselines 412 / 488, ink-measured bounds, grapheme cutting), CTA seal with the approved `assets/icon.png`, stop motion 15 drawings/s with line boil.
- Voice and audio: Kokoro-82M Hindi voice `hf_beta`, lang `hi`, speed 1.0 (same as #03), numbers written as Hindi words; the accepted `mix.py` (quiet chord bed + air, no beat, event foley, ducking, loudnorm −15 LUFS / −1.5 dBTP) unchanged.

## Episode-specific adjustments (this episode only)
- **Food geometry:** a beaked, wrinkled chickpea (analytic body + 2D curled beak + seam groove), a chickpea sprig with pinnate leaflets and one inflated pod (leaf-green accent), and a long-section cutaway: seed coat, two cotyledons split by the seam (one cross-hatched in shade), starch-cell stipple, the embryo in the beak.
- **High contrast:** first stills read pale; the seed coat was deepened (`#B4732E`), cotyledons made richer gold (`#F2CC7E` / `#E5B35A`), embryo darkened (`#C98A3A`) and a crossing hatch added to the shaded cotyledon.
- **Protein motif ("repair"):** a row of cells with a gap; a bead chain flows in and a new cell forms (MedlinePlus: protein helps the body repair cells and make new ones).
- **Volume vs grams mechanism:** a measuring cup (1 कप ≈ 240 मि.ली.) is filled with chickpeas on the balance; a 100 g weight lands on "सौ नहीं" and the beam stays down on the cup side; a 64 g weight lands on "एक सौ चौंसठ" and the beam levels; then the per-cup values count up from the per-100 g values (164 → 270 kcal, 8.9 → 14.5 g protein).
- **CTA stillness fix:** the seal's milled edge is engraved across the whole CTA and the stipple boil is slightly stronger (first export had two 0.8 s freezes in the CTA).

## Final script (70 Hindi words by token count; Kokoro hf_beta)
| Take | Start | Hindi (spoken) | Meaning |
|---|---|---|---|
| T0 | 0.30 s | सौ ग्राम उबले हुए चने में क्या है? | What is in 100 g of boiled chickpeas? |
| T1 | 3.25 s | एक सौ चौंसठ कैलोरी, लगभग नौ ग्राम प्रोटीन, और सात दशमलव छह ग्राम फ़ाइबर। | 164 kcal, about 9 g protein and 7.6 g fibre. |
| T2 | 9.80 s | प्रोटीन कोशिकाओं की मरम्मत में मदद करता है, फ़ाइबर पाचन में। | Protein helps repair cells; fibre helps digestion. |
| T3 | 14.65 s | पर एक कप उबले चने का वज़न सौ नहीं, करीब एक सौ चौंसठ ग्राम होता है। | But a cup of boiled chickpeas weighs not 100 but about 164 g. |
| T4 | 20.20 s | यानी लगभग दो सौ सत्तर कैलोरी और साढ़े चौदह ग्राम प्रोटीन। | That is about 270 kcal and 14.5 g protein. |
| T5 | 26.05 s | कैलमीटर के साथ अपने खाने और पोषण को ट्रैक करें। | Track your food and nutrition with CalMeter. |

Hindi ASR timing pass (faster-whisper medium, language hi): every number recovered (164, 9, 7 दशमलव 6, 100, 164, 270, साढ़े 14); differences are spelling-level (सो, लगभभग, सारहे, को शिकाओ, पोशन).

## Source-to-claim mapping (retrieved 2026-11-04)
| Claim | Value | Source |
|---|---|---|
| Basis: 100 g chickpeas, mature seeds, cooked (boiled), without salt | per 100 g | USDA FoodData Central SR Legacy **FDC 173757** (NDB 16057) "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt"; SR28 `FOOD_DES` refuse 0 % |
| 164 calories | 164 kcal (686 kJ) | FDC 173757 Energy |
| about 9 g protein | 8.86 g (n = 23) | FDC 173757 Protein |
| 7.6 g fibre | 7.6 g | FDC 173757 Fiber, total dietary |
| Protein helps repair cells | n/a | MedlinePlus (NIH NLM) "Protein in diet" https://medlineplus.gov/ency/article/002467.htm: "You need protein in your diet to help your body repair cells and make new ones." |
| Fibre aids digestion | n/a | MedlinePlus "Dietary fiber" https://medlineplus.gov/ency/article/002470.htm |
| 1 cup cooked ≈ 164 g | 164 g | FDC 173757 portion "cup" = 164 g (US cup ≈ 240 ml) |
| per cup ≈ 270 kcal, ≈ 14.5 g protein (≈ 12.5 g fibre) | 164 × 1.64 = 269; 8.86 × 1.64 = 14.5; 7.6 × 1.64 = 12.5 | derived from FDC 173757 |

## Storyboard (30 fps; `production/30s/2026-11-04-hindi-04/source/timeline.json`)
| Beat | Time | Plate action | Caption (Hindi) | Sound |
|---|---|---|---|---|
| Hook | 0–2.4 s | Loupe pull-out while the burin cuts a whole chickpea (wrinkled body, curled beak, seam) and a sprig with pod; golden seed-coat wash | 100 ग्राम उबले चने में / क्या है? | burin scratches |
| Open | 2.2–3.5 s | Red knife line from beak across; burnish; long-section re-cut (seed coat, two cotyledons, embryo, starch stipple) | (same) | slice, page |
| Facts | 3.3–9.0 s | Roundels scribed on "164", "9", "7.6": ऊर्जा 164 कैलोरी / प्रोटीन 8.9 ग्राम / फ़ाइबर 7.6 ग्राम; basis line cut | 164 कैलोरी · ≈ 9 ग्राम प्रोटीन / 7.6 ग्राम फ़ाइबर | scribe ticks |
| Functions | 9.6–14.1 s | Protein roundel: bead chain fills a gap in a row of cells (कोशिका मरम्मत). Fibre roundel: strands flow (पाचन) | प्रोटीन कोशिकाओं की मरम्मत में, / फ़ाइबर पाचन में मददगार | page |
| Volume vs grams | 14.5–19.7 s | Balance cut; measuring cup lands and fills with chickpeas; 100 g weight lands but the cup side stays down; 64 g weight levels it; "100 + 64 = 164 ग्राम" | 1 कप उबले चने: / 100 नहीं, ≈ 164 ग्राम | thud, patter, clinks |
| Per cup | 20.0–25.4 s | Values count up under the pans: ≈ 270 कैलोरी, ≈ 14.5 ग्रा. प्रोटीन | यानी ≈ 270 कैलोरी / और ≈ 14.5 ग्राम प्रोटीन | — |
| CTA | 25.4–30 s | Balance burnished away; engraved seal with the approved icon, "CalMeter" cut, leaf-green rule, milled edge engraved | CalMeter के साथ अपने खाने / और पोषण को ट्रैक करें | pencil, bed fades |
