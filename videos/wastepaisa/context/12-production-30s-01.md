# 12 · Production 30s-01: "Why a paper cup is not just paper"

Round `production-30s-2026-11-02` (user-approved), 2026-11-02. Format rules are in `11-production-format.md`.
A copy of this file sits in the output folder as `PRODUCTION-NOTES.md`.

## Deliverable
`videos/wastepaisa/production/30s/2026-11-02/wastepaisa-30s-production-01.mp4`
SHA-256 `8269dd290355f045dbdef61077a0a1c158b8e97bf375ef8e20d43eff7bdf8057` · 9,972,389 bytes.
This is a new source and a new render, not a trim of the 10 s or 15 s work (both preserved untouched).

## Brief
- Genre: recycling explainers / material composition. Skill: Paper-cut Motion (read-only).
- Scene: one continuous shot in Tinku's scrap shop. Tinku tears the cup to reveal the lining,
  demonstrates the lining with a two-swatch drop test, peels the layers apart, pins them to labelled
  columns on the sorting board, then shows that facilities differ and that local rules decide.
- No rates, profit or allowance claims. Barrier variation and local variability are sourced and shown.

## Final script (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us)
The approved draft is used **verbatim**. It fits 30 s naturally (23.0 s of speech, gaps ≥ 0.35 s,
about 2 s visual end), so no edits were needed.
| Line | Time (s) | Text |
|---|---|---|
| L1 | 0.40–1.76 | This looks like a paper cup. |
| L2 | 3.10–4.05 | But look inside. |
| L3 | 4.40–10.27 | Many disposable cups have a thin plastic lining that helps stop liquid soaking through the paper. |
| L4 | 10.90–14.29 | That mixed construction can make recycling more complicated. |
| L5 | 14.90–18.16 | Some facilities can process certain cups; others cannot. |
| L6 | 18.75–22.78 | Before adding one to your recycling, check your local recycler's rules. |
| L7 | 23.40–26.27 | The useful question is not only what it looks like. |
| L8 | 26.65–27.94 | It is what it is made of. |

## Source-to-claim map
Sources (accessed 2026-11-02, re-used from `education/pilot-01/sources.md`): **S1** NIST news release,
2022-04-20 (the cups studied were coated with LDPE, "a soft flexible plastic film often used as a liner"). **S2** Grundon,
"Paper cup recycling" (a PE film bonded to the cup "makes the cup waterproof"; "the bonding … makes it difficult to
separate the paper fibres"; only a few facilities can process cups). **S3** Wikipedia "Paper cup" (lining stops liquid
"soaking through the paper"; PLA and wax used on some cups; tertiary, corroboration only). **S4** Waste Dive, 2026-05-11
(cup recycling access varies; some mills "prefer not to work with paper cups"; 35 North American mills accept them).
**S5** Packaging Europe, 2025-01-21 (PE and PLA coatings and recycling challenges; alternative coatings).
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Many disposable cups have a thin plastic lining | S1, S2, S3 | "Many", plus the wall note "Many cups, not all. Some use other barrier coatings." (S3, S5) |
| …that helps stop liquid soaking through the paper | S2, S3 | Two-swatch drop test is illustrative (bead on lined swatch, stain on bare paper) |
| That mixed construction can make recycling more complicated | S2, S4, S5 | "can make … more complicated", not "unrecyclable" |
| Some facilities can process certain cups; others cannot | S2, S4 | Facility cards are labelled ILLUSTRATIVE (✓ SOME CAN / ✗ OTHERS CAN'T) |
| Check your local recycler's rules | follows from S4 | Not a universal disposal instruction |
| Final tag "MADE OF: PAPER + PLASTIC LINING" | S1, S2 | Refers to the lined cup shown; qualified by the "not all" note |
Not claimed: recycling rates, facility counts, values or prices, payouts or allowance, app features, health claims.

## Storyboard (stepped 12 fps, delivered 30 fps)
| Section | Time | Action |
|---|---|---|
| Hook | 0–3 s | Camera pushed in (1.10). Tinku peers through his loupe; a "PAPER CUP?" tag is pinned on the cup (0.42); he taps it twice (1.0/1.25) |
| Setup | 3–8 s | Camera eases out to full. Tinku tears the cup (3.25) and the flap falls to the counter, revealing a blue lining band. "Wow". PAPER tag (5.0) and PLASTIC LINING tag (6.08) are pinned and copper wires run to the tear. Wall note (6.58). Hop onto the crate (7.33) |
| Mechanism | 8–23 s | Drop test: bead sits on the PAPER + LINING swatch (8.17), drop soaks into BARE PAPER (9.33). Hop to the cup, peel paper and lining apart (10.9–11.5), pin paper (12.42) and lining (13.08) under their labels. MIXED stamped on the tag (13.83). Facility cards drop: SOME CAN ✓ (15.17/16.42), OTHERS CAN'T ✗ (17.0/17.58), with wires from the cup; Tinku shrugs. He hops down and points as the YOUR LOCAL RECYCLER sheet is pinned (19.5); CHECK LOCALLY stamp (21.58) |
| Takeaway | 23–29 s | Camera pushes to 1.10–1.12 on the cup. Tag replaced by covering: LOOKS LIKE: PAPER (25.58), then MADE OF: PAPER + PLASTIC LINING (27.42); Tinku points |
| End | 29–30 s | Caption off (29.33); final tableau holds; music resolves and fades |

## QA (final export)
- ffprobe: **30.000000 s**; H.264 High yuv420p **1080×1920**, 30/1 fps, **900** frames; AAC-LC 48 kHz stereo,
  duration_ts **1,440,000** @ 1/48000.
- Whole decode: `ffmpeg -v error -i … -map 0 -f null -` → exit 0, 0 bytes of errors.
- Loudness: **−15.1 LUFS** integrated, true peak **−1.5 dBFS**, LRA 5.5 LU.
- Captions (logged for all 360 steps): ink **y 354–466**, **x 196–884**, at most 2 lines, hard switches with no overlap.
  y 0–300 is clear.
- ASR and timing pass (Vosk en-us-0.22-lgraph, one pass on the export): word accuracy L1 1.00, L2 0.75, L3 0.94,
  L4 1.00, L5 1.00, L6 0.83, L7 0.83, L8 1.00 (mean 0.919). Every script word was recognised. Misses are
  "helps"→"help", "recycler's"→"recyclers" (normalisation), and short insertions ("and", "i i") where SFX fall in the
  line-tail windows. Heard speech onsets match the plan within ±0.03 s.
- Visual review: full sheet (every 1.25 s) and 21 transition frames decoded from the export.
  Fixed during QA: (1) stain and local-rules sheet hidden behind Tinku → drop order reversed (lined then bare, matching
  the narration) and Tinku hops down for L6; (2) accuracy note occluded → moved to the wall; (3) takeaway tag in the
  right UI column under the end zoom → tags re-hung on the cup's left; (4) CHECK LOCALLY stamp covering the sheet text
  → moved below the sheet. Re-checked on the final export.
- Remaining limits: no human listening test in this cloud session (ASR plus loudness and spectrogram only).
  Tinku's motion is sprite swaps and stepped hops (intended stop-motion look, no in-betweens). Some board items are
  partly occluded by Tinku at moments when they're no longer narrated.

## Provenance and licences
Code, sprites, music and SFX are original (this repo). Tinku is the approved rig from pilot 01. Kokoro-82M is
Apache-2.0 (hexgrad); kokoro-onnx is MIT; three.js is MIT (sprite render); Baloo 2 is OFL; the app icon is from the
approved assets. Paper-cut Motion skill: read-only art direction, no code copied or executed.
