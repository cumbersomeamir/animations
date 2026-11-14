# 10 · Educational progress

Session: Claude Code, branch `claude-video/wastepaisa`, 2026-11-02. App: WastePaisa
(`com.wastepaisa`), repo `cumbersomeamir/animations`. Workspace: `videos/wastepaisa/` only. No other
branches, apps, chats or private assets were opened.

## Status
**Pilot 01 "Why a paper cup is not just paper": COMPLETE (render v3, QA passed).**
- Deliverable: `videos/wastepaisa/education/pilot-01/wastepaisa-education-pilot-01.mp4`
  (SHA-256 `5121f1a42feccc7cd98238e0ea8a0a5bb616f903a67209eb92c794cec5304a0b`, 11.6 MB)
- 15.000 s · 1080×1920 · H.264 High 30/1 fps, 450 frames · AAC-LC 48 kHz stereo (720000 samples declared)
- QA report: `education/pilot-01/qa/QA.md`

## Prior work (verified at session start)
No earlier 30 s campaign render, 15 s skill test or educational pilot existed on this branch.
Context 05 said "No new video has been rendered yet" and the file tree confirmed it. Nothing
needed checkpointing or preserving. Context files 06 and 07 do not exist. The campaign deliverable in 04
remains **not started**, deliberately: the user's latest brief said not to make another campaign ad.

## Verified facts (evidence)
| Fact | Evidence |
|---|---|
| Listing: "Check recycling prices, sort waste, book pickups and track every payout." Lifestyle, free, Tensorblue AI | `assets/listing.json` (sha256 matches 03) |
| Subject claims C1–C6 (linings, other coatings, waterproofing, bonded separation, local facilities) | Dated public sources S1–S5, mapped in `education/pilot-01/sources.md` |
| User-described allowance | **Unverified**: never shown, never implied |
| Video/audio spec, decode, bounds, intelligibility | `qa/checks.json`, `qa/ffprobe.json`, `qa/decode.log`, `qa/text-bounds.json` (0/450 violations), `qa/asr-intelligibility.json` (100 %) |

## Creative choices (not facts)
Tinku (original performer), the material-dissection lab, the "Hidden materials · 01" series tag,
the cut stroke, exploded view, stretchy-arm pour, tug-of-war metaphor and facility ✓/✗ cut-outs
(labelled illustration). Palette: cream/brown/metallic with icon orange #E8741C and green #1F6B3A.
Original 96 BPM synthesized cue. Voice: Piper `en_US-kristin-medium` (public-domain LibriVox
data), +7 % pitch/formant with tin resonance. Details in context 08/09.

## Provenance and adaptations
- Skill `.claude/skills/animation-direction/SKILL.md` was read and followed: storyboard first, a reusable rig
  in this workspace, anticipation/impact/recovery, props explaining cause and effect, a full render,
  boundary and contact-sheet inspection, ffprobe and a full decode. **Adapted**: a browser Three.js 3D
  character replaced the stickman for the dimensional lab look, and editorial labelled diagrams became
  3D-anchored chips. The skill's reference repositories were not fetched or run.
- Dependencies come only from official registries: three 0.186.1, @fontsource/baloo-2 5.3.0 (npm); piper-tts 1.8.0
  and vosk 0.3.45 (PyPI, in a scratch venv). Voice and ASR models were downloaded from Hugging Face and alphacephei
  and are not committed. No Blender, paid APIs, secrets or third-party scripts.
- Narration adaptation: L3 changed from "drinks" to "liquid" after ASR showed the TTS blurred
  "drinks soaking". L4 got a comma after "But" for a clearer onset.

## Exact commands (from `education/pilot-01/`)
```bash
npm ci
python3 audio/tts.py                      # re-treat committed takes (REGEN: --regen [--only L3], needs PIPER_BIN, PIPER_VOICE_DIR, VOSK_MODEL)
python3 audio/synth.py && python3 audio/mix.py build
node src/render.js video build/video-only-v3.mp4      # 688 s for 450 frames
ffmpeg -i build/video-only-v3.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart wastepaisa-education-pilot-01.mp4
VOSK_PY=<venv python> VOSK_MODEL=<vosk-model-en-us-0.22-lgraph> python3 tools/qa.py wastepaisa-education-pilot-01.mp4
node src/render.js sheet build/sheet && python3 tools/make_sheet.py build/sheet character/tinku-model-sheet.png
```
Or simply run `./build.sh`.

