# 18 — Production 30 s, batch 2026-11-05-feedback-05: "सौ ग्राम पनीर में कितना प्रोटीन है?" (plain paneer)

Output: `videos/nutriai/production/30s/2026-11-05-feedback-05/nutriai-30s-feedback05-01.mp4`. QA + hash: `production/30s/2026-11-05-feedback-05/QA.md`. Sources: `.../SOURCES.md`. Publishing caption (Hindi, matches the final transcript): `.../publishing-caption.txt`. Format: `11-production-format.md` (unchanged apart from the episode list line).

## Pre-checks
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `a728357` (Hindi #04 chickpeas) before edits; account per session context (info@tensorblue.com). No render/ffmpeg/TTS process was running; nothing to finish or checkpoint.
- Topic history: paneer had not been covered (episodes: mango, guava, pomegranate, papaya, orange, chickpeas; oats cancelled). The requested topic was used.

## Performance snapshot supplied with the brief (recorded as given; not causal)
14/14 reels show plays; observed plays 4,755; observed likes 110 (13/14 counts visible); median plays 139.5. Post ages differ, so these totals do not show what caused performance. This episode is treated as a **controlled topic/opening test**: the topic (a protein food) and the opening (a knife cuts the block within ~1.3 s under a protein question) change; the approved style, renderer, voice, audio, caption layout, pacing and CTA stay fixed.

## Reference food and the variation decision
- **Reference food (named):** Matvaretabellen (Norwegian Food Composition Table, Norwegian Food Safety Authority) **"Cheese, paneer", Food ID 01.301**, per 100 g: energy 325 kcal (1,348 kJ), protein 26 g, fat 24.5 g (saturated 15.4 g), carbohydrate 0 g, water 50 g; energy from fat 67 %, from protein 33 %. Values are sourced in that table to code **450d = Food Databanks National Capability (2021) extended dataset based on PHE's McCance and Widdowson's Composition of Foods Integrated Dataset (UK CoFID)**.
- **Why not USDA:** USDA SR Legacy and Foundation have no paneer. USDA FNDDS 2021–2023 "Cheese, paneer" (FDC 2705740, food code 14110050) is recipe-derived (whole milk + vinegar) and lists 22.5 g carbohydrate, implausible for drained paneer. It is archived (`research/fdc-2705740-fndds-paneer-NOT-USED.json`) but not shown.
- **Variation without invented brand values:** the video says the values come from "एक मानक तालिका" (one standard table), shows the 2/3-from-fat split computed from the reference values (24.5 g × 9 ≈ 220 kcal; 26 g × 4 ≈ 104 kcal), states the general energy factor (about 9 kcal per gram of fat), and shows a qualitative higher-fat vs lower-fat comparison with no numbers. The takeaway is to read the per-100 g label on your own pack and weigh the portion.
- **Familiar portion:** "200 ग्राम पैक का आधा = 100 ग्राम" (half of a 200 g pack = 100 g; arithmetic, no bowl is equated with 100 g).

## Final script (69 Hindi words by token count; Kokoro hf_beta, lang hi, speed 1.0)
| Take | Start | Hindi (spoken) | Meaning |
|---|---|---|---|
| T0 | 0.30 s | सौ ग्राम पनीर में कितना प्रोटीन है? | How much protein is in 100 g of paneer? |
| T1 | 3.20 s | एक मानक तालिका में: छब्बीस ग्राम प्रोटीन, साढ़े चौबीस ग्राम फ़ैट, तीन सौ पच्चीस कैलोरी। | In one standard table: 26 g protein, 24.5 g fat, 325 kcal. |
| T2 | 10.20 s | इसकी दो-तिहाई कैलोरी फ़ैट से आती है। | Two-thirds of its calories come from fat. |
| T3 | 13.40 s | हर ग्राम फ़ैट लगभग नौ कैलोरी देता है, इसलिए कम फ़ैट वाले पनीर में कैलोरी कम होती है। | Each gram of fat gives about 9 kcal, so lower-fat paneer has fewer calories. |
| T4 | 20.50 s | पैक पर प्रति सौ ग्राम का लेबल पढ़ें, और अपना हिस्सा तौलें। | Read the per-100 g label on the pack, and weigh your portion. |
| T5 | 26.05 s | कैलमीटर के साथ अपने खाने और पोषण को ट्रैक करें। | Track your food and nutrition with CalMeter. |

Voice note: the approved Meshline/Recall blend (af_bella 0.7 + am_puck 0.3) is English-only, so the applicable approved Hindi voice (Kokoro's own `hf_beta`, used in Hindi #03/#04) is kept; no celebrity voice. Hindi ASR timing pass (faster-whisper medium, language hi): all numbers recovered; spelling-level variants only.

## Source-to-claim mapping (retrieved 2026-11-05)
| Claim | Value | Source |
|---|---|---|
| 26 g protein, 24.5 g fat, 325 kcal per 100 g | as listed | Matvaretabellen "Cheese, paneer" 01.301 (UK CoFID via FDNC 2021, code 450d) |
| two-thirds of the calories come from fat | 67 E% fat | same record (energy distribution) and 24.5 × 9 / 325 |
| fat ≈ 220 kcal, protein ≈ 104 kcal | 24.5 × 9 = 220.5; 26 × 4 = 104 | Atwater general factors (fat 9, protein 4 kcal/g): FAO Food and Nutrition Paper 77 "Food energy – methods of analysis and conversion factors" (2003), https://www.fao.org/4/y5022e/y5022e04.htm |
| each gram of fat gives about 9 kcal; lower-fat paneer has fewer calories | 9 kcal/g | FAO FNP 77 (Atwater general factor) |
| half of a 200 g pack = 100 g | arithmetic | — |

## Storyboard (30 fps; `production/30s/2026-11-05-feedback-05/source/timeline.json`)
| Beat | Time | Plate action | Caption (Hindi) | Sound |
|---|---|---|---|---|
| Hook | 0–1.8 s | Loupe pull-out; an engraved paneer block (front, top, shaded side, pores, cream wash); a knife drops and cuts it at ~1.1 s; the halves part, showing a fresh cut face | 100 ग्राम पनीर में / कितना प्रोटीन? | burin, slice |
| Cut face | 1.8–3.2 s | Burnish to a large magnified cut face: casein protein network, fat droplets (gold), whey pores (pale blue); notes "प्रोटीन का जाल", "फ़ैट की बूँदें" | एक मानक तालिका में: | page |
| Facts | 4.6–9.6 s | Roundels flown from the cut face on "26", "24.5", "325": प्रोटीन 26 ग्राम / फ़ैट 24.5 ग्राम / ऊर्जा 325 कैलोरी; basis line | 26 ग्राम प्रोटीन · 24.5 ग्राम फ़ैट / 325 कैलोरी | ticks |
| Two-thirds | 10.0–13.0 s | Energy bar 325 kcal fills: fat ≈ 220 (24.5 × 9) vs protein ≈ 104 (26 × 4); fat droplets glow | दो-तिहाई कैलोरी / फ़ैट से आती है | page |
| Fat sets calories | 13.3–19.8 s | Roundel "≈ 9 कैलोरी · 1 ग्राम फ़ैट"; then two cut faces (more droplets / fewer droplets) with calorie gauges (qualitative, no numbers) | 1 ग्राम फ़ैट ≈ 9 कैलोरी, / कम फ़ैट = कम कैलोरी | page |
| Takeaway | 20.1–25.3 s | Blank "पोषण जानकारी · प्रति 100 ग्राम" label card (green underline on "प्रति 100 ग्राम"); half of a block lands on a balance and levels with 100 g; "200 ग्राम पैक का आधा = 100 ग्राम" | पैक का प्रति 100 ग्राम लेबल पढ़ें, / अपना हिस्सा तौलें | thud, clink |
| CTA | 25.3–30 s | Engraved seal with the approved icon, "CalMeter" cut, rule, milled edge engraved | CalMeter के साथ अपने खाने / और पोषण को ट्रैक करें | pencil, bed fades |

## Approved style notes (unchanged; reference the code, not a library — no Three.js)
Renderer `production/30s/2026-11-04-hindi-04/source/render.mjs` (Hindi #04) copied with only the food geometry swapped; same recipe as `14`–`17`: burin swell/taper, hatch families by tone (shaded block side cross-hatched), multiply washes under the ink, roundels on arcs with leaders, bar and balance vignettes, ivory plate + ruled border + cut title ("PLATE VII · पनीर · सादा"), Hindi captions (Noto Sans Devanagari Black 56 px, baselines 412/488, ink-measured bounds, grapheme cutting), CTA seal with `assets/icon.png`, stop motion 15 drawings/s with line boil, accepted quiet `mix.py`. Paneer washes: curd `#F6E6B8` / top `#FBF1D2` / side `#E6CF93`, cut face `#FAEFCC` → `#EED9A0`, fat droplets `#F0BE3E`, whey `#B9D3E0`.
