# 30 — English-14 (2026-11-14) 30 s #01: "£2.30 or £2.80: which mayo is the better buy?" (unit pricing and the unit effect)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · assigned account
info@tensorblue.com (CLAUDE.md) · batch `2026-11-14-english-14`.

Before any edit:
- Repo/branch confirmed: origin = github.com/cumbersomeamir/animations, branch claude-video/werbens, local 9205c92 == origin,
  clean tree.
- Every earlier accepted job (through english-13) is finished and pushed. No jobs were running, so nothing needed queueing.
- CLAUDE.md and `05-progress.md` were re-read.

Output: `videos/werbens/production/30s/2026-11-14-english-14/werbens-30s-english14-01.mp4` + separate thumbnail
`werbens-30s-english14-01-thumbnail.png` (and `.jpg`).

Governing files:
- Rules: **`context/27`** (unchanged; re-stated in this brief).
- Style: `context/11` (accepted "Satisfying Product Theatre" recipe + renderer).
- Colour theme: the live app.werbens.com dark-navy theme (context/28 §3).
- English voice: context/11 + context/16 (Meshline/Recall).
- Brand: `context/17` (re-checked today).

A copy of this file is in the output folder as `english14-30s-01.md`.

## 1. Brief (user-approved, 14 November 2026 batch; "Published apps", Satisfied? column; latest feedback retained)
- New topic: **why the same price feels different when the unit changes**.
- Requirements:
  - **unit pricing and framing**: compare **one real product price per item versus per 100 g** without changing facts;
  - a clear marketer/consumer insight backed by verified research;
  - no universal conversion promise;
  - exact current app.werbens.com palette and logo;
  - approved style otherwise.
- Read the actual prior topics first, choose another topic if this one overlaps, update the episode history, and do not
  duplicate or overwrite any batch.

## 2. Topic check against the episode history → topic kept (new)
- `grep -ril "unit pric|per 100|numerosity|per kg|unit effect"` over `videos/werbens` found no earlier episode, note or
  source.
- Closest earlier episodes, all using different mechanisms:
  - **#08 english-06 attribute framing**: "75% lean" vs "25% fat" — the valence of the same statistic.
  - **#03 decoy effect**: an asymmetrically dominated third option.
  - **#09 english-07 anchoring**: a premium item sets the reference price.
- This episode is about the **unit** a price is expressed in: per item (pack) versus per 100 g. It covers the unit/numerosity
  effect and how consumers and sellers should use unit prices, so it is not covered by those episodes.

## 3. Brand re-check (facts; 2026-11-14)
- Live `https://app.werbens.com/` was loaded in headless Chromium: HTTP 200 → `/app`.
- Top-40 computed colour list: identical to 2026-11-13.
- Wordmark: Space Grotesk 700, 30.4 px, −1.216 px, 135° #7FE7DC→#316879.
- Hero headline gradient: unchanged.
- Login button: #316879.
- Logo SVG: sha256 816c1761…, unchanged.
- Kept in every scene:
  - the dark-navy hero theme: navy #0B1120 stage and fog;
  - deep teal #316879 bottle bands, caps and the "other" snack band;
  - mint #7FE7DC price columns, gauges and the healthy snack;
  - mint-white #F0FDFA tags and cards with ink #0F172A numbers;
  - the dark-glass caption pill;
  - hero-gradient labels;
  - the logo SVG, unchanged, on the CTA tile.
- Amber is not used.

