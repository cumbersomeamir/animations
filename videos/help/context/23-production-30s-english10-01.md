# 23 — english-10 (2026-11-09) 30 s #01 — English: "Rice: yes. Soap: no." — food help often stops at food; donate toiletries too

**Status: DONE.** `videos/help/production/30s/2026-11-09-english-10/help-30s-english10-01.mp4` · SHA-256 `7accb4f8bbc2f64fee4fe7c8d8926d82d8459ee82b745cc518d89da68c389b26`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`d2efd3f`); every earlier episode (30s-01 … english-09) already rendered, committed and pushed; no render/ffmpeg/voice job running — nothing to finish
or checkpoint. Assigned account info@tensorblue.com; workspace `videos/help/` only. English narration + captions only; Meshline voice synthesized fresh.

## Topic check → subject changed (episode history consulted)
Suggested: "why asking what is needed can beat donating what you happen to have" (shelter needs blankets, receives toys; check the needs list,
confirm quantity and drop-off). **Covered** — the 2026-11-06 topic gate in `11-production-format.md` records that "ask the organisation what is
needed" is already the takeaway of 30s-01, hindi-03 and english-06 (and english-07 was switched for the same reason). Fresh subject in the same
genre: **food help often covers food only — in the US, SNAP benefits can't buy soap, toothpaste or period products — so food banks also ask for
toiletries; add a sealed toiletry to your food-bank bag.** No earlier episode mentions soap, toiletries, hygiene items or SNAP (checked).
Kept from the brief: a respectful fictional donor, a concrete three-part action (check the list → pick toiletries → give them sealed), no impact numbers.

## Approved style kept (notes)
Most recent accepted look (english-09 stage head/primitives unchanged; Three.js not used): cream cloth + two lamps, lamp-dip scene changes, cut-out
hands, carved plaques, yellow-hat helper (0.7; 0.8 in the CTA), real Play icon, quiet pad + scene-change motif, music duck 0.72, voice upfront.
New props in the same carved-hide language: checkout counter + scanner beam (green ✓ / red ✗), benefit card ("FOOD BENEFIT", "SNAP"), rice,
soap bar, toothpaste tube, "PADS" pack, deodorant, toothbrush (sealed blister), "FOOD BANK — NEEDED" board with a "TOILETRIES TOO" divider,
food-bank shelf with a dashed "GAP". Hook: at f0 the card and rice are at the scanner; rice beeps ✓ at 0.75 s, soap is refused ✗ at 1.4 s.

## Final script (English; 66 words; 24.3 s of speech)
| # | Start–end (s) | Line |
|---|---|---|
| 1 | 0.35–1.82 | Rice: yes. Soap: no. |
| 2 | 2.30–5.06 | In the US, SNAP benefits are only for food. |
| 3 | 5.45–10.18 | Soap, toothpaste and period products aren't food, so benefits can't buy them. |
| 4 | 10.60–12.79 | Food banks often ask for toiletries too. |
| 5 | 13.20–16.67 | Check their list: deodorant, toothbrushes, period products. |
| 6 | 17.10–21.11 | Fictional example: a donor adds a sealed toothbrush and deodorant. |
| 7 | 21.55–25.32 | Food help often stops at food. Toiletries help fill that gap. |
| 8 | 26.05–27.89 | Download Help to donate essentials. |
Pacing: the first draft ran 25.5 s of speech → lines 2 and 6 shortened. Offline English ASR recognises every word (homophones only).
CTA = approved verified-listing wording; the video does not claim Help distributes toiletries or works with SNAP.

## Sources (accessed 2026-11-09)
- **R1** US Code of Federal Regulations, 7 CFR 271.2 Definitions (CFR 2024 edition, govinfo),
  https://www.govinfo.gov/content/pkg/CFR-2024-title7-vol4/xml/CFR-2024-title7-vol4-sec271-2.xml : "Eligible foods" means "(1) Any food or food
  product intended for human consumption except alcoholic beverages, tobacco, and hot foods" (soap, toothpaste and period products are not food
  products, so SNAP benefits cannot buy them). The USDA FNS "What Can SNAP Buy?" page (which lists "soaps", "hygiene items" as not purchasable)
  refused automated fetches (403) and was not quoted; one direct curl retry was blocked by this session's permission policy and was not pursued.
- **T1** Trussell, "Food bank donations", https://www.trussell.org.uk/support-us/donate-food : "Find out how and where to donate food and other
  essentials to your local food bank."
