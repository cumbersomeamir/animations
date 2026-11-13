# 26 · english-13 episode 01: "Why does a mill pay ₹8 more a kilo for some iron?" (steel scrap grades: thick/clean vs thin/rusty, English)

Batch `2026-11-13-english-13` (user-approved 13 Nov 2026; Published-apps rules of 2026-11-11 retained, see `11-production-format.md`).
- **Language:** English narration and English captions only; every line synthesised fresh. No narration reused from earlier episodes.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-11-english-12/src/scene.html`
  with its 2026-11-11 adaptations (CTA 27–30 s, captions centred at x 500, large brief labels, key light, depth-push transitions,
  separate thumbnail). Mascot, palette, caption panel, voice and CTA are unchanged. Props, scenes and text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-13-english-13/wastepaisa-30s-english13-01.mp4`
  SHA-256 `876b9d37d5bfd994f201fd1ea74d5c34408749afe9710f18f72af164767db152` · 11,248,653 bytes.
- Thumbnail (separate 1080×1920 PNG, words "THICK BEATS THIN."):
  `videos/wastepaisa/production/30s/2026-11-13-english-13/wastepaisa-30s-english13-01-thumbnail.png`
  SHA-256 `fbca08a1566f00f3e24439af619aa81dd8323c8f3c206ec878e3a1d3c8fc2dab` · 1,893,730 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 3bbd771 (english-12) before
  edits. No earlier job was running or unfinished; earlier outputs were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Proposed topic rejected as covered:** "Why cardboard buyers care about air in your load" (clean dry sorted cardboard, baling,
  same truck loose vs compacted, costs vs gross).
  - english-07 (context 20) already taught the core lesson for PET: "Then crush them; loose bottles are mostly air, and air costs
    transport", with a truck of loose bottles (≈20 kg/m³) against a truck of bales (≈300 kg/m³) and a cost/sales example.
  - feedback-05 (context 18) covered clean, dry, graded cardboard and the buyer's moisture deduction; english-10 covered cardboard reuse.
  - english-11 (context 24) covered spreading one trip's cost over more units.
- **Candidates checked and set aside:** coir pith (salt/EC lesson is new, but no verifiable price for washed vs unwashed pith and the
  BIS draft is no longer online); human hair (the Instagram reference's subject; prices only from 2013–2014 reports, an export
  prohibition below US$65/kg since Feb 2025, and no clear fit with a scrap-app CTA); heavy vs light iron by sorting alone (on the mill
  card the mixed "Super" grade is close to a sorted blend, so "sort to earn more" would be unsupported).