## 4. Facts used (verified 2026-11-14) — tagged measured / official snapshot / illustration / advice
| Line | Claim | Tag | Source (quoted) |
|---|---|---|---|
| L1–L3 | "£2.30 or £2.80 … Same brand … Per 100 grams: 107p versus 52p. About double." | **Real prices from an official snapshot** (one retailer, 9 May 2023; may not hold today) | UK Competition and Markets Authority, *Groceries unit pricing: pricing analysis*, 30 January 2024, para. A.34: "One retailer stocked three sizes (215g, 540g, and 775g) of a leading brand of mayonnaise in plastic bottles. A 215g bottle was sold at £2.30 (107p per 100g), a 540g bottle was sold at £2.80 (52p per 100g), and a 775g bottle was sold at £4.00 (52p per 100g)." Para. 3.5: "The examples we use throughout this report are based on a snapshot of data from 9 May 2023, therefore each specific example may not hold over time." https://assets.publishing.service.gov.uk/media/65b8c153b5cb6e000d8bb747/___Groceries_unit_pricing_pricing_analysis_2__.pdf — "about double" = 107 ÷ 52 = 2.06. The brand is not named by the CMA and is not shown. |
| L4 | "Research shows we focus on the number, not the unit." | **Measured mechanism in the studied settings** | Pandelaere, M., Briers, B., & Lembregts, C. (2011). How to make a 29% increase look bigger: The unit effect in option comparisons. *Journal of Consumer Research*, 38(2), 308–322. https://doi.org/10.1086/659000 — abstract (OpenAlex): "attribute differences appear larger on scales with a higher number of units … The unit effect occurs because consumers focus on the number rather than the type of units in which information is expressed (numerosity effect). Therefore, reminding consumers of alternative units in which information can be expressed eliminates the unit effect." |
| L5 | "Listing snacks in kilojoules, not calories, raised healthy snack choices." | **Measured finding** | Same abstract: "expressing the energy content of snacks in kilojoules rather than kilocalories increases the choice of a healthy snack." No effect size is spoken or shown. |
| L6 | "Shoppers: compare every option in the same unit." | **Practical advice** (consumer) | Grounded in the CMA analysis: "Unit prices can help shoppers make comparisons between products …" (§3); "Consumer research carried out on behalf of the CMA suggests many shoppers do not regularly use, or may not even be aware of, unit pricing" (para. 1.3). |
| L7 | "Sellers: show unit prices clearly, in one unit." | **Practical advice** (seller), consistent with the regulator's recommendation; not a measured sales effect | CMA, *Groceries unit pricing: Review of compliance*, July 2023: calls on grocery retailers to "ensure that the unit of measurement that they use for the unit price is displayed consistently across each product type (branded and own brand) in-store and online", after finding e.g. "tea bags being priced per 100 grams for some products and others being unit priced per each tea bag". https://assets.publishing.service.gov.uk/media/64b80ab1ef5371000d7aeefa/CMA_Review_of_unit_pricing_in_the_groceries_sector.pdf. Legal background (not narrated): the Price Marking Order 2004 requires a unit price for most grocery products (same report). |
| — | bottles, price tags on columns, price card, snack bars, energy gauges, kcal/kJ chips, plinth, shelf labels | **Illustration** | Generic props in Werbens colours (no brand). Bottle size ∝ ∛weight (540/215 → ×1.36). Column heights are proportional to the displayed number in each unit: 0.03 m per £ of pack price, then 0.0011 m per penny per 100 g. These are two different units, so they show which tag is higher, not one common scale. Gauge heights use illustrative energies (no values shown); the kcal → kJ switch multiplies them by the exact factor 4.184. |

## 5. English voice + checks
- Voice: the established Meshline/Recall narrator — Kokoro-82M v1.0 (q8) style blend **af_bella 0.7 + am_puck 0.3**, speed
  0.98, en-us, newly synthesised. No Hindi, no reused narration.
- Pronunciation:
  - "Werbens" → wˈɜɹbɛnz; general rhotic ɜː → ɜɹ.
  - New: the en-us front-end read "£2.30" as "two pounds and thirty pence". It is now **"two thirty"** / **"two eighty"**
    (tˈuː θˈɜɹɾi, tˈuː ˈeɪɾi), the way UK shoppers say prices.
  - "107p" and "52p" are read "one hundred seven p" and "fifty-two p".
