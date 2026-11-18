# 34 · english-21 episode 01: "Scrap price. Ride price." (old bicycles bought as scrap, sorted, repaired or stripped for parts, and resold, English)

Batch `2026-11-18-english-21` (expressly authorised 18 Nov 2026, follows the delivered batch20).
- **Rules applied:** the Published-apps rules, the 2026-11-15 FIRST-FRAME rule and the 2026-11-17 live feedback (context 11):
  - opportunity-first;
  - zero warnings and a clean script;
  - stronger motion;
  - CTA and style kept.
- **Language:** English narration and English captions only; every line was synthesised fresh.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-17-english-20/src/scene.html`.
  Mascot (simple open-lid can), palette, caption panel, voice, soundtrack style and CTA are unchanged.
- **New:**
  - Props: a side-view bicycle that can be split into a rusty half and a shiny half, a bent frame marked in red, removable wheels, seat
    and chain, a platform scale with a digital readout, price tags and a spare-parts shelf.
  - Scenes and text.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-18-english-21/wastepaisa-30s-english21-01.mp4`
  SHA-256 `40d830c99b7290a4b16f18728202bfc3dedb2de846baac210b177cb4f5dba57a` · 16,066,050 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "SCRAP PRICE RIDE PRICE"):
  `videos/wastepaisa/production/30s/2026-11-18-english-21/wastepaisa-30s-english21-01-thumbnail.png`
  SHA-256 `27910812394313be6098c9adfd1e8a228f4fa1cff370f64ae3ac302d812a656f` · 1,995,823 bytes.