## Render and QA state
v1 → v2 → v3 full renders. Each review fixed real defects (see the iteration log in `qa/QA.md`).
v3 passes every automated check, and its boundary, representative and dense motion sheets were reviewed.

## Unresolved / limitations
No human listening test (cloud session); intelligibility comes from two ASR models. The beaker prop is
partly in frame at the bottom-right during the bond beat. English only. The Instagram references were not viewed.

## 10 s style test, batch 2026-11-02-pre-reset: COMPLETE
S11 paper-cut motion in Tinku's scrap shop (new source, new render; the 15 s pilot is untouched).
- Output: `videos/wastepaisa/tests/10s/pre-reset-2026-11-02/wastepaisa-10s-test.mp4`, SHA-256 `a7faf0e5e63745f93ca957908c9f62ee96fc85ab82e272f00f52d3e0bc590267`
- 10.000 s · 1080×1920 · H.264 30/1 · 300 frames (120 unique stepped 12 fps frames) · AAC-LC 48 kHz stereo 480000 samples · full decode clean
- Voice: Kokoro-82M ONNX, Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (not Piper). Narration unshortened.
- Captions y 350–466 / x 172–908, no overlaps; one ASR pass shows all words present (one inserted "and").
- QA: `tests/10s/pre-reset-2026-11-02/qa/QA.md`. Limits: no human listening test; stylised lining band; sprite-swap posing.
- Facts reused from pilot-01 sources S1–S5. Labelled illustration. No payout or allowance claims.

## Production round production-30s-2026-11-02: COMPLETE
- Output: `videos/wastepaisa/production/30s/2026-11-02/wastepaisa-30s-production-01.mp4`,
  SHA-256 `8269dd290355f045dbdef61077a0a1c158b8e97bf375ef8e20d43eff7bdf8057`
- 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo (1,440,000 samples) · clean decode ·
  −15.1 LUFS / −1.5 dBTP · caption ink y 354–466, x 196–884 · ASR: all script words recognised (mean 0.919, insertions only)
- Final script = approved draft verbatim. Kokoro Meshline blend. Paper-cut Motion (read-only).
- Durable format: `context/11-production-format.md`. Round record: `context/12-production-30s-01.md`. No automation created.
- Limits: no human listening test; sprite-swap posing; some board items briefly occluded when not narrated.

## Production batch production-30s-2026-11-02-batch-02: COMPLETE
- Topic: Why one aluminium can can become another can (new topic; 30s-01 preserved, its topic not reused).
- Output: `videos/wastepaisa/production/30s/2026-11-02-batch-02/wastepaisa-30s-production-02.mp4`,
  SHA-256 `263fa6beaf8b7e924d055c840a26eebd3cad8df22309e27b0ea5327f7f3c7a66`
- 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo (1,440,000 samples) · clean decode ·
  −15.0 LUFS / −1.4 dBTP · caption ink y 354–466, x 157–924 · ASR: every script word recognised (mean 0.933; homophone + SFX insertions)
- User feedback applied and saved in `context/11-production-format.md` (simplified mascot: cylinder, lid, eyes, two arms;
  distinct scene changes; no earnings promises). Round record: `context/13-production-30s-02.md`. No automation created.
- Limits: no human listening test; simplified illustrative machinery; 2D procedurally posed mascot.

## Feedback round 2026-11-02-feedback-round: COMPLETE
- Topic: what's inside an old cable and why sorting changes a buyer's assessment (value and selling focus). Style: "Scrap Shop X-ray".
- Output: `videos/wastepaisa/production/30s/2026-11-02-feedback-round/wastepaisa-30s-feedback-01.mp4`,
  SHA-256 `5ba25a0e08aab5da58b37e919736d0ca08c5a6a1beba8e179c68ccc7cf7d85a4`
- 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo · clean decode · −15.0 LUFS / −1.5 dBTP ·
  caption ink y 366–494, x 130–950 · timing within ±0.03 s · ASR misses are homophones or brand name only
- New rules and the exact style recipe are saved in `context/11-production-format.md`; episode record in `context/14-feedback-round-01.md`.
  The old batch-02 draft was not resubmitted. No automation.
