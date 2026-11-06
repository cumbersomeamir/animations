# 21 · english-08 episode 01: "Why can a few bits of broken mug cost you a whole glass load?" (glass cullet, English)

Batch `2026-11-07-english-08` (user-approved, 7 Nov 2026).
- **Language:** English narration and English captions only. Every line was synthesised fresh; no Hindi text or audio is reused.
- **Renderer and style:** the most recently accepted **Scrap Shop X-ray** recipe (B in `11-production-format.md`), copied from
  `production/30s/2026-11-06-english-07/src/scene.html` (round-02 lineage). The point-cloud shop, camera grammar, simplified open-can
  mascot, palette, caption panel and English CTA card are unchanged. The props, scene functions and English text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-07-english-08/wastepaisa-30s-english08-01.mp4`
SHA-256 `102a00f512d9614e3059f043b187198d3c2352cb27ebdaad37b22d3428d035a5` · 10,663,546 bytes.

## Start state, identity and topic check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 6d103fb before edits. No job
  was running, so nothing needed finishing or checkpointing. Earlier renders were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The assigned
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **History:** the episode records in context 12–20 were searched for glass, cullet and ceramics, with no hits.
  - Earlier topics: paper cup, aluminium can, cable, brass, aluminium aggregation, pallets, cardboard grading, coconut-shell charcoal,
    PET bottles.
  - The suggested subject (waste glass bottles into graded cullet) is fresh and was used as given.

## Requirements applied
- **Flow:**
  - Hook (frame 0): the mascot holds a **broken mug** in a glass scrap shop, next to a cullet bin tagged "GLASS LOAD ₹ ?". The X-ray (by
    1.3 s) finds a ceramic shard hidden in the glass, and the price is struck through at "cost you a whole glass load".
  - Then: collection (a bottle crate) → colour separation → contamination removal (caps, ceramics) → why ceramics matter (furnace
    cutaway) → professional processing (plant: crush, screen, optical sort).
  - Then an illustrative bulk batch: revenue minus collection, labour, transport and processing. CTA in the last 3.8 s.
- **Boundaries:**
  - Crushing happens only inside a "PROCESSING PLANT". There are no home crushing steps or tools.
  - No guaranteed earnings: the example is spoken as "Say…" and tagged "EXAMPLE · PRICES VARY". No invented app features.
- **Voice:** the approved **Meshline** English character (Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, speed 0.98), cached. Quiet pad;
  SFX that land on spoken words are kept low (the flaw-ring tick sounds just after "flaws").
- **Captions:** English, in the accepted treatment (62 px Baloo 2 ExtraBold, 70 px line spacing, centre y 430).
- **Pacing:** as in english-06/07, the numbers fill the time, so there is no silent recap. The net result holds until the CTA.

## Final script (English narration = captions) · 71 words, 26.3 s of speech
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.25–3.86 | Why can a few bits of broken mug cost you a whole glass load? |
| L2 | 4.16–8.63 | Keep clear, green and brown bottles apart; clear allows little other colour. |
| L3 | 8.93–13.72 | Pull out caps and ceramics: ceramic melts hotter than glass and leaves flaws. |
| L4 | 14.00–17.66 | A processing plant crushes, screens and sorts it into cullet. |
| L5 | 18.00–20.59 | Say ten tonnes sell for ₹90,000; (spoken "ninety thousand rupees") |
| L6 | 20.74–25.45 | collection, labour, transport and processing leave about ₹10,000. (spoken "ten thousand rupees") |
| L7 | 26.20–28.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

**Pronunciation of "cullet":** Kokoro's phonemes are /kˈʌlɪt/, which matches the dictionary "KUH-lit". Both ASR engines misread it
because the term is rare, so it is also captioned and shown as a CULLET chip.

## Research (accessed 7 Nov 2026)
- **G1, Glass Manufacturing Industry Council (GMIC),** "Cullet Quality: The Hidden Key to Efficient Glass Production" (20 Feb 2026),
  https://gmic.org/cullet-quality-the-hidden-key-to-efficient-glass-production/.
  - "Ceramic fragments and Pyrex™ cookware often melt at higher temperatures than container glass and can cause inclusions."
  - "Small pieces of pyroceramic can persist in the melt for several days, causing up to 5 % production losses."
  - Cullet for quality container production must be "free of coarse ceramics and metals".
  - Adding cullet cuts furnace energy costs by roughly 2–3 % per 10 % cullet (GMIC citing the Glass Packaging Institute). This is
    context only, not spoken.
- **G2, colour limits:**
  - WRAP **PAS 101** container-glass grades (via letsrecycle "Glass specifications",
    https://www.letsrecycle.com/prices/glass/glass-specifications/): Grade A **clear: other colours 4 %**; amber and green: other colours
    5 %. Ceramics (crockery, earthenware, Pyrex) are listed as "critical contaminants".
  - **ASTM E708** (waste glass for container manufacture; standards preview at
    https://standards.iteh.ai/catalog/standards/astm/a1d194af-96c1-46de-91ac-08a05b359a7c/astm-e708-792017): flint cullet 95–100 % flint,
    0–5 % amber, 0–1 % green.
  - On screen: "CLEAR: ONLY ~4% OTHER COLOURS".
- **G3, ceramics tolerance (context):** an ISRI MRF-glass specification draft allows ".025% of total load" for (pyro)ceramics, about 250
  g per tonne (seen via the search record; the PDF at isri.org was not directly fetchable). Not shown on screen.
- **G4, processing:** British Glass, "Latest systems enhance cullet quality"
  (https://www.britglass.org.uk/knowledge-base/digital-library-and-information-services/latest-systems-enhance-cullet-quality).
  Cullet quality depends on removing "even the smallest inclusions of ceramic, stone, porcelain or off-colours", which processing plants
  do with screening and optical sorting (G1 lists the same contaminants).
- **P1, Indian cullet prices (asking prices; IndiaMART):**
  - Bengaluru (May 2026): transparent cullet ≈₹9/kg, green bottle cullet ₹12/kg
    (https://dir.indiamart.com/bengaluru/cullet-glass-scrap.html).
  - Indore: amber cullet ₹8/kg (https://www.indiamart.com/proddetail/amber-glass-cullet-20928963348.html).
  - Category spread: ≈₹6–15/kg; processed or sized cullet ₹20–35/kg (https://dir.indiamart.com/impcat/cullet-glass-scrap.html).
  - No dated Indian kabadi rate for waste bottles was found, so collection is an illustrative cost line.
- **P2, labour benchmark:** Delhi unskilled minimum wage ₹710/day (see context 17).

### Illustrative bulk batch (spoken "Say", on-screen "EXAMPLE · PRICES VARY")
| Item | ₹ |
|---|---|
| 10 tonnes of colour-separated, cleaned glass processed into cullet (10 × 1 t bags) | n/a |
| **Sales**: buyer quote ₹9/kg × 10,000 kg (P1) | **90,000** |
| Collection (pickups or payments to bars, hotels, kabadis, ≈₹3/kg) | −30,000 |
| Labour (colour sorting, de-capping, ceramic picking; ≈28 worker-days, P2) | −20,000 |
| Transport (≈₹1.5/kg) | −15,000 |
| Processing at a plant (crush, screen, optical sort; ≈₹1.5/kg toll) | −15,000 |
| **Left** | **≈10,000** (≈11 % of sales; before rent, storage, rejected loads or tax) |

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| A few bits of broken mug can cost a whole glass load (mug in hand; X-ray finds a ceramic shard; price struck through) | G1, G2 (ceramics are critical contaminants), G3 | Phrased as a question; no figure |
| Keep clear, green and brown apart; clear allows little other colour (CLEAR / GREEN / BROWN bins, "CLEAR: ONLY ~4% OTHER COLOURS") | G2 (PAS 101 Grade A 4 %; ASTM E708 ≤5 % amber, ≤1 % green) | "~4%" taken from PAS 101 |
| Pull out caps and ceramics; ceramic melts hotter than glass and leaves flaws (CAPS OUT, CERAMICS OUT; furnace cutaway, CERAMIC MELTS HOTTER, FLAW IN NEW BOTTLE) | G1 | No temperatures stated |
| A processing plant crushes, screens and sorts it into cullet (PROCESSING PLANT, CRUSH, SCREEN, SORT with an air jet ejecting ceramic, CULLET) | G1, G4 | Professional plant only; no home crushing |
| Say ten tonnes sell for ₹90,000 (EXAMPLE, 10 TONNES = 10 × 1 t BAGS, BUYER QUOTE ₹9/kg, SALES ₹90,000) | P1 | Spoken "Say" + EXAMPLE tag |
| Collection, labour, transport and processing leave about ₹10,000 (COLLECTION −₹30,000, LABOUR −₹20,000, TRANSPORT −₹15,000, PROCESSING −₹15,000, LEFT ≈ ₹10,000) | Example arithmetic; P1, P2 | "EXAMPLE · PRICES VARY"; bar drawn to scale |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; 0.3 s dissolves; camera keys re-timed)
| Section | Time | Scene |
|---|---|---|
| Hook | 0–4.0 s | Mascot holds a broken mug beside a cullet bin, "GLASS LOAD ₹ ?". The X-ray (0.3–1.3) turns the glass translucent and rings the opaque ceramic shard; CERAMIC chip (1.66); price struck through (2.6–3.1) |
| Colour | 4.0–8.8 s | Bottle crate (collection). Bottles fly to CLEAR (4.4), GREEN (4.82) and BROWN (5.39) bins; chip "CLEAR: ONLY ~4% OTHER COLOURS" (6.95) |
| Clean | 8.8–13.85 s | Caps out (CAPS OUT 9.38), then the ceramic shard out (CERAMICS OUT 9.89; one chip at a time). Furnace cutaway: molten glass; the ceramic chunk sinks unmelted (CERAMIC MELTS HOTTER 11.39); a new green bottle with a ringed white flaw (FLAW IN NEW BOTTLE 12.6) |
| Process | 13.85–17.85 s | PROCESSING PLANT: a bottle into the crusher (CRUSH 14.9), vibrating screen (SCREEN 15.59), optical sorter whose air jet ejects a ceramic piece (SORT 16.58), clean CULLET pile (17.18) |
| Batch | 17.85–20.65 s | EXAMPLE; ten 1 t bags; BUYER QUOTE ₹9/kg; SALES ₹90,000 |
| Net | 20.65–25.95 s | To-scale bar SALES ₹90,000: COLLECTION −₹30,000, LABOUR −₹20,000, TRANSPORT −₹15,000, PROCESSING −₹15,000 land on their spoken words; warm sliver LEFT ≈ ₹10,000 (24.16); mascot hops |
| CTA | 25.95–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 26.2–28.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode and loudness:** whole decode exit 0 with 0 bytes of errors. **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 2.6 LU.
- **Captions** (900 frames logged): ink **y 366–494**, **x 95–985** (widest: L3.1 "ceramic melts hotter than glass", inside the 90–990
  limit), at most 2 lines, hand-offs at ASR word onsets, nothing at y < 300.
- **Labels:** all chips ≥ 40 px.
- **Timing (Vosk on the final file):** heard onsets and offsets are within ±0.03 s of plan for every line.
- **Intelligibility** (ASR only; this cloud session cannot play audio; detail in `qa/asr.txt`):
  - *Vosk:* L1, L2, L3, L5 and L6 all 1.00; L4 0.70 ("cullet" and "sorts it"); L7 0.89 (brand OOV); mean 0.941.
  - *faster-whisper small:* matches the script except "cullet" ("color") and the brand.
- **Fixes:**
  - *Before the full render:* the colour-limit chip text overflowed its pill (now an auto-sized label); the flawed bottle was enlarged.
  - *After the first export:* the "CAPS OUT" and "CERAMICS OUT" chips overlapped at ≈10.3 s, so they now share one slot and hand off at
    "ceramics". Video re-rendered once; audio unchanged.
- **Visual:** stills of every scene, then 34 transition and representative frames decoded from the export, plus a full sheet every
  1.25 s and a strip of the fixed chip hand-off.
- **Limits:**
  - ASR-only intelligibility; synthetic voice. "Cullet" is a rare term, so ASR misses it, but it is captioned.
  - Prices are asking prices, not transactions; collection and processing costs are illustrative.
  - The ISRI ceramics figure is context from the search record only.
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
