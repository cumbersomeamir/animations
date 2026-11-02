# Pilot 01 — sources, verification and claim-to-source mapping

Topic: *Why identical products can feel different in different packaging.*
All sources accessed **2026-11-02** from this Claude Code session. Bibliographic data checked against Crossref
(`api.crossref.org/works/<DOI>`) and, where noted, PubMed / institutional repositories. Nothing on screen is an experiment
result: the scene is an **illustrative comparison** with fictional boxes. No percentages, effect sizes, prices, sales figures,
endorsements or customer data are used.

## Sources

| # | Source | Verified how | What it supports |
|---|---|---|---|
| S1 | Deliza, R. & MacFie, H. J. H. (1996). *The generation of sensory expectation by external cues and its effect on sensory perception and hedonic ratings: a review.* Journal of Sensory Studies 11(2), 103–128. DOI 10.1111/j.1745-459X.1996.tb00036.x | Crossref record + abstract (read in full) | External cues including **packaging** generate sensory expectations; expectations can influence perception and liking at consumption; abstract reports "overwhelming evidence for assimilation-contrast effect, although no studies have been specifically designed to detect it"; reviews **why individuals differ** in how expectations influence perception. |
| S2 | Piqueras-Fiszman, B. & Spence, C. (2015). *Sensory expectations based on product-extrinsic food cues: An interdisciplinary review of the empirical evidence and theoretical accounts.* Food Quality and Preference 40(A), 165–179. DOI 10.1016/j.foodqual.2014.09.013 | Crossref record; Wageningen University research portal summary (research.wur.nl) | Review of how product-extrinsic cues (labels, packaging and other cues not in the product) affect expectations, perception and liking; explicitly focuses on studies that showed an effect on tasting (so it is not evidence that effects always occur). |
| S3 | Piqueras-Fiszman, B. & Spence, C. (2012). *The weight of the container influences expected satiety, perceived density, and subsequent expected fullness.* Appetite 58(2), 559–562. DOI 10.1016/j.appet.2011.12.021 · PMID 22245134 | Crossref record + PubMed abstract (read in full) | "The contents of a heavier container are expected to be more satiating than when exactly the same contents are presented in a visually-identical, but physically lighter, container (even before the food has been tasted)"; heavier container → contents perceived as denser. Supports **weight as a packaging cue that shifts expectations about identical contents**. |
| S4 | Becker, L., van Rompay, T. J. L., Schifferstein, H. N. J. & Galetzka, M. (2011). *Tough package, strong taste: The influence of packaging design on taste impressions and product evaluations.* Food Quality and Preference 22(1), 17–23. DOI 10.1016/j.foodqual.2010.06.007 | Crossref + University of Twente record (bibliographic only). Findings taken from **secondary summaries** (abstract not accessible to this session): angular vs rounded yoghurt packs; angular → more intense taste impression, mainly among design-sensitive participants; colour saturation generally not significant. | Supports **shape as a packaging cue** and that **effects vary between people**. Treated as secondary-sourced; no numbers used. |
| S5 | Krishna, A. (2012). *An integrative review of sensory marketing: Engaging the senses to affect perception, judgment and behavior.* Journal of Consumer Psychology 22(3), 332–351. DOI 10.1016/j.jcps.2011.08.003 | Crossref record + abstract | Background for the series: sensory cues can shape perceptions of abstract product qualities (e.g. sophistication, quality). Not used for an on-screen claim. |

## Claim-to-source mapping (every spoken line and on-screen statement)

| Time | Narration / on-screen text | Type | Support / status |
|---|---|---|---|
| 0.3 s | "Which box holds the better cookies?" | Question (no claim) | — |
| 2.9 s | "Packaging is a clue." | Mechanism (simplified) | S1 (packaging generates expectations), S2. "Clue" = plain-language wording for an extrinsic cue. |
| 4.4 s | "It sets an expectation," | Mechanism | S1, S2, S3 (container weight changes expectations about identical contents before tasting). |
| 3.1–5.4 s | Tags "lighter", "heavier", "angular" | Description of the **fictional props** in the scene | True of our props by construction. Cue choice informed by S3 (weight) and S4 (shape). No claim about real products. |
| 6.0 s | "and expectations can tilt the taste." | Mechanism, hedged ("can") | S1, S2 (effects on tasting/liking), S4 (shape → taste impression). Hedge + on-screen note required because effects vary (S1 individual differences, S4 design-sensitive participants only). |
| 6–11.5 s | Note "Illustrative demo · not experiment data · effects vary" | Accuracy disclaimer | Reflects S1/S4 variability; makes clear the scene is not data. |
| 7–9 s | Quibble enjoys the fancy-box cookie more than the plain-box one | Illustration of the mechanism | A dramatised single case, labelled illustrative; not presented as a measured result. |
| 10.0 s | "Same cookies." / "=" badge | Fact **about the scene** | True by construction: both boxes hold instances of one shared cookie geometry/material (`makeCookie()` in src/props.js). |
| 11.8 s | "So make the box promise what's really inside." | Takeaway / advice | Practical recommendation, not an empirical claim. Grounded in S1 (assimilation–contrast: experience is judged against the expectation the cues set), plus the general principle of avoiding misleading presentation. Worded as advice; no promise of sales impact. |
| 13.4 s | "Werbens" signature, "Research: Deliza & MacFie 1996 · Becker et al. 2011 · Piqueras-Fiszman & Spence 2012, 2015" | Attribution | App name from assets/listing.json; research line = S1–S4. No app feature claims in this pilot. |

## Deliberately not claimed
- No "people will pay X% more", no "fancy packaging makes food taste better" as a universal law, no claim that price/quality
  can be inferred from packaging, no real brands, no real experiment depicted, nothing implied about Werbens' features or results.

## Reference accounts provided by the user (inspiration only)
- https://www.instagram.com/battysticky/ and https://www.instagram.com/breakingbreach/ — **not viewed in this session**
  (WebFetch returned HTTP 429). Only the user's written observations were used as a quality bar (expressive recurring
  performer, dimensional dark stage, physical demonstrations, dimensional objects/visual metaphors). No characters, scripts,
  logos, assets, palettes or voices were copied; the cast, palette (from the Werbens icon) and voice are original.