- Limits: no human listening test; brief double-exposure in 0.3 s dissolves; the local review folder isn't reachable from cloud (delivered as an attachment).

## Round 02 (2026-11-03-round-02) episode 01: COMPLETE
- Topic: brass scrap in old taps and door handles (new topic; history checked). Style: accepted Scrap Shop X-ray, unchanged.
- Output: `videos/wastepaisa/production/30s/2026-11-03-round-02/wastepaisa-30s-round02-01.mp4`,
  SHA-256 `d887246283134860a03b6f167b5acb59e82eacc72d460e197af73fca515f5e4d`
- 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo · clean decode · −15.0 LUFS / −1.4 dBTP ·
  caption ink y 366–494, x 144–936 · timing within ±0.03 s · ASR mean 0.952 (brand OOV + "an/and")
- Feedback saved as the round-02 editorial emphasis update in `context/11-production-format.md`; episode record `context/15-round-02-01.md`. No automation.

## hindi-03 (2026-11-03-hindi-03) episode 01: COMPLETE (Hindi)
- **Topic:** a small aluminium scrap business (buy → sort → clean → aggregate → sell to a recycler; turnover vs profit).
  New topic, history checked. Style: accepted Scrap Shop X-ray, unchanged.
- **Language (latest user correction):** all narration and captions are natural Hindi in Devanagari.
  - Voice: Kokoro-82M native Hindi voices **hf_beta 0.7 + hm_omega 0.3**, `lang='hi'`, speed 1.15. The English-only
    voices were not used.
  - Font: Baloo 2 Devanagari faces; caption line spacing 84 px.
- **Output:** `videos/wastepaisa/production/30s/2026-11-03-hindi-03/wastepaisa-30s-hindi03-01.mp4`,
  SHA-256 `95e28ec88b4c94e0fee5e331ec3a37d8e1a0b5b2e2e6022edc1dddd8f13e22ec`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.5 dBTP.
- **Checks:**
  - Caption ink y 348–512, x 212–868.
  - Hindi ASR on the export (Vosk small-hi): mean 0.933. Near-homophone and window-start misses were resolved by shifted
    and constrained decoding; faster-whisper small was a second check.
- **Research:** prices are illustrative (मान लीजिए / उदाहरण) because dated rates conflict.
  - Sources: Kabadiwala Online, ScrapC and National Recycling (prices); CBIC 10/2019-CT and the 2024/2026 metal-scrap GST
    notifications (GST); Legal Metrology Act 2009.
  - Episode record: `context/16-hindi-03-01.md`. A Hindi-language note was added to context 11. No automation.
- **Exact commands:** see the output folder `README.md`.
- **Unresolved:**
  - No human listening test.
  - The 1 Nov 2026 GST changes come from secondary sources.
  - The Desktop review folder isn't reachable from the cloud (delivered as an attachment).

## hindi-04 (2026-11-04-hindi-04) episode 01: COMPLETE (Hindi)
- **Topic:** collect, grade and repair discarded wooden pallets for resale instead of selling broken timber by weight. New material and
  business model; history checked. Style: accepted Scrap Shop X-ray (hindi-03 renderer), unchanged.
- **Voice:** same cached Kokoro Hindi blend (hf_beta 0.7 + hm_omega 0.3, `hi`, speed 1.15).
  - Draft wording changed after ASR: छाँटिए dropped, नग → पीस, sentence-initial पैलेट avoided, and clearer line-final verbs.
- **Output:** `videos/wastepaisa/production/30s/2026-11-04-hindi-04/wastepaisa-30s-hindi04-01.mp4`,
  SHA-256 `f77fc826c997c0444791421e009e48698eb79c5f0e531214a0677e577e080446`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.1 LUFS / −1.5 dBTP.
- **Checks:**
  - Caption ink y 347–513, x 220–860.
  - Timing within ±0.07 s.
  - Vosk mean 0.912, with near-homophone misses confirmed by constrained decoding and Whisper. ASR-only: no listening possible in the cloud.