- **Replacement, same story criteria:** steel scrap grades by thickness, cleanliness and rust. Hook question with dated, located
  rates from one buyer; proof from the furnace (yield) and buyer specifications; a business insight (collect and keep the grades mills
  pay for: thick, clean, dry); the same truck and the same trip cost against two gross revenues. History: iron appeared only as a
  contaminant (hindi-03, brass, stainless). english-12 (stainless) was about hidden alloy content and testing; this episode is about
  visible thickness and rust and what the furnace returns.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/: still readable only as page metadata (dexter_zee1, "Make Money ! From
  Hair ??!!", 5 Nov 2026). The video was not viewed; nothing about it is claimed beyond that.

## Final script (English narration = captions) · 69 words before the CTA, 26.0 s of speech including it
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.49 | Why does a mill pay ₹8 more a kilo for some iron? (spoken "eight rupees") |
| L2 | 3.80–5.52 | The answer is inside the furnace. |
| L3 | 5.85–10.85 | Thin, rusty sheet oxidises away; thick, clean pieces return more steel. |
| L4 | 11.15–14.73 | So mills pay by grade: punchings top, light scrap last. |
| L5 | 15.05–17.93 | Keep heavy pieces apart, dry and free of dirt. |
| L6 | 18.25–23.53 | Same truck, same trip cost, but a tonne of punchings brings ₹8,000 more. (spoken "a ton … eight thousand rupees") |
| L7 | 23.85–25.66 | Mills pay for the steel they get back. |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

## Research (accessed 13 Nov 2026). Measured facts, market rates, estimates and assumptions are kept apart
- **M1, dated buyer rates (aggregator-published mill card):** Steel Baba, "Iron Scrap Rate Today", page dated 13 Nov 2026, section
  "Jalna (mill card, verified)", ₹/t excluding 18 % GST: Punching ₹39,500; End Cut ₹38,500; Structure/TMT ₹38,000; Melting ₹37,500;
  Super (mix grade) ₹36,500; Heavy ₹35,500; Turning ₹34,500; **LC / L2 (Light Melting Scrap) ₹31,500**. https://steel-baba.com/
  Grades are not defined on the page; the episode uses only Punching (top), Melting and Light Scrap.
- **M2 (context):** BigMint, HMS 80:20 ₹35,850/t DAP Mandi Gobindgarh on 3 Nov 2026 (search extract; article paywalled).
- **F1, buyer specification (primary):** Steel Dynamics, Roanoke Bar Division, "Inspection of Scrap", AP019 rev. 3, 20 Aug 2026
  (https://www.steeldynamics.com/wp-content/uploads/2026/08/ScrapSpecifications082026.pdf):
  - "#1 Heavy Melt: Clean steel scrap at least ¼" thickness"; prohibitions include "Free of dirt", tin-coated steel, cables.
  - "#2 Heavy Melt: Steel scrap … 1/8" thickness and over … Free of sheet iron and thin gage material".
  - "Downgrade – When a particular grade of scrap is found to not conform to its represented grade, it may be … accepted as an inferior grade".
- **F2, yield (technical):** C. Manning and V. Chevrier, "Maximizing Iron Unit Yield from Ore to Liquid Steel (Part 3) – Melting
  Practice", Midrex, June 2020: "low density scrap tends to oxidize rapidly, which results in a low melting yield"; scrap containing
  "dirt, oil, rust, and coatings will yield less when melted than" clean, well-segregated scrap.
  https://www.midrex.com/tech-article/maximizing-iron-unit-yield-from-ore-to-liquid-steel-part-3-melting-practice/
- **F3 (technical):** IspatGuru, "Ferrous Scrap and its Collection and Recycling", 14 Jan 2017: punchings and plate scrap are "generally
  clean, free from rust", melt with high yield and are of known composition; No. 2 bundles (coated light scrap) yield "around 70 %".
  https://www.ispatguru.com/ferrous-scrap-and-its-collection-and-recycling/
- **M3 (household rate, undated):** Kabadiwala Online, Delhi NCR: iron scrap ₹35–42/kg, "heavy, clean iron gets the best rate".
- **T1, T2, P4 (costs, from contexts 24 and 17):** Tata Ace full-day tariff ₹3,000 (8 h/80 km); ≈₹2,000 per short trip; Delhi unskilled
  minimum wage ₹710/day.

### Illustrative same-truck comparison (on-screen "EXAMPLE"; rates labelled "JALNA MILL RATES · 13 NOV 2026")
| Item | Punchings | Light scrap | Basis |
|---|---|---|---|
| Gross for 1 t at the mill card rate | **₹39,500** | **₹31,500** | M1, measured |
| Truck trip (≈₹3,000) + one worker-day of sorting (≈₹700) | −₹3,700 | −₹3,700 | T1, P4, rounded; same for both |
| Left before paying for the metal | ₹35,800 | ₹27,800 | arithmetic |
| Difference | **₹8,000 per tonne** | | M1 |

No buying price is assumed: the episode says only that the same truck and trip cost bring ₹8,000 more per tonne of punchings, which is
the room a collector has to pay suppliers and still earn. No profit is promised.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| A mill pays ₹8 more a kilo for some iron (MILL PAYS ₹39.50/kg CLEAN OFFCUTS vs ₹31.50/kg THIN, RUSTY SHEET; +₹8 / kg; JALNA MILL RATES · 13 NOV 2026) | M1 | Dated and located; one mill |
| Thin, rusty sheet oxidises away; thick, clean pieces return more steel (furnace cross-sections: slag layer and small pool vs tall pool; OXIDISED, MORE STEEL) | F2, F3 | Pool levels illustrative; no yield % shown |
| Mills pay by grade: punchings top, light scrap last (MILL RATE CARD: PUNCHINGS ₹39,500/t, MELTING ₹37,500/t, LIGHT SCRAP ₹31,500/t; JALNA · 13 NOV 2026 · EX GST) | M1, F1 (grades by thickness; downgrade rule) | Three of the card's rows |
| Keep heavy pieces apart, dry and free of dirt (HEAVY APART; roof; DRY · NO DIRT) | F1 ("Free of dirt"; thin gauge excluded from heavy melt), F2 (rust and dirt lower yield) | Storage advice, no machinery |
| Same truck, same trip cost; a tonne of punchings brings ₹8,000 more (EXAMPLE; 1 t; TRIP + SORTING ₹3,700 on both; PUNCHINGS ₹39,500; LIGHT SCRAP ₹31,500; +₹8,000 / t) | M1, T1, P4 | Costs identical by construction; no buying price or profit claimed |
| Mills pay for the steel they get back (billet from the furnace; PAID FOR THE STEEL OUT) | F2, F3, M1 | Insight, not a promise |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.6 s | From frame 0: CLEAN OFFCUTS and THIN, RUSTY SHEET heaps on two 100 kg scales; MILL PAYS tags "₹ ?" flip to ₹39.50/kg (≈1.4 s) and ₹31.50/kg (≈2.0 s); +₹8 / kg (2.25); JALNA MILL RATES · 13 NOV 2026 |
| Super hook | 3.6–5.75 s | A glowing induction furnace rises; pieces from both heaps arc into it |
| Melt | 5.75–11 s | Two furnace cross-sections: rusty sheet flakes into orange oxide and a thick slag crust over a small pool (OXIDISED 7.02); thick plates sink into a tall bright pool (MORE STEEL 10.08) |
| Rate card | 11–14.9 s | MILL RATE CARD rows slide in; PUNCHINGS highlighted (12.74), LIGHT SCRAP marked (13.58); JALNA · 13 NOV 2026 · EX GST |
| Sort | 14.9–18.1 s | Pieces fly to two heaps (HEAVY APART 15.92); a roof drops over the heavy heap and dirt falls away (DRY · NO DIRT 16.58) |
| Same truck | 18.1–23.7 s | EXAMPLE. Two identical trucks, 1 t each (punchings / light scrap); TRIP + SORTING ₹3,700 on both (19.48); tickets ₹39,500 and ₹31,500 (21.07); +₹8,000 / t (21.97) |
| Takeaway | 23.7–27 s | A billet slides out of the furnace onto rollers; PAID FOR THE STEEL OUT (24.69); tick; mascot hops |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:** whole decode exit 0 with 0 bytes of errors; **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 3.5 LU; sample
  peak −1.48 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged): ink **x 135.5–864.5**, **y 366–494**, at most 2 lines, hand-offs at ASR word onsets.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`): Vosk L1, L2, L5, L7 1.00; L3 0.91
  ("thin" heard as "then"), L4 0.90 and L6 0.93 (plural "punchings" heard as "punching"), CTA 0.89 (brand OOV); mean 0.954; onsets and
  offsets within ±0.03 s. faster-whisper small matches the script ("Thin", "punchings"), apart from the brand spelling.
  - "thin": the raw narration is heard as "thin"; the export is heard as "then" even in test mixes without music or SFX, so it is a
    recogniser reaction to resampling and normalisation, not masking. The one real masking risk (a metallic clank ending on "Thin")
    became a low thud before this pass.
- **Fixes:** script tightened from 30.9 s to 23.5 s of speech; hook and sorting heaps enlarged and trucks scaled up after the stills
  review; clank → thud (audio re-mixed and re-muxed; video unchanged).
- **Visual review:** stills of every scene, 40 transition and representative frames decoded from the export
  (`qa/contact-transitions.png`) and a full sheet every 1.25 s (`qa/contact-full.png`). Every scene matches its line; no overlaps beyond
  the accepted dissolves.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - The rates are one mill's card as published by an aggregator on 13 Nov 2026; grade definitions are not on the page.
  - Furnace pool levels illustrate the yield difference; no yield percentage is claimed. F1 is a US mill specification used as the
    clearest written buyer requirement; Indian mills set their own grades.
  - Trip and sorting costs are tariff/wage based, not quotes.
  - The Instagram reference could only be read as page metadata.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
