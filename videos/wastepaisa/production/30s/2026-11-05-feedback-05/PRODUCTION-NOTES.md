# 18 · feedback-05 episode 01: "गत्ता अलग, मुनाफ़ा अलग" (grade clean corrugated cardboard apart from mixed/wet paper), Hindi

Batch `2026-11-05-feedback-05` (user-approved, 5 Nov 2026).
- **Language:** all narration and captions are in natural Hindi (Devanagari).
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-04-hindi-04/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, caption panel, Devanagari faces, silent recap and CTA layout are unchanged. The props, scene functions and Hindi text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-05-feedback-05/wastepaisa-30s-feedback05-01.mp4`
SHA-256 `6d230558752620ed84a453bc52e2b3fbe477681d47d4ea244965b92e543aaff3` · 10,339,561 bytes.

## Start state, identity and topic check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 6e01188 before edits. No job
  was running. Earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's GitHub access, which is scoped to this repo.
  The assigned account in CLAUDE.md (info@tensorblue.com) cannot be verified independently from inside the container.
- **History:**
  - Earlier topics: paper cup, aluminium can, cable, brass, aluminium aggregation, pallet repair.
  - "Cardboard" appeared only as a palette and background colour, so cardboard grading is a fresh topic.
  - Only this app's context, renderer, assets and episodes were read.

## Performance snapshot and how it was used
User-supplied public snapshot: 15/16 reels with displayed plays, 1,502 observed plays, 56 observed likes (14/16 counts visible), median
118 plays. Totals over unequal post ages do **not** establish causality, so this episode is a **controlled opening/topic test**, not a
style change:
- **Variable changed:** the opening is a buyer/margin question with the subject on screen from frame 0. The mixed lot, two "₹ ?" buyer
  price tags and the X-ray reveal all start by 0.35 s.
- **Held constant:** renderer, mascot, palette, caption treatment, voice, pacing, recap and CTA.
- **Measurement:** compare this reel only after equal post ages; nothing here claims performance.

## Requirements applied
- **Flow:**
  - Starts with the buyer/margin question.
  - Demonstrates grading: dry corrugated, mixed paper, and out (tape, plastic, wet paper).
  - Shows why buyers care: moisture means a weight claim, contamination means a lower grade.
  - Then one illustrative batch with purchase, collection/transport, sorting labour, sales revenue and **net** margin, compared with selling
    unsorted.
- **Boundaries:**
  - The example is labelled: spoken "मान लीजिए", on-screen "उदाहरण · भाव बदलते रहते हैं".
  - No ₹10-to-lakhs promise, no current price presented as fact, no industrial DIY (no pulping, baling machinery or chemicals).
  - CTA is the truthful accepted WastePaisa line. No other app name appears anywhere.
- **Voice:** the accepted voice character for Hindi. Kokoro-82M native Hindi voices **hf_beta 0.7 + hm_omega 0.3** (the Hindi counterpart
  of the 0.7/0.3 "Meshline" blend), `lang='hi'`, speed 1.15, cached. No celebrity imitation; quiet pad under speech.

## Final script (Hindi narration = captions) · 71 words, 24.3 s of speech
| Line | Time (s) | Hindi | English gloss |
|---|---|---|---|
| L1 | 0.25–3.68 | कागज़ के कबाड़ में मुनाफ़ा कहाँ है? खरीदार के ग्रेड में। | Where is the profit in paper scrap? In the buyer's grade. |
| L2 | 3.98–8.20 | सूखे गत्ते के डिब्बे अलग कीजिए; टेप, प्लास्टिक और गीला कागज़ बाहर। | Set dry cardboard boxes apart; tape, plastic and wet paper go out. |
| L3 | 8.50–12.73 | खरीदार गीलेपन का वज़न काटता है, और मिलावट पर भाव गिराता है। | The buyer deducts the weight of wetness and lowers the rate for contamination. |
| L4 | 13.03–17.51 | मान लीजिए तीन सौ किलो अठारह सौ में लिया; अलग करके बिक्री तीन हज़ार। | Suppose you bought 300 kg for ₹1,800; sorted, sales are ₹3,000. |
| L5 | 17.81–22.58 | खरीद, ढुलाई और मज़दूरी घटाकर शुद्ध मुनाफ़ा दो सौ; बिना अलग किए, घाटा। | After purchase, transport and labour, net profit is ₹200; unsorted, a loss. |
| L6 | 26.20–29.37 | वेस्टपैसा से जुड़िए और अपना कबाड़ काम में लाइए! | Join WastePaisa and put your scrap to use! (accepted CTA in Hindi) |

Wording decisions:
- **Avoided words:** छाँटिए (an earlier ASR risk) and line-initial loanwords, as recorded in context 11.
- **Spoken arithmetic:** the first L5 ("ढुलाई और मज़दूरी के हज़ार घटाकर…") omitted the purchase and sounded like 3,000 − 1,000 = 200.
  It was rewritten to name the purchase, and the scene was re-timed and re-rendered.

## Research: grading (primary sources, accessed 5 Nov 2026)
- **G1, ReMA (formerly ISRI) Scrap Specifications Circular, Paper Stock:**
  - Category page: https://www.isrispecs.org/orpheus_resource_categories/paper-stock/.
  - Guideline IV.5: "All paper must be packed dry with a moisture content of 12% which is deemed to be the maximum moisture limit."
    Buyer and seller may agree otherwise in advance.
  - Section VI defines **outthrows** as "all papers that will make the pack undesirable and unsuitable for consumption as the grade
    specified". **Prohibitive materials** are materials whose presence "in excess of the amount allowed, will make the pack unusable as
    the grade specified".
  - Grade 11 Corrugated Containers (OCC) limits, per ReMA's PSI proposals and grade summaries: prohibitive materials ≤1 %, outthrows plus
    prohibitives ≤5 %. Example: https://isri.org/membership/rema-chapters/paper-stock-industries-chapter/psi---scrap-specifications-circular/2015/11/23/specification-proposed-changes---november-2015.
- **G2, CEPI,** *Guidelines for the control of paper for recycling* (on EN 643), https://www.cepi.org/wp-content/uploads/2021/09/REC-18-024-002.pdf.
  - Mill inspection covers the grade, bale condition, "the moisture content, and the unwanted materials content".
  - "Where the moisture content is higher than 10 % (of air dried weight), the additional weight in excess of 10 % may be claimed back".
- **G3, the market rewards clean corrugated:** Resource Recycling, "HDPE, PP prices climb for October" (14 Oct 2026),
  https://resource-recycling.com/recycling/2026/10/14/hdpe-pp-prices-climb-for-october/. US national average OCC (PS 11) was $91/ton
  versus mixed paper (PS 54) at $35–40/ton. This is US data, so the video says only that a buyer grades and deducts. The example's Indian
  gap (₹12 vs ₹8) is deliberately smaller than the US ratio.

## Research: Indian prices (accessed 5 Nov 2026). Only indicative or asking prices exist, so the batch is illustrative
- **P1:** Kabadiwala Online, *Scrap Price List Today in Delhi NCR*, https://kabadiwalaonline.in/price-list/ (no rate date; © 2026).
  - Carton/cardboard box ₹8–14/kg, books and mixed paper ₹8–14/kg, newspaper ₹12–18/kg.
  - "Wet, oily or heavily taped cartons may be discounted."
- **P2:** Kabadidost, *Scrap Rates Today in India* (reviewed July 2026), https://kabadidost.in/scrap-rates. Cardboard/carton ₹6–10/kg
  (indicative guide).
- **P3:** scraprates.in city pages. Cardboard ≈₹7–8/kg (e.g. Agra ₹7.48 on 23 Oct 2026, https://scraprates.in/agra/cardboard-scrap-price;
  Delhi ₹8.37 on 23 Jun 2026).
- **P4:** Joinbin, *Cardboard Scrap Rate in India 2026* (April 2026), https://joinbin.com/scrap-rate-cardboard-india. OCC ₹10–14/kg;
  mill-grade baled ₹14–18/kg (retail-oriented guide).
- **P5, labour benchmark:** Delhi unskilled minimum wage ₹710/day (notification of 15 Apr 2025, as reported; see context 17).

Indian retail lists put cardboard and mixed paper in the same broad band, so the video makes no claim about a fixed Indian premium.

| Illustrative batch (one collected lot) | ₹ |
|---|---|
| Purchase: 300 kg mixed paper and cardboard at ₹6/kg (P2, P3) | −1,800 |
| Sorted into: 210 kg dry corrugated, 60 kg mixed paper, 30 kg out (wet, tape, plastic) | n/a |
| Sales: 210 kg cardboard at ₹12/kg (P1, P4) | 2,520 |
| Sales: 60 kg mixed paper at ₹8/kg (P1) | 480 |
| **Sales revenue (बिक्री)** | **3,000** |
| Collection and transport (ढुलाई) | −600 |
| Sorting labour (मज़दूरी), under one worker-day (P5) | −400 |
| **Net margin (शुद्ध मुनाफ़ा)** | **200** (≈7 % of revenue; before rent, storage or compliance) |
| Comparison: unsorted, sold as mixed at ₹8/kg after the 30 kg wet/contaminant weight is deducted: 270 × 8 = 2,160 − 1,800 − 600 | **−240 (loss)** |

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Profit in paper scrap depends on the buyer's grade (साफ़ गत्ता ₹ ?, मिला-गीला ₹ ?, खरीदार का ग्रेड) | G1, G2 (mills inspect grade, moisture, unwanted materials), G3 | No rate shown in the hook |
| Keep dry corrugated apart; tape, plastic and wet paper out (सूखा गत्ता, मिला कागज़, टेप, प्लास्टिक, गीला कागज़, बाहर) | G1 (prohibitives/outthrows make a pack unusable as the grade), P1 (wet, oily, heavily taped cartons discounted) | Manual sorting only |
| Buyer deducts the weight of wetness (नमी ज़्यादा, वज़न कटौती; moisture meter) | G1 (12 % maximum), G2 (excess above 10 % claimed back) | No percentage spoken; meter shown, not a figure |
| Contamination lowers the rate/grade (मिलावट, गत्ता ग्रेड → हल्का ग्रेड) | G1 | "भाव गिराता है"; no figure |
| Example: 300 kg for ₹1,800; sorted sales ₹3,000; ₹12/kg vs ₹8/kg vs ₹0; 210/60/30 kg | P1–P4 (figures inside indicative ranges) | Spoken "मान लीजिए" + on-screen "उदाहरण" |
| Net: sales ₹3,000 − purchase ₹1,800 − transport ₹600 − labour ₹400 = net ₹200; unsorted = loss −₹240 | Example arithmetic; P5 | "उदाहरण · भाव बदलते रहते हैं"; bar drawn to scale |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed only)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.85 s | Frame 0 already shows the mascot with a mixed lot (cardboard, newspaper, wet paper, plastic) and two buyer tags, "साफ़ गत्ता ₹ ?" and "मिला-गीला ₹ ?". The X-ray (0.35–1.3) shows corrugated flutes inside the board and water in the wet paper. Chip मुनाफ़ा? (1.4), then खरीदार का ग्रेड (3.15) |
| Grading demo | 3.85–8.35 s | Three bins. Dry boards fly to सूखा गत्ता (4.34–5.3); newspaper to मिला कागज़ (5.4); tape peeled (6.05), plastic (6.47) and wet paper (7.13) go to the third bin, whose label steps टेप → प्लास्टिक → गीला कागज़ → बाहर |
| Buyer's check | 8.35–12.9 s | Wet bale on a scale: the moisture probe goes into the red, droplets rise; नमी ज़्यादा, stamp वज़न कटौती (9.95). Contaminated bale: plastic and tape circled (मिलावट 11.08); grade tag flips गत्ता ग्रेड → हल्का ग्रेड (11.75) |
| Example | 12.9–17.65 s | उदाहरण tag; 300 किलो lot; ticket खरीद ₹1,800 (14.5). The lot splits into 210 किलो गत्ता ₹12/किलो, 60 किलो मिला ₹8/किलो and 30 किलो बाहर ₹0 (15.85); ticket बिक्री ₹3,000 (16.6) |
| Net margin | 17.65–22.95 s | To-scale bar बिक्री ₹3,000. खरीद −₹1,800 (17.84), ढुलाई −₹600 (18.26), मज़दूरी −₹400 (18.89), then the warm sliver शुद्ध मुनाफ़ा ₹200 (19.91). Chip बिना अलग किए: घाटा −₹240 (21.35, warm at 22.1). Mascot hops at profit, looks stern at the loss |
| Recap | 22.95–25.9 s | Silent cards: गत्ता अलग, गीला बाहर, शुद्ध हिसाब (warm) |
| CTA | 25.9–30 s | Accepted end card: icon, WastePaisa wordmark, अपना कबाड़ काम में लाइए, mascot waves. Voice CTA 26.2–29.37 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.1 LUFS**, true peak **−1.4 dBFS**, LRA 5.4 LU.
- **Captions** (900 frames logged): ink **y 347–513**, **x 220–860**, at most 2 lines, hand-offs at ASR word onsets, nothing at y < 300.
- **Glyphs:** Devanagari, nukta and ₹ render in Baloo 2 with no missing-glyph boxes. The "↓" was removed from the grade tag to avoid a
  fallback font.
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.06 s of plan; L2's onset reads 0.15 s early because of the
  window start.
- **Intelligibility** (ASR only; this cloud session cannot play audio; full detail in `qa/asr.txt`):
  - *Vosk free decoding:* L1 0.82, L2 0.92, L3 1.00, L4 0.86, L5 1.00, L6 0.80 (mean 0.899).
  - *Spelling or near-homophone misses:* की/के, कहा/कहाँ, अट्ठारह and जुड़ी है/लाई. Constrained decoding confirms "अठारह सौ" and the
    CTA.
  - *L2 "बाहर":* Vosk prefers "बा है" even on the clean take, while Whisper hears "बाहर". The caption and bin label carry it, so it is
    recorded as an ASR ambiguity.
  - *Second engine:* faster-whisper small yields every content word phonetically.
- **Fixes made:**
  - *Before the full render:* hook heap enlarged; wet patch redrawn (it read as a hole); arrow glyph removed.
  - *After the first export:* L2-end SFX lowered.
  - *Content defect:* L5 arithmetic wording corrected, then re-timed and re-rendered once.
- **Visual:** stills of every scene, then 37 transition and representative frames decoded from the export, plus a full sheet every
  1.25 s and a strip of the re-timed net-margin scene.
- **Limits:**
  - ASR-only intelligibility; synthetic Hindi voice.
  - Prices are indicative or asking ranges, not transactions.
  - The US grade-price gap is used only as context.
  - Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its Hindi model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