- **Research:**
  - Illustrative batch: 20 pallets ₹3,000 → turnover ₹6,000 → profit ₹500.
  - Prices: IndiaMART asking ranges for used pallets (per piece) and pallet scrap (per kg).
  - Repair method: USDA FPL/NWPCA 2022 LCA; ISO 18613:2014.
  - Rules: ISPM 15 (export re-treatment by authorised providers); CHEP notice (pooled pallets are not for sale).
  - Episode record: `context/17-hindi-04-01.md`. Pronunciation/SFX notes added to context 11. No automation.
- **One defect fixed after the first export:** SFX masking L3's last word were lowered (remix only).
- **Exact commands:** see the output folder `README.md`.

## feedback-05 (2026-11-05-feedback-05) episode 01: COMPLETE (Hindi)
- **Topic:** separate clean, dry corrugated cardboard from mixed and wet paper before sale (fresh topic, history checked).
  - Style: accepted Scrap Shop X-ray (hindi-04 renderer), unchanged.
  - Controlled opening test: buyer/margin question with the subject and two "₹ ?" buyer tags on screen from frame 0. The performance
    snapshot is treated as non-causal.
- **Output:** `videos/wastepaisa/production/30s/2026-11-05-feedback-05/wastepaisa-30s-feedback05-01.mp4`,
  SHA-256 `6d230558752620ed84a453bc52e2b3fbe477681d47d4ea244965b92e543aaff3`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.1 LUFS / −1.4 dBTP.
- **Checks:**
  - Caption ink y 347–513, x 220–860.
  - Timing within ±0.06 s.
  - Vosk mean 0.899, confirmed by constrained decoding and Whisper; L2's final "बाहर" is an ASR ambiguity. ASR-only: no listening
    possible in the cloud.
- **Research:**
  - Illustrative batch: 300 kg ₹1,800 → sales ₹3,000 → net ₹200; unsorted −₹240.
  - Grading rules: ReMA paper-stock guideline (12 % moisture; outthrows/prohibitives); CEPI EN 643 guideline (moisture above 10 % claimed
    back).
  - Prices: Indian indicative rates; US Oct 2026 OCC vs mixed-paper prices as context only.
  - Episode record: `context/18-feedback-05-01.md`. No automation.
- **Fixed:**
  - L5's spoken arithmetic omitted the purchase cost; it was rewritten, re-timed and re-rendered once.
  - SFX under L2's last word were lowered.
- **Exact commands:** see the output folder `README.md`.

## english-06 (2026-11-06-english-06) episode 01: COMPLETE (English)
- **Topic:** discarded coconut shells into charcoal briquettes: collect, dry, drum kiln, crush/starch/press, buyer, net margin. Fresh topic,
  history checked. Style: accepted Scrap Shop X-ray, unchanged.
- **Language override:** English narration and captions. Meshline voice (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98), fresh takes,
  no Hindi reuse. Captions use the accepted English 70 px line spacing.
- **Output:** `videos/wastepaisa/production/30s/2026-11-06-english-06/wastepaisa-30s-english06-01.mp4`,
  SHA-256 `e908962990b43c91a26982dc6577f186def28cd465f851c6d258c4a3ca9c8e25`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.4 dBTP.
- **Checks:**
  - Caption ink y 366–494, x 146–934.
  - Timing within ±0.03 s.
  - Vosk mean 0.948 (homophones and brand OOV); Whisper matches the script. ASR-only: no listening in the cloud.
- **Research:**
  - Process: Coconut Development Board shell-charcoal note (limited air, drum kiln, briquettes, 35 kg per 1,000 shells, 50 kg sacks,
    ₹10 lakh plant); FAO moisture guidance.
  - Prices: IndiaMART briquette asking ₹30/kg; Deccan Herald Aug 2026 Kerala shells up to ₹38/kg.
  - Illustrative batch: 10,000 shells → 350 kg → ₹10,500 → ≈₹1,500 left, "if shells come cheap" (break-even ≈₹2.8/kg).
  - Episode record: `context/19-english-06-01.md`. No automation.
- **Note:** no silent recap; English number phrases needed the time. The net result and spoken takeaway hold until the CTA.

## english-07 (2026-11-06-english-07) episode 01: COMPLETE (English)
- **Topic decision:** the suggested subject (collecting and sorting corrugated cardboard; clean dry vs wet mixed) duplicates feedback-05
  (context 18). Fresh subject chosen in the same genre: **collecting and sorting PET drink bottles for a recycler** (clear vs coloured,
  trash out / PET-share grade, crush for transport, illustrative batch).