- Whisper base.en per line (clean narration):

  | Line | Score | Note |
  |---|---|---|
  | L1 | 6/7 | "buy" written "by" (homophone); "£2.30" heard as "230" |
  | L2 | 6/6 | |
  | L3 | 7/7 | |
  | L4 | 10/10 | |
  | L5 | 10/10 | |
  | L6 | 8/8 | |
  | L7 | 8/8 | |
  | L8 | 6/7 | "Werbens" → "Warbins", the documented limit |

- Caption timing: Whisper word times, plus `WORD_FIX` onsets read from the voiced segments for L1, L3, L5, L6 and L7.

## 6. Final script (= final transcript) — 66 words, 25.7 s of speech
| Part (context/27) | Line | Clip on air (s) | Text |
|---|---|---|---|
| Hook | L1 | 0.30–3.44 | £2.30 or £2.80: which mayo is the better buy? |
| Super hook | L2 | 3.75–5.79 | Same brand. Now switch the unit. |
| Reveal | L3 | 6.15–11.32 | Per 100 grams: 107p versus 52p. About double. |
| Proof (why) | L4 | 11.70–14.63 | Research shows we focus on the number, not the unit. |
| Proof | L5 | 15.00–19.73 | Listing snacks in kilojoules, not calories, raised healthy snack choices. |
| Payoff | L6 | 20.15–22.74 | Shoppers: compare every option in the same unit. |
| Payoff | L7 | 23.10–25.83 | Sellers: show unit prices clearly, in one unit. |
| CTA | L8 | 27.00–29.32 | Follow Werbens to decode how brands sell. |
Publishing caption (`publishing-caption.txt`) = this transcript verbatim + one illustration/snapshot note + sources.

## 7. How the context/27 rules were applied (creative decisions)
- **Thumbnail → hook:**
  - Words: "CHEAPER? / CHECK THE UNIT." (4 words, Space Grotesk 700, hero gradient).
  - Image: the two bottles with their pack-price tags (£2.30 / 215 g and £2.80 / 540 g).
  - Brand: the app.werbens.com logo and wordmark.
  - Frame 0 of the video already has both bottles falling into place.
- **One real question:** "which is the better buy?"
  - The super hook changes one thing only: the unit.
  - The reveal answers it with the real per-100 g prices.
  - The proof explains why the unit matters (numerosity) with a measured example (kJ vs kcal).
  - The payoff gives one action for shoppers and one for sellers.
- **One visual idea at a time, revealed in sequence:**
  1. Two bottles land; pack-price tags rise on price columns of nearly equal height.
  2. Caps glint on "Same brand".
  3. Both tags flip on "switch the unit" and the columns re-scale: the small bottle's 107p tag rises, the big bottle's 52p
     tag drops (the reversal).
  4. "ABOUT 2×".
  5. Lateral move to a price card: "52p" grows while "per 100 g" fades.
  6. The card slides out as two snack bars slide in, with energy gauges in kcal. On "kilojoules" the gauges grow ×4.184 and the
     gap widens; the healthy bar rises on a plinth into the light.
  7. Back to the bottles: "SAME UNIT".
  8. On "Sellers" the tags flip into clear shelf labels (pack price + "107p per 100 g" / "52p per 100 g" strip).
  9. The bottles part and the logo tile pops up between them.
- **Labels:** "ABOUT 2×" and "SAME UNIT" (DOM, large, one at a time). The in-world tags carry the prices. No source chips, no
  paragraph cards, no decorative lines.
- **Reusable lessons:**
  1. A price post (tag on a column) makes the unit reversal visible as motion.
  2. Read prices the way people say them ("two thirty").
  3. Exit props sideways, never upward through the caption band.
  4. A CTA tile can pop up between parting props, which avoids both an empty frame and a large drop.
  5. Load every canvas font explicitly; "IB" fell back to a serif in the first stills.

