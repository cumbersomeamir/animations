# QA — Werbens English-10 30 s #01 "Learn more... about what?" (final export = render 1 after 5 stills passes)

**File:** `videos/werbens/production/30s/2026-11-09-english-10/werbens-30s-english10-01.mp4`
**sha256:** `cf069c563563366fba05eb8b9953a1e0d18a3716efe0c5d4638f64dfad4d66b6` · 3,877,118 bytes · checked 2026-11-09

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
  synthesised; English only, no Hindi audio. Overrides: "Werbens" → wˈɜɹbɛnz; general rhotic ɜː → ɜɹ; "15-minute" split.
- Final-mix ASR (Whisper base.en): whole-mix transcript = the script word for word, except "Werbens" ("Wurbens", the
  documented vocabulary limit — the name is spelled on screen), "3" written "three" and the quote marks around the button
  labels. Per-line windows: L1 4/4 · L2 10/10 · L3 10/14 · L4 17/17 · L5 15/19 · L6 5/5 · L7 6/7 — the L3/L5 misses are only
  the quote marks and "3"/"three" in the scoring (every word was heard).
- Narration on air (voice stem): L1 0.33–1.72 · L2 2.08–4.62 · L3 5.08–9.54 · L4 10.03–15.92 · L5 16.53–22.51 ·
  L6 23.23–24.60 · L7 26.16–28.38 s. CTA line + logo tile 25.9–30 s (last 3.9 s).
- Caption groups: L1 0.23–1.96 · L2 1.98–4.96 · L3 4.98–7.35 / 7.37–9.76 · L4 9.93–13.34 / 13.36–16.41 · L5 16.43–18.08 /
  18.10–19.74 / 19.76–23.11 · L6 23.13–25.21 · L7 26.03–29.24 s; each word brightens at its onset.
- Audio: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 3.2 LU, flat factor 0. Voice stem −20.7 LUFS (accepted
  English −20.9), music stem −31.4 LUFS (quiet, ducked −10 dB under speech), foley −32.1 LUFS; 7 held pads + 16 event notes,
  no loops.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame; `qa/frames/*.jpg`)
- 900 samples: caption line boxes y 367–491 (inside 340–520), x 153–927 (inside 90–990), max 2 lines; pill y 353–507.
  Labels (W3C chip, wordmark, tagline): x 287–793, y 530–1456; nothing in y 0–300; 0 under the caption pill; 0 overlaps;
  0 outside x 80–1000 / y ≤ 1560. PASS.
- Button/list/tile text ("Learn more", "See the 3 plans", "Book a 15-minute call", "WHAT THEY'LL GET", "·") renders correctly in
  Inter (f015, f251, f450, f604).

## 4. Brand (context/17, re-checked 2026-11-09)
- app.werbens.com palette, wordmark and `werbens-logo.svg` unchanged (sha256 816c1761…). CTA tile = logo SVG drawn unlit;
  wordmark Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 (f788, f803, f899). Copy/CTA name only Werbens.

## 5. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 27 beats)
- Hook on frame 0: the "Learn more" button is already going down; door A opens onto fog + "?" by 0.85 s. Then: pull back,
  two doors + two buttons, sign → "?" cloud over A → plan previews over B → B pressed, door B opens, plan cards out → set
  steps back, link list with three "Learn more" rows, W3C chip, rows flip to specific labels → formula tiles → doors return,
  A's label becomes "Compare 3 plans", the "?" cloud pops → logo tile + wordmark. No static page, no camera bobbing; no empty
  transition frames (f413-style gaps checked: f362, f431, f567, f690).
- Beats checked: f0, f4, f15, f34, f66, f77, f98, f170, f251, f275, f290, f300, f315, f362, f431, f450, f462, f567, f604, f641,
  f690, f698, f705, f720, f788, f803, f899.

## 6. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| voice | non-rhotic "learn/service/purpose/verb"; garbled "W3C's"; "15-minute" joined | general rhotic override; line reworded ("from the W3C"); phoneme split |
| script | a 3.4 s silent gap before the CTA | short closing line "No guessing what comes next." (restates the W3C intent; no claim) |
| layout (pre-stills) | sign, "?" cloud and previews would sit in the caption band | shorter doors; cloud/previews in front of the doors; smaller, lower list and tiles; reframed cameras |
| stills 1 | button label faces tilted away from the camera (unreadable); background sign under the caption pill during the list/formula; previews tiny | tilt sign flipped; doors set steps back during the foreground beats; bigger previews |
| stills 2 | sign edge still peeking between the W3C chip and the list | sign shrinks away while the set is back and returns with the doors |
| stills 4 | "So name the next step" played over an almost empty foreground (~17.5 s) | link list held until the formula tiles arrive |

## 7. Remaining limitations (honest)
- Intelligibility is checked by ASR (Whisper base.en), not a human listener; Whisper cannot spell "Werbens".
- The W3C criteria are accessibility requirements; the video uses them as the basis for a copy technique and claims no
  click-through or conversion effect.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and at the repo path above.