- **Style and voice:** accepted Scrap Shop X-ray (english-06 renderer), unchanged. Meshline voice, fresh English takes; English captions
  at 70 px line spacing.
- **Output:** `videos/wastepaisa/production/30s/2026-11-06-english-07/wastepaisa-30s-english07-01.mp4`,
  SHA-256 `7b3dacf549d2a6165e5bceb8a35313047636deae3d8d5f7939318a09c3181936`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.4 dBTP.
- **Checks:**
  - Caption ink y 366–494, x 133–947.
  - Timing within ±0.06 s.
  - Vosk L1–L6 word-perfect (brand OOV only), mean 0.984; Whisper matches the script. ASR-only: no listening in the cloud.
- **Research:**
  - Grading: APR PET bale spec (Grade A ≥94 % PET).
  - Transport: EPA volume-to-weight (loose 30–40 vs compacted 515 lb/yd³).
  - Clear vs coloured: letsrecycle Oct 2026 (clear £250–350/t vs coloured −£50 to +£10/t).
  - Indian rates: kabadi ₹10–20/kg; B2B asking ₹25–70/kg.
  - Illustrative batch: 400 kg → ₹8,800 → ≈₹1,500 left.
  - Episode record: `context/20-english-07-01.md`. No automation.

## english-08 (2026-11-07-english-08) episode 01: COMPLETE (English)
- **Topic:** waste glass bottles into clean, colour-graded cullet for industrial buyers (fresh; history searched for glass, cullet and
  ceramics with no hits). Covers collection, colour separation, caps and ceramics out, why ceramics are rejected (they melt hotter and
  leave flaws), a professional processing plant, and an illustrative bulk batch.
- **Style and voice:** accepted Scrap Shop X-ray (english-07 renderer), unchanged. Meshline voice, fresh English takes; English
  captions at 70 px line spacing.
- **Output:** `videos/wastepaisa/production/30s/2026-11-07-english-08/wastepaisa-30s-english08-01.mp4`,
  SHA-256 `102a00f512d9614e3059f043b187198d3c2352cb27ebdaad37b22d3428d035a5`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.5 dBTP.
- **Checks:**
  - Caption ink y 366–494, x 95–985.
  - Timing within ±0.03 s.
  - Vosk mean 0.941: the rare term "cullet" and the brand are missed; everything else is word-perfect; Whisper agrees. ASR-only: no
    listening in the cloud.
- **Research:**
  - Ceramics: GMIC (Feb 2026) — ceramics melt hotter and cause inclusions; up to 5 % production loss.
  - Colour: PAS 101 (clear Grade A 4 % other colours); ASTM E708.
  - Prices: IndiaMART cullet ₹6–15/kg (Bengaluru clear ≈₹9/kg, May 2026).
  - Illustrative batch: 10 t → ₹90,000 → ≈₹10,000 left.
  - Episode record: `context/21-english-08-01.md`. No automation.
- **One defect fixed after the first export:** two chips overlapped at ≈10.3 s; they now hand off in one slot (video re-render only).

## english-09 (2026-11-08-english-09) episode 01: COMPLETE (English)
- **Topic:** old cotton garments into industrial wiping rags (fresh; history searched for textile, garment, cotton and rag with no
  hits). Covers an oil-drop absorbency hook, cotton vs all-synthetic, buttons and zips out, white/coloured grades, workshop cutting and
  baling, factory and garage buyers, and an illustrative batch.
- **Style and voice:** accepted Scrap Shop X-ray (english-08 renderer), unchanged. Meshline voice, fresh English takes; English
  captions at 70 px line spacing.
- **Output:** `videos/wastepaisa/production/30s/2026-11-08-english-09/wastepaisa-30s-english09-01.mp4`,
  SHA-256 `8eda170ddf097d8a1e907c42900ffd1257b70751f3a4b931d56552ea23598137`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.4 dBTP.
- **Checks:**
  - Caption ink y 366–494, x 134–947.
  - Timing within ±0.03 s.
  - Vosk mean 0.963 (homophones and brand OOV); Whisper matches apart from homophones. ASR-only: no listening in the cloud.
