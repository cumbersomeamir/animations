# QA — Werbens English-06 30 s #01 "75% lean, or 25% fat?" (final export = render 1 after 3 stills passes)

**File:** `videos/werbens/production/30s/2026-11-06-english-06/werbens-30s-english06-01.mp4`
**sha256:** `16052093757f44a042cd8b931e9622236248112d2046c01b751c30d38b4a20e6` · 9,406,676 bytes · checked 2026-11-05 (container clock)

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
  synthesised for this script; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz, "first" → fˈɜɹst.
- Final-mix ASR (Whisper base.en, each line windowed from the MP4): L1 "75% lean, or 25% fat." (exact) · L2 8/8 · L3 15/15 ·
  L4 6/6 · L5 10/10 · L6 4/4 · L7 10/10 · L8 6/7 → **66/67**; the only miss is "Werbens" → "Warbins" (documented Whisper
  vocabulary limit; the name is spelled on screen). Whole-mix transcript matches the script word for word apart from that.
- Narration on air (voice stem): L1 0.33–3.45 · L2 4.03–7.11 · L3 7.68–13.35 · L4 13.88–15.56 · L5 16.13–19.29 ·
  L6 19.78–20.92 · L7 21.53–24.90 · L8 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.8 s).
- Caption groups (from words.json + WORD_FIX): L1 0.23–3.91 · L2 3.93–5.79 / 5.81–7.56 · L3 7.58–9.51 / 9.53–12.13 /
  12.15–13.76 · L4 13.78–16.01 · L5 16.03–18.14 / 18.16–19.66 · L6 19.68–21.41 · L7 21.43–23.48 / 23.50–25.52 · L8 26.03–29.24 s;
  each word brightens at its onset (onsets pinned to the voiced segments where Whisper drifted).
- Audio: −15.0 LUFS integrated, true peak −1.5 dBTP, LRA 2.9 LU, flat factor 0. Voice stem −20.7 LUFS (accepted English
  −20.9), music stem −31.6 LUFS (quiet, ducked −10 dB under speech), foley −30.4 LUFS; 9 held pads + 15 event notes, no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 201–879 (inside 90–990), max 2 lines; pill y 353–507.
  Labels ("?", "=", source note, illustration chip, "75% + 25% = 100%", wordmark, tagline): x 188–892, y 580–1547; nothing
  in y 0–300; 0 under the caption pill; 0 overlaps; 0 outside x 80–1000 / y ≤ 1560. PASS.
- Inter Display ExtraBold captions; "%", "&", digits and the ✓ path render correctly (f010, f198, f242, f618).

## 4. Brand (context/17, re-checked for this batch)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 32 beats)
- Hook on frame 0: two trays already falling; land by 0.32 s; "75% LEAN" slams at 0.33–0.5 s, "25% FAT" at 2.2–2.4 s. Then
  hop + "=" → 3+1 blocks → frames → highlight split → pull back + source note → tubes rise, fill, left rises → gap bracket →
  sample plate + fork bite → gap narrows (not closed) → positive card covers the right label, old card slides out → blocks
  return + "75% + 25% = 100% ✓" → frames glow, lift away, plate returns → logo tile + wordmark. No static page, no camera bobbing.
- Beats checked: f0, f3, f10, f15, f66, f72, f94, f121, f150, f188, f198, f225, f242, f289, f300, f332, f392, f405, f425, f436,
  f455, f476, f510, f554, f593, f618, f650, f711, f774, f788, f803, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| script | "lead with what your product has, not what it lacks" does not fit a 75/25 product (it has the fat) | "lead with the positive side, not the negative one" |
| voice | Kokoro G2P gave non-rhotic "first" for en-us | override fˈɜːst → fˈɜɹst |
| timing | Whisper onsets drifted (e.g. "same numbers", "study", "when it was labeled lean", "tasting", "positive") | WORD_FIX onsets from the voiced segments |
| stills 1 | landscape trays left most of the portrait frame empty; tasting plate tiny; old card exited on top of the new card; left tray cropped in the L5 push | taller trays, larger plate closer to camera, old card slides out from under, gentler push |
| stills 2–3 | mince read as pink granite; pale fluid; disclaimer chip over the plate; frames entered oversized | darker strand texture + bump, teal fluid, chip moved, smaller frame entrance |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The rating tubes illustrate the study's direction only ("Ratings shown: illustration, not study data"); no study values.
- The narration says "meat"; the study's product was ground beef (recorded in the sources).
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
