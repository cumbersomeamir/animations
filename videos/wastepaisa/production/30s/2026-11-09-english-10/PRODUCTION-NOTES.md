# 23 · english-10 episode 01: "Sell a used box by the kilo, or as a box?" (cardboard box reuse before scrap, English)

Batch `2026-11-09-english-10` (user-approved, 9 Nov 2026).
- **Language:** English narration and English captions only. Every line was synthesised fresh; no Hindi text or audio is reused.
- **Renderer and style:** the most recently accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-08-english-09/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, palette, caption panel and English CTA card are unchanged. The props, scene functions and English text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-09-english-10/wastepaisa-30s-english10-01.mp4`
SHA-256 `192b926ebe8f9c97da90381d15409ab2792ee07bd1907fbf1424297ecd2e07bf` · 9,469,212 bytes.

## Start state, identity and topic check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 631451f before edits. No
  earlier job was running or unfinished, so nothing needed finishing; earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The assigned
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Topic check against history (context 12–22):** the nearest episode is feedback-05 (Hindi), which graded **scrap** cardboard for
  pulping: dry corrugated vs mixed and wet paper, the buyer's moisture deduction and the contamination downgrade. english-07 rejected a
  suggested "collect and sort cardboard for a recycler" brief as a duplicate of it.
  - This brief is a different business: **reuse before pulping**. Intact boxes are resold as boxes to repeat buyers, and only the
    damaged ones go to scrap. The new teaching is reuse value vs scrap value, size grading, label removal and repeat buyers.
  - To avoid repeating feedback-05, moisture appears only as a reason a box cannot be **reused** (it loses strength). There is no
    moisture-deduction scene and no paper-grade sorting.
- Only this app's context, skill, renderer, assets and episodes were read.

## Requirements applied
- **Flow:**
  - Hook (from frame 0): the same taped box hangs on a kilo hook scale tagged "BY THE KILO ₹ ?" and sits on a resale shelf tagged
    "AS A BOX ₹ ?". The X-ray (0.35–1.3 s) opens the shelf box to show its corrugated flutes, chip "INTACT FLUTES = STRENGTH" (1.4 s).
  - Then: dry storage (a damp box at the bottom of a stack sags and goes to the scrap bale) → size grading (SMALL / MEDIUM / LARGE
    stacks) with old labels and tape peeled off → repeat buyers (movers, online sellers, the same sizes) → an illustrative batch with
    resale and scrap revenue minus boxes, transport, storage and labour. CTA in the last 4 s.
- **Boundaries:** prices sit inside dated asking ranges, spoken with "Say" and tagged "EXAMPLE" / "EXAMPLE · PRICES VARY". No
  guaranteed market price or income, no invented app feature, no disclaimer padding.
- **Voice:** the approved **Meshline** English character (Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98), cached model
  files. Quiet pad, music ducked under speech, SFX kept off spoken words (the box drop lands after "scrap").
- **Captions:** English, in the accepted treatment (62 px Baloo 2 ExtraBold, 70 px line spacing, centre y 430).
- **Pacing:** no silent recap, as in english-06 to english-09. The net result holds until the CTA.

## Final script (English narration = captions) · 68 words, 25.3 s of speech
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.04 | Sell a used box by the kilo, or as a box? |
| L2 | 3.34–7.20 | Keep them dry; damp cardboard loses strength, so it goes to scrap. |
| L3 | 7.50–12.03 | Stack intact boxes by size, and peel off old labels for resale. |
| L4 | 12.40–15.79 | Movers and online sellers come back for the same sizes. |
| L5 | 16.09–19.62 | Say resale and scrap bring in ₹9,200; (spoken "ninety-two hundred rupees") |
| L6 | 19.77–24.45 | boxes, transport, storage and labour leave about ₹2,500. (spoken "twenty-five hundred rupees") |
| L7 | 26.20–28.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage changes:
- ASR heard "Grade intact boxes" as "great" and "Sort" as "sword", so L3 says "Stack".
- The first draft ran 30.35 s. L5 now speaks only the sales total (the resale/scrap split is on screen), and L4 was shortened.

## Research (accessed 9 Nov 2026)
- **R1, US EPA, Sustainable Materials Management: Non-Hazardous Materials and Waste Management Hierarchy.** Source reduction and reuse
  rank above recycling. https://www.epa.gov/smm/sustainable-materials-management-non-hazardous-materials-and-waste-management-hierarchy
  (archived copy: https://19january2025snapshot.epa.gov/smm/sustainable-materials-management-non-hazardous-materials-and-waste-management-hierarchy).
- **R2, Gary Ashton Brown, "Relative Humidity Effects on the Compression Strength of Corrugated Boxes",** MS thesis, Clemson University,
  2019. https://open.clemson.edu/all_theses/3225/
  - About 3,000 boxes were conditioned at 30–90 % relative humidity; box compression strength falls as moisture rises.
- **R3, Georgia Tech Research, "Effects of moisture content on box compression strength"** (2021 PDF):
  https://research.gatech.edu/sites/default/files/2021-06/effects-of-moisture-content-on-box-compression-strength.pdf
  - Roughly a third of compression strength is lost at about 80 % RH. Used only as background for "loses strength"; no figure is
    spoken.
- **R4, UPS Packaging Guidelines & Resources:** https://www.ups.com/si/en/support/shipping-support/packaging-tips/jcr-content
  - "Remove any labels, hazardous materials indicators or other previous shipment markings on the box that are no longer applicable."
    A UPS-hosted guideline PDF allows "remove or conceal".
  - UPS shipping tips: if you reuse a box, for example for lightweight or non-fragile items, remove or cover any old labels.
  - The full ups.com page could not be retrieved from this container; the wording is taken from the search extract of the UPS pages.
    A third-party checklist quoting UPS also says "Avoid re-using boxes", so reuse suits light, non-fragile loads, not everything.
- **R5, used-box resale to movers and shippers (US example of the business model):**
  - Packaging World, "'Boxes' get a second life": UsedCardboardBoxes.com's founder began by buying used moving cartons from neighbours
    and reselling them at about half the price of new ones; the company now buys used shipping boxes from businesses and resells them,
    including to contract packagers. https://www.packworld.com/issues/contract-packaging/article/13356416/boxes-get-a-second-life
    (the page returned 403 to a direct fetch; summary from the search extract).
  - MoveBuddha review of UsedCardboardBoxes.com: moving kits sized by number of rooms, with new boxes used only for sizes missing from
    the used stock. https://www.movebuddha.com/blog/used-cardboard-boxes-review/
- **P1, used-box asking prices (India):**
  - IndiaMART used corrugated boxes ₹5–20 per piece (Indore listing) and ₹30–60/kg sold by weight:
    https://dir.indiamart.com/impcat/used-corrugated-box.html
  - Used-goods marketplace listings in Delhi and Bengaluru at about ₹6–10 per box (classified asking prices, not transactions).
  - Other IndiaMART traders quote about ₹25–58 per piece for used cartons, so per-piece prices vary widely with size and ply. The
    example's ₹12 sits at the lower end.
- **P2, carton scrap prices (India):**
  - IndiaMART Chennai carton scrap ₹14–20/kg (₹18/kg on 26 Oct 2026): https://dir.indiamart.com/chennai/carton-scrap.html
  - Kabadiwala Online, Delhi household carton rate ₹8–14/kg: https://kabadiwalaonline.in/price-list/
- **P3, labour benchmark:** Delhi unskilled minimum wage ₹710/day (see context 17).

### Illustrative batch (spoken "Say", on-screen "EXAMPLE" / "EXAMPLE · PRICES VARY")
| Item | ₹ |
|---|---|
| 1,000 used boxes collected from shops and offices at ₹1 each | −1,000 |
| After drying, checking and grading: 600 intact, dry boxes; 400 rejects (damp, crushed, torn) | n/a |
| Resale: 600 boxes × ₹12 (inside P1's ₹5–20 per-piece range) | 7,200 |
| Scrap: 400 rejects × ≈0.5 kg = 200 kg × ₹10/kg (inside P2's ₹8–14 household range) | 2,000 |
| **Sales** | **9,200** |
| Transport (collection and delivery) | −2,000 |
| Storage (dry space for the stock) | −1,500 |
| Labour (≈3 worker-days: sort, grade, de-label, stack; P3) | −2,200 |
| **Left** | **≈2,500** (≈27 % of sales; before rent of a larger shop, losses or tax) |

Per box, the example's reuse value (≈₹12) is more than twice its scrap value (≈0.5 kg × ₹10 = ₹5). The 0.5 kg weight per box and the
40 % reject share are assumptions for the example, not measurements.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Sell a used box by the kilo, or as a box? (BY THE KILO ₹ ?, AS A BOX ₹ ?; X-ray of the flutes, INTACT FLUTES = STRENGTH) | R1 (reuse ranks above recycling), P1, P2 | Question; no price shown |
| Keep them dry; damp cardboard loses strength, so it goes to scrap (DRY, DAMP = WEAKER, sagging box, → SCRAP) | R2, R3 | No percentage spoken |
| Stack intact boxes by size, and peel off old labels for resale (SMALL / MEDIUM / LARGE, OLD LABELS OFF) | R4 (remove old labels and markings; sturdy box), P1 (sold per piece by size) | n/a |
| Movers and online sellers come back for the same sizes (MOVERS, ONLINE SELLERS, REPEAT: SAME SIZES) | R5 (used moving cartons and used shipping boxes resold, kits built from standard sizes), R4 (shippers may reuse boxes for light, non-fragile items), P1 (per-piece listings for shifting and packing) | Buyer types the business can approach, not a promise of orders. No source quantifies Indian online sellers as a segment; "same sizes" is the operating reason for size grading |
| Say resale and scrap bring in ₹9,200 (EXAMPLE; 600 RESOLD × ₹12; 400 REJECTS: 200 kg × ₹10; RESALE ₹7,200; SCRAP ₹2,000; SALES ₹9,200) | P1, P2 | Spoken "Say" + EXAMPLE tag |
| Boxes, transport, storage and labour leave about ₹2,500 (BOXES (₹1 each) −₹1,000, TRANSPORT −₹2,000, STORAGE −₹1,500, LABOUR −₹2,200, LEFT ≈ ₹2,500) | Example arithmetic; P3 | "EXAMPLE · PRICES VARY"; bar drawn to scale |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.2 s | From frame 0: a taped, labelled box swings on a kilo hook scale ("BY THE KILO ₹ ?"); the same box sits on a resale shelf ("AS A BOX ₹ ?"). The X-ray (0.35–1.3) reveals the flutes; INTACT FLUTES = STRENGTH (1.4) |
| Dry | 3.2–7.35 s | A three-box stack: DRY (3.73), then the bottom box darkens, DAMP = WEAKER (4.45), and sags under the load with a creak (5.25–6.0); a scrap bale grows, → SCRAP (6.6) |
| Grade | 7.35–12.2 s | SMALL, MEDIUM and LARGE stacks (seams visible) build on a shelf (7.8–9.1); the top label curls away and the tape lifts, OLD LABELS OFF (10.02) |
| Buyers | 12.2–15.95 s | A movers' truck rolls in (MOVERS 12.46); a laptop with a parcel (ONLINE SELLERS 13.0); cycle arrows and REPEAT: SAME SIZES (14.3); a box flies to each buyer and back |
| Batch | 15.95–19.7 s | EXAMPLE tag (16.05). Nine resale boxes, 600 RESOLD × ₹12 (16.36); scrap bale, 400 REJECTS: 200 kg × ₹10 (17.02); tickets RESALE ₹7,200 and SCRAP ₹2,000 (17.5–18.0); SALES ₹9,200 (18.1) |
| Net | 19.7–25.95 s | To-scale bar SALES ₹9,200: BOXES (₹1 each) −₹1,000 (19.83), TRANSPORT −₹2,000 (20.46), STORAGE −₹1,500 (21.3), LABOUR −₹2,200 (22.05) land on their spoken words; warm sliver LEFT ≈ ₹2,500 (22.95); mascot hops |
| CTA | 25.95–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 26.2–28.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 3.5 LU.
- **Captions** (900 frames logged): ink **y 366–494**, **x 120–960**, at most 2 lines, hand-offs at ASR word onsets, nothing at y < 300.
- **Labels:** all chips ≥ 40 px.
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.06 s of plan.
- **Intelligibility** (ASR only; this cloud session cannot play audio; detail in `qa/asr.txt`):
  - *Vosk:* L2–L6 all 1.00; L1 0.91 (missed the unstressed "a"); L7 0.89 (brand OOV); mean 0.971.
  - *faster-whisper small:* matches the script word for word apart from the brand spelling (plus a known hallucinated "You" on the
    music-only tail).
- **Fixes:**
  - Before the full render: stacked boxes merged into tall blocks, so seams were added (gaps in the grade, buyer and batch stacks);
    the truck repeated the "MOVERS" chip as text, so it now carries mini boxes.
  - After the first full render: the caption log showed L2's first group at x 88.7–991.3, just outside x 90–990. L2 was split into
    three groups ("Keep them dry;" / "damp cardboard loses strength," at 1.08 s / "so it goes to scrap." at 2.76 s, onsets from ASR),
    re-checked at x 120–960 with `node src/render.js captions`, then re-rendered and re-muxed. All QA above is on that final file.
- **Visual:** stills of every scene, then transition and representative frames decoded from the export (`qa/contact-transitions.png`),
  plus a full sheet (`qa/contact-full.png`). Every scene matches its narration, chips never overlap, and the hook is legible at t = 0.
- **Limits:**
  - ASR-only intelligibility; synthetic voice.
  - Prices are asking prices, not transactions. The ₹1 purchase price, 40 % reject share, 0.5 kg box weight and the costs are
    illustrative.
  - R4 and R5 are US sources, used as the clearest written evidence on reusing boxes and the resale model; Indian buyers set their own
    terms. Two web pages (ups.com, packworld.com) could only be read through search extracts.
  - No silent recap. Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