- **Research:**
  - Spec: US A-A-2522A wiping-rag defects (fittings, 100 % synthetic, unwashed); Louisiana statewide rag contract (clean, dry, no
    buttons or pins).
  - Grading: SMART (≈30 % of sorted textiles become wiping cloth).
  - Absorbency: Cotton Inc. (via Sciencing).
  - Prices: IndiaMART/TradeIndia rag asking prices (white ₹60–100, coloured ₹40–60/kg); used-clothing ₹2–6/kg kabadi, ₹10–35/kg bulk.
  - Illustrative batch: 500 kg → 300 kg rags → ₹13,500 → ≈₹2,500 left.
  - Episode record: `context/22-english-09-01.md`. No automation.
- **Fixed before the full render:** floating heap (tray added), BALES/GARAGES chip overlap, and the missing reject-pile prop.

## english-10 (2026-11-09-english-10) episode 01: COMPLETE (English)
- **Topic:** collect used cardboard boxes and resell the intact ones as boxes before pulping the damaged ones. Not a duplicate of
  feedback-05, which graded scrap cardboard for pulping (moisture deduction, contamination downgrade); this episode is reuse before
  scrap. Covers a kilo-scale vs resale-shelf hook, dry storage (damp boxes lose strength and go to scrap), size grading with old labels
  and tape removed, repeat buyers (movers, online sellers), and an illustrative resale + scrap batch.
- **Style and voice:** accepted Scrap Shop X-ray (english-09 renderer), unchanged. Meshline voice, fresh English takes; English
  captions at 70 px line spacing.
- **Output:** `videos/wastepaisa/production/30s/2026-11-09-english-10/wastepaisa-30s-english10-01.mp4`,
  SHA-256 `192b926ebe8f9c97da90381d15409ab2792ee07bd1907fbf1424297ecd2e07bf`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.5 dBTP.
- **Checks:**
  - Caption ink y 366–494, x 120–960.
  - Timing within ±0.06 s.
  - Vosk mean 0.971 (L1 missed an unstressed "a"; brand OOV); Whisper matches word for word apart from the brand spelling. ASR-only:
    no listening in the cloud.
- **Research:**
  - Reuse: US EPA waste hierarchy (reuse above recycling); UPS packaging guidelines (remove old labels and markings on a reused box);
    Packaging World / MoveBuddha on the used-box resale model (moving and shipping boxes).
  - Moisture: Clemson thesis (Brown 2019) and Georgia Tech note: compression strength falls as humidity rises.
  - Prices: used boxes ₹5–20 per piece (IndiaMART Indore; other traders up to ₹58), marketplace ₹6–10; carton scrap ₹8–14/kg
    (Delhi household) and ₹14–20/kg (Chennai).
  - Illustrative batch: 1,000 boxes → 600 resold × ₹12 + 200 kg rejects × ₹10 = ₹9,200 → ≈₹2,500 left.
  - Episode record: `context/23-english-10-01.md`. No automation.
- **Fixes:** box stacks merged into blocks (seams added); the truck duplicated the MOVERS chip (now mini boxes); after the first full
  render the L2 caption reached x 88.7–991.3, so L2 was split into three groups at ASR onsets and the video re-rendered and re-muxed.

## english-11 (2026-11-09-english-11) episode 01: COMPLETE (English)
- **Topic:** used cooking oil collected for licensed processing (fresh; history searched for cooking oil, RUCO, biodiesel and frying,
  with only a hindi-03 GST note as a hit). Covers a polar-compound X-ray hook (never back into food), cool → labelled can with headspace,
  authorised collector check and pickup log, aggregation (one van trip vs one route for twenty kitchens), and a licensed biodiesel plant.
- **Style and voice:** accepted Scrap Shop X-ray (english-10 renderer), unchanged. Meshline voice, fresh English takes; English captions
  at 70 px line spacing. New tool: optional `ph_sub` phoneme replacement in `tts.py` ("liters" with a clear /t/).
- **Output:** `videos/wastepaisa/production/30s/2026-11-09-english-11/wastepaisa-30s-english11-01.mp4`,
  SHA-256 `f32b05c2d68d7b2e0c984d9f8b2a5bffd84667368cf7b3682aa51561ed695841`
- **Specs:**
  - 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames.
  - AAC-LC 48 kHz stereo (1,440,000 samples).
  - Clean decode · −15.0 LUFS / −1.5 dBTP.
