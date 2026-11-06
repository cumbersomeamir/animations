# QA — Werbens English-07 30 s #01 "Is a 320-rupee sandwich expensive?" (final export = render 1 after 5 stills passes)

**File:** `videos/werbens/production/30s/2026-11-06-english-07/werbens-30s-english07-01.mp4`
**sha256:** `7539a8ec2ccbf16fddf4bc3b827e3a18188cd0eef1b493758eb00657e4dfe19a` · 4,174,155 bytes · checked 2026-11-06

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~194 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
- Voice: the accepted Meshline/Recall host (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
  synthesised; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz; hyphenated prices split ("320 rupee");
  stressed "was".
- Final-mix ASR (Whisper base.en): **whole-mix transcript is word-for-word the script** except "Werbens" ("Wurbans"; the
  documented Whisper vocabulary limit — the name is spelled on screen). Per-line windows: L1 4/5 (heard "320-roopy" — a
  spelling of the same sound; the whole-mix pass and the clean narration pass both write "rupee") · L2 7/7 · L3 11/11 ·
  L4 8/8 · L5 17/17 · L6 14/15 (heard "a was price"; the miss is only the quote marks around 'was' in the scoring) · L7 6/7
  → 67/70.
- Narration on air (voice stem): L1 0.33–2.94 · L2 3.48–6.80 · L3 7.28–11.21 · L4 11.68–14.27 · L5 14.73–20.99 ·
  L6 21.43–25.49 · L7 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.9 s).
- Caption groups: L1 0.23–3.36 · L2 3.38–5.70 / 5.72–7.16 · L3 7.18–10.14 / 10.16–11.56 · L4 11.58–12.60 / 12.62–14.61 ·
  L5 14.63–16.47 / 16.49–18.48 / 18.50–21.08 · L6 21.33–23.95 / 23.97–26.01 · L7 26.03–29.24 s; each word brightens at its onset.
- Audio: −15.0 LUFS integrated, true peak −1.5 dBTP, LRA 2.7 LU, flat factor 0. Voice stem −20.9 LUFS (accepted English −20.9),
  music stem −31.6 LUFS (quiet, ducked −10 dB under speech), foley −31.0 LUFS; 7 held pads + 16 event notes, no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 202–878 (inside 90–990), max 2 lines; pill y 353–507.
  Labels ("?", source chip, illustration chip, wordmark, tagline): x 295–984, y 530–1456; nothing in y 0–300; 0 under the
  caption pill; 0 overlaps; 0 outside x 80–1000 / y ≤ 1560. PASS.
- ₹, digits with thousands separator ("₹1,200"), apostrophes and "É" render correctly in Inter (f017, f231, f365, f734).

## 4. Brand (context/17, re-checked 2026-11-06)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 33 beats)
- Hook on frame 0: the sandwich halves are already falling into a close shot; ₹320 flag spears in at 0.56–0.72 s; "?" at
  2.4 s. Then: pull back → sandwich row pops in, ₹150 snacks slam → gauge → PRICEY → ₹1,200 row slams above → gauge → FAIR →
  anchor lands on ₹1,200 → reference line to ₹320 → source chip, would-pay arrows (no values) → real platter slides in, next to
  the sandwich → fake "WAS ₹500" sticker, X, falls off → logo tile + wordmark. No static page, no camera bobbing.
- Beats checked: f0, f3, f9, f17, f22, f73, f95, f108, f117, f128, f173, f189, f231, f285, f324, f357, f365, f385, f404,
  f452, f507, f558, f614, f639, f668, f699, f734, f743, f752, f773, f788, f803, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| script | first draft ran 26.7 s of speech — no room for the CTA | L4–L6 tightened; speech now ends 25.5 s |
| voice | "320-rupee" etc. joined into one word by the G2P; weak "was" | phoneme splits; stressed "was" |
| timing | Whisper onsets drifted (e.g. "platter … above it, and", "the high price sets", "study", "real premium item") | WORD_FIX onsets from the voiced segments |
| stills 1 | frame 0 showed an empty stand; sandwich row flew in huge during the pull-back; gauge hid the Brownie price; fake sticker covered ₹1,200; lesson framing pushed the board into the captions | lower drop start; gentler card entrances; props moved forward and gauge lowered/enlarged; sticker moved; reframed |
| stills 2–4 | chips covered the "FICTIONAL CAFÉ" header; fake sticker covered ₹320; sandwich row crossed the caption band mid-move; anchor fell from very high | wider board framing; sticker beside the price; row pops in after the move; shorter anchor drop |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The gauge and the would-pay arrows illustrate the direction of the effect only ("Needle: illustration, not data"); no
  study values or conversion numbers are shown. The café, items and prices are fictional.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
