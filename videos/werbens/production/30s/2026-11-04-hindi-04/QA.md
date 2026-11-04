# QA — Werbens Hindi 04 30 s #01 "एक ईमानदार पहले/बाद का शॉट" (final export = render 1 after 3 stills passes)

**File:** `videos/werbens/production/30s/2026-11-04-hindi-04/werbens-30s-hindi04-01.mp4`
**sha256:** `4bd762b497e200817d900a5113366b67157399a0eca4775a568e9efcdb1595ae` · 6,594,804 bytes · checked 2026-11-04

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
- Voice: Kokoro-82M Hindi voice pack **hf_alpha** (accepted Hindi pipeline, not the English blend), speed 1.22, eSpeak NG 1.51
  `-v hi` G2P + misaki mapping; spoken-only respellings "-इये" glides and लिंट→लिन्ट (context/19 §4). No numbers/dates/currency.
- **Listening limitation (explicit):** no human listening is possible in this environment; intelligibility is verified by
  Hindi ASR only (Whisper large-v3-turbo, language=hindi) on the **final MP4**: L1 8/8 · L2 9/12 · L3 8/10 · L4 8/8 · L5 9/10 ·
  L6 11/12 · L7 6/9 → **59/69** (identical to the clean narration → the mix masks nothing). Misses are spelling or glide
  variants: काल्पनिक→कालपनिक, रोओं→रों, दिखाइए→दिखाए, चलाइए→चलाई, रोशनी→रोश्णी, रोएँ→रोए, करें→करे, ब्रांड्स→ब्रांस, समझिए→समझे.
- Narration on air (voice stem): L1 0.33–3.36 · L2 3.88–8.17 · L3 8.83–12.02 · L4 13.03–15.34 · L5 16.23–19.02 ·
  L6 20.03–24.19 · L7 26.03–29.30 s (within 0.05 s of plan). CTA line + logo tile 25.6–30 s (last ~4 s).
- Caption groups (`src/words_hi.mjs`, change at measured pauses): L1 0.23–3.76 · L2 3.78–5.86 / 5.88–8.71 · L3 8.73–12.60 ·
  L4 12.93–15.91 · L5 16.13–19.61 · L6 19.93–21.65 / 21.67–24.79 · L7 25.93–30 s.
- Audio: −14.9 LUFS integrated, true peak −4.7 dBTP, LRA 2.6 LU, flat factor 0. Accepted balance kept (voice ×0.82; music
  −31.5 LUFS stem; foley −31.3 LUFS); 7 held pads + 19 event notes, no loops.

## 3. Devanagari rendering, captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- Noto Sans Devanagari 700/800 (OFL): conjuncts (प्रीमियम, क्वालिटी, स्वेटर, ब्रांड्स), nukta (फ़्रेम, फ़र्क़, ख़ुद, बिज़नेस,
  फ़िल्टर) and chandrabindu (रोएँ) render correctly — no missing-glyph boxes (f079, f389, f653, f899).
- 900 samples (every frame): caption line boxes y 354–502 (inside 340–520), x 190–890 (inside 90–990), max 2 lines; pill
  y 346–514. Labels (chip, पहले/बाद में, सबूत, three rule notes, lockup, tagline): x 217–834, y 550–1540; nothing in y 0–300;
  0 under the caption pill; 0 overlaps; 0 frames outside x 80–1000 / y ≤ 1560. PASS.

## 4. Brand (context/17, re-checked 2026-11-04)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (byte-identical, sha256 816c1761…). CTA tile face =
  the logo SVG drawn unlit; wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f790, f899).

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 33 beats)
- Each line moves something physical: adjective tiles land and change nothing (lint puffs and settles) → words slide off,
  roller rolls in, viewfinder + "पहले", shutter → frame pulses on "फ़्रेम"/"रोशनी", one roller pass over the right half (lint
  hops onto the roll) → divider + "पहले"/"बाद में" in the same frame → lint-covered sheet turned to camera, "सबूत" → three
  rule notes on their words, filter pane slides over the clean half and is pulled away with ✕ → logo tile + wordmark.
  No static page, no camera bobbing.
- Beats checked: f0, f22, f35, f47, f79, f120, f150, f180, f232, f281, f304, f320, f340, f365, f380, f389, f391, f412, f435,
  f486, f520, f555, f590, f653, f677, f702, f712, f723, f750, f768, f779, f790, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| G2P | लिंट lost its [n] (lĩʈ); फ्रेम aspirated (pʰ) | spoken respelling लिन्ट; script spelling फ़्रेम |
| stills 1 | proof close-up cropped the roll at both edges; rule notes too small for the takeaway | proof camera pulled back; rules 46 px mint notes |
| stills 2 | lifted roller's handle swung toward the caption corner | 0.55 rad yaw + less tilt during the lift |

## 7. Remaining limitations (honest)
- ASR-only intelligibility (no human listener); Kokoro's Hindi packs are lower-graded than its English voices.
- Word-level caption brightening inside a phrase is estimated from phoneme counts; phrase boundaries follow measured pauses.
- ASCI's 2021 influencer-guideline filter clause was reachable only via secondary reports, so the "no filter" rule cites the
  UK ASA/CAP primary guidance plus ASCI Code Chapter I instead.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
