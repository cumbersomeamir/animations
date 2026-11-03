# 16 — Production 30 s, Hindi batch #03 (2026-11-03): "सौ ग्राम संतरे में असल में क्या है?" (orange)

Output: `videos/nutriai/production/30s/2026-11-03-hindi-03/nutriai-30s-hindi03-01.mp4`. QA + hash: `production/30s/2026-11-03-hindi-03/QA.md`. Sources: `.../SOURCES.md`. Publishing copy (Hindi): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks and topic decision
- No generation was active (no render/ffmpeg/TTS process; branch equal to origin at `e550986`, the completed papaya episode).
- **Proposed topic "guava per 100 g edible raw fruit: vitamin C, fibre, energy" was already covered** by production #02 (`13-production-30s-02.md`, 2026-11-02, guava 68 kcal / 5.4 g fibre / 228 mg vitamin C). Per the brief ("if already covered, choose another equally concrete topic within the exact genre and record why"), this episode uses **orange (संतरा), 100 g raw edible segments**: same genre, same nutrient set (energy, fibre, vitamin C) and one everyday portion takeaway. Not covered before (episodes: mango, guava, pomegranate, papaya; oats cancelled).

## Brief (user, 3 November 2026; latest correction overrides language)
One new 30.000 s CalMeter video. **All narration and captions in natural Hindi (Devanagari)** with a genuinely Hindi-capable local voice (not Hindi fed into the English-only af_bella/am_puck blend); check pronunciation, numbers, intelligibility and speech/caption alignment; Devanagari glyphs with a compatible font. Keep the accepted engraving style, renderer, caption treatment and quiet voice-forward audio. CTA names CalMeter.

## Language, voice and font decisions
- **Voice:** Kokoro-82M ONNX (cached `kokoro-v1.0.onnx` / `voices-v1.0.bin`) with its own **Hindi-trained voice `hf_beta`**, `lang='hi'` (espeak-ng Hindi G2P), speed 1.0. Candidates tested on the number-heavy line with Hindi ASR: hf_alpha, hf_beta, hm_omega, hm_psi and a 0.7 hf_alpha + 0.3 hm_omega blend all recovered every number; hf_beta was chosen as the clearest-reading and fastest female voice (the accepted English performer was a female-led blend). No celebrity or cloned voice; no paid API.
- **Numbers are written as Hindi words in the TTS text** (सैंतालीस, दो दशमलव चार, तिरपन, सत्तासी, एक सौ इकतीस, सत्तर); captions use digits. Brand spoken as "कैलमीटर", shown as "CalMeter".
- **Font:** Noto Sans Devanagari Black / Bold / SemiBold (OFL 1.1, notofonts, vendored in `source/fonts/` with `OFL.txt`); Latin brand and "USDA FoodData Central" fall back to the accepted Inter faces. Shaping verified (conjuncts क्ष त्र स्त्री द्व ष्ण, matras, anusvara, nukta फ़) — no missing glyphs. Devanagari is cut grapheme by grapheme (`Intl.Segmenter`), and QA bounds are measured from ink pixels because Devanagari vowel signs rise above the reported font ascent.
- **Intelligibility:** checked with faster-whisper **medium** (multilingual, language forced to Hindi) on every take and on the final mix. A human listening test was not possible in this environment.

## Sheet feedback implemented (specific adjustments only)
| Feedback | This episode |
|---|---|
| Retain exact approved engraving on ivory `#F4EEDC` / ink `#16201A`, vivid washes, large cutaway | Renderer is `production/30s/2026-11-03-round-02/source/render.mjs` (papaya) with the food geometry swapped (orange) and Hindi lettering; burin, hatch families, washes, roundels, bar, balance, camera, caption layout and CTA seal unchanged |
| No repetitive generic disclaimers | None |
| Brief per-100 g edible basis | One line: "प्रति 100 ग्राम खाने योग्य फाँकें · USDA FoodData Central FDC 169097" |
| Required qualification in the relevant sentence only | "छिला हुआ" (peeled) added inside the portion sentence: USDA's 131 g is the edible portion of one fruit |
| Clear final spoken + visible CTA | Spoken "कैलमीटर के साथ अपने खाने और पोषण को ट्रैक करें।" 26.00–29.58 s; caption "CalMeter के साथ अपने खाने / और पोषण को ट्रैक करें"; engraved CalMeter seal with the approved icon inside the plate |
| No top / side / bottom overlap | Caption ink y 361–501 (inside the allowed 340–520), x 175–909; plate text left of x 950 and above y 1540; nothing above y 300 |

## Final script (69 Hindi words; Kokoro hf_beta)
| Take | Start | Hindi (spoken) | Meaning |
|---|---|---|---|
| T0 | 0.25 s | सौ ग्राम संतरे में असल में क्या है? | What is really in 100 g of orange? |
| T1 | 3.05 s | छिलका और बीज हटाकर: सैंतालीस कैलोरी, दो दशमलव चार ग्राम फ़ाइबर, तिरपन मिलीग्राम विटामिन सी। | Peel and seeds removed: 47 kcal, 2.4 g fibre, 53 mg vitamin C. |
| T2 | 10.60 s | सत्तासी प्रतिशत पानी है, और पानी में कैलोरी नहीं होती। | It is 87 % water, and water has no calories. |
| T3 | 14.93 s | फ़ाइबर पाचन में मदद करता है, विटामिन सी घाव भरने में। | Fibre aids digestion; vitamin C helps wounds heal. |
| T4 | 19.30 s | एक मध्यम छिला हुआ संतरा, करीब एक सौ इकतीस ग्राम: लगभग सत्तर मिलीग्राम विटामिन सी। | One medium peeled orange, about 131 g: about 70 mg vitamin C. |
| T5 | 26.00 s | कैलमीटर के साथ अपने खाने और पोषण को ट्रैक करें। | Track your food and nutrition with CalMeter. |

