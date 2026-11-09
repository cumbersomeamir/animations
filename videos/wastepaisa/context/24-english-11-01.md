# 24 · english-11 episode 01: "Who buys old frying oil? Never another kitchen." (used cooking oil to licensed biodiesel, English)

Batch `2026-11-09-english-11` (user-approved, 9 Nov 2026).
- **Language:** English narration and English captions only. Every line was synthesised fresh; no Hindi text or audio is reused.
- **Renderer and style:** the most recently accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-09-english-10/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, palette, caption panel and English CTA card are unchanged. The props, scene functions and English text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-09-english-11/wastepaisa-30s-english11-01.mp4`
SHA-256 `f32b05c2d68d7b2e0c984d9f8b2a5bffd84667368cf7b3682aa51561ed695841` · 9,174,768 bytes.

## Start state, identity and topic check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 41adc9e (english-10) before
  edits. No earlier job was running or unfinished; earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The assigned
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **History:** the episode records in context 12–23 were searched for cooking oil, RUCO, biodiesel and frying. The only hit is a GST
  note in hindi-03 that lists used cooking oil among reverse-charge items; no episode covers it. The suggested subject (used cooking oil
  collection for licensed downstream processing) is fresh and was used as given.
- Only this app's context, skill, renderer, assets and episodes were read.

## Requirements applied
- **Flow:**
  - Hook (from frame 0): a kadai of dark, smoking oil with a "WHO BUYS? ₹ ?" tag. The X-ray (0.35–1.3 s) shows orange polar-compound
    molecules in the oil, chip "POLAR COMPOUNDS > 25% = UNFIT" (1.45 s). On "Never another kitchen" a dashed arrow to a street-food pan
    is crossed out, chip "NOT BACK INTO FOOD".
  - Then: cool the oil and pour it into a labelled can with headspace → hand it only to an authorised collector (check the card) and log
    the pickup → aggregation: one van trip for one kitchen vs one route for twenty kitchens, per-litre transport cost → a licensed plant
    turns the pooled oil into biodiesel; "VALUE = POOLING + PROCESSING". CTA in the last 4 s.
- **Boundaries:** no earnings, margin, oil buying price or biodiesel price is stated. The only figures are an illustrative van-trip cost
  (inside dated hire tariffs) divided by litres, tagged "EXAMPLE". Old oil is never shown going back to food. No how-to for
  processing, no invented app features, no disclaimer padding.
- **Instagram App Performance sheet improvements (feedback-05, user-approved):** question opening with the subject on screen from frame 0;
  spoken arithmetic complete on its own (cost, litres and result are all spoken); caption matches the final transcript.
  - **One variable changed this episode:** the payoff is a per-litre cost comparison (aggregation) instead of a profit bar, because the
    brief forbids fabricated earnings. Renderer, mascot, caption treatment, voice, pacing and CTA are held constant. No analytics are
    used or claimed.
- **Voice:** the approved **Meshline** English character (Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98), cached model
  files. `tts.py` gained an optional `ph_sub` phoneme replacement (see Script). Quiet pad, music ducked under speech; SFX that would land on
  spoken words were made silent or moved after the line.
- **Captions:** English, in the accepted treatment (62 px Baloo 2 ExtraBold, 70 px line spacing, centre y 430).
- **Pacing:** no silent recap, as in english-06 to english-10. The result holds until the CTA.

## Final script (English narration = captions) · 67 words, 24.1 s of speech
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.27 | Who buys old frying oil? Never another kitchen. |
| L2 | 3.65–6.25 | Let it cool, then pour it into a labelled can. |
| L3 | 6.65–9.49 | Give it only to an authorised collector, and log it. |
| L4 | 9.95–16.42 | Say a ₹2,000 van trip picks up one kitchen's 25 litres: ₹80 a litre. (spoken "two-thousand-rupee … twenty-five liters … eighty rupees a liter") |
| L5 | 16.85–21.14 | Pool 500 litres from twenty kitchens: ₹4 a litre. (spoken "five hundred liters … four rupees a liter") |
| L6 | 21.60–24.04 | Then a licensed plant turns it into biodiesel. |
| L7 | 26.20–28.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Pronunciation: the en-us G2P flaps "liters" (/lˈiːɾɚz/) and ASR heard it as "leaders". `audio/lines.json` now passes
`ph_sub: [["lˈiːɾɚ", "lˈiːtɚ"]]` for L4 and L5; both engines then heard "liters/litres". Captions keep British spelling
(labelled, authorised, litres) as in earlier episodes; the TTS text uses US spelling.

## Research (accessed 9 Nov 2026)
- **F1, FSSAI Guidance Note No. 06/2018, "Handling and Disposal of Used Cooking Oil"** (read in full):
  https://eastregion.fssai.gov.in/pdf/Guidance-note-%20RUCO.pdf
  - TPC: "the limit of Total Polar compounds to be not more than 25% beyond which the oil is unsafe for human consumption"; discard when
    "blue-grey smoke appears or tough foam is formed or oil becomes dark and murky".
  - Big FBOs: "Keep the discarded oil in a separate container once it is cooled. Keep headspace while filling. Always label the container
    to avoid cross contamination." "Do not transfer hot oil."
  - Disposal: to "authorized UCO aggregators/collection agencies that are registered with authorized agencies such as States Biodiesel
    Boards, Biodiesel Association of India and other agencies nominated by state government … for the manufacture of biodiesel or any
    other industrial purpose". "FBOs should refrain from buying UCO for manufacturing their foods products."
  - Records: FBOs using "more than 50 Kg or litres per day" keep a log with date, quantities, mode and date of disposal and "Used Cooking
    oil Collected by (name of authorized agency)".
  - UCO "reportedly finds its way to small restaurants/dhabas and road-side vendors".
  - The note says it "does not have any force of law"; the binding rule is F2.
- **F2, FSSAI Direction under Section 16(5) of the FSS Act, 2006, regarding disposal of UCO,** 30 Jan 2019, effective 1 Mar 2019:
  FBOs using more than 50 litres a day must keep records and dispose of UCO only to agencies authorised by FSSAI or the State Commissioner
  of Food Safety, so that it does not re-enter the food chain. Revised record format 20 Jan 2022. Read through secondary reports (the
  order PDF was not opened): https://foodsafetyworks.com/news/fssai-direction-on-disposal-of-used-cooking-oil-uco
- **F3, "All you wanted to know about RUCO"** (The Hindu BusinessLine, 31 Dec 2019, hosted in FSSAI's media archive; read in full):
  https://www.fssai.gov.in/upload/media/FSSAI_News_RUCO_01_01_2020.pdf
  - FSSAI with the Biodiesel Association of India runs RUCO; authorised agencies collect inedible oil "which is then transferred to a plant
    to make bio-diesel".
  - Large FBOs sell to "authorised UCO aggregators or collection agencies registered with the BDAI, State biodiesel boards and other
    agencies nominated by State government". Agencies pay at collection "based on the quantity and quality".
  - Aims: prevent adulteration of new oil with UCO and repeated reuse; UCO "finds its way to small food vendors and households".
- **F4, PIB, Lok Sabha written reply by the Petroleum Minister, 25 Nov 2019:** oil marketing companies floated an Expression of Interest
  on 10 Aug 2019 for biodiesel produced from UCO at 100 locations, extended to 200 on 10 Oct 2019; FSSAI RUCO sticker and app; aggregator
  list at fssai.gov.in/ruco/collection-point.php. https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1593435 (the page returned 403
  to a direct fetch; wording from the search extract). The EOI prices are dated (2019) and are not used.
- **F5, PIB release on obesity (2025):** UCO is collected by aggregators from food businesses and redirected for biodiesel or soap;
  25 % TPC limit. https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2107179 (search extract).
- **F6, Goa Used Cooking Oil Policy** (state cabinet approval, July 2026; secondary report): QR-code traceability linking generators to
  authorised aggregators, a GEDA registration portal, and disposal through authorised aggregators as a pollution-board consent condition.
  https://www.thegoan.net/goa-news/cabinet-clears-framework-to-regulate-used-cooking-oil/151524.html
- **T1, mini-truck hire tariff (Bangalore operator, Tata Ace local packages):** 5 h / 50 km ₹1,900; 6 h / 60 km ₹2,300; GST 5 % extra;
  tolls and parking extra; tariff note dated January 2022.
  https://sharmaportersrentandhire.com/rent-a-tata-ace-truck-on-hire-in-bangalore.php
- **T2, TruckGuru Tata Ace hire:** about ₹2,000 per trip for routes under 150 km; base fare covers truck, driver and fuel.
  https://truckguru.co.in/tata-ace-for-rent (search extract).
- **Not used:** restaurant-side UCO prices. Sources disagree (a reported Goa tentative rate of ₹40/L that could not be opened, IndiaMART
  asking prices of ₹15–120/L), so no oil price appears in the episode.

### Illustrative collection cost (spoken "Say", on-screen "EXAMPLE")
| Item | Value |
|---|---|
| One half-day collection route, mini truck with driver (inside T1's ₹1,900–2,300 for 5–6 h and T2's ≈₹2,000 per short trip) | ₹2,000 |
| Case A: the van serves one kitchen, 25 L | ₹2,000 ÷ 25 L = **₹80 per litre** |
| Case B: the same route serves 20 kitchens × 25 L = 500 L | ₹2,000 ÷ 500 L = **₹4 per litre** |

Assumptions: 25 L per kitchen per pickup; 20 pickups fit one 5–6 h route; 500 L of oil weighs about 460 kg (density ≈ 0.92 kg/L), assumed
to fit the vehicle's payload. Excludes containers, extra staff, GST, tolls and any payment to kitchens. No income or margin is claimed.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Who buys old frying oil? (WHO BUYS? ₹ ?; dark oil with blue-grey smoke; X-ray POLAR COMPOUNDS > 25% = UNFIT) | F1 (TPC 25 %, smoke and colour signs), F3 | Question; no price shown |
| Never another kitchen (arrow to a street-food pan crossed out; NOT BACK INTO FOOD) | F1 ("refrain from buying UCO"; UCO finds its way to dhabas and vendors), F2 (stop re-entry into the food chain), F3 | n/a |
| Let it cool, then pour it into a labelled can (COOL FIRST gauge; can labelled USED COOKING OIL · NOT FOR FOOD; LEAVE HEADSPACE; cap on) | F1 (cool first, separate container, headspace, label, no hot transfer) | Label text is generic, no brand |
| Give it only to an authorised collector (UCO COLLECTOR card; CHECK AUTHORISATION; AUTHORISED stamp) | F1, F2 (only to authorised agencies), F3, F4 (FSSAI aggregator list), F6 (state traceability) | Generic card; no logo or real agency |
| …and log it (logbook: DATE · LITRES · COLLECTED BY) | F1 record format, F2 | Mandatory above 50 L/day; good practice below |
| Say a ₹2,000 van trip picks up one kitchen's 25 litres: ₹80 a litre (EXAMPLE; VAN TRIP ₹2,000; 1 KITCHEN · 25 L; ₹2,000 ÷ 25 L = ₹80 / LITRE) | T1, T2; arithmetic | Spoken "Say" + EXAMPLE tag; a cost, not an earning |
| Pool 500 litres from twenty kitchens: ₹4 a litre (20 KITCHENS; 500 L COLLECTED counter; ₹2,000 ÷ 500 L = ₹4 / LITRE; to-scale bars ₹80 vs ₹4) | T1, T2; arithmetic | Same route cost; bars drawn to scale |
| Then a licensed plant turns it into biodiesel (LICENSED PLANT; BIODIESEL drum; VALUE = POOLING + PROCESSING) | F3 (plant makes biodiesel), F4 (OMC procurement of UCO biodiesel), F5 | Equipment shown as a principle, no how-to; no licence type named |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.5 s | From frame 0: kadai of dark oil on a stove with blue-grey smoke; tag WHO BUYS? ₹ ?. X-ray (0.35–1.3) reveals polar compounds; POLAR COMPOUNDS > 25% = UNFIT (1.45). Dashed arrow to a street-food pan (2.05), red cross (2.6), NOT BACK INTO FOOD (2.7); mascot turns stern |
| Can | 3.5–6.5 s | Gauge swings HOT → COOL, COOL FIRST (3.89). The kadai tilts and pours into a translucent can (4.75–5.75); the label USED COOKING OIL · NOT FOR FOOD slides on (5.3); LEAVE HEADSPACE (5.75); cap on (5.9) |
| Collector | 6.5–9.8 s | UCO COLLECTOR card slides in (6.6); magnifier sweep, CHECK AUTHORISATION (7.4); AUTHORISED stamp and tick (7.95); logbook rises, LOG IT (8.9), row "9 Nov · 25 L · authorised agency" written |
| One trip | 9.8–16.7 s | EXAMPLE (9.95). City map; VAN TRIP ₹2,000 ticket (10.34). The van drives to one kitchen (11.39–12.9), 1 KITCHEN · 25 L (13.43), on to the plant (14.1–15.0). Map dims; ₹2,000 ÷ 25 L = ₹80 / LITRE (14.96) |
| Pool | 16.7–21.45 s | Same map with 20 kitchens; the van follows one route, kitchens turn orange as served, counter to 500 L COLLECTED; 20 KITCHENS (18.47). Map dims; ₹2,000 ÷ 500 L = ₹4 / LITRE (19.61); to-scale bars 1 KITCHEN ₹80 vs POOLED ₹4 (20.06); mascot hops |
| Plant | 21.45–25.95 s | The van arrives and pumps into the plant's intake tank; LICENSED PLANT (21.81); product flows through the column into a BIODIESEL drum (23.28); VALUE = POOLING + PROCESSING (24.1); mascot hops |
| CTA | 25.95–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 26.2–28.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 2.4 LU.
- **Captions** (900 frames logged): ink **y 366.5–493.5**, **x 175.5–904.5**, at most 2 lines, hand-offs at ASR word onsets, nothing at
  y < 300.
- **Labels:** all chips ≥ 40 px; small text exists only on props (can label, ID card, logbook).
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.03 s of plan.
- **Intelligibility** (ASR only; this cloud session cannot play audio; detail in `qa/asr.txt`):
  - *Vosk:* L1–L4 and L6 all 1.00; L5 0.91 ("four" heard as the homophone "for"); L7 0.89 (brand OOV); mean 0.971.
  - *faster-whisper small:* matches the script word for word, including "4 rupees" and "litres", apart from the brand spelling.
- **Fixes:**
  - Draft stage: "liters" was heard as "leaders", fixed with the phoneme override above.
  - Stills: the ₹80 / LITRE and ₹4 / LITRE results overflowed the standard ticket, so `ticket()` gained an optional width (500 px
    here); the AUTHORISED stamp covered the card's REG. No. line and moved to the card's lower edge.
  - After the first full render: the map behind the results was only lightly dimmed, so houses competed with the bars. The overlay was
    darkened (≈0.85), then re-rendered and re-muxed. All QA above is on that final file.
  - Audio: the cross on "kitchen" and the AUTHORISED stamp land on spoken words, so the cross is silent and the stamp is a quiet tick;
    the two result pings play after their lines.
- **Visual:** stills of every scene, then 40 transition and representative frames decoded from the export
  (`qa/contact-transitions.png`), plus a full sheet every 1.25 s (`qa/contact-full.png`) and half-resolution checks of the result frames.
  Every scene matches its narration and chips never overlap.
- **Limits:**
  - ASR-only intelligibility; synthetic voice.
  - The ₹2,000 route cost comes from operator tariffs (one dated January 2022), not a quote; 25 L per kitchen and 20 stops per route are
    assumptions.
  - F2, F4, F5 and F6 were read through reports or search extracts (fssai.gov.in order PDF, pib.gov.in and eparlib.nic.in were not
    reachable from this container); F1 and F3 were read in full.
  - "Licensed plant" means a plant operating with the approvals its state requires; the episode names no specific licence.
  - No silent recap. Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
