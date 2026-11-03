# QA — Werbens Hindi 03 30 s #01 "विशेषण नहीं, सबूत दिखाइए" (final export = render 1 after 3 stills passes)

**File:** `videos/werbens/production/30s/2026-11-03-hindi-03/werbens-30s-hindi03-01.mp4`
**sha256:** `f8cd2e428fb37f1f2aca6b4c67f47e0241e024d6073b1512c0c3c7f4957d6f4b` · 3,973,320 bytes · checked 2026-11-03

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Hindi narration, intelligibility and caption timing (`qa/asr-narration.json`, `qa/asr-hi-mix.json`, `qa/asr-hi-final.json`)
- Voice: Kokoro-82M Hindi voice pack **hf_alpha** (not the English blend), speed 1.22, eSpeak NG 1.51 `-v hi` G2P with the
  misaki mapping; spoken-only "-इये" respellings (context/18 §3). No numbers, dates or currency are spoken.
- "Listening" by Hindi ASR (Whisper large-v3-turbo, language=hindi) on the **final MP4**: L1 6/7 · L2 7/7 · L3 4/7 · L4 9/12 ·
  L5 8/8 · L6 12/14 · L7 5/5 · L8 6/9 → **57/69** (same as the clean narration, 57/69 → the mix masks nothing). Misses are
  spelling variants or near-homophones: शानदार→शांदार, नॉन-स्टिक→नॉन्स्टिक, लीजिए→लीजे, के→की, बनाइए/झुकाइए/दिखाइए→बनाए/जुकाए/दिखाए,
  विशेषण→विशेशन, करें→करे, ब्रांड्स→ब्रांस, समझिए→समझे. Every line's meaning is recovered. No human listening was possible here.
- Narration on air (voice stem): L1 0.33–3.09 · L2 3.58–6.48 · L3 6.98–9.28 · L4 9.83–13.98 · L5 14.47–17.31 ·
  L6 17.83–22.72 · L7 23.23–25.02 · L8 26.03–29.30 s (within 0.06 s of the planned slots). CTA line + logo tile 25.6–30 s.
- Caption groups (from `src/words_hi.mjs`, change at measured pauses): L1 0.24–3.46 · L2 3.48–6.86 · L3 6.88–9.71 ·
  L4 9.73–11.41 / 11.43–14.36 · L5 14.38–17.71 · L6 17.73–20.01 / 20.03–21.78 / 21.80–23.11 · L7 23.13–25.61 · L8 25.93–30 s.
- Audio: −14.9 LUFS integrated, true peak −3.4 dBTP (≤ −1), LRA 1.6 LU, flat factor 0 (no clipping). Voice gain ×0.82 keeps
  the accepted voice/music/foley ratios (Hindi stem −16.3 LUFS vs English −20.9); score = 8 held pads + 20 event notes, no loops.

## 3. Devanagari rendering, captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- Fonts: Noto Sans Devanagari 700/800 (OFL) with unicode-range; frames show correct conjuncts (ब्रांड्स, झुकाइए, विज्ञापन-style
  clusters), nukta (मज़बूत, फ़ॉलो) and chandrabindu (आँखों, दिखाऊँ) — no missing-glyph boxes (f405, f612, f899).
- 900 samples (every frame). Caption line boxes y 354–502 (inside 340–520), x 232–848 (inside 90–990), max 2 lines; pill
  y 346–514. PASS.
- Labels (chip, tag, notes, record label, lockup, tagline): x 100–984, y 550–1458; nothing in y 0–300; 0 under the caption
  pill; 0 label/label overlaps; 0 frames outside x 80–1000 / y ≤ 1560. PASS.

## 4. Brand (context/17 — app.werbens.com)
- CTA tile face = `assets/brand/app-werbens-logo.svg` (verbatim copy of app.werbens.com's logo) drawn unlit (#7FE7DC field,
  #316879 W); wordmark "Werbens" in Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 gradient (f790, f899).
- Palette in `src/scene.html`/`scene.js`: #316879, #7FE7DC, #5CE0D2, #0F172A, #F0FDFA, #0B1120, #64748B. The violet Play icon
  and the round-02 palette are not used in this episode (latest brief).

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 34 beats)
- Every line moves a physical object: tile drop + wobble ("साबित") → side fly-ins stack into a wall that hides the product →
  topple + hood off on "अब" → tawa/plate/tag → "बिना तेल", batter spreads and browns, tilt on "झुकाइए", slide + plate drop on
  "फिसल जाता है" → push-in + glow on "याद" → adjective tag lights up, question note, viewfinder + record, replay → mock-up falls
  flat on "असली" ("नकली") + "असली टेस्ट" → props off, logo tile, wordmark. No static page, no camera bobbing.
- Beats checked: f0, f22, f65, f112, f130, f166, f210, f230, f239, f266, f300, f330, f350, f365, f383, f405, f425, f450, f493,
  f540, f566, f590, f612, f650, f665, f682, f698, f718, f733, f738, f766, f779, f790, f899.

## 6. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| voice | hf_beta less intelligible (58/74 vs 63/74); speed 0.98 → 31.7 s of speech | hf_alpha; script 72→67 words; speed 1.22 (equal ASR to 1.15) |
| voice | "-इए" verbs heard as "-ए" | spoken respelling "-इये" (glide); captions keep standard spelling |
| G2P | kokoro-js' eSpeak WASM has no Hindi data | Ubuntu `espeak-ng` 1.51 + misaki EspeakG2P mapping; all IPA in Kokoro vocab (checked) |
| stills 1 | tawa handle off-frame; fallen word tiles cluttering the demo; tiles would fall through the caption band; "?" on the wall; hook objects small | stage re-laid out (smaller pan/plate, handle angled back); words fly in from the sides and slide out of frame; "?" beside the wall; closer hook camera |
| stills 2 | inline comment swallowed `doubt/q/wallWobble` keys (page error) | comment moved to its own line |
| mix | Hindi stem 4.6 dB hotter than the accepted English voice | voice gain ×0.82 |

## 7. Remaining limitations (honest)
- Synthetic Hindi (Kokoro's Hindi packs are lower-graded than its English voices); intelligibility measured by ASR only.
- Word-level caption brightening inside a phrase is estimated from phoneme counts (no Hindi word-timestamp model offline);
  phrase boundaries follow measured pauses.
- The worker restarted once after the render finished; the build artefacts were intact and the export was made from them.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