## 8. Storyboard (as built; `src/timeline.js`)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Hook | 0–3.6 s | both bottles | bottles land; £2.30 / £2.80 tags rise on columns | air, thuds, risers, cards, piano |
| Super hook | 3.6–6.1 s | slight push | caps glint; tags flip; columns re-scale (107p up, 52p down) | tick, flips, riser, sink, piano |
| Reveal | 6.1–11.5 s | both bottles | 107p and 52p pulse as read; "ABOUT 2×" | ticks, tag, piano |
| Proof | 11.5–19.9 s | lateral move to the card / snacks | 52p grows, "per 100 g" fades; card out, snacks in; kcal → kJ (×4.184); healthy snack chosen | whoosh, riser, sink, slide, thuds, riser, glow, piano |
| Payoff | 19.9–26.0 s | back to the bottles | "SAME UNIT"; tags flip into shelf labels | whoosh, tag, flips, piano |
| CTA | 26.0–30 s | pull back | bottles part; logo tile pops up 26.47 s; wordmark 27.55 s | slide, tile thud, D-major spread |

## 9. QA (final export) — details and evidence in the output folder's `QA.md` and `qa/`
**Final export: render 2.** Render 1 (in checkpoint ff04e0d) had about 3 near-empty frames before the CTA tile at
26.1–26.2 s. That was fixed and the video re-rendered.

| Check | Result |
|---|---|
| Frames | 900 |
| Duration (video / audio / format) | 30.000000 s each |
| Video | H.264 High yuv420p, 30/1, bt709 |
| Audio | AAC-LC 48 kHz stereo |
| Full decode | 0 errors |
| Loudness | −15.0 LUFS, true peak −1.9 dBTP, flat factor 0 |
| Caption ink | x 131–869 / y 369–489 |
| Caption pill | x 101–899 / y 353–507 |
| Labels | x 248–832 / y 564–1456 |
| Top 300 px | nothing in y 0–300 |
| Overlaps / big labels | 0 overlaps; one big label at a time |
| Page errors | none |
| Transitions | no empty frames |
| Thumbnail | 1080×1920 |

Narration on air:

| Line | Time (s) |
|---|---|
| L1 | 0.33–3.38 |
| L2 | 3.78–5.74 |
| L3 | 6.22–11.26 |
| L4 | 11.73–14.59 |
| L5 | 15.03–19.68 |
| L6 | 20.18–22.60 |
| L7 | 23.14–25.68 |
| L8 | 27.07–29.28 |

- **Final-mix English ASR:** matches the script apart from the expected spellings ("230", "280", "107 P", "52 P", "by",
  "Wurbins"). This is an ASR check only; no human listening was done.
- **MP4 sha256:** `701c071293fdff822bcb746d458a4d0ef7201159b47c8aef47066c60d1ea9c02`.
- Earlier MP4s verified unchanged.

## 10. Progress / provenance log (this round)
1. Repo/branch/account and earlier-jobs check; CLAUDE.md + 05-progress re-read.
2. History grep for the topic.
3. Sources fetched: OpenAlex (Pandelaere et al. abstract); CMA PDFs (2023 review, 2024 pricing analysis; pdftotext).
4. app.werbens.com re-inspection.
5. `node src/tts.mjs` (3 passes: draft; price reading + tightening; re-timing).
6. `node src/words.mjs` → `node src/words_fix.mjs`.
7. Stills (6 passes).
8. `node src/audio.mjs` → `node src/qa_dom.mjs 3` → `node src/render.mjs --thumb --stills 3.2 --out build/thumb`.
9. `node src/render.mjs --video` → ffmpeg mux → `bash qa.sh` → `node src/qa_dom.mjs 1` → `node src/asr_mix.mjs <mp4>`.
10. The transition sheet showed near-empty frames before the CTA tile → earlier tile pop + earlier pull-back → full re-render
    (render 2) → mux → full QA again.

Next step: none for this batch (one episode only; no automation).
