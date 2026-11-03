# 16 · hindi-03 episode 01: "पुराने एल्युमिनियम से छोटा कारोबार" (a small aluminium scrap business), Hindi

Round `2026-11-03-hindi-03` (user-approved, 3 Nov 2026). **Language:** all narration and captions are in natural Hindi
(Devanagari), as the latest user correction requires; it overrides the brief's "English" wording. Renderer and style: the
accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
`production/30s/2026-11-03-round-02/src/scene.html`. The point-cloud shop, camera grammar, mascot, caption panel, recap
layout and CTA layout are unchanged; only the props, scene functions and Hindi text are new. A copy of this file is in
the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-03-hindi-03/wastepaisa-30s-hindi03-01.mp4`
SHA-256 `95e28ec88b4c94e0fee5e331ec3a37d8e1a0b5b2e2e6022edc1dddd8f13e22ec` · 9,874,671 bytes.

## Topic check
- **History searched:** paper cup (30s-01), aluminium can-to-can (30s-02), old cable (feedback-01) and brass (round02-01).
  None covered the business side (buy → sort → clean → aggregate → sell to a recycler, turnover vs profit), so this is a
  new topic. It reuses aluminium as the material but not the can-to-can mechanism.
- **Start state:** no generation was active and the tree was clean at commit 077fdd1. Old MP4s were not touched.

## Feedback and corrections applied
- **Emphasis:** scrap value and an earning opportunity, framed as a business. Value comes from the buy/sell spread on
  clean, sorted, bulk material. The costs that reduce profit are named. Turnover (बिक्री) and profit (मुनाफ़ा) are
  explicitly separated. There is no windfall, guaranteed return or income promise, and every rupee figure is a labelled
  example.
- **Clean script:** no do-not-burn line, disposal instructions or repeated safety warnings. The only hazard-relevant step,
  manual sorting, is shown being done with the mascot's gloves; one practical line about gloves is in the post text only.
  Nothing teaches melting, burning or chemical extraction.
- **Kept exactly:** accepted style, mascot, palette, caption panel (62 px Baloo 2 ExtraBold, cream with orange
  highlights, dark panel, centre y 430), pacing, recap-card layout, CTA layout and icon. Context 11 already holds the
  editorial emphasis update (round 02); only a short Hindi-language note was added there.
- **Hindi adaptations (necessary, not redesign):**
  - Baloo 2 **Devanagari** faces (same family, OFL, @fontsource 5.3.0, weights 800 and 700) added with their unicode range.
  - Caption line spacing 70 → **84 px** so matras on one line never touch the next.
  - The CTA "Join WastePaisa and put your scrap to use." became वेस्टपैसा से जुड़िए और अपना कबाड़ काम में लाइए!
  - End-card action line: अपना कबाड़ काम में लाइए. The official "WastePaisa" wordmark and icon are unchanged.

## Hindi voice (local, legitimate, no paid API, no cloning)
- **Engine:** Kokoro-82M v1.0 ONNX via kokoro-onnx 0.6.1 (Apache-2.0 model, MIT wrapper), the same engine as the
  accepted voice. It uses its **native Hindi voices**, not the English-only af_bella/am_puck.
- **Blend:** **hf_beta 0.7 + hm_omega 0.3**, mirroring the accepted 0.7/0.3 female-led blend. Speed 1.15, `lang='hi'`.
  Grapheme-to-phoneme conversion is espeak-ng Hindi via espeakng-loader. Phonemes for every line are stored in
  `audio/narration/timing.json`.
- **How it was chosen:** all four Hindi voices (hf_alpha, hf_beta, hm_omega, hm_psi) were synthesised on a test sentence
  with rupee amounts and transcribed by a Hindi ASR (Vosk `vosk-model-small-hi-0.22`). hf_beta and hm_omega were
  word-perfect.
- **Pronunciation fixes found by ASR:**
  - "रीसाइक्लर" was misheard in every spelling (साइकिल / ईसाई कलर), so the spoken line avoids the word; the recycler
    is named on screen instead.
  - The brand is sent to the synthesiser as "वेस्ट पैसा" (with a space), because the joined spelling inserted a schwa
    ("vesta-paisa"). The caption keeps वेस्टपैसा.
  - The CTA ends with "!" because the final imperative "लाइए" was clipped with "।". With "!", constrained decoding
    confidence for लाइए rose from 0.79 to 0.93.
- **Numbers and currency:** numbers are spoken as Hindi words (सौ किलो, दस हज़ार, नब्बे किलो, साढ़े ग्यारह हज़ार,
  पाँच सौ). Captions show them as digits with ₹ (₹10,000, ₹11,500, ₹500), which renders in Baloo 2 Devanagari
  (U+20B9). The video contains no dates.

## Final script (Hindi narration = captions) · 73 words, 26.6 s of speech
| Line | Time (s) | Hindi | English gloss |
|---|---|---|---|
| L1 | 0.30–3.38 | पुराना एल्युमिनियम छोटा कारोबार बन सकता है। | Old aluminium can become a small business. |
| L2 | 3.68–7.49 | बर्तन-फ्रेम खरीदिए, लोहा, प्लास्टिक और गंदगी अलग कीजिए। | Buy pots and frames; separate the iron, plastic and dirt. |
| L3 | 7.80–11.98 | साफ़ थोक माल का अक्सर बेहतर भाव मिलता है; यही फ़र्क कमाई है। | Clean bulk material usually gets a better rate; that difference is the earning. |
| L4 | 12.25–17.27 | मान लीजिए सौ किलो दस हज़ार में लिया, साफ़ नब्बे किलो साढ़े ग्यारह हज़ार में बिका। | Suppose you bought 100 kg for ₹10,000, and 90 kg of clean metal sold for ₹11,500. |
| L5 | 17.60–21.34 | ये बिक्री है, मुनाफ़ा नहीं; ढुलाई-मज़दूरी के बाद बचे पाँच सौ। | That is turnover, not profit; after transport and labour, ₹500 is left. |
| L6 | 21.68–25.37 | पक्का बिल, सत्यापित तराज़ू; बिक्री बढ़े तो जीएसटी पंजीकरण। | Proper bills, a verified scale; GST registration as sales grow. |
| L7 | 26.20–29.37 | वेस्टपैसा से जुड़िए और अपना कबाड़ काम में लाइए! | Join WastePaisa and put your scrap to use! (accepted CTA, in Hindi) |

Qualifiers sit inside their sentences:
- "अक्सर" (usually) qualifies the better-rate claim.
- "मान लीजिए" (suppose) marks the numbers as an example, and the screen tags them **उदाहरण** (example) and
  **भाव रोज़ बदलते हैं** (rates change daily).
- "बिक्री बढ़े तो" (as sales grow) introduces GST registration without implying it is needed from day one.

## Research: prices (accessed 3 Nov 2026). Reliable like-for-like buy and sell rates were NOT available
Indian scrap rates are published mostly by aggregators and dealers, with unclear dates and definitions, and they disagree
by more than 2×:
- **P1:** Kabadiwala Online, *Scrap Price List Today in Delhi NCR*, https://kabadiwalaonline.in/price-list/. Aluminium
  scrap (windows, sections, utensils, mixed) **₹95–130/kg**. "All prices are indicative. Scrap rates change daily…",
  "Prices vary for bulk". Mixed, oily or painted aluminium may get 5–10 % less. No update date is shown.
- **P2:** ScrapC, *Delhi Scrap Price Today*, https://scrapc.com/news/delhi-scrap-price-today/. Table time-stamped
  **3 Nov 2026, 05:52**: aluminium bartan buy **₹279** / sell **₹302**, purja ₹239 / ₹267, sheet ₹316 / ₹328 (₹/kg).
  Columns are not defined; these are dealer-level figures.
- **P3:** National Recycling, *Aluminium Scrap Recycling India: Grades & Prices* (updated 19 Apr 2026),
  https://www.nationalrecycling.in/blog/aluminum-scrap-recycling-india/:
  - Indicative ranges: extruded ₹130–160, cast ₹105–130, UBC ₹95–120, mixed/contaminated **₹75–95** per kg.
  - "Buyers will apply a contamination discount, often 15–25% off prevailing clean-grade prices."
  - Sorting cast and wrought separately earns 8–12 % more per kg.
  - Iron fasteners and rubber inserts are listed as contaminants.

**Decision:** the video uses **illustrative arithmetic**, spoken as मान लीजिए and tagged उदाहरण, so it is never presented
as today's rate. The example buys at ₹100/kg (inside P1's household range), loses 10 kg of iron, plastic and dirt in
sorting, and sells clean metal at ≈₹128/kg (inside P3's clean cast range and below its extruded range). The gross spread
(₹1,500 on ₹11,500) sits within P3's 15–25 % contamination discount, and the net margin is about 4 % of turnover. The
video shows no ₹10 input and no lakh-scale revenue claim. The one lakh figure on screen is the sourced GST threshold (G1).

| Illustrative ledger (100 kg lot) | ₹ |
|---|---|
| Purchase, 100 kg mixed aluminium at ₹100/kg | −10,000 |
| Sorting loss (iron, plastic, dirt) | 10 kg, not sold |
| **Turnover (बिक्री):** 90 kg clean at ≈₹127.8/kg | **11,500** |
| Transport (ढुलाई) | −500 |
| Labour (मज़दूरी) | −500 |
| **Profit (मुनाफ़ा)** | **500** (≈4.3 % of turnover; before rent, working capital, rejects or tax) |

## Research: legal and practical requirements (accessed 3 Nov 2026)
- **G1, GST registration threshold:** CBIC Notification No. 10/2019-Central Tax, 7 Mar 2019, effective 1 Apr 2019,
  https://www.gstcouncil.gov.in/sites/default/files/2024-05/notfctn-10-central-tax-english-2019.pdf.
  - Suppliers exclusively of goods are exempt from registration up to **₹40 lakh aggregate turnover** in a financial year.
    Lower limits apply in some states (₹20 lakh or ₹10 lakh; commentary at https://taxguru.in/?p=676650 and
    https://gstzen.in/a/central-tax-notification-102019-to-give-exemption-from-registration-for-any-person-engaged-in-exclusive-supply-of-goods-and-whose-aggregate-turnover-in-the-financial-year-does-not-exceed-rs-40-lakhs.html).
  - Inter-state taxable supply requires registration regardless of turnover (CGST Act s.24).
  - On screen: "सीमा: ज़्यादातर राज्यों में ₹40 लाख/साल".
- **G2, metal scrap and reverse charge:**
  - Notification 06/2024-Central Tax (Rate), 8 Oct 2024, effective 10 Oct 2024: metal scrap (Chapters 72–81) supplied by
    an unregistered person to a registered person is taxed under reverse charge, so the registered buyer pays
    (https://www.taxscan.in/cbic-notifies-introduction-of-gst-under-rcm-on-supply-of-metal-scrap-by-unregistered-to-registered-person-read-notification/444881).
  - Notification 24/2024-Central Tax: the reverse-charge-only registration exemption "shall not be available to metal scrap
    dealers", so they must register on crossing the threshold
    (https://taxmann.com/post/blog/metal-scrap-dealers-liable-to-obtain-registration-on-crossing-threshold-limit-despite-supply-notified-under-rcm-notification).
- **G3, very recent change (secondary sources, official PDFs not opened):** Notifications 04, 06 and 07/2026-Central Tax
  (Rate / Central Tax), dated 27 Oct 2026 and effective **1 Nov 2026**
  (https://www.corplawupdates.in/updates/gst-scrap-trade-rcm-registration-tds-changes, https://calcguru.in/?p=9929):
  - They extend reverse charge to plastic, tyre, e-waste and used cooking oil.
  - They withdraw the reverse-charge-only registration exemption for these categories, including metal scrap.
  - They apply GST TDS (2 %, contracts above ₹2.5 lakh) to registered-to-registered supplies, including metal scrap.
  - Both sources say the s.22 turnover thresholds are unchanged. This is why the video says "बिक्री बढ़े तो" and tells
    no one they are exempt.
- **L1, verified weighing instrument:** Legal Metrology Act, 2009, https://www.indiacode.nic.in/bitstream/123456789/2102/1/2009l.pdf.
  - Weights and weighing instruments used in transactions must be **verified and stamped** (s.24).
  - Using unverified instruments is penalised (s.33); amounts were revised by the Jan Vishwas Act 2023, so no penalty
    figure is quoted.
  - On screen: सत्यापित तराज़ू.
- **Practical:** proper bills/records support the buyer's reverse-charge and TDS compliance (G2, G3), hence पक्का बिल.
  Gloves for sharp offcuts are shown, not lectured. No income-tax TCS claim is made; it was not verified for the new
  Income-tax Act and is left to a tax adviser.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Old aluminium can become a small business (एल्युमिनियम, छोटा कारोबार) | P1–P3 (aluminium scrap is bought and sold at quoted rates) | "बन सकता है" (can), no income claim |
| Buy pots and frames; separate iron, plastic, dirt (बर्तन, फ्रेम, लोहा, प्लास्टिक, गंदगी, साफ़ एल्युमिनियम) | P1 (windows, sections, utensils), P3 (iron fasteners, rubber inserts as contaminants) | Mechanical sorting only |
| Clean bulk material usually gets a better rate; that gap is the earning (खरीद भाव, बेहतर भाव, फ़र्क = कमाई, रीसाइक्लर) | P3 (15–25 % contamination discount; +8–12 % for sorted lots), P1 (mixed 5–10 % less; bulk priced differently), P2 (sell > buy in every row) | "अक्सर" (usually); bars carry no rates |
| Example: 100 kg for ₹10,000; 90 kg clean for ₹11,500 (उदाहरण, 100 किलो, −10 किलो, 90 किलो, ₹10,000, ₹11,500) | P1, P3 (rates inside published indicative ranges) | Spoken "मान लीजिए" + on-screen उदाहरण |
| That is turnover, not profit; after transport and labour ₹500 is left (बिक्री ₹11,500, खरीद −₹10,000, ढुलाई −₹500, मज़दूरी −₹500, मुनाफ़ा ₹500) | Arithmetic of the example | "उदाहरण · भाव रोज़ बदलते हैं"; the bar is drawn to scale, so profit is a visible sliver |
| Proper bill, verified scale; GST registration as sales grow (पक्का बिल, सत्यापित तराज़ू, जीएसटी पंजीकरण, सीमा: ज़्यादातर राज्यों में ₹40 लाख/साल) | G1, G2, G3, L1 | "ज़्यादातर राज्यों में" (in most states); no exemption promised |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented app capability or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed only)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.5 s | Mascot holds a grimy old pot. The X-ray scan (0.55–1.6) reveals clean aluminium, with chip एल्युमिनियम (0.8). Chip छोटा कारोबार (2.0) |
| Setup | 3.5–7.65 s | Sorting tray: pot (बर्तन 3.7) and window-frame offcut (फ्रेम 4.1). Steel screws fly to लोहा (5.1), gasket to प्लास्टिक (5.6), dirt to गंदगी (6.25) and the pot turns clean. Chip साफ़ एल्युमिनियम (6.85) |
| Mechanism | 7.65–12.1 s | Clean slabs stack into a strapped bale on a scale (साफ़ थोक माल 8.1), then go by arrow to the recycler shed (रीसाइक्लर). Bars: खरीद भाव (9.35) vs बेहतर भाव (9.7). The gap is highlighted with फ़र्क = कमाई (11.1) |
| Example | 12.1–17.45 s | उदाहरण tag (12.25). Sack 100 किलो (12.9) with ticket खरीद ₹10,000 (13.35). Arrow with waste falling out, −10 किलो (14.35). Bale on scale 90 किलो (14.9) with ticket बिक्री ₹11,500 (15.4). बिका stamp (16.9) |
| Profit | 17.45–21.5 s | To-scale turnover bar बिक्री ₹11,500 (17.75). Purchase covers it (खरीद −₹10,000, 18.4), then ढुलाई −₹500 (19.25) and मज़दूरी −₹500 (19.64). The remaining warm sliver is मुनाफ़ा ₹500 (20.6). Mascot looks stern during costs and hops at profit |
| Takeaway | 21.5–25.9 s | Recap cards पक्का बिल (21.68), सत्यापित तराज़ू (22.22), जीएसटी पंजीकरण (24.29, warm), plus threshold chip (24.8) |
| CTA | 25.9–30 s | Accepted end card: icon, WastePaisa wordmark, अपना कबाड़ काम में लाइए, mascot waves. Voice CTA 26.2–29.37 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 2.2 LU.
- **Captions** (all 900 frames logged in `qa/caption-bounds.json`): ink **y 348–512**, **x 212–868**, at most 2 lines,
  hard switches with no overlap, nothing at y < 300.
- **Glyphs:** Devanagari renders in Baloo 2 with no missing-glyph boxes. Conjuncts (प्लास्टिक, ज़्यादातर, सत्यापित),
  nukta (फ़र्क, मुनाफ़ा, मज़दूरी) and ₹ were checked in stills and in frames decoded from the export. The page refuses
  to render if the Devanagari face does not load.
- **Narration timing:** Vosk Hindi on the export. Heard onsets and offsets are within ±0.06 s of plan, except where a
  first word went unrecognised (below).
- **Intelligibility** (full detail in `qa/asr.txt`):
  - *Vosk free decoding:* word accuracy L1 1.00, L2 1.00, L3 0.92, L4 1.00, L5 0.92, L6 0.89, L7 0.80 (mean 0.933).
  - *L3/L5 first words:* "साफ़" and "ये" are recovered with a slightly shifted window, so the audio contains them.
  - *L6/L7 endings:* free decoding writes near-homophones (बढ़ी for बढ़े, "जुड़ी है"/"लाई" for जुड़िए/लाइए).
    Constrained decoding chooses the intended forms (confidence 0.94–1.0).
  - *Second engine:* faster-whisper small yields every content word in phonetic spelling.
  - Before mixing, the narration-only takes were word-perfect in Vosk (spelling variants only).
- **Mix fix:** the first Vosk pass on the export lost the first words of L3 and L5. The slab-drop, bar-whoosh,
  example-tag and bill-card SFX that coincide with line onsets were lowered, and the mix was rebuilt (visuals unchanged).
- **Visual:** full sheet (every 1.25 s) and 31 transition and representative frames decoded from the export.
  Fixed before final:
  - The hook chip covered the pot.
  - The sorting tray's bottom edge sat at y ≈ 1470, past the 1460 limit.
  - Sorting props were too small.
  - The buy-rate bar touched the sack.
- **Remaining limits:**
  - No human listening test (cloud session), so intelligibility is from two ASR engines.
  - Kokoro's Hindi is clear but synthetic, and ड़/ढ़ are approximated by espeak as a flapped r.
  - Brief double exposure during 0.3 s dissolves (accepted pattern).
  - Prices are illustrative because no reliable like-for-like dated buy/sell rates exist.
  - The 1 Nov 2026 GST changes come from secondary sources.
  - The local Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat
    attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng (via espeakng-loader) is GPL-3.0 and was used as a tool,
  not shipped.
- Vosk and its Hindi model are Apache-2.0. faster-whisper is MIT, with Whisper weights under MIT.
- Baloo 2 (Latin + Devanagari) is OFL. The app icon is from the approved assets.
- Music and SFX instruments are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the session scratchpad and are not committed.
