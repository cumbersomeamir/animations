# 19 · english-06 episode 01: "Coconut shells into charcoal briquettes: where's the money?" (English)

Batch `2026-11-06-english-06` (user-approved, 6 Nov 2026).
- **Language override:** English narration and English captions only. No Hindi text or audio is reused; every line was synthesised
  fresh.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-05-feedback-05/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, caption panel and the accepted English CTA card ("Put your scrap to use") are unchanged. The props, scene functions and
  English text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-06-english-06/wastepaisa-30s-english06-01.mp4`
SHA-256 `e908962990b43c91a26982dc6577f186def28cd465f851c6d258c4a3ca9c8e25` · 9,846,199 bytes.

## Start state, identity and topic check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at e3f770a before edits. No job
  was running. Earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The assigned
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **History:**
  - Earlier topics: paper cup, aluminium can, cable, brass, aluminium aggregation, pallet repair, cardboard grading.
  - No coconut, charcoal or briquette episode exists, so the suggested topic was used.
  - Only this app's context, renderer, assets and episodes were read.

## Requirements applied
- **Flow:**
  - The hook is on screen in frame 0: the mascot holds a shell next to a briquette stack with a "BRIQUETTES ₹ ?" tag, and the X-ray turns
    the shell to charcoal by 1.3 s.
  - Then collection, drying, processing (kiln, crush, starch, press) and the buyer.
  - Then an illustrative batch: revenue minus shells and starch, labour, energy, transport and equipment, and the net left.
  - The takeaway is spoken: the margin holds only "if shells come cheap". The CTA runs in the last 3.7 s.
- **Boundaries:**
  - No guaranteed lakhs, no ₹10-to-lakhs claim, and no home-carbonisation tutorial.
  - The kiln is shown as equipment, with no temperatures, timings or how-to steps.
  - The notes record the pollution-board categorisation and CDB's warning about pit smoke.
- **Voice:** the approved **Meshline** English character. Kokoro-82M v1.0 ONNX, af_bella 0.7 + am_puck 0.3, en-us, speed 0.98, the cached
  setup of the earlier English episodes. Quiet pad under speech; no celebrity imitation.
- **Captions:** English, in the accepted English treatment (62 px Baloo 2 ExtraBold, **70 px line spacing**, centre y 430). The 84 px
  spacing was a Hindi-only adaptation.
- **Pacing note:** English number phrases are long, so there is **no silent recap** this time. The net-margin scene holds its result and
  the spoken takeaway until the CTA.

## Final script (English narration = captions) · 63 words, 26.9 s of speech
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.51 | Coconut shells into charcoal briquettes: where's the money? |
| L2 | 3.83–7.57 | Collect discarded shells and dry them; wet loads waste fuel. |
| L3 | 7.89–12.96 | A drum kiln chars them with little air, then crush, bind with starch and press. |
| L4 | 13.28–19.04 | Say one batch makes 350 kilos: ₹10,500 in sales. (spoken: "three hundred fifty kilos: ten thousand five hundred rupees in sales") |
| L5 | 19.36–25.92 | Shells, labour, energy, transport and equipment leave about ₹1,500, if shells come cheap. (spoken: "fifteen hundred rupees") |
| L6 | 26.30–28.79 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage changes:
- The first draft ran 30.5 s of speech, so it was cut to 26.9 s.
- "Sold at thirty rupees a kilo" was heard by ASR as "aquila", so L4 states the sales total instead.

## Research: process (primary sources, accessed 6 Nov 2026)
- **C1, Coconut Development Board (Govt of India),** *Shell Charcoal* (processing technology note),
  https://www.coconutboard.in/images/TMOC/Pdf/ProcessingTechnology/shellchar-process.pdf.
  - **Carbonising:** shells of fully matured coconuts are burnt "with a limited supply of air so that they do not burn away to ash but
    are only carbonized".
  - **Pit method:** gives "inferior quality" charcoal, and its "smoke and flue gases … causes atmospheric pollution".
  - **Drum kiln:** an M.S. drum whose rows of air holes are closed in sequence, then "cooled for about eight hours".
  - **Briquettes:** charcoal powder "is binded with the help of binding materials and moulded in the form of briquettes using moulding
    machine".
  - **Yield:** "the average output has been found to be 35 Kg of charcoal from 1000 whole shells".
  - **Packing:** 50 kg sacks.
  - **Capital:** a 1-tonne-per-day unit totals ₹18.66 lakh, of which plant and equipment is ₹10 lakh.
- **C2, FAO,** *Simple technologies for charcoal making* (Forestry Paper 41), §13.2.2 Moisture content,
  https://www.fao.org/4/X5328E/x5328e0e.htm.
  - "Moisture in wood charged to the kiln has to be evaporated by burning extra wood and this lowers overall yield".
  - "the time to complete a carbonization cycle is extended, thus increasing costs".
  - The principle is applied to shells as a woody charge: "wet loads waste fuel".
- **C3, starch binders in briquettes:** coconut-shell charcoal briquette studies use cassava/tapioca or corn starch at about 5–15 %
  and sun-dry pressed briquettes. Example: Fuel characteristics of coconut-shell briquettes with different binders,
  https://journal.unnes.ac.id/journals/sainteknol/article/view/64417; summary of binder trials in the search record.
  The binder share varies by study, so no percentage is stated on screen.
- **C4, regulation (India):** Kerala SPCB's circular adopting CPCB directions puts charcoal units in Green or Orange by kiln type and
  capacity, under CPCB's *Guidelines for Charcoal Manufacturing Units* (secondary summaries; the state board circular should be checked
  locally). Not in the video; recorded so the episode does not imply that home or backyard carbonising is fine.

## Research: prices (accessed 6 Nov 2026). Only asking prices exist, so the batch is illustrative
- **P1, briquette buyer price:** IndiaMART category listings for coconut shell charcoal (seller asking prices),
  https://dir.indiamart.com/impcat/coconut-shell-charcoal.html.
  - Coimbatore "Coconut Shell Charcoal, Briquettes" at ₹30/kg (50 kg pack); a Bengaluru tandoor briquette pack at ≈₹31/kg.
  - Lump charcoal listings run ₹20–55/kg.
- **P2, shell prices are rising:** Deccan Herald, "Coconut shell price: Rates surge to Rs 38 per kg amid rising demand" (Aug 2026),
  https://www.deccanherald.com/india/keralam/coconut-shell-witnesses-steep-price-hike-4114445.
  - Kerala shells "once sold for Rs 5-10 per kg" now fetch up to ₹38/kg.
  - Marketplace listings run ₹6–36/kg (e.g. https://dir.indiamart.com/chennai/coconut-shell.html).
- **P3, labour benchmark:** Delhi unskilled minimum wage ₹710/day (see context 17); coastal state rates differ.

### Illustrative batch (spoken "Say", on-screen "EXAMPLE · PRICES VARY")
| Item | ₹ |
|---|---|
| Discarded shells collected from coconut sellers: 10,000 shells | n/a |
| Charcoal at CDB's 35 kg per 1,000 shells (C1), pressed with starch into briquettes (crushing loss assumed to offset binder mass) | 350 kg |
| **Sales**: 350 kg at ₹30/kg (P1) | **10,500** |
| Shells (nominal payment for discards) + starch | −2,500 |
| Labour (≈4 worker-days: collect, dry, kiln, crush, press; P3) | −3,000 |
| Energy (crusher/press power; the kiln burns shell volatiles) | −1,000 |
| Transport (collection runs + delivery) | −1,500 |
| Equipment (wear/depreciation share; C1 lists ₹10 lakh plant for a 1 t/day unit) | −1,000 |
| **Left (net)** | **≈1,500** (≈14 % of sales) |

**Why "Market-price shells = a loss":**
- At a ~33 % mass yield (C1 implies ~30–35 %; a drum-kiln study measured 33.8–37.2 %), 350 kg of charcoal needs about 1,060 kg of shells.
- The batch breaks even only if shells and starch together cost under about ₹3,000, i.e. shells under ~₹2.8/kg.
- Old Kerala rates of ₹5–10/kg, let alone August 2026's up to ₹38/kg (P2), turn the batch into a loss. Hence "if shells come cheap".

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Coconut shells can become charcoal briquettes (SHELLS → BRIQUETTES ₹ ?; X-ray shell to charcoal) | C1 | No value in the hook |
| Collect discarded shells (vendor cart → sack, COLLECT) | C1 (shells of matured coconuts), P2 (shells are a traded material) | "discarded" |
| Dry them; wet loads waste fuel (sun mat, steam; inset WET = MORE FUEL) | C2 | Principle stated, no figures |
| A drum kiln chars them with little air (DRUM KILN, air-hole rows closing, LITTLE AIR) | C1 | Equipment shown, not a how-to; no temperatures or timings |
| Crush, bind with starch, press (CRUSH, STARCH, PRESS → briquettes) | C1 (powder + binder moulded by machine), C3 (starch binders) | No binder percentage |
| Example: 10,000 shells → 350 kg (7 × 50 kg sacks) → buyer ₹30/kg → ₹10,500 sales | C1 (yield, 50 kg sacks), P1 | Spoken "Say" + EXAMPLE tag |
| Shells + starch, labour, energy, transport, equipment leave ≈₹1,500; market-price shells = a loss | Example arithmetic; P2, P3, C1 | "EXAMPLE · PRICES VARY"; bar drawn to scale; warning chip |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.7 s | Mascot holds a coconut shell; pile of shells, briquette stack, tag "BRIQUETTES ₹ ?". The X-ray (0.3–1.3) turns the held shell to charcoal; SHELLS chip; arrow shells → briquettes; WHERE'S THE MONEY? (2.7) |
| Collect + dry | 3.7–7.75 s | Vendor cart with green coconuts; shells fly into a sack (COLLECT 3.9); shells spread on a drying mat under the sun with steam (DRY 5.3); inset: a wet shell over a bigger fire (WET = MORE FUEL 6.1–6.75) |
| Process | 7.75–13.15 s | Drum kiln (DRUM KILN 8.0). The X-ray shows shells inside turning black; air-hole rows close 9.3/9.55/9.8 (LITTLE AIR). Charcoal flies to the crusher (CRUSH 10.45); starch bowl pours (STARCH 11.8); lever press strokes (PRESS 12.42); briquettes pop out |
| Batch + buyer | 13.15–19.2 s | EXAMPLE tag; 10,000 SHELLS pile → arrow → seven charcoal sacks (350 kg = 7 × 50 kg, 15.45); tickets BUYER PAYS ₹30/kg (15.9) and SALES ₹10,500 (16.4) |
| Net margin | 19.2–25.95 s | To-scale bar SALES ₹10,500; costs land on their spoken words: SHELLS + STARCH −₹2,500, LABOUR −₹3,000, ENERGY −₹1,000, TRANSPORT −₹1,500, EQUIPMENT −₹1,000. Warm sliver LEFT ≈ ₹1,500 (22.85); chip MARKET-PRICE SHELLS = A LOSS (24.64). Mascot hops, then looks stern |
| CTA | 25.95–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 26.3–28.79 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.4 dBFS**, LRA 3.2 LU.
- **Captions** (900 frames logged): ink **y 366–494**, **x 146–934**, at most 2 lines, hand-offs at ASR word onsets, nothing at y < 300.
- **Labels:** all chips ≥ 40 px.
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.03 s of plan for every line.
- **Intelligibility** (ASR only; this cloud session cannot play audio; detail in `qa/asr.txt`):
  - *Vosk en-us 0.22-lgraph:* L1 1.00, L2 1.00, L3 0.87, L4 1.00, L5 0.93, L6 0.89 (mean 0.948).
  - *Vosk misses:* homophones (chars/"charge", then/"than", shells/"shell's") and the out-of-vocabulary brand.
  - *faster-whisper small:* matches the script word for word, including the numbers.
- **Fixes before the full render:**
  - Net-scene labels raised from 36 to 40 px, and their x range kept inside 90–990.
  - Warning chip shortened and moved.
  - SALES label moved over the bar.
  - Sack text replaced by a "350 kg = 7 × 50 kg" chip.
  - Briquettes given a visible rim and moved to the floor beside the press.
  - Starch bowl now fades in only when needed.
- **Visual:** stills of every scene, then 35 transition and representative frames decoded from the export, plus a full sheet every
  1.25 s.
- **Limits:**
  - ASR-only intelligibility; synthetic voice.
  - Prices are asking prices or news-reported, not transactions.
  - Briquette mass assumes binder mass and crushing loss cancel out.
  - No silent recap this episode.
  - Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
