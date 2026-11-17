# 32 · english-19 episode 01: "Old jeans, new bag." (old denim sorted, washed, cut and stitched into patchwork bags and repair patches, English)

Batch `2026-11-17-english-19` (user-approved 17 Nov 2026, follows the delivered batch18). The Published-apps rules of 2026-11-11 and
the 2026-11-15 FIRST-FRAME rule are retained.
- **Language:** English narration and English captions only. Every line was synthesised fresh; no narration is reused.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-15-english-18/src/scene.html`
  with its 2026-11-11 adaptations. Mascot (simple open-lid can), palette, caption panel, voice and CTA are unchanged.
- **New:**
  - Props: a hanging pair of jeans on a clothes rail with one leg cut into panels, folded pairs with stitched back pockets, scissors, a
    patchwork tote, repair patches, a reject tray, wash bubbles and a balance.
  - Scenes and text.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-17-english-19/wastepaisa-30s-english19-01.mp4`
  SHA-256 `5ac1e6cb6497569214a36408815a23ee145955c47a151a8542ca41e54965a358` · 13,817,569 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "OLD JEANS NEW BAG"):
  `videos/wastepaisa/production/30s/2026-11-17-english-19/wastepaisa-30s-english19-01-thumbnail.png`
  SHA-256 `2da3529d3aa4b21939ca5accd0b4bc87ec221cc322898c0588bd4f4c1f1d8f88` · 1,837,737 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at cacbf99 (english-18) before
  edits.
  - The container had restarted since batch18. The scratchpad models (Kokoro, Vosk, faster-whisper) and venvs were still present and
    were re-checked before use.
  - No render was running; earlier outputs were not touched, and batch18 was not repeated.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Topic kept (fresh):** "How old denim becomes a sellable patchwork product".
  - Episode records and production notes were searched for denim, jeans and patchwork: no hits.
  - The nearest earlier topic is english-09: old cotton garments sold by the kilo as industrial wiping rags. This episode is a
    different business: selected denim is turned into a finished product (patchwork bags) plus repair patches from the offcuts.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/:
  - Last checked during batch18 (15 Nov): only metadata (dexter_zee1, Reel, 5 Nov 2026, "Make Money ! From Hair ??!!") and visible
    comments, some asking whether buyers exist. It was not re-checked for this batch.
  - The video was never viewable and is not described beyond that.

## 2026-11-15 FIRST-FRAME rule applied
- **Frame 0 is the composed subject:**
  - A pair of jeans hangs on a rail. One leg is cut into a dashed grid of panels.
  - Five panels already sit in a patchwork tote, five are mid-air, and six are still on the leg. By 1.15 s every panel is in, the
    handles have grown and the seams are stitched.
  - The words "Old jeans, new bag." (4) are on screen from frame 0, and the voice starts at 0.10 s. No logo, fade or empty setup.
- **The thumbnail is the same frame-zero composition** with "OLD JEANS NEW BAG".
- **The words are truthful:** the episode shows the transformation and what decides whether it pays.

## Final script (English narration = captions) · 72 words before the CTA, 29.6 s including the CTA
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.34 | Old jeans, new bag. (big hook caption, on screen from frame 0) |
| L2 | 1.66–3.12 | But which pairs are worth cutting? |
| L3 | 3.47–8.47 | A Mumbai start-up sold almost 3,000 products from old jeans in its first year. (spoken "three thousand") |
| L4 | 8.82–13.25 | Reject thin or stretchy pairs, sort by shade, then wash and cut squares. |
| L5 | 13.60–18.82 | Ten pairs, about ₹120 of denim, make three bags and thirty patches. (spoken "a hundred and twenty rupees") |
| L6 | 19.17–24.72 | After labour and supplies, about ₹300 is left; the patches pay for the denim. (spoken "labor … three hundred rupees") |
| L7 | 25.07–26.47 | So sort first, then cut. (answers L2) |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage note: Whisper heard all lines correctly on the first synthesis. L7 was added afterwards to answer the hook question in the
21–27 s window.

