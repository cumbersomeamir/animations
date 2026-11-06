# 20 · english-07 episode 01: "Why do recyclers pay more for some bottle loads?" (PET bottle collection, English)

Batch `2026-11-06-english-07` (user-approved, 6 Nov 2026).
- **Language:** English narration and English captions only. Every line was synthesised fresh; no Hindi text or audio is reused.
- **Renderer and style:** the most recently accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-06-english-06/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, palette, caption panel and English CTA card are unchanged. The props, scene functions and English text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-06-english-07/wastepaisa-30s-english07-01.mp4`
SHA-256 `7b3dacf549d2a6165e5bceb8a35313047636deae3d8d5f7939318a09c3181936` · 10,500,373 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at f12f92d before edits. No job
  was running. Earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The assigned
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Suggested subject rejected as a duplicate:** "collecting and sorting discarded corrugated cardboard for a recycling buyer; clean dry
  separated vs wet mixed loads" is already episode **feedback-05** (`context/18-feedback-05-01.md`, 5 Nov 2026). That episode covered
  corrugated cardboard graded apart from mixed and wet paper, the buyer's moisture deduction and contamination downgrade, and an
  illustrative batch with buyer prices, transport, labour, net profit and the unsorted loss.
- **Fresh subject chosen, same genre:** collecting and sorting **PET drink bottles** for a recycler. It is equally useful and
  India-relevant, with a different material and different value mechanisms:
  - Clear and coloured bottles are worth different amounts.
  - Buyers grade a load by its PET share (contamination).
  - Crushing changes the transport cost per kilogram.
  - History check: PET bottles were never an episode; a bottle only drops into "OTHER" in 30s-02.

## Requirements applied
- **Flow:**
  - Hook (on screen in frame 0): the mascot holds a clear bottle next to two bags tagged "SORTED ₹ ?" and "MIXED ₹ ?". The X-ray (by
    1.3 s) reveals coloured bottles and trash hidden in the mixed bag.
  - Then a sorting demo, the grading rule, the crushing and transport mechanism, and an illustrative batch with weight, buyer quote,
    sales, bottle cost, transport, labour and what is left.
  - The CTA runs in the last 3.8 s.
- **Boundaries:** no guaranteed earnings, no invented app features, no hazardous steps. Copy and CTA mention only WastePaisa.
- **Voice:** the approved **Meshline** English character (Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98), from the cached
  setup. Quiet pad; SFX that land on spoken words are kept low (e.g. the GRADE A stamp sound is delayed to just after "PET").
- **Captions:** English, in the accepted treatment (62 px Baloo 2 ExtraBold, 70 px line spacing, centre y 430).
- **Pacing:** as in english-06, spoken numbers fill the time, so there is no silent recap. The net result holds until the CTA.

## Final script (English narration = captions) · 67 words, 25.8 s of speech
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.60 | Why do recyclers pay more for some bottle loads than others? |
| L2 | 3.90–7.40 | Keep clear bottles apart; coloured ones often sell for little. |
| L3 | 7.70–12.45 | Leave out other trash; buyers grade loads by how much is really PET. (spoken "P E T") |
| L4 | 12.75–16.94 | Then crush them; loose bottles are mostly air, and air costs transport. |
| L5 | 17.25–21.13 | Say 400 kilos sell for ₹8,800. (spoken "four hundred kilos … eight thousand eight hundred rupees") |
| L6 | 21.43–25.12 | Buying, transport and labour leave about ₹1,500. (spoken "fifteen hundred rupees") |
| L7 | 26.20–28.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

## Research (accessed 6 Nov 2026)
- **B1, APR (Association of Plastic Recyclers), Model Bale Specification "PET Bottles with Thermoforms"**
  (https://plasticsrecycling.org/images/Markets/APR-BaleSpec-PETBottle-WithThermoforms.pdf; quoted from the search record because the
  URL returned HTTP 404 to direct fetch on 6 Nov 2026).
  - Grades by "Total PET fraction by weight": **Grade A 94 % or above**, B 83–93 %, **C 73–82 %**, F 72 % or below.
  - "no more than 2% of any of the listed items" (contaminants).
  - Closures may be left on.
  - Users should check with PET buyers about allowances for "other colored PET containers".
  - Bale density 15–18 lb/ft³ (≈240–290 kg/m³).
- **B2, US EPA,** *Volume-to-Weight Conversion Table* (Appendix D), https://archive.epa.gov/epawaste/nonhaz/municipal/web/pdf/app-d.pdf.
  - PET soda bottles: "Whole bottles, uncompacted 1 cu. yd. 30-40" lb versus "Whole bottles, compacted 1 cu. yd. 515" lb.
  - That is ≈18–24 kg/m³ loose versus ≈306 kg/m³ compacted, about 15× more plastic per volume. On screen: LOOSE ≈ 20 kg per m³ and
    CRUSHED ≈ 300 kg per m³.
- **B3, clear vs coloured prices:** letsrecycle.com, *Plastic bottles 2026* price table,
  https://www.letsrecycle.com/prices/plastics/plastic-bottles/plastic-bottles-2026/.
  - October 2026: clear and light-blue PET **£250–350/t**; mixed bottles £100–200/t; **coloured PET −£50 to +£10/t**.
  - This is UK data, used as dated evidence that coloured PET "often sells for little"; no UK figure appears on screen.
- **B4, Indian price signals** (asking or indicative):
  - Household kabadi PET-bottle rates: ₹10/kg Bangalore and ₹20/kg Pune (The Kabadiwala city pages,
    https://www.thekabadiwala.com/scrap-rates/Bangalore, https://www.thekabadiwala.com/scrap-rates/Pune).
  - Recycleinme "Indian Plastic Prices": South India PET bottles (white and green mixed, without cap) ≈₹15.10/kg
    (https://www.recycleinme.com/plasticpricelisting/Indian%20Plastic%20Prices; date format ambiguous).
  - Scrapo (Nov 2026): median PET asking rate ₹49.28/kg, with "clean, clear bottles in bales" fetching more than coloured or mixed
    (https://scrapo.com/in/plastic-scrap-rate).
  - B2B listings: transparent ₹25–70/kg (https://www.exportersindia.com/indian-suppliers/pet-bottles-scrap.htm).
- **B5, labour benchmark:** Delhi unskilled minimum wage ₹710/day (see context 17).

### Illustrative batch (spoken "Say", on-screen "EXAMPLE · PRICES VARY")
| Item | ₹ |
|---|---|
| 400 kg of clear PET bottles, sorted, trash out, crushed and baled | n/a |
| **Sales**: buyer quote ₹22/kg × 400 kg (between the ≈₹15 mixed-bottle rate and the ₹25+ B2B listings, B4) | **8,800** |
| Bottles bought from households/kabadis at ₹12/kg (inside the ₹10–20 kabadi range, B4) | −4,800 |
| Transport (one trip once crushed, B2) | −1,000 |
| Labour (≈2 worker-days: sort, de-trash, crush, bale; B5) | −1,500 |
| **Left** | **≈1,500** (≈17 % of sales; before rent, baler or storage) |

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Recyclers pay more for some bottle loads (SORTED ₹ ? vs MIXED ₹ ?, X-ray of the mixed bag) | B1, B3, B4 | Question, no figure in the hook |
| Keep clear bottles apart; coloured ones often sell for little (CLEAR / COLOURED bins, LOW PRICE) | B3 (coloured PET −£50 to +£10/t vs clear £250–350/t), B4 (Scrapo note), B1 (buyer-set colour allowances) | "often"; no UK prices on screen |
| Leave out other trash; buyers grade loads by PET share (OTHER TRASH; gauge 82 % = GRADE C → 95 % = GRADE A, label "94%+ PET: GRADE A") | B1 | Grade cut-offs quoted from APR |
| Crush them; loose bottles are mostly air, and air costs transport (press; truck of loose bottles "LOOSE ≈ 20 kg per m³" vs truck of bales "CRUSHED ≈ 300 kg per m³") | B2 (and B1 bale density) | Rounded conversions of EPA figures |
| Say 400 kilos sell for ₹8,800 (EXAMPLE; 400 kg CLEAR, CRUSHED; BUYER QUOTE ₹22/kg; SALES ₹8,800) | B4 | Spoken "Say" + EXAMPLE tag |
| Buying, transport and labour leave about ₹1,500 (BOTTLES (₹12/kg) −₹4,800, TRANSPORT −₹1,000, LABOUR −₹1,500, LEFT ≈ ₹1,500) | Example arithmetic; B4, B5 | "EXAMPLE · PRICES VARY"; bar drawn to scale |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–3.75 s | Mascot holds a clear bottle; bags "SORTED ₹ ?" and "MIXED ₹ ?". The X-ray (0.35–1.3) circles the coloured bottles, can, wrapper and bag hidden in the mixed load; chip WHICH PAYS MORE? (1.39) |
| Sort | 3.75–7.55 s | Bottles on a tray fly into the CLEAR bin (4.14–5.1) and the COLOURED bin (5.64–6.4); stamp LOW PRICE (6.6) |
| Grade | 7.55–12.6 s | Can, wrapper and bag fly to a trash bin (OTHER TRASH 8.3). PET-share gauge: 82 % "WITH TRASH: GRADE C" (9.14), rising to 95 % "94%+ PET: GRADE A" (10.5); stamp GRADE A (11.48) |
| Crush | 12.6–17.1 s | Press crushes a bottle (CRUSH 12.93). Truck of loose bottles, "LOOSE ≈ 20 kg per m³: MOSTLY AIR" (13.6–14.6); truck of bales, "CRUSHED ≈ 300 kg per m³" (15.3–15.9) |
| Batch | 17.1–21.3 s | EXAMPLE tag; four bales "400 kg CLEAR, CRUSHED" (18.15); tickets BUYER QUOTE ₹22/kg (18.6) and SALES ₹8,800 (19.41) |
| Net | 21.3–25.95 s | To-scale bar SALES ₹8,800: BOTTLES (₹12/kg) −₹4,800 (21.49), TRANSPORT −₹1,000 (22.03), LABOUR −₹1,500 (22.99); warm sliver LEFT ≈ ₹1,500 (23.86); mascot hops |
| CTA | 25.95–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 26.2–28.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.4 dBFS**, LRA 2.7 LU.
- **Captions** (900 frames logged): ink **y 366–494**, **x 133–947**, at most 2 lines, hand-offs at ASR word onsets, nothing at y < 300.
- **Labels:** all chips ≥ 40 px.
- **Timing (Vosk on the export):** heard onsets and offsets are within ±0.06 s of plan for every line.
- **Intelligibility** (ASR only; this cloud session cannot play audio; detail in `qa/asr.txt`):
  - *Vosk en-us 0.22-lgraph:* L1–L6 all 1.00; L7 0.89 because the brand is out of vocabulary (mean 0.984).
  - *faster-whisper small:* matches the script word for word.
- **Fixes before the full render:**
  - Draft L3 rephrased (ASR heard "great a load"; "Keep" was repeated).
  - Hook bags given visible bottle tops, with the price tags raised clear of them.
  - Sorting heap given a tray, so it no longer floats.
  - Crush press enlarged.
  - L4–L6 re-timed to keep 0.3 s pauses.
- **Visual:** stills of every scene, then 35 transition and representative frames decoded from the export, plus a full sheet every
  1.25 s. No defects remained.
- **Limits:**
  - ASR-only intelligibility; synthetic voice.
  - Prices are asking or indicative rates, not transactions.
  - The clear-vs-coloured gap uses UK data as context.
  - The APR spec was read via the search record (direct URL 404).
  - No silent recap.
  - Brief double exposure in 0.3 s dissolves (accepted).
  - The Desktop/video-review folder isn't reachable from this cloud session, so the MP4 is delivered as a chat attachment and in the repo.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
