# 35 · english-22 episode 01: "Trash with a buyer." (a discarded coconut shell sanded, oiled, drilled and roped into a hanging planter, English)

Batch `2026-11-19-english-22` (authorised 19 Nov 2026, follows the delivered batch21).
- **Rules applied:**
  - The Published-apps rules, the 2026-11-15 FIRST-FRAME rule and the 2026-11-17 live feedback: opportunity-first, zero warnings, a
    clean script, stronger motion, CTA and style kept.
  - **New from this brief:**
    - Upper captions sit in y ~280–460, below the platform account UI. The caption centre moved from y 430 to 375; ink is now y 288–462.
    - At most one short headline besides the spoken caption.
    - Vital information stays left of the right-side platform controls.
- **Language:** English narration and English captions only; every line was synthesised fresh.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-18-english-21/src/scene.html`.
  Mascot (simple open-lid can), palette, voice, soundtrack style and CTA are unchanged.
- **New:**
  - Props: a half coconut shell that goes rough and fibrous → sanded → oil-polished, a drain hole, a jute hanger, a trailing plant, a
    spotlit wall with the planter's shadow, coconuts, crates and a shipping container.
  - Scenes and text.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-19-english-22/wastepaisa-30s-english22-01.mp4`
  SHA-256 `e5900b7db56fb737d2a768237eae07ce72f98170d8c57393cd68b7568bcd8019` · 12,707,979 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "TRASH WITH A BUYER"):
  `videos/wastepaisa/production/30s/2026-11-19-english-22/wastepaisa-30s-english22-01-thumbnail.png`
  SHA-256 `889219b67df31e98cefb7aa3d0a6cffc36bd71950dc65b12df6c4c021d6c05c7` · 2,120,907 bytes.