## Research (accessed 17 Nov 2026). Facts, sourced prices and assumptions are kept apart
- **R1, The Better India, "Mumbai jeans recycle bags" on Dwij** (28 Mar 2019):
  https://thebetterindia.com/176538/mumbai-jeans-recycle-bags-sustainable-inspiring
  - The collection "is sent to Panipat to be segregated, based on quality"; the jeans "are industrially cleaned"; then they are cut and
    tailored "as per the designs" by a team that includes tailors and cutters.
  - Third-grade denim is bought "at a rate of Rs 20 per kilogram". This is the **sourced local price** used on screen as
    "₹20/KG REPORTED"; it is a 2019 figure.
  - In its first year Dwij upcycled "more than 2,500 post-consumer jeans" and sold "almost 3,000 upcycled products". Source for L3.
- **R2, denim:** Britannica describes denim as a durable twill-woven fabric, usually all-cotton but sometimes a cotton-synthetic blend
  (search snippet). Context for "stretchy pairs": stretch denim contains a synthetic stretch fibre.
- **R3, price context (not on screen):** IndiaMART seller listings put denim waste for the textile industry at about ₹18–25/kg. Listings
  vary by grade and are asking prices, not verified market rates.
- **Context, not used on screen:** other Indian denim-upcycling enterprises found in search coverage (Karaashilp, Narikind, Kumbaya).

### Unit economics (on screen as "ASSUMED", except the reported denim price)
| Item | Value | Basis |
|---|---|---|
| Old jeans bought | 10 pairs ≈ 6 kg | assumption (~0.6 kg per pair) |
| Denim cost | ₹120 | 6 kg × ₹20/kg, the price reported in R1 (2019) |
| Rejected at sorting (thin or stretchy) | 3 of 10 (30 %) | assumption; R1 confirms quality segregation, the rate is assumed |
| Yield from 7 usable pairs | 3 patchwork bags + 30 repair patches | assumption |
| Supplies (washing, thread, lining, handles) | ₹330 | assumption |
| Labour (3 bags × ₹250 + patches ₹150) | ₹900 | assumption |
| **Costs** | **₹1,350** | arithmetic |
| Sales: 3 bags × ₹450 + 30 patches × ₹10 | ₹1,650 | assumed prices |
| **Left** | **≈ ₹300** | arithmetic (≈18 % of sales) |
| Patches vs denim | ₹300 vs ₹120 | arithmetic: the offcut patches more than pay for the denim |
- **Not modelled** (each would reduce the ₹300): unsold stock, selling costs (stall fees, platform commission, delivery) and machine wear.
  No profit is promised.
- The rejected pairs are paid for (they are part of the 6 kg) but produce nothing here. In practice they could go to rag or fibre buyers
  (english-09); that income is not counted.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Old jeans, new bag (a jeans leg cut into panels that stitch into a patchwork tote) | demonstration | No price or promise |
