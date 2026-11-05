# QA — Werbens feedback-05 Hindi 30 s #01 "एक प्रोडक्ट, एक कीमत, एक काम" (final export = render 1 after 2 stills passes)

**File:** `videos/werbens/production/30s/2026-11-05-feedback-05/werbens-30s-feedback05-01.mp4`
**sha256:** `394bfb4ddfc4c9389db7755916af3a8003ce62f2b5c2ceb80d71d4d9f4d24132` · 5,187,967 bytes · checked 2026-11-05

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~194 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Hindi narration, intelligibility and caption timing (`qa/asr-narration.json`, `qa/asr-hi-final.json`)
- Voice: accepted Hindi voice (Kokoro-82M hf_alpha, speed 1.22, eSpeak NG hi + misaki mapping); the English Meshline/Recall
  blend cannot speak Hindi and is not used. Respellings + explicit price wording in context/20 §4.
- **Listening limitation (explicit):** no human listening in this environment; verified by Hindi ASR only (Whisper
  large-v3-turbo, language=hindi; digits accepted for "दो सौ पचास" → "250"). Final MP4: L1 6/8 · L2 8/9 · L3 8/9 · L4 6/7 ·
  L5 5/7 · L6 10/14 · L7 6/9 · L8 9/9 → **58/72** (clean narration 59/72; the difference is ASR tokenisation — "नियम याद" heard
  as one token "नियम्याद" in L7 — not masking). The price is recovered exactly ("250 रुपिये"); misses are spelling variants
  (विज्यापन, और्डर, दीसरी, थसाथस, ब्रान, बिक्या).
- Narration on air (voice stem): L1 0.33–2.95 · L2 3.43–7.41 · L3 7.93–10.88 · L4 11.38–13.94 · L5 14.43–16.69 ·
  L6 17.23–21.93 · L7 22.43–25.60 · L8 26.13–28.72 s (≤ 0.06 s from plan). CTA line + logo tile 25.95–30 s.
- Caption groups (word ranges verified against word counts; phrase spans pinned for L1/L4/L6/L7): L1 0.24–3.31 · L2 3.33–5.68 /
  5.70–7.81 · L3 7.83–9.16 / 9.18–11.26 · L4 11.28–14.31 · L5 14.33–17.11 · L6 17.13–18.86 / 18.88–22.26 · L7 22.33–26.01 ·
  L8 26.03–30 s.
- Audio: −14.9 LUFS integrated, true peak −4.4 dBTP, LRA 1.3 LU, flat factor 0. Music quiet under speech (stem −31.7 LUFS,
  ducked −10 dB; voice ×0.82 as accepted); 8 held pads + 16 event notes, no loops.

## 3. Devanagari rendering, captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- Noto Sans Devanagari 700/800: conjuncts (प्रीमियम, रेस्टोरेंट, विज्ञापन, प्रोडक्ट, ब्रांड), nukta (फ़ोटो, साफ़, फ़ॉलो, चीज़ें), rupee
  sign ₹ and drawn stars render correctly — no missing-glyph boxes (f066, f362, f710, f899).
- 900 samples: caption line boxes y 354–502 (inside 340–520), x 172–908 (inside 90–990), max 2 lines; pill y 346–514.
  Labels (gaze chip, "?", badges 1–3, rule labels, lockup, tagline): x 245–984, y 550–1460; nothing in y 0–300; 0 under the
  caption pill; 0 overlaps; 0 frames outside x 80–1000 / y ≤ 1560. PASS.

## 4. Brand (context/17, re-checked 2026-11-05)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f790, f816, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 29 beats)
- Hook in frame 1–2: "शाही" sticker slaps onto the ad at 0.05 s, five more by 2.25 s. Then: more stickers + wobble → peel-off
  on "अब" → slots 1·2·3 → thali slides in → shutter, photo slot shows the same thali (render target) → ₹250 stamps → button
  pops and is pressed → cluttered copy + illustrative gaze paths, brand header dims on "ब्रांड" → badges/labels on "एक प्रोडक्ट /
  एक कीमत / एक काम" → logo tile + wordmark. No static page, no camera bobbing.
- Beats checked: f0, f3, f15, f45, f66, f75, f108, f180, f200, f238, f255, f285, f315, f362, f382, f459, f479, f525, f552,
  f609, f645, f675, f710, f729, f753, f780, f790, f816, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| voice | "ढाई सौ रुपये" heard as "धाई सो रुपिये" (price unclear) | explicit "दो सौ पचास रुपये" (ASR: "250 रुपिये") |
| G2P | रेस्टोरेंट / ट्रैकिंग lost their [n] | spoken respellings रेस्टोरेन्ट / ट्रैकिन्ग |
| timing | Kokoro skipped some comma pauses; stop closures faked gaps → wrong phrase splits (L1, L4, L6, L7) | phrase spans pinned from the measured chunks |
| stills 1 | L6 "गया" and L8 "करें" missing (caption ranges one short); chip on top of the ad header; rule labels over the ₹250 tag | ranges fixed + checked against word counts; chip dropped (header says "काल्पनिक रसोई"); labels placed right of each element |

## 7. Remaining limitations (honest)
- ASR-only intelligibility (no human listener); Kokoro's Hindi packs are lower-graded than its English voices.
- The gaze paths are an illustration of the study's idea, labelled "नज़र का रास्ता: सिर्फ़ उदाहरण" — not data from the study.
- The performance snapshot in the brief is recorded but not used as evidence of what works (no causal claim).
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