## Start state, identity and topic decision
- **Start state:**
  - `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at d1bfaca (english-20).
  - batch20 was complete and pushed; there was no checkpointed unfinished work and no running job, so nothing had to be finished,
    queued or cancelled first.
  - The container had restarted; the scratchpad models and venvs were re-checked and present.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Proposed topic rejected as covered:** "Broken terracotta pots into sellable mosaic planters".
  - english-17 (context 30) already taught broken ceramic made into mosaic products: shards sorted, glued on a base, grouted and sealed,
    with an illustrative split of materials, labour, selling costs and profit.
  - Terracotta mosaic planters would repeat the same technique, supplies and margin story, so a genuinely different subject in the
    same genre was chosen.
- **Candidates checked and rejected:**
  - Tamarind seeds sold to kernel-powder mills: BIS IS 189 confirms tamarind kernel powder grades for textile and jute sizing. But
    mandi price data is too inconsistent to use: listings range from ₹2,250 to ₹17,000+ a quintal.
  - Jar candles in salvaged glass jars: no verifiable jar prices, and the official DC-MSME candle profile was unreachable (HTTP 503, and
    a TLS chain error that was not bypassed).
  - Human hair: thin price data and DGFT export rules (see context 33).
- **Chosen subject (fresh):** old bicycles bought at scrap rates, sorted by frame, repaired or stripped for parts, and resold.
  - Verified evidence: a Mumbai repair shop's sales and price range, from a dated news report.
  - Episode records were searched for bicycle and cycle (as a product): no earlier topic.
  - The business model (fix what can be fixed, part out the rest) resembles hindi-04's pallet repair, but the material, buyers and
    economics are different.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/:
  - Not re-attempted this batch; fastdl's reCAPTCHA blocked the 17 Nov attempt and was not bypassed. The reel remains unviewed.
  - Its pattern was applied: an everyday scrap item → an evident money angle → proof → steps → the money.

## 2026-11-15 FIRST-FRAME rule applied
- **Frame 0 is the composed subject:**
  - One bicycle on a platform scale, split by a glowing line: the left half is rusty scrap, the right half shiny and ride-ready.
  - A "SCRAP ₹ ?" tag and a "RIDE ₹ ?" tag hang above.
  - The split slides left, so more of the cycle turns shiny; the scale reads 15.0 kg on "price".
  - The words "Scrap price. Ride price." (4) are on screen from frame 0, and the voice starts at 0.10 s. No logo, fade or empty setup.
- **The thumbnail is the same composition** with "SCRAP PRICE RIDE PRICE".
- **The words are truthful:** the episode compares buying cycles at scrap rates with selling them as rides.

## Final script (English narration = captions) · 63 words before the CTA, 29.6 s including the CTA
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.97 | Scrap price. Ride price. (big hook caption, on screen from frame 0) |
| L2 | 2.30–4.02 | Which old cycles are worth fixing? |
| L3 | 4.35–7.63 | A Mumbai shop has sold over 100 refurbished cycles. (spoken "a hundred") |
| L4 | 7.96–11.21 | Fix the ones with straight frames; strip the rest for parts. |
| L5 | 11.55–17.44 | Say ten scrap cycles cost ₹4,500; fixing seven costs ₹7,000. (spoken "forty-five hundred rupees … seven thousand") |
| L6 | 17.77–23.26 | Seven sold at ₹2,000, plus scrap from three wrecks: about ₹3,500 left. (spoken "two thousand … thirty-five hundred") |
| L7 | 23.59–25.70 | And every wreck is a cheap spare-parts shop. |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage change: the first L3 also spoke the price range ("for ₹250 to ₹2,500"), which pushed speech to 27.2 s. The range moved to an
on-screen chip (₹250–₹2,500 EACH, plus NEW ≈ ₹7,000), and the voice keeps the sales count.

## Research (accessed 18 Nov 2026). Facts, reported prices and assumptions are kept apart
- **R1, Free Press Journal, "Mumbai: Andheri Duo's Eco-Friendly Initiative Provides Affordable Bicycles To Commuters"** (updated 5 Jan
  2024): https://www.freepressjournal.in/amp/mumbai/mumbai-andheri-duos-eco-friendly-initiative-provides-affordable-bicycles-to-commuters
  - Anthony Fernandes and Kunal Sutar ("Cycle Revolution", Andheri) have collected old bicycles for about five years, mostly donated.
  - They repair and refit them at their cycle retail and repair centre; bicycles that can't be fixed "are dismantled for spare parts".
  - They have sold over 100 repaired and refurbished bicycles, at Rs 250 to Rs 2,500; a new bicycle costs about Rs 7,000.
  - Source for L3, L4's "strip the rest for parts", the on-screen price range and the new-cycle comparison.
- **R2, household iron scrap rate** (from english-13's research, context 26; undated listing): Kabadiwala Online, Delhi NCR, iron scrap
  ₹35–42/kg. Used only as an anchor for the assumed scrap-cycle price of ₹30/kg (lower, because cycles are thin, mixed metal with
  rubber).
- **Advice, not a sourced claim:** fixing only straight frames and stripping bent ones is practical repair sense. A bent or kinked frame
  is the part a repair shop can't cheaply replace. R1 confirms that unfixable cycles are dismantled for parts.

### Assumptions (on screen as "ASSUMED")
| Item | Value | Basis |
|---|---|---|
| Scrap cycles bought | 10 × ~15 kg × ₹30/kg = ₹4,500 | assumption anchored below R2's iron rate |
| Sorted | 7 straight frames to fix, 3 bent frames stripped for parts | assumption (R1: unfixable cycles are dismantled for parts) |
| Parts for 7 (tyres/tubes, chains, brakes, paint; donor parts cut this) | ₹4,900 (₹700 per cycle) | assumption |
| Labour for 7 | ₹2,100 (₹300 per cycle) | assumption |
| **Fixing seven** | **₹7,000** | arithmetic (parts + labour) |
| **Total costs** | **₹11,500** | arithmetic |
| Sales | 7 × ₹2,000 = ₹14,000 | assumed price, inside R1's reported ₹250–₹2,500 range |
| Scrap from the 3 stripped frames | ₹1,000 | assumption |
| **Left** | **≈ ₹3,500** | arithmetic (₹15,000 − ₹11,500; ≈ ₹500 per cycle sold) |
- **Where the margin goes (shown on the bar):** buying ₹4,500, parts ₹4,900, labour ₹2,100, left ₹3,500. Parts are the biggest cost,
  which is why the stripped wrecks matter: they supply wheels, seats and chains for the fixes.
- **Not modelled:** tools, shop rent, and time spent selling. No profit is promised.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Scrap price. Ride price. (split rusty/shiny cycle on a scale; SCRAP ₹ ? and RIDE ₹ ? tags; 15.0 kg) | demonstration | No price on frame 0 |
| Which old cycles are worth fixing? (heap of rusty cycles; question mark) | question | n/a |
| A Mumbai shop has sold over 100 refurbished cycles (MUMBAI · REPAIR SHOP; six shiny cycles; 100+ SOLD; ₹250–₹2,500 EACH; NEW ≈ ₹7,000) | R1 | "over"; figure pops in (no count-up) |
| Fix the ones with straight frames; strip the rest for parts (10 cycles: 7 ticked STRAIGHT → FIX; 3 kinked BENT → PARTS, wheels removed) | R1 (parts); repair practice | Advice, no hazardous procedure |
| Say ten scrap cycles cost ₹4,500; fixing seven costs ₹7,000 (ASSUMED; 10 cycles on a scale, 150 kg; 10 × 15 KG × ₹30; BUY ₹4,500; PARTS ₹4,900; LABOUR ₹2,100; FIX ₹7,000 bracket) | R2 anchor; assumptions | "Say" + ASSUMED; to-scale blocks |
| Seven sold at ₹2,000, plus scrap from three wrecks: about ₹3,500 left (7 × ₹2,000; + SCRAP ₹1,000; BUY, PARTS, LABOUR fill; LEFT ≈ ₹3,500) | R1 price range; assumptions | "about"; costs shown |
| And every wreck is a cheap spare-parts shop (a bent cycle bursts onto a SPARE PARTS shelf; its wheels fly onto the next fix, which rolls out shiny) | R1 | n/a |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–2.15 s | Split rusty/shiny cycle on a scale; the split slides left; 15.0 kg; SCRAP ₹ ? / RIDE ₹ ? tags; big caption from frame 0 |
| Question | 2.15–4.2 s | Three rusty cycles pile in (one bent, one without a seat); "?" on "worth" (3.23); the mascot looks on |
| Proof | 4.2–7.8 s | MUMBAI · REPAIR SHOP (4.45); six shiny cycles pop onto racks, wheels turning; 100+ SOLD on "a hundred" (5.82); ₹250–₹2,500 EACH (6.48); NEW ≈ ₹7,000 (7.05) |
| Method | 7.8–11.4 s | Ten rusty cycles; straight frames get ticks (STRAIGHT → FIX, 8.71) and move into a FIX group; three kinked frames move right (BENT → PARTS, 9.76) and lose wheels, seat and chain into a parts row (10.24) |
| Costs (assumed) | 11.4–17.6 s | ASSUMED; ten cycles on a scale (150 kg); 10 × 15 KG × ₹30 then BUY ₹4,500 (13.32); blocks BUY, PARTS (15.6), LABOUR (16.02); FIX ₹7,000 bracket (16.46) |
| Money (assumed) | 17.6–23.4 s | Sales bar 7 × ₹2,000 (18.64) + SCRAP ₹1,000 (19.81); BUY, PARTS and LABOUR fill from the bottom (20.9); LEFT ≈ ₹3,500 (21.79) |
| Takeaway | 23.4–27 s | A wreck bursts onto a SPARE PARTS shelf (24.01–24.67); its wheels fly onto the next frame, which rolls out shiny (24.94–25.6) |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:**
  - Whole decode exited 0 with 0 bytes of errors.
  - Loudness **−15.0 LUFS**, true peak **−1.4 dBFS** (the AAC encode adds 0.1 dB over the −1.5 dBTP target), LRA 2.8 LU.
  - Sample peak −1.47 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged, `qa/caption-bounds.json`): ink **x 135.5–864.5**, **y 343.5–516.5**, at most 2 lines; the hook caption
  is present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`):
  - Vosk: mean word accuracy 0.938; L1, L2, L4 and L5 1.00; onsets and offsets within ±0.04 s. Misses are homophones (wrecks/"rex",
    and/"in", is/"as") and the brand.
  - faster-whisper small: matches the script word for word apart from the brand spelling.