| But which pairs are worth cutting? (stack of jeans; scissors hover; question mark) | question | n/a |
| A Mumbai start-up sold almost 3,000 products from old jeans in its first year (MUMBAI · FIRST YEAR; jeans → products; ≈3,000 PRODUCTS SOLD) | R1 | "almost" and "≈"; the company is named in the notes only |
| Reject thin or stretchy pairs, sort by shade, then wash and cut squares (THIN / STRETCHY pairs drop into 3 REJECTS; SORT BY SHADE gradient; WASH bubbles; CUT SQUARES) | R1 (quality segregation, cleaning), R2 | Reject count assumed; no tool-safety procedure needed |
| Ten pairs, about ₹120 of denim, make three bags and thirty patches (ASSUMED; 10 PAIRS ≈ 6 KG; ₹20/KG REPORTED; ₹120 DENIM; 3 BAGS; 30 PATCHES) | R1 price; assumptions | "about"; reported price kept apart from ASSUMED yields |
| After labour and supplies, about ₹300 is left (SALES ₹1,650; LABOUR −₹900; SUPPLIES −₹330; DENIM −₹120; LEFT ≈ ₹300) | assumptions | "about"; ASSUMED tag; bar to scale |
| The patches pay for the denim (balance: PATCHES ₹300 outweighs DENIM ₹120; ASSUMED NUMBERS) | arithmetic | n/a |
| So sort first, then cut (sorted stack with a tick; scissors cut squares) | advice | n/a |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–1.5 s | Jeans on a rail; one leg's panels fly into a patchwork tote; handles grow, seams stitch; big caption from frame 0 |
| Question | 1.5–3.35 s | Two stacks of folded jeans; scissors hover between them; "?" on "worth" (2.38) |
| Proof | 3.35–8.65 s | MUMBAI · FIRST YEAR (3.56); a stack of jeans → arrow (4.7) → a grid of patchwork bags; ≈3,000 counter (5.45); PRODUCTS SOLD (6.14) |
| Method | 8.65–13.45 s | Ten folded pairs; THIN and STRETCHY pairs drop into the tray (3 REJECTS, 9.3–10.2); the rest line up light to dark (SORT BY SHADE 10.56); WASH bubbles (11.91); CUT SQUARES (12.42) |
| Output | 13.45–19.0 s | ASSUMED; 10 PAIRS ≈ 6 KG; ₹20/KG REPORTED (14.65); ₹120 DENIM (16.03); three patchwork bags stitch (16.72, 3 BAGS 17.26); 30 PATCHES (17.86) |
| Money (assumed) | 19.0–23.05 s | SALES ₹1,650 bar (19.17); LABOUR −₹900 (19.5), SUPPLIES −₹330 (19.98), DENIM −₹120 (20.4) fill from the bottom; LEFT ≈ ₹300 (21.12) |
| Takeaway | 23.05–27 s | Balance: PATCHES ₹300 (23.25) outweighs DENIM ₹120 (24.24); then a sorted stack with a tick (SORT 25.25) and scissors cutting squares (THEN CUT 25.88) |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:**
  - Whole decode exited 0 with 0 bytes of errors.
  - Loudness **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 3.4 LU.
  - Sample peak −1.47 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged, `qa/caption-bounds.json`): ink **x 133.8–866.2**, **y 343–517**, at most 2 lines; the hook caption is
  present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`):
  - Vosk: mean word accuracy 0.971; L1, L2, L4, L6 and L7 1.00; onsets and offsets within ±0.05 s. Misses: "start-up" split at the
    hyphen, "a hundred" normalised to "one hundred", and the brand.
  - faster-whisper small: matches the script word for word apart from the brand spelling.
- **Fixes:**
  - Script: L7 "So sort first, then cut." was added so the 21–27 s window answers the hook question.
  - Code: a reject-table error (4 rejects instead of 3) crashed the cut-squares step; fixed, and each reject is now staggered by its
    own order.
  - Stills:
    - At frame 0 no panel had reached the bag yet, so the timing was changed: 5 panels placed, 5 in the air, 6 still on the leg.
    - The folded pairs read as bars, so they got more height and a stitched back pocket.
    - The mascot hid the reject tray, so it moved left.
    - An unlabelled tint on the sales bar was removed.
  - Caption log: "Reject thin or stretchy pairs," reached x 99.9–900.1, so it was split onto two lines.
  - Thumbnail and frame 0: hanging cords crossed the words and ran behind the caption, so the jeans now hang from a short clothes rail,
    lowered 30 px to clear the caption panel.
  - First full render: the "≈3,000" counter counted up, so one frame read "≈2,989". It now pops in at ≈3,000.
  - A `//` comment inserted mid-line broke the page (the english-14 lesson); it was replaced with a block comment, then the video was
    re-rendered and re-muxed. All QA above is on that final file.
- **Visual review:**
  - Stills of every scene (two rounds).
  - 50 transition and representative frames decoded from the export (`qa/contact-transitions.png`).
  - A full sheet every 1.25 s (`qa/contact-full.png`).
  - The counter frames at 5.5, 5.8 and 6.1 s.
  - Frame 0 at full resolution.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - The denim price (₹20/kg) is a 2019 report from one enterprise. Every other rupee figure, the reject rate and the yields are
    assumptions. Unsold stock and selling costs are not modelled, and no profit is promised.
  - The Instagram reference was not re-checked for this batch; it has only ever been readable as page metadata and comments.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused. The jeans, bags and patches are generic drawings with no brands.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