- **Checks:**
  - Caption ink y 366.5–493.5, x 175.5–904.5.
  - Timing within ±0.03 s.
  - Vosk mean 0.971 (homophone "for", brand OOV); Whisper matches word for word apart from the brand spelling. ASR-only: no listening
    in the cloud.
- **Research:**
  - FSSAI Guidance Note 06/2018 (read in full): TPC ≤ 25 %, cool, separate labelled container with headspace, authorised aggregators only,
    records above 50 L/day, FBOs must not buy UCO.
  - FSSAI direction of 30 Jan 2019 (via reports); FSSAI-hosted RUCO explainer (plants make biodiesel); PIB 2019 OMC EOI for UCO
    biodiesel; Goa UCO policy 2026 (traceability).
  - Costs: Tata Ace hire ₹1,900–2,300 for 5–6 h; ≈₹2,000 per short trip.
  - Illustrative route: ₹2,000 ÷ 25 L = ₹80/L vs ₹2,000 ÷ 500 L = ₹4/L. No earnings or oil prices stated.
  - Episode record: `context/24-english-11-01.md`. No automation.
- **Fixed:** "liters" heard as "leaders" (phoneme override); result tickets too narrow (width option); stamp over the REG. No. line;
  map under the results not dim enough (darkened, re-rendered and re-muxed).