- **Fixes:**
  - Script: the spoken price range moved on screen to fit before the CTA.
  - Stills:
    - In the sort scene the cycles overlapped into a jumble, so it now has a FIX group of seven (two rows) on the left and a PARTS
      column of three on the right.
    - The cost stack ran into the ASSUMED tag, so it was rescaled.
    - The "seven thousand" moment showed the ₹11,500 total, so it now brackets PARTS + LABOUR as "FIX ₹7,000".
    - The refit wheels didn't land on the bike's real wheel positions, so they were corrected.
    - The hero cycle was enlarged, and the scale readout raised clear of the front wheel.
  - Caption log: "plus scrap from three wrecks:" reached x 82–918 and the L3 group x 103–897, so both were re-split; captions are now
    x 135.5–864.5.
- **Visual review:**
  - Stills of every scene (two rounds).
  - 46 transition and representative frames decoded from the export, covering every cut (`qa/contact-transitions.png`).
  - A full sheet every 1.25 s (`qa/contact-full.png`).
  - The frame-zero thumbnail.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - The only reported prices are the Mumbai shop's ₹250–₹2,500 range and the ₹7,000 new-cycle comparison (2024), plus an undated
    household iron rate used as an anchor. Every batch figure is an assumption; tools, rent and selling time are not modelled, and no
    profit is promised.
  - The reference reel remains unviewed (fastdl's reCAPTCHA was not bypassed on 17 Nov; not re-attempted).
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused. The cycles are generic drawings with no brand.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