## Start state, identity and topic decision
- **Start state:**
  - `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 35acf32 (english-21).
  - batch20 and batch21 were both complete and pushed; there was no checkpointed or running work, so nothing was finished, cancelled
    or duplicated.
  - The container had restarted; the scratchpad models and venvs were re-checked.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Topic kept:** "A discarded coconut shell becomes a sellable planter".
  - The material appeared before in english-06 (context 19): coconut shells sold to the charcoal-briquette trade, by the kilo, for
    burning into fuel.
  - This episode is a different product and business: a single hand-finished shell sold as a décor or garden item.
  - The precise subject (shell → planter) was not covered, so the brief's topic stands.
  - english-06's research is reused for one input: shell prices have risen to as much as ₹38/kg (Deccan Herald, Aug 2026).
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/:
  - Not re-attempted; fastdl's reCAPTCHA blocked the 17 Nov attempt and was not bypassed. The reel remains unviewed.
  - Its pattern was applied: an everyday waste → an evident buyer → proof → steps → the money.

## 2026-11-15 FIRST-FRAME rule applied (brief: "a scrap shell casting the shadow of a premium planter, TRASH WITH A BUYER")
- **Frame 0 is the composed subject:**
  - A rough, fibrous half shell on the scrap-shop floor, lit by a low lamp at the bottom left.
  - On the wall behind, its shadow is a premium hanging planter: a jute hanger, the bowl and trailing leaves, swaying gently.
  - A "BUYER PAYS ₹ ?" tag hangs beside it.
  - The words "Trash with a buyer." (4) are on screen from frame 0, and the voice starts at 0.10 s. No logo, fade or empty setup.
- **The thumbnail is the same composition** with "TRASH WITH A BUYER".
- **The words are truthful:** shell crafts have buyers (proof below), and the episode shows what a buyer actually pays for.

## Final script (English narration = captions) · 67 words before the CTA, 29.6 s including the CTA
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.07 | Trash with a buyer. (big hook caption, on screen from frame 0) |
| L2 | 1.37–5.29 | India grows about 20 billion coconuts a year. Which shells sell? (spoken "twenty billion") |
| L3 | 5.58–9.76 | A Kerala shell-craft firm exported 40,000 pieces to Denmark. (spoken "forty thousand") |
| L4 | 10.06–14.73 | Sand an uncracked half, polish it with coconut oil, drill a drain, add a rope. |
| L5 | 15.04–19.58 | A plant shop pays ₹199: revenue, not profit. (spoken "a hundred and ninety-nine rupees") |
| L6 | 19.88–24.42 | After shell, oil, rope, tools and labour, about ₹70 is left. (spoken "labor … seventy rupees") |
| L7 | 24.72–26.72 | The finish is what the buyer pays for. (answers L2) |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage changes:
- The first money lines ran 27.5 s with gaps, so they were shortened.
- "Sold to a plant shop at ₹199, that's revenue, not profit" was transcribed by Whisper as "$199". The current wording is transcribed
  as "a hundred and ninety-nine rupees".

## Research (accessed 19 Nov 2026). Facts, listings and assumptions are kept apart
- **R1, PIB, "India's Coconut Sector: From the Tree of Life to Global Prominence"** (18 Aug 2026; primary, read via pdftotext):
  https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/aug/doc2026818961601.pdf
  - "According to the DA&FW statistics, India produced about 20,301.22 million nuts of coconut during 2024-25".
  - India ranks first in global production. Source for L2.
- **R2, Onmanorama, "Woman entrepreneur makes curios and utensils out of coconut shells…" (Thenga, Thrissur)** (26 Sep 2023):
  https://www.onmanorama.com/news/business/2023/09/26/thenga-coconut-shell-product-firm-of-thrissur-woman-marks-success.html
  - Founder Maria Kuriakose; about 40 products across kitchenware, tableware, garden and décor; 12 artisans.
  - Oil mills supply the shells, cut to size. The finish is sanding and buffing for the deep brown colour, plus coconut oil for lustre,
    with no colour or chemical varnish.
  - "recently exported 40,000 pieces to Denmark". Source for L3 and for L4's sand-and-oil finish.
  - It also reports ₹1 crore annual turnover; that figure is in the notes only (no lakh or crore claims in the video).
- **R3, selling example (listing, retrieved 19 Nov 2026):** Brown Living product data for "Handcrafted Coconut Shell Plant Hanger | Cotton
  Rope Hanging Planter" (vendor Kottravai): ₹650 (compare-at ₹680).
  https://brownliving.in/products/handcrafted-coconut-shell-plant-hanger-with-woven-cotton-rope
  - Shown small on screen as "ONLINE LISTING SEEN AT ₹650". It is retail through an online eco-marketplace, not a trade price.
- **R4, shell input context:** english-06's P2. Deccan Herald (Aug 2026) reports Kerala shell prices rising to as much as ₹38/kg, from
  ₹5–10/kg before. A secondary profile of Thenga reports shells bought at ₹6–20 each; its original page (YourStory) returned 403, so that
  figure is not used as a fact.
- **Practice (not a sourced claim):** drilling a drainage hole and adding a hanger are standard for shell planters (gardening guides,
  e.g. Gardening Know How "coconut shell planter"). No tool-safety lecture is included, per the feedback.

### Illustrative unit (on screen as "ASSUMED")
| Item | ₹ | Basis |
|---|---|---|
| Uncracked half shell | 10 | assumption; a premium for an intact, planter-sized half over R4's per-kg shell prices |
| Oil and sandpaper | 15 | assumption |
| Jute rope hanger | 25 | assumption |
| Tools share (saw, drill, sanding block ~₹2,000 over ~400 planters) | 5 | assumption |
| Labour (~1 hour: clean, sand, oil, drill, rope, deliver) | 75 | assumption |
| **Cost per planter** | **130** | arithmetic |
| **Revenue:** plant-shop price | **199** | assumption, well below R3's ₹650 online retail |
| **Margin left** | **≈ 70** (₹69) | arithmetic; about 35 % of revenue |
- **Revenue vs margin:** ₹199 is what the buyer pays (revenue); about ₹70 is what is left after inputs, tools share and labour (margin).
- **Not modelled:** unsold stock, rejected or cracked shells beyond the ₹10 allowance, and selling time. No income is promised, and
  nothing implies lakhs from one shell.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Trash with a buyer (scrap shell casts a premium-planter shadow; BUYER PAYS ₹ ?) | R2, R3 | No price on frame 0 |
| India grows about 20 billion coconuts a year (≈20 BILLION · COCONUTS A YEAR · INDIA; coconut pile) | R1 | "about", "≈" |
| Which shells sell? (four rough halves; cracked ones crossed out, uncracked ones ticked) | practice | Question resolved by L4 and L7 |
| A Kerala shell-craft firm exported 40,000 pieces to Denmark (KERALA · SHELL-CRAFT FIRM; crates of polished shells; 40,000 PIECES EXPORTED; container → DENMARK) | R2 | Firm named in the notes only |
| Sand an uncracked half, polish it with coconut oil, drill a drain, add a rope (SAND; OIL POLISH; DRILL A DRAIN; ADD A ROPE; a plant grows in) | R2 (sand, buff, coconut oil); practice | No safety lecture or hazardous detail |
| A plant shop pays ₹199: revenue, not profit (planter on a shop stand; PLANT SHOP ₹199; ONLINE LISTING SEEN AT ₹650; REVENUE ≠ PROFIT) | R3 listing; assumption | ₹199 labelled ASSUMED in the next scene |
| After shell, oil, rope, tools and labour, about ₹70 is left (ASSUMED; ₹199 bar: SHELL ₹10, OIL + SANDPAPER ₹15, ROPE ₹25, TOOLS SHARE ₹5, LABOUR ~1 HR ₹75; LEFT ≈ ₹70) | assumptions | Bar to scale; labels kept left of the right-side controls |
| The finish is what the buyer pays for (rough ₹10 shell → finished ₹199 planter; FINISH; ASSUMED NUMBERS) | arithmetic | n/a |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–1.25 s | Low lamp, rough shell, a swaying planter shadow on a warm wall; BUYER PAYS ₹ ? tag; big caption from frame 0 |
| Super hook | 1.25–5.45 s | Coconuts pile in; ≈20 BILLION pops on "twenty billion" (2.27); then four rough halves, cracked ones crossed and uncracked ones ticked on "sell" (4.79) |
| Proof | 5.45–9.95 s | KERALA · SHELL-CRAFT FIRM (6.1); crates of polished shells stack; 40,000 PIECES EXPORTED (7.8); a container slides in, → DENMARK (8.7–9.2) |
| Make | 9.95–14.9 s | One shell: SAND (block and dust, fibre clears, 10.12); OIL POLISH (oil drips, gloss grows, 11.47); DRILL A DRAIN (13.21); ADD A ROPE (jute lines rise to a ring; a plant grows in, 14.08–14.9) |
| Sale | 14.9–19.75 s | Planter hangs on a plant-shop stand with three potted shells; PLANT SHOP ₹199 (15.79); ONLINE LISTING SEEN AT ₹650 (16.6); REVENUE (18.13) ≠ PROFIT (18.73) |
| Margin (assumed) | 19.75–24.55 s | ₹199 bar; SHELL (20.18), OIL + SANDPAPER (20.69), ROPE (21.2), TOOLS SHARE (21.65), LABOUR (22.22) fill from the bottom; LEFT ≈ ₹70 (23.03) |
| Takeaway | 24.55–27 s | Rough ₹10 shell → arrow → finished ₹199 planter; FINISH (25.47); the mascot hops |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:**
  - Whole decode exited 0 with 0 bytes of errors.
  - Loudness **−15.1 LUFS**, true peak **−1.5 dBFS**, LRA 3.0 LU.
  - Sample peak −1.46 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged, `qa/caption-bounds.json`): ink **x 135–865**, **y 288.5–461.5** (the brief's upper band, y ~280–460),
  at most 2 lines; the hook caption is present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`):
  - Vosk: mean word accuracy 0.909; L1, L6 and L7 1.00; onsets and offsets within ±0.04 s. Misses are near-homophones and
    out-of-vocabulary words (Kerala/"careless", uncracked/"untracked", "drill a"/"driller") and the brand.
  - faster-whisper small: matches the script word for word apart from the brand spelling and "Shellcraft" written as one word.
- **Fixes:**
  - Script: money lines shortened, and the "$199" mishearing removed by rewording.
  - Captions: the centre moved up from y 430 to y 375 for the requested band.
  - Stills:
    - The frame-zero wall glow showed hard rectangle edges, so it now fills the canvas.
    - The duplicate "WHICH SELL?" label was removed.
    - The KERALA label fades out when 40,000 PIECES appears (one headline at a time).
    - The hook tag moved left, away from the right-side controls.
    - A hook line was added from the shop stand to the planter's rope.
- **Visual review:**
  - Stills of every scene.
  - 46 transition and representative frames decoded from the export, covering every cut (`qa/contact-transitions.png`).
  - A full sheet every 1.25 s (`qa/contact-full.png`).
  - The frame-zero thumbnail.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - The unit economics are assumptions, except the ₹650 online listing (one retailer, one product, retrieved 19 Nov 2026). Unsold stock
    and selling time are not modelled, and no income is promised.
  - The reported ₹6–20 per-shell figure could not be opened at its original source and is not used.
  - The reference reel remains unviewed.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused. Shells, planters and the container are generic drawings with no
  brands.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
