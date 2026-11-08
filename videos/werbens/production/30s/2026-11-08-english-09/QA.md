# QA — Werbens English-09 30 s #01 "Same reward, same eight washes. Which card gets finished?" (final export = render 2 after 4 stills passes)

**File:** `videos/werbens/production/30s/2026-11-08-english-09/werbens-30s-english09-01.mp4`
**sha256:** `a22bb2a7e636cf80d8fae7b0f846ce0c5808ae646d4ccc173ed83cf3d723c201` · 3,698,594 bytes · checked 2026-11-08
(supersedes the first render committed as a checkpoint in 09b7955, which had two near-empty transition moments — §6)

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
  synthesised; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz; rhotic "first".
- Final-mix ASR (Whisper base.en): whole-mix transcript = the script word for word except "Werbens" ("Warbins", the
  documented vocabulary limit — the name is spelled on screen). Per-line windows: L1 9/9 · L2 10/10 · L3 14/14 · L4 13/13 ·
  L5 18/18 · L6 6/7 → 70/71.
- Narration on air (voice stem): L1 0.33–3.52 · L2 3.98–8.26 · L3 8.73–13.01 · L4 13.48–18.03 · L5 18.53–24.14 ·
  L6 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.9 s).
- Caption groups: L1 0.23–2.30 / 2.32–3.86 · L2 3.88–6.30 / 6.32–8.29 · L3 8.63–10.60 / 10.62–13.36 · L4 13.38–15.72 /
  15.74–18.41 · L5 18.43–21.00 / 21.02–22.28 / 22.30–24.76 · L6 26.03–29.24 s; each word brightens at its onset.
- Audio: −15.0 LUFS integrated, true peak −2.0 dBTP (≤ −1.5), LRA 4.0 LU, flat factor 0. Voice stem −20.7 LUFS (accepted
  English −20.9), music stem −31.3 LUFS (quiet, ducked −10 dB under speech), foley −32.0 LUFS; 6 held pads + 12 event notes,
  no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 202–878 (inside 90–990), max 2 lines; pill y 353–507.
  Labels ("?", source chip, wordmark, tagline): x 328–836, y 530–1456; nothing in y 0–300; 0 under the caption pill;
  0 overlaps; 0 outside x 80–1000 / y ≤ 1560. PASS.
- "→", "è" (Drèze), "&", "!" render correctly in Inter (f051, f128, f377, f653).

## 4. Brand (context/17, re-checked 2026-11-08)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 27 beats)
- Hook on frame 0: the rubber stamp is already coming down on card B; two free stamps by 0.66 s. Then: pull back, card A lands,
  "8 TO GO" tags, "?" → source chip, rings ripple over the eight empty circles of both cards → B's free stamps swell, the race
  (B fast, A slower), B "FREE WASH!" → board away, progress rows drop in (right-aligned), B's head start glows, equal brackets →
  new card + welcome stamp → checklist, first step ticked → logo tile + wordmark. No static page, no camera bobbing.
- Beats checked: f0, f4, f20, f30, f42, f51, f94, f128, f204, f296, f340, f377, f405, f413, f430, f477, f520, f552, f573,
  f643, f653, f668, f708, f772, f788, f803, f899.

## 6. Defects found and fixed (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| topic | suggested "show the outcome, not the features" topic duplicates #01 ("A feature is not yet a benefit") and #05/#06 | replaced with the endowed progress effect |
| timing | L2 overlapped L3 in the first TTS pass | lines re-spaced |
| stills 1 | rubber stamp invisible (array copied into a vector); card A slammed in huge over the captions; progress rows tiny; lesson props small, board under the captions | stamp position fixed; gentle card entrance; dedicated low camera, larger rows; board slides away; props one at a time, centred |
| stills 2 | stamp seen end-on read as a ball; rows clipped at the left | stamp tilted and enlarged; wider row framing |
| render 1 | two near-empty transition moments (≈13.6–13.8 s board gone before the rows; ≈18.5–19.0 s rows gone before the new card) | row and card entrances overlapped (rows from 13.5 s, card from 18.5 s); audio rebuilt; re-rendered |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The completion percentages quoted by secondary summaries of the 2006 study could not be checked against the full paper
  (paywall; author copy unreachable), so the video states only the direction (more often, faster) — no numbers. The stamping
  race is an illustration of that direction.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
