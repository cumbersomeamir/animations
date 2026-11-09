# QA — Werbens English-11 30 s #01 "24 jams? Or just 6?" (final export = render 1 after 3 stills passes)

**File:** `videos/werbens/production/30s/2026-11-09-english-11/werbens-30s-english11-01.mp4`
**sha256:** `37dc50819ec3f514055be7fa60f6e22c6e991efa4d189e582d384097e880d256` · 4,746,868 bytes · checked 2026-11-09

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
- Voice: the accepted Meshline/Recall host (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
  synthesised; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz; general rhotic ɜː → ɜɹ; "zero" → zˈɪɹoʊ.
- Final-mix ASR (Whisper base.en): whole-mix transcript = the script word for word, except "Werbens" ("Wurbens", the
  documented vocabulary limit — the name is spelled on screen). Per-line windows: L1 3/3 · L2 16/16 · L3 12/12 · L4 10/10 ·
  L5 14/14 · L6 8/8 · L7 6/7 → 69/70.
- Narration on air (voice stem): L1 0.33–2.16 · L2 2.63–8.91 · L3 9.38–13.56 · L4 14.03–17.66 · L5 18.18–22.21 ·
  L6 22.68–25.21 · L7 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.9 s).
- Caption groups: L1 0.23–2.51 · L2 2.53–5.43 / 5.45–9.26 · L3 9.28–11.24 / 11.26–13.55 · L4 13.93–14.93 / 14.95–18.06 ·
  L5 18.08–19.83 / 19.85–22.56 · L6 22.58–25.82 · L7 26.03–29.24 s; each word brightens at its onset.
- Audio: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 3.0 LU, flat factor 0. Voice stem −20.6 LUFS (accepted
  English −20.9), music stem −31.4 LUFS (quiet, ducked −10 dB under speech), foley −33.6 LUFS; 6 held pads + 15 event notes,
  no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 163–917 (inside 90–990), max 2 lines; pill y 353–507.
  Labels (three source chips, wordmark, tagline): x 137–943, y 530–1456; nothing in y 0–300; 0 under the caption pill;
  0 overlaps; 0 outside x 80–1000 / y ≤ 1560. PASS.
- "&", "·", digits and the sign text ("FOR CHEESE BOARDS" auto-fitted) render correctly in Inter (f061, f288, f396, f716).

## 4. Brand (context/17, re-checked 2026-11-09)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 28 beats)
- Hook on frame 0: jam pots already raining onto the three-tier stand; "24" tag at 1.1 s; six pots onto the small stand and
  "6" tag by 2.2 s. Then: chip 1 → basket in, to the six-jam table, a pot hops in → chip 2, scale drops in tipped to 6 →
  levels on "nearly zero" → chip 3, tips again on "overload grows", pots jumble on "hard to compare" → pots sort into three
  groups, one per tier → blank signs → "FOR KIDS" / "FOR CHEESE BOARDS" / "FOR BAKING" on the spoken words → logo tile +
  wordmark. No static page, no camera bobbing; no empty transition frames.
- Beats checked: f0, f4, f15, f28, f52, f61, f88, f128, f188, f212, f267, f288, f377, f396, f421, f463, f493, f537, f599,
  f623, f626, f698, f716, f743, f773, f788, f803, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| topic | suggested "feature list vs customer outcome" topic duplicates #01 (and was already set aside for english-09) | replaced with choice overload (context/08 idea 8) |
| voice | "zero" read zˈiəɹoʊ; the weak "or" in "24 jams, or (just) 6?" heard as "are" | phoneme override; hook split into two questions |
| timing | L2 overlapped L3; 4 s gap before the CTA | re-spaced; concrete example line L6 ("Like: for kids, for cheese boards, for baking.") |
| stills 1 | group signs hidden behind the pots on the tier below; balance scale dropped from high through the caption band | taller tiers, signs placed high on each riser; shorter drop |
| stills 2 | wide shot clipped the big stand's left end; tier "lift" highlight covered the sign above; scale still crossed the source chip | wider, centred framing; highlight changed to a swell; drop shortened again |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The scale and basket show only the direction and the levelling described in the abstracts; no study values (purchase rates,
  effect sizes) are spoken or shown. The grouping advice is a practical technique derived from the moderators, not a measured
  effect.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