- **W1** Walton & Hersham Foodbank, "Donating Food" (most-needed list w/e 6.11.26), https://waltonhersham.foodbank.org.uk/give-help/donate-food/ :
  list includes "Deodorant" and "Feminine hygiene products" (also "Shaving gel / foam", "Washing up liquid and kitchen roll").
- **D1** Devizes & District Foodbank, "Donate food", https://devizesdistrict.foodbank.org.uk/give-help/donate-food/ : shopping list includes
  "Shower gel", "Shampoo", "Deodorant (ladies' and men's)", "Adult toothbrushes", "Toilet rolls".

| Claim (spoken) | Support |
|---|---|
| In the US, SNAP benefits are only for food | R1 (eligible foods = food or food products for human consumption) |
| Soap, toothpaste and period products aren't food, so benefits can't buy them | R1 |
| Food banks often ask for toiletries too | T1 ("food and other essentials"), W1, D1 |
| Their list: deodorant, toothbrushes, period products | W1 (deodorant, feminine hygiene products), D1 (deodorant, adult toothbrushes) |
| A donor adds a sealed toothbrush and deodorant | Practical action from W1/D1 lists ("sealed" = unopened; W1 refuses opened food) |
| Food help often stops at food; toiletries help fill that gap | R1 + W1/D1 (no impact figure claimed) |
| Download Help to donate essentials | Verified Play listing |

## Storyboard (7 scenes; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–2.15 | Checkout: a hand holds a "FOOD BENEFIT" card; rice under the scanner — green beam ✓; soap slides in — red beam ✗. |
| B SNAP | 2.15–5.3 | "US: SNAP BENEFITS"; big SNAP card; beans, rice, pasta pop onto the counter ✓; "FOOD ONLY". |
| C Not food | 5.3–10.4 | Soap (anchor), toothpaste, "PADS" on the counter; "NOT FOOD"; each gets ✗; SNAP card ✗. |
| D List | 10.4–16.9 | "FOOD BANK — NEEDED": TINS, PASTA, "TOILETRIES TOO", DEODORANT / TOOTHBRUSHES / PERIOD PRODUCTS highlighted as spoken; a pointing hand. |
| F Fictional donor | 16.9–21.4 | "FICTIONAL EXAMPLE"; the donor puts a sealed toothbrush and a deodorant into the FOOD BANK bag; "SEALED ✓"; ✓ in the pause. |
| G Gap | 21.4–25.8 | Food-bank shelf full of food; a dashed "GAP"; toiletries slide in; "TOILETRIES", "FOOD + TOILETRIES"; ✓ in the pause. |
| I CTA | 25.8–30 | Helper + neighbour with the essentials sack; real Help icon + name; lamps dim. |

## Captions (English; one ASR timing pass; every spoken word in exactly one card)
| Time (s) | Card |
|---|---|
| 0.21–0.92 | Rice: yes. |
| 0.99–2.16 | Soap: no. |
| 2.23–3.13 | In the US, SNAP |
| 3.20–5.24 | benefits are only for food. |
| 5.31–7.37 | Soap, toothpaste and period products |
| 7.44–10.37 | aren't food, so benefits can't buy them. |
| 10.44–12.98 | Food banks often ask for toiletries too. |
| 13.05–14.03 | Check their list: |
| 14.10–16.96 | deodorant, toothbrushes, period products. |
| 17.03–18.07 | Fictional example: |
| 18.14–21.32 | a donor adds a sealed toothbrush and deodorant. |
| 21.39–23.48 | Food help often stops at food. |
| 23.55–25.67 | Toiletries help fill that gap. |
| 25.89–29.70 | Download Help to donate essentials. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean (exit 0, 0 errors) · AAC-LC 48 kHz stereo · −15.1 LUFS /
−1.7 dBTP · captions x 106–974, y 376–495, 0 violations · **ASR-only listening limitation** (no human listen): final mix = voice track, all 66 words
recognised. Fixed: overlapping/small props; a rustle SFX masking "Soap"; a near-empty B→C hand-off; and a self-inflicted inline-comment bug that
leaked scene C over B/D (caught on the transition sheet before delivery). Details: output `QA.md`.

## Publishing caption
`production/30s/2026-11-09-english-10/publishing-caption.txt` — the final transcript verbatim, "(Illustrative scene; the donor is fictional.)", four
sources, three hashtags. App name: Help only; no other app names; no editing notes.