Draft → final: a 71-word draft would have run about 32–35 s with the Hindi voice, so it was tightened to 67 words; then "छिला हुआ" was added to T4 for accuracy (69 words, 26.4 s of speech). Hindi ASR per take: numbers and words recovered; differences are spelling-level (सौ→सो, छिलका→चिल्का (छ slightly under-aspirated), मदद→मदत, मध्यम→मद्यम, पोषण→पोशन).

## Source-to-claim mapping (retrieved 2026-11-03)
| Claim | Value | Source |
|---|---|---|
| Basis: 100 g raw edible segments (peel and seeds removed) | per 100 g edible portion | USDA FoodData Central SR Legacy **FDC 169097** "Oranges, raw, all commercial varieties" (NDB 09200); SR28 `FOOD_DES` refuse **"Peel and seeds", 27 %**, *Citrus sinensis* |
| 47 calories | 47 kcal (197 kJ) | FDC 169097 Energy |
| 2.4 g fibre | 2.4 g | FDC 169097 Fiber, total dietary |
| 53 mg vitamin C | 53.2 mg (n = 145) | FDC 169097 Vitamin C |
| 87 % water; water has no calories | 86.8 g / 100 g (n = 88) | FDC 169097 Water |
| the other 13 g is mostly sugars + fibre | sugars 9.35 g + fibre 2.4 g of 13.2 g | FDC 169097 |
| Fibre aids digestion | n/a | MedlinePlus (NIH NLM) "Dietary fiber" https://medlineplus.gov/ency/article/002470.htm: "Fiber aids digestion and helps prevent constipation." |
| Vitamin C helps wounds heal | n/a | MedlinePlus (NIH NLM) "Vitamin C" https://medlineplus.gov/ency/article/002404.htm: vitamin C is used to "Heal wounds and form scar tissue"; the same page lists "Citrus fruits and juices, such as orange" among the highest sources |
| 1 medium peeled orange ≈ 131 g ≈ 70 mg vitamin C | 131 g; 131 × 53.2 / 100 = 69.7 mg | FDC 169097 portion "fruit (2-5/8" dia)" = 131 g (edible) |

## Storyboard (30 fps; `production/30s/2026-11-03-hindi-03/source/timeline.json`)
| Beat | Time | Plate action | Caption (Hindi) | Sound |
|---|---|---|---|---|
| Hook | 0–2.6 s | Loupe pull-out while the burin cuts a whole orange (contours, cross-contours, crossing family, pitted-peel stipple, stem button, leaf); gold-to-orange peel wash; red knife line round the equator | 100 ग्राम संतरे में / असल में क्या है? | burin scratches, slice |
| Open | 2.1–3.3 s | Burnisher sweeps the fruit away; a large equatorial section is re-cut: orange rind with oil-gland ticks, pale pith, 11 segments of packed juice vesicles, white membranes, core, seeds | छिलका और बीज / हटाकर: | page, juice |
| Peel and seeds | 3.1–4.7 s | The peel lifts away and fades ("छिलका · नहीं खाते"); seeds fly into a dish ("बीज · नहीं खाते"); "फाँकें · यही 100 ग्राम" | (same) | tear, patter |
| Facts | 4.7–10.2 s | Roundels scribed from the segments on "47", "2.4", "53": ऊर्जा 47 कैलोरी / फ़ाइबर 2.4 ग्राम / विटामिन सी 53 मि.ग्रा.; basis line cut | 47 कैलोरी · 2.4 ग्राम फ़ाइबर / 53 मि.ग्रा. विटामिन सी | scribe ticks |
| Mechanism: water | 10.4–14.7 s | Roundels lift off; blue water lines flow through the segments; bar "100 ग्राम फाँकें": 87 ग्राम पानी (0 कैलोरी) vs 13 ग्राम (47 कैलोरी, मुख्यतः शर्करा + फ़ाइबर) | 87% पानी, / और पानी में कैलोरी नहीं | drip, page |
| Functions | 14.8–18.9 s | Fibre roundel: strands flow (पाचन). Vitamin C roundel: a cut in the skin closes as orange strands bridge it (घाव भरना) | फ़ाइबर पाचन में मददगार, / विटामिन सी घाव भरने में | page |
| Takeaway | 19.1–25.6 s | Balance cut: a peeled orange (segment ball) lands, the 131 g weight levels the beam with a damped settle; dotted leader from the segments; "≈ 70 मि.ग्रा. विटामिन सी" and "131 ग्रा. × 53.2 / 100 ग्रा." cut | 1 मध्यम छिला संतरा ≈ 131 ग्राम / ≈ 70 मि.ग्रा. विटामिन सी | thud, clink |
| CTA | 25.6–30 s | Balance burnished away; engraved seal with the approved icon, "CalMeter" cut, leaf-green rule, milled edge engraved | CalMeter के साथ अपने खाने / और पोषण को ट्रैक करें | pencil, bed fades |

## Retained style (unchanged; reference the code, not a library)
Same recipe as `14-production-30s-pomegranate.md` / `15-production-30s-round02-papaya.md`. Orange washes: peel `#FFC768` → `#F5921E` → `#C65A12`, rind band `#F08A1A`, pith `#F7EBC8`, segment ground `#F6A23A`, vesicles `#EE7A10` / `#F9A033`, membranes `#FBF0D2`, seeds `#F4E7BE`, water `#8CC0E6`. Captions: Noto Sans Devanagari Black 56 px, baselines 412 / 488 (line 1 ink, line 2 leaf-dark) — the only typographic change, made because Devanagari needs room for vowel signs above and below. Audio: the papaya / pomegranate `mix.py` unchanged.
