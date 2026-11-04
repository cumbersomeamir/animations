# 17 · hindi-04 episode 01: "टूटे पैलेट की मरम्मत का कारोबार" (collect, grade and repair wooden pallets for resale), Hindi

Round `2026-11-04-hindi-04` (user-approved, 4 Nov 2026). **Language:** all narration and captions are in natural Hindi (Devanagari).
**Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
`production/30s/2026-11-03-hindi-03/src/scene.html`, which is itself the round-02 renderer. The point-cloud shop, camera grammar,
simplified open-can mascot, caption panel, Devanagari faces, silent recap and CTA layout are unchanged. The props, scene functions and
Hindi text are new. A copy of this file is in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-04-hindi-04/wastepaisa-30s-hindi04-01.mp4`
SHA-256 `f77fc826c997c0444791421e009e48698eb79c5f0e531214a0677e577e080446` · 11,004,006 bytes.

## Topic check and start state
- **History:** paper cup (30s-01), aluminium can (30s-02), old cable (feedback-01), brass (round02-01) and an aluminium aggregation business
  (hindi03-01). Wooden pallets are a new material, and repair-for-resale is a different business model from aggregation. It adds value by
  repairing rather than sorting for a recycler, so the requested topic was used unchanged.
- **Start state:** no generation was active and the tree was clean at commit afe8fa9. Earlier MP4s and folders were not touched.
- **Scope:** the separate Ideaverse meme test is a different app and was not opened or used.

## Corrections and requirements applied
- **Framing:** a business idea. Repair and resell whole pallets instead of selling broken timber by weight. The illustrative batch shows
  the turnover (बिक्री ₹6,000), then every cost (purchase, transport, labour, nails), then the actual profit (मुनाफ़ा ₹500).
  - It is clearly labelled as an example: spoken "मान लीजिए", and the on-screen tags "उदाहरण" and "भाव बदलते रहते हैं".
  - There is no ₹10-to-lakhs promise, no current price presented as fact, and no earnings guarantee.
- **No hazardous or chemical DIY:**
  - Repair is mechanical only: remove boards, replace boards, nail.
  - Heat treatment, fumigation and export marking are never shown as DIY. They are covered in the notes and post text as facts.
- **Kept exactly:** simplified open-can mascot in the point-cloud scrap shop; dismantling and value-addition scenes; accepted caption
  panel (62 px Baloo 2 ExtraBold, Devanagari faces, 84 px line spacing, centre y 430); silent 2 s recap as in round-02; truthful CTA.
- **Skill adjustments (recorded in context 11):** none to the style.
  - Kokoro Hindi pronunciation rules were added after ASR found risky words: avoid छाँटिए, avoid line-initial English loanwords, and
    prefer common trade words (पीस over नग).
  - SFX under a line's last word are kept quiet.

## Voice (local, legitimate, no paid API, no cloning)
- **Engine:** Kokoro-82M v1.0 ONNX (kokoro-onnx 0.6.1) with native Hindi voices **hf_beta 0.7 + hm_omega 0.3**, `lang='hi'`, speed 1.15.
  This is the same setup as hindi-03, reused from the cached scratchpad. espeak-ng Hindi G2P; phonemes per line are in
  `audio/narration/timing.json`.
- **Listening limitation:** this cloud session cannot play audio. Intelligibility was verified with two Hindi-capable ASR engines (Vosk small-hi, faster-whisper small)
  and constrained decoding. No human listening test.
- **Changes made at draft stage because of ASR:**
  - **"छाँटिए"** was transcribed as a vulgar near-homophone, so it was removed (the three piles are described instead).
  - **"नग"** (piece) was not recognised, so it became **"पीस"**.
  - **Sentence-initial "पैलेट"** read as "पहले", so L2 starts "जमा किए हुए पैलेट…".
  - **Line-final verbs:** बिके → बिक गए, बदलिए → बदल दीजिए.
  - **"बची"** (heard as पर्ची) → बाकी.
  - **The brand** is sent to the synthesiser as "वेस्ट पैसा"; the caption keeps वेस्टपैसा.
- **Numbers:** spoken as Hindi words (बीस, तीन हज़ार, बारह, छह हज़ार, पाँच सौ). Captions show digits with ₹ (20, ₹3,000, 12, ₹6,000, ₹500).

## Final script (Hindi narration = captions) · 71 words, 25.4 s of speech
| Line | Time (s) | Hindi | English gloss |
|---|---|---|---|
| L1 | 0.25–4.21 | टूटा पैलेट किलो के भाव बिकता है, ठीक किया पैलेट पीस के भाव। | A broken pallet sells by the kilo; a repaired pallet sells by the piece. |
| L2 | 4.50–8.64 | जमा किए हुए पैलेट के तीन ढेर बनाइए: ठीक, मरम्मत लायक, बेकार। | Make three piles of the collected pallets: good, repairable, scrap. |
| L3 | 8.94–13.03 | बेकार पैलेट के अच्छे तख्ते निकालकर, टूटे तख्ते बदल दीजिए। | Take the good boards out of the scrap pallets and replace the broken boards. |
| L4 | 13.33–17.39 | मान लीजिए बीस पैलेट तीन हज़ार में लिए; बारह ठीक होकर बिक गए। | Suppose you bought 20 pallets for ₹3,000; 12 were repaired and sold. |
| L5 | 17.70–23.67 | बाकी लकड़ी मिलाकर बिक्री छह हज़ार; खरीद, ढुलाई, मज़दूरी, कीलें घटाकर मुनाफ़ा पाँच सौ। | With the leftover wood, turnover is ₹6,000; after purchase, transport, labour and nails, profit is ₹500. |
| L6 | 26.20–29.37 | वेस्टपैसा से जुड़िए और अपना कबाड़ काम में लाइए! | Join WastePaisa and put your scrap to use! (accepted CTA in Hindi) |

## Research: prices (accessed 4 Nov 2026). Only marketplace asking prices exist, so the batch is illustrative
- **P1, used wooden pallets: IndiaMART city directories (seller asking prices per piece, ex-GST/delivery).**
  - Sources: https://dir.indiamart.com/delhi/used-wooden-pallets.html, https://dir.indiamart.com/chennai/used-wooden-pallets.html and
    https://dir.indiamart.com/mumbai/used-wooden-pallets.html.
  - Delhi: 1200×1400 Euro pallet ₹400, 1200×1000 ₹600, others ₹600–1,250. Chennai: ≈₹400–800 (800×1200). Mumbai: ≈₹450–1,150.
  - Seen through search results on 4 Nov 2026; IndiaMART returned HTTP 429 to direct fetch.
- **P2, wooden pallet scrap / firewood: IndiaMART city directories (asking prices per kg).**
  - Sources: https://dir.indiamart.com/delhi/wooden-scrap.html, https://dir.indiamart.com/bengaluru/wooden-scrap.html and
    https://dir.indiamart.com/ahmedabad/wooden-scrap.html.
  - Delhi: pallet scrap ₹15–25/kg; plain wood scrap ₹5–6/kg (listing dated 31 Oct 2026).
  - Bengaluru: pallet scrap ₹6.50/kg; firewood ₹5/kg. Ahmedabad: hardwood pallet scrap ₹6/kg; firewood ₹3.50/kg (28 Oct 2026).
- **P3, typical pallet weight:** about 20–25 kg for a 1200×800 EUR/EPAL pallet (supplier and reference pages, e.g.
  https://en.wikipedia.org/wiki/EUR-pallet). EPAL's own figure was not found, so this is used only to sanity-check the example.
- **P4, labour benchmark:** Delhi minimum wage for unskilled workers is ₹710/day (₹18,456/month, notification of 15 Apr 2025, as reported
  at https://www.outlookmoney.com/news/good-news-delhi-govt-raises-minimum-wages-for-all-workers). A 2026 revision is unconfirmed.

**Decision:** no single dated transaction price exists, so the video uses an **illustrative batch**. Every rupee figure sits inside
the asking-price ranges above:
- **Purchase:** damaged pallets bought at ₹150 each, about the scrap value of a ~25 kg pallet at ₹6/kg (P2, P3).
- **Repaired pallets:** sold at ₹450 each, the low end of used-pallet asking prices (P1).
- **Leftover wood:** sold at ₹5/kg (P2).
- **Labour:** about 2 worker-days at roughly the Delhi minimum wage (P4).

| Illustrative batch (20 collected pallets) | ₹ |
|---|---|
| Purchase: 20 damaged pallets at ₹150 | −3,000 |
| Grading: 4 good as is, 8 repairable, 8 scrap (dismantled for boards) | n/a |
| Sales: 12 pallets at ₹450 (4 good + 8 repaired) | 5,400 |
| Sales: leftover wood ≈120 kg at ₹5/kg | 600 |
| **Turnover (बिक्री)** | **6,000** |
| Transport (ढुलाई) | −800 |
| Labour (मज़दूरी), ≈2 worker-days | −1,400 |
| Nails (कीलें) | −300 |
| **Profit (मुनाफ़ा)** | **500** (≈8 % of turnover; before rent, tools, unsold stock, GST or other compliance) |

## Research: how pallet repair works, and the rules (primary sources)
- **R1, USDA Forest Service, Forest Products Laboratory, with the National Wooden Pallet & Container Association:** Alanya-Rosenbaum et al.
  (2022), *Life cycle assessment of the wood pallet repair and remanufacturing sector in the United States*, Biofuels Bioprod. Bioref.
  16:1342–1352, https://research.fs.usda.gov/download/treesearch/64847.pdf.
  - "Pallet repair refers to a process of … removing and replacing broken blocks and boards".
  - "inspection and sorting are conducted to determine the next processing steps for the recovered pallets".
  - "a percentage are reused as they are (i.e. without repair)".
  - "If pallets … cannot be repaired or reused, they are typically dismantled and the components are mostly used for repair".
  - Repaired pallets use "new wooden boards or reclaimed boards retrieved from dismantled pallets".
  - 2018 US mass shares: 12 % reused without repair, 31 % dismantled, 53 % repaired, 4 % repurposed (e.g. wood fuel).
  - Nails are a main process input.
- **R2, ISO 18613:2014,** *Pallets for materials handling: Repair of flat wooden pallets*, https://www.iso.org/standard/62562.html (abstract;
  full text paid).
  - It specifies "the maximum defects and damage allowed before a flat wooden pallet shall be repaired" and the minimum repair criteria,
    for pallets "repaired with wood based components".
  - Pool and rental pallets follow their owners' criteria and may need a licence.
- **R3, IPPC, ISPM 15 (2009, rev. 2013), sections 4.3.2–4.3.3,**
  https://www.ippc.int/static/media/files/publications/en/2014/06/30/ispm_15_2009_en_2014-06-16.pdf.
  - Repairing up to about one-third of components needs treated wood, and each added component must be marked.
  - Above that the pallet is "remanufactured": previous marks must be "permanently obliterated", and it "must be re-treated and the mark
    must then be applied anew".
  - So export-marked work belongs to authorised treatment providers. This episode sells for domestic use and never shows DIY treatment.
- **R4, pooled pallets:** CHEP's March 2023 public notice in Indian newspapers says its pallets are marked "Property of CHEP" / "Owned by
  CHEP" and warns against unauthorised use
  (https://www.outlookmoney.com/spotlight/chep-issues-public-notice-on-sustainable-practices-and-cautions-against-unauthorized-use-of-its-equipment-8816).
  Buying or reselling pooled or rental pallets is therefore avoided; this is in the post text, not the video.
- **Practical safety:** nails and splinters. The mascot works in gloves and the post text says so once. No chemicals, burning or heat
  treatment are involved.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| A broken pallet sells by the kilo, a repaired one by the piece (किलो के भाव, पीस के भाव) | P2 (pallet scrap quoted ₹/kg), P1 (used pallets quoted ₹/piece) | No rate shown in the hook |
| Grade collected pallets into good, repairable, scrap (जमा, ठीक, मरम्मत लायक, बेकार) | R1 (inspection and sorting; reuse as-is, repair, dismantle), R2 | n/a |
| Take good boards from scrap pallets and replace broken boards (बेकार, अच्छे तख्ते, टूटे तख्ते, मरम्मत पूरी; nails hammered) | R1 (reclaimed boards from dismantled pallets used for repair), R2 (repair with wood-based components) | Mechanical repair only |
| Example: 20 pallets for ₹3,000; 12 repaired and sold; 8 to firewood (उदाहरण, ₹3,000, 20 पैलेट, 12 बिके, 8 → लकड़ी) | P1, P2, P3 (figures inside asking-price ranges) | Spoken "मान लीजिए" + on-screen "उदाहरण" |
| Turnover ₹6,000 (₹5,400 pallets + ₹600 wood); minus purchase ₹3,000, transport ₹800, labour ₹1,400, nails ₹300 = profit ₹500 | Example arithmetic; P4 (labour benchmark) | "भाव बदलते रहते हैं"; bar drawn to scale |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented app feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed only)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–4.4 s | Mascot holds a broken pallet. X-ray scan (0.45–1.3) shows cracked/split boards in orange and nails; chip किलो के भाव (1.0). New boards drop in (2.55, 2.75); chip पीस के भाव (3.4) |
| Grade | 4.4–8.8 s | A hand-cart rolls in with a jumbled heap (जमा 4.55). Three dashed pile zones (5.8). Pallets fly to ठीक (6.9), मरम्मत लायक (7.32) and बेकार (8.19) |
| Dismantle + repair | 8.8–13.2 s | बेकार and मरम्मत लायक pallets side by side. X-ray marks the good boards cyan (9.3–10.0). Two good boards are pried off and staged (अच्छे तख्ते 10.35). The repairable pallet's broken boards are marked and fall away (टूटे तख्ते 11.6). Reclaimed boards drop in and the hammer hits three nails (12.3–13.1); stamp मरम्मत पूरी |
| Example | 13.2–17.55 s | उदाहरण tag; ticket खरीद ₹3,000 (14.55); 20 mini pallets (20 पैलेट 14.0). 12 turn fresh with outlines (15.9); stamp 12 बिके (16.93); 8 fade into a firewood pile (8 → लकड़ी) |
| Profit | 17.55–23.85 s | Tag "उदाहरण · भाव बदलते रहते हैं"; chip ₹5,400 (12 पैलेट) + ₹600 (लकड़ी). To-scale bar बिक्री ₹6,000 (18.75). Costs cover it: खरीद −₹3,000 (19.89), ढुलाई −₹800 (20.52), मज़दूरी −₹1,400 (21.09), कीलें −₹300 (21.87). Warm sliver मुनाफ़ा ₹500 (22.8). Mascot looks stern through the costs and hops at profit |
| Recap | 23.85–25.9 s | Silent cards: ढेर बनाइए, तख्ते बदलिए, पूरा हिसाब (warm) |
| CTA | 25.9–30 s | Accepted end card: icon, WastePaisa wordmark, अपना कबाड़ काम में लाइए, mascot waves. Voice CTA 26.2–29.37 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.1 LUFS**, true peak **−1.5 dBFS**, LRA 3.9 LU.
- **Captions** (900 frames logged): ink **y 347–513**, **x 220–860**, at most 2 lines, no overlapping hand-offs, nothing at y < 300.
- **Glyphs:** Devanagari glyphs, conjuncts, nukta and ₹ render in Baloo 2 with no missing-glyph boxes. The "✓" in a stamp was replaced
  by text (मरम्मत पूरी), because Baloo 2 lacks that glyph.
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.07 s of plan for every line. Caption groups switch at
  ASR-measured word onsets.
- **Intelligibility** (ASR only; full detail in `qa/asr.txt`):
  - *Vosk free decoding:* L1 1.00, L2 0.75, L3 1.00, L4 0.92, L5 1.00, L6 0.80 (mean 0.912).
  - *Remaining misses:* frequent-word or near-homophone substitutions (पैलेट→पहले, तीन→टीम, बनाइए→बनाएं, जुड़िए→"जुड़ी है", लाइए→लाई).
    Constrained decoding confirms the intended words, and Whisper hears तीन ढेर.
- **One concrete defect fixed:** the nail-hit and board-knock SFX masked L3's last word (दीजिए → "दी थी"). They were lowered and the mix
  rebuilt; the visuals were unchanged.
- **Visual:** stills of every scene, then 35 transition and representative frames decoded from the export, plus a full sheet every 1.25 s.
  Fixed before the full render:
  - The collected heap floated, so it was put on a hand-cart.
  - The "20 पैलेट" chip crossed x 90 and the grid, so it was moved.
  - The hammer was enlarged.
- **Limits:**
  - ASR-only intelligibility, no human listening.
  - Synthetic Hindi voice.
  - Prices are illustrative marketplace asking ranges, not transactions.
  - Pallet weight is a typical figure.
  - Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its Hindi model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
