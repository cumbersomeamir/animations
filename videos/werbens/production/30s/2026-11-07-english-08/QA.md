# QA — Werbens English-08 30 s #01 "Same cookies. Why do the last two look more tempting?" (final export = render 1 after 3 stills passes; audio re-mastered once)

**File:** `videos/werbens/production/30s/2026-11-07-english-08/werbens-30s-english08-01.mp4`
**sha256:** `d70b71a39aa231894298f9bf012de87e36172b808e96b8685a88bad99491f09c` · 3,327,801 bytes · checked 2026-11-06 (container clock)

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
  synthesised; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz; rhotic "were".
- Final-mix ASR (Whisper base.en): whole-mix transcript = the script word for word, except "Werbens" ("Warbins", the
  documented vocabulary limit — the name is spelled on screen) and "2" written as "two". Per-line windows: L1 10/10 ·
  L2 13/13 · L3 12/12 · L4 9/9 · L5 11/11 · L6 8/10 ("'only"/"2" vs "only"/"two" — scoring only) · L7 6/7 → 69/72.
- Narration on air (voice stem): L1 0.33–3.14 · L2 3.63–9.26 · L3 9.78–13.79 · L4 14.28–17.25 · L5 17.73–21.24 ·
  L6 21.73–24.44 · L7 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.9 s).
- Caption groups: L1 0.23–1.37 / 1.39–3.51 · L2 3.53–5.69 / 5.71–7.28 / 7.30–9.15 · L3 9.68–11.24 / 11.26–12.48 / 12.50–14.16 ·
  L4 14.18–15.30 / 15.32–17.61 · L5 17.63–19.11 / 19.13–21.61 · L6 21.63–23.04 / 23.06–24.59 · L7 26.03–29.24 s; each word
  brightens at its onset.
- Audio: −15.0 LUFS integrated, true peak −2.0 dBTP, LRA 2.9 LU, flat factor 0. Voice stem −20.8 LUFS (accepted English
  −20.9), music stem −31.6 LUFS (quiet, ducked −10 dB under speech), foley −31.0 LUFS; 7 held pads + 14 event notes, no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 170–910 (inside 90–990), max 2 lines; pill y 353–507.
  Labels ("?", two source chips, wordmark, tagline): x 254–826, y 530–1456; nothing in y 0–300; 0 under the caption pill;
  0 overlaps; 0 outside x 80–1000 / y ≤ 1560. PASS.
- Tag text ("2 IN STOCK", "ENDS SUNDAY", "ONLY 2 LEFT!") auto-fits its card; apostrophes and "&" render correctly in Inter
  (f064, f238, f620, f672).

## 4. Brand (context/17, re-checked for this batch)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats)
- Hook on frame 0: cookies already raining into both jars (A ten, B two); "?" at 2.8 s. Then: source chip → B pulses and its
  podium rises, rosette on B → A's cookies lifted out one by one until two remain → A rises above B, rosette hops to A →
  hourglass drops in, sand runs, glows → "2 IN STOCK" / "ENDS SUNDAY" tags → full jar + amber "ONLY 2 LEFT!" tag → tag turns
  dark → falls → logo tile + wordmark. No static page, no camera bobbing.
- Beats checked: f0, f3, f9, f15, f64, f83, f120, f207, f238, f257, f345, f375, f395, f410, f445, f465, f495, f503, f589,
  f620, f640, f655, f672, f707, f715, f723, f772, f788, f803, f899.

## 6. Defects found and fixed (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| topic | suggested "admit a tiny flaw / two-sided ad" topic duplicates #02 ("The ad that admits a weakness") and #01's "not waterproof" | replaced with scarcity (context/08 idea 6) |
| script | L2 ran 7.1 s and overlapped L3; hook question flat | L2 shortened; hook sharpened; lines re-spaced |
| voice | non-rhotic "were" before "rated" | phoneme override |
| stills 1 | jars small in the portrait frame; "ENDS SUNDAY" tag clipped; CTA tile landed while the camera was still close (covered the caption band) | taller jars on pedestals, wider gap; wider framings; CTA pull-back starts at 25.1 s |
| stills 2 | tag text could overflow its card | auto-fit text; slightly wider tags |
| export | AAC export true peak −1.0 dBTP (accepted ≤ −1.5) | mix normalised to −2 dBTP; re-muxed (video stream unchanged) → −2.0 dBTP |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The 1975 paper's full text was not accessible; only its abstract is used. The 2-vs-10 cookie counts shown are an
  illustration of "scarce" vs "abundant" and are not spoken. Podium heights show only the order of the ratings.
- India's CCPA dark-pattern guidelines could not be fetched from the official site in this container; the FTC staff report
  is cited instead.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