## english-12 (2026-11-11-english-12) episode 01: COMPLETE (English) — first episode under the 2026-11-11 Published-apps rules
- **Topic:** the proposed "sorted aluminium offcuts vs a mixed bag" duplicated hindi-03 (aluminium sort-clean-aggregate, "clean bulk
  gets a better rate"), so a fresh subject with the same story was made: stainless steel offcuts sorted by grade (same weight,
  different value; magnet can't separate 200 from 300 series; nickel; one grade per sack; buyers who test pay for proven grade and volume).
- **Rules applied:** saved in `11-production-format.md` ("PUBLISHED-APPS FEEDBACK RULES (2026-11-11)"). Theory-of-Marketing structure,
  CTA at 27–30 s, captions centred at x 500 inside x 100–900, large brief labels, key light + depth-push transitions, separate thumbnail.
- **Output:** `videos/wastepaisa/production/30s/2026-11-11-english-12/wastepaisa-30s-english12-01.mp4`,
  SHA-256 `43feaae9f472e68ae85e5c25ce7e9dc3ff3ae575729a2e5fe924b01af74f75b6`; thumbnail `wastepaisa-30s-english12-01-thumbnail.png`.
- **Specs:** 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo (1,440,000 samples) · clean decode ·
  −15.0 LUFS / −1.4 dBTP · no clipping.
- **Checks:** caption ink x 134–866, y 343–517; timing within ±0.03 s; Vosk 1.00 on every content line (mean 0.986, brand OOV); Whisper
  word for word apart from the brand. ASR and meters only: no listening in the cloud.
- **Research:** ASSDA (304 8.0–10.5 % Ni; CrMn grades non-magnetic and hard to tell from 304; offcuts worth less; XRF or drop tests);
  BigMint 1 May 2026 (304 ₹138,000/t DAP Delhi, utensil scrap ₹71,000/t) and 16 Oct 2026 (304 ₹148,000/t Delhi); Kabadiwala Online
  household stainless ₹60–90/kg. Illustrative 500 kg lot: ₹69,000 gross − buying ₹55,000 (assumed ₹110/kg) − sorting ₹1,500 − transport
  ₹5,000 ≈ ₹7,500. Episode record: `context/25-english-12-01.md`. No automation.
- **Instagram reference:** only page metadata could be read (dexter_zee1, "Make Money ! From Hair ??!!", 5 Nov 2026); the video was not viewed.

## english-13 (2026-11-13-english-13) episode 01: COMPLETE (English)
- **Topic:** the proposed "Why cardboard buyers care about air in your load" was already covered (english-07 taught "loose bottles are
  mostly air, and air costs transport" with loose-vs-baled trucks; feedback-05 graded clean dry cardboard; english-11 spread trip cost
  over volume). Replacement with the same story criteria: steel scrap grades (thick, clean pieces vs thin, rusty sheet; furnace yield;
  same truck and trip cost, different gross). Coir pith, human hair and sort-heavy-from-light iron were checked and set aside (notes).
- **Rules:** the 2026-11-11 Published-apps rules (context 11) applied unchanged: Theory-of-Marketing structure, CTA 27–30 s, captions
  centred at x 500 inside x 100–900, large brief labels, key light + depth-push transitions, separate thumbnail ("THICK BEATS THIN.").
- **Output:** `videos/wastepaisa/production/30s/2026-11-13-english-13/wastepaisa-30s-english13-01.mp4`,
  SHA-256 `876b9d37d5bfd994f201fd1ea74d5c34408749afe9710f18f72af164767db152`; thumbnail `wastepaisa-30s-english13-01-thumbnail.png`.
- **Specs:** 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo (1,440,000 samples) · clean decode ·
  −15.0 LUFS / −1.5 dBTP · no clipping.
- **Checks:** caption ink x 135.5–864.5, y 366–494; timing within ±0.03 s; Vosk mean 0.954 ("thin"→"then" on the export only, plural
  "punchings", brand OOV); Whisper matches the script apart from the brand. ASR and meters only: no listening in the cloud.
- **Research:** Jalna mill card 13 Nov 2026 (punching ₹39,500/t … light melting ₹31,500/t, ex GST, via Steel Baba); Steel Dynamics
  scrap inspection spec 20 Aug 2026 (#1 heavy melt ≥ ¼", free of dirt; downgrade rule); Midrex 2020 (low-density and rusty scrap yield
  less); IspatGuru (punchings clean, high yield). Same-truck example: ₹39,500 vs ₹31,500 gross, same ₹3,700 trip + sorting, ₹8,000/t
  apart; no buying price or profit assumed. Episode record: `context/26-english-13-01.md`. No automation.

## english-14 (2026-11-14-english-14) episode 01: COMPLETE (English)
- **Topic:** the proposed "Why clear plastic can earn more than a mixed-color pile" was already english-07 (clear vs coloured PET, PET-share
  grading, crushing, cost example). Replacement with the same story criteria: the household hard-plastic pile, sorted by density in water
  (PE/PP float; PVC/PET sink) and by stamped resin code (2 = HDPE, 5 = PP); buyer caps and refusals; sorted vs mixed rates; costs.
- **Rules:** the 2026-11-11 Published-apps rules (context 11) applied unchanged; thumbnail "FLOAT OR SINK?".
- **Output:** `videos/wastepaisa/production/30s/2026-11-14-english-14/wastepaisa-30s-english14-01.mp4`,
  SHA-256 `404889204bad3c8859d2ad653c269b8ad875b57ce620d4c87188a888081143dd`; thumbnail `wastepaisa-30s-english14-01-thumbnail.png`.
- **Specs:** 30.000 s · 1080×1920 · H.264 yuv420p 30/1 · 900 frames · AAC-LC 48 kHz stereo (1,440,000 samples) · clean decode ·
  −15.0 LUFS / −1.4 dBTP · no clipping.
- **Checks:** caption ink x 135.5–864.5, y 366–494; timing within ±0.03 s; Vosk mean 0.925 (pronunciation merges also on the raw voice,
  brand OOV); Whisper matches except "stamped" heard as "stamp". ASR and meters only: no listening in the cloud.
- **Research:** LibreTexts densities (PP 0.90–0.92, HDPE 0.94–0.96, PET 1.35–1.38, PVC 1.32–1.42); Herbold sink-float tanks (PE/PP float,
  PET/PVC sink); APR model bale specs (PVC excluded, metal not allowed, other plastics capped); Scrapo index Nov 2026 (HDPE ₹70.69, PP
  ₹63.15, PVC ₹37.70 per kg, median asking); Kabadiwala Online hard plastic ₹15–30/kg. Illustrative costs ≈₹6/kg sorting+cleaning and
  ≈₹6/kg transport; no profit claimed. Episode record: `context/27-english-14-01.md`. No automation.
- **Fixed during QA:** empty first frame, overlapping density labels, bags at the right edge, hidden GAP label, a near-empty rates beat,
  and a bar accidentally disabled by an edit (caught in frame review, re-rendered).

## Next action
User review of pilot 01. If approved, research and claim-map episode 02 ("The magnet test")
from the list in context 08, reusing the rig, lab and audio pipeline with new staging. Make no app posts
until the user asks for one.
