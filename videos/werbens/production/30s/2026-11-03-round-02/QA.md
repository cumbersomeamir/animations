# QA — Werbens round 02 30 s #01 "One shape, everywhere" (final export = render 1 after 4 stills passes)

**File:** `videos/werbens/production/30s/2026-11-03-round-02/werbens-30s-round02-01.mp4`
**sha256:** `4b463c76ac65ddc730fa062fbf4da88f04cd8a47e62c7086d22cb2809af55e92` · 3,291,544 bytes · checked 2026-11-03

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~194 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Audio, narration and caption timing (`qa/loudness.txt`, `qa/astats.txt`, `qa/audio-spectrogram.png`, `qa/asr-mix.json`)
- Integrated −15.0 LUFS, true peak −1.5 dBTP, LRA 3.3 LU, sample peak −1.48 dBFS, flat factor 0 (no clipping). PASS.
- Accepted quiet voice-forward balance: stems voice −20.9 LUFS (×1.4), music −31.4 LUFS (×0.8, ducked −10 dB under speech),
  foley −27.8 LUFS (ducked −4 dB). Score = 8 held pad chords + 26 event-tied piano notes; no beat grid or loop.
- Narration on air (voice stem): L1 0.33–2.53 · L2 3.03–6.82 · L3 7.43–10.43 · L4 11.33–15.47 · L5 16.03–19.09 ·
  L6 19.83–24.39 · L7 26.34–28.59 s (within 0.04 s of the planned slots). CTA line + tile + lockup occupy 25.85–30 s.
- Captions are built from the measured word times (Whisper + `src/words_fix.mjs` envelope pins); caption groups on air:
  L1 0.23–2.91 · L2 2.93–4.45 / 4.47–7.31 · L3 7.33–8.38 / 8.40–11.03 · L4 11.23–13.97 / 13.99–15.91 · L5 15.93–17.75 /
  17.77–19.70 · L6 19.73–20.92 / 20.94–22.48 / 22.50–24.99 · L7 26.23–29.44 s (each group starts 0.1 s before its first word).
- Final-mix ASR (Whisper base.en on the MP4): L1 7/7 · L2 12/12 · L3 12/12 · L4 12/12 · L5 11/11 · L6 14/14 · L7 6/7 → 74/75.
  Only miss: the brand name ("Warbins"/"Wurbins"; not in Whisper's vocabulary — same on the clean narration). The name is
  spelled in the caption and the lockup. No human listening pass was possible here.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, live DOM, every frame)
DOM_RESULTS

## 4. Brand correction checks (context/15)
- Play icon downloaded 2026-11-03 is byte-identical to `assets/icon.png` (sha256 b9709c1f…); used unchanged on the CTA tile
  face, not tone-mapped: rendered face pixels #6437FB / #6336FB vs measured icon #6435FC. PASS.
- Lockup = werbens.com header SVG mark (copied verbatim, `assets/brand/werbens-site-logo-mark.svg`) + "Werbens" in Fahkwang
  Bold, black (`qa/frames/f840.jpg`, f899). No invented emblem; the old typeset Inter wordmark and lavender tints are gone.
- Palette tokens in `src/scene.html` / `src/scene.js`: #573EEC, #AEA2F4, #F7F8FA, #E4E7EB, #101114, #8C93A1, #6435FC.
  Lit hero arch front measured #5F3CEB (target #573EEC; plain #573EEC base rendered #8758EB → base pre-compensated).
  Caption pill #101114 (92 %), highlights #AEA2F4.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 36 beats, `qa/frames/*.jpg`)
- Each line has its own physical change: drop → repeat row → stamps on "logo/bag/sign" → covers on "Cover the name" →
  arch pulse + recall lines on "point to the bakery" → push-in, lift, label, peel, link on "learn the link" → flips on "Swap
  shapes", snapped links on "no link" → pick, restamps on "consistently", covers + "Test: hide the name" + recall lines to "?"
  on "link it to you" → CTA tile + lockup. No static page, no camera bobbing.
- Beats checked (frame numbers in `qa.sh`): f0, f22 landing, f36/f63 repeats, f80 row out, f99/f118 items land,
  f160/f177/f193 stamps, f210 park, f226 covers, f262 pulse, f290 recall, f330 push, f352 lift, f375 label, f425 peel, f450
  link, f468 back, f482/f495/f508 swaps, f540 try-link, f557 snap, f596 odd out, f612 pick, f633/f660 restamps, f682 covers,
  f710 test lines, f745 reveal, f772 CTA clear, f790 tile lands, f807 lockup, f899 last.
- On-screen labels: "Fictional brand" (once, 3.5–9.25 s), LOGO/BAG/SIGN, "Plimm Bakery", "Distinctive brand asset",
  "Inconsistent", "?", "Test: hide the name". No statistic, outcome, real brand or app feature.

## 6. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| stills 1 | hook arch sank half into the floor (centre/origin mix-up); hovering arch near the chip; lifted arch behind the caption; "pick" arch fell through the caption band; chip stacked on the recall note; tiny "?" | consistent centre maths; hover y 1.2; smaller/lower lift; arch rises out of the floor; chip ends 9.25 s; "?" 60 px |
| colour | lit #573EEC base rendered #8758EB (ACES) | pre-compensated 3D base (#362AEC) → #5F3CEB; icon face unlit (exact) |
| stills 2 | an inline comment swallowed `hero.scale/rotation` → hook arch never shrank, row uneven | comment fixed (block comment); row even |
| stills 3 | sign name cover could touch the printed arch | sign print/name re-laid out |
| words | Whisper word onsets drifted in L2/L3 (e.g. "bag" 5.53 s vs voiced 5.96 s) | `src/words_fix.mjs` pins onsets to the voice envelope |

## 7. Remaining limitations (honest)
- Synthetic narration (Kokoro); "Werbens" uses the stored override and Whisper cannot spell it (vocabulary limit).
- The close-up (11.6–15.4 s) crops the neighbouring logo tile and sign at the frame edges (depth context, no text there).
- werbens.com answered a plain HTTP client with a bot check (429); it was inspected in headless Chromium. Its "Werbens"
  header text is styled Fahkwang 700 (computed style); the lockup reproduces that with the OFL font.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
