# QA — Werbens English-14 30 s #01 "£2.30 or £2.80: which mayo is the better buy?" (final export = render 2)

- **File:** `videos/werbens/production/30s/2026-11-14-english-14/werbens-30s-english14-01.mp4`
- **sha256:** `701c071293fdff822bcb746d458a4d0ef7201159b47c8aef47066c60d1ea9c02` · 4,049,685 bytes · checked 2026-11-14
- **Thumbnail:**
  - `werbens-30s-english14-01-thumbnail.png`: 1080×1920; sha256 `7e9bbffdb20150841f76fcba1a4df72f391ce86edd91b6da672b8d1dfe809af7`
  - `.jpg`: sha256 `b0c3e212c7388f9ae3c819dcba1f0ab424c2e013ac1e631acb43eec06118fa96`
- **Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, re-confirmed in the 2026-11-14 brief.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Story structure + pacing (context/27)
Times are narration on air, measured from the voice stem.

| Part | Required | As built |
|---|---|---|
| Hook | 0–3 s striking image + hook | Frame 0: two bottles falling into place. L1 "£2.30 or £2.80: which mayo is the better buy?" runs 0.33–3.38 s, with pack-price tags rising on columns. |
| Super hook | 3–5 s escalation | L2 "Same brand. Now switch the unit." runs 3.78–5.74 s. Both tags flip and the columns re-scale, so the order reverses. |
| Build-up + proof | 5–21 s, scene changes | L3 runs 6.22–11.26 s (real per-100 g prices, "about double"). L4 runs 11.73–14.59 s (price card). L5 runs 15.03–19.68 s (kcal → kJ gauges). There are three sets. |
| Payoff | 21–27 s concrete takeaway | L6 runs 20.18–22.60 s and L7 runs 23.14–25.68 s ("SAME UNIT"; tags turn into clear shelf labels). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." runs 27.07–29.28 s. The logo tile pops up at 26.04–26.40 s; the wordmark appears at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
- **Voice:** the established Meshline/Recall narrator: Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us,
  newly synthesised. English only. No Hindi, no reused narration.
- **Price reading:** prices are read as UK shoppers say them ("two thirty", "two eighty").
- **Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script. Expected spellings:
  - "£2.30" / "£2.80" written as "230" / "280";
  - "107p" / "52p" written as "107 P" / "52 P";
  - "buy" written as the homophone "by";
  - "Werbens" written as "Wurbins" (documented limit; the name is on screen).
- **Per-line windows:** L1 6/7 (the homophone) · L2 6/6 · L3 7/7 · L4 10/10 · L5 10/10 · L6 8/8 · L7 8/8 · L8 6/7.
- **Listening:** this was checked by ASR only. No human listened in this cloud session.
- **Sync and clipping:** narration sync was checked by ASR word windows and the voice-stem envelope. Clipping was checked by
  astats (flat factor 0, true peak −1.9 dBTP).
- **Captions:** 13 groups. Each word brightens at its onset, using Whisper onsets plus `WORD_FIX` pins for L1/L3/L5/L6/L7.
- **Audio levels:**

  | Measure | Value |
  |---|---|
  | Integrated loudness | −15.0 LUFS |
  | True peak | −1.9 dBTP (limit ≤ −1.5) |
  | LRA | 2.4 LU |
  | Flat factor | 0 |
  | Voice stem | −20.8 LUFS |
  | Music stem | −31.5 LUFS: quiet, ducked −10 dB under speech; 7 held pads + 17 event notes, no loops |
  | Foley stem | −32.7 LUFS |

## 4. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame)
Checked on 900 samples, one per frame, against the context/27 boxes:

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 131–869, y 369–489 | x 100–900, y 230–1500 |
| Caption pill | x 101–899, y 353–507 | x 100–900, y 230–1500 |
| Big labels ("ABOUT 2×", "SAME UNIT"), wordmark, tagline | x 248–832, y 564–1456 | x 100–900, y 560–1500 |

Caption lines are at most 2. The checks also confirmed:
- nothing in y 0–300;
- no label under the caption pill;
- no label overlaps;
- never more than one big label at a time;
- no source chips or paragraph cards.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-14; context/17 + context/30 §3)
- The site's palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme.
- The CTA tile shows the logo SVG drawn unlit: #7EE7DC / #316879.
- The wordmark is Space Grotesk 700, −0.04 em, with the 135° #7FE7DC→#316879 gradient.
- The copy and the CTA name only Werbens, with no sales pitch.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0: the bottles fall into place.
2. The £2.30 / 215 g and £2.80 / 540 g tags rise on columns of nearly equal height.
3. The caps glint on "Same brand".
4. On "switch the unit" the tags flip and the columns re-scale: 107p goes up, 52p goes down.
5. The tags pulse as each price is read; "ABOUT 2×" appears.
6. The camera moves laterally to the price card. "52p" grows and "per 100 g" fades.
7. The card slides out as the snack bars slide in.
8. The gauges switch from kcal to kJ (×4.184, so the gap widens). The healthy bar rises on a plinth into the light.
9. Back to the bottles: "SAME UNIT".
10. On "Sellers" the tags flip into clear shelf labels ("107p per 100 g" / "52p per 100 g" strip).
11. The bottles part and the logo tile pops up between them (`qa/frames/f783…f790-ctafix.jpg`). The wordmark and tagline
    follow.

**Checks:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames. f14, f20 and f25 are mid-move and show props.
- No missing assets: fonts (including Inter Bold for tag text), logo and words.json all load, and the page log is clean.

**Beats checked:** f0, f12, f38, f60, f114, f155, f172, f235, f282, f320, f345, f370, f388, f420, f448, f460, f485, f505,
f545, f560, f600, f670, f700, f715, f760, f785, f790, f800, f830, f899.

**Thumbnail:**
- Separate 1080×1920 image tied to the hook.
- Text: "CHEAPER?" / "CHECK THE UNIT." (4 words, Space Grotesk 700, hero gradient).
- Shows the two bottles with £2.30 / 215 g and £2.80 / 540 g tags, plus the logo and wordmark at the bottom.
- Text sits inside x ≈ 110–975; the top 300 px are free of text.

## 7. Defects found and fixed (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| voice | prices read as "two pounds and thirty pence"; first draft 3 s long | phoneme override reads "two thirty" / "two eighty"; lines tightened and re-timed |
| stills 1 | tag text in a serif fallback (font "IB" not loaded); empty frame on the move to the card; "52p" grew into its unit; kJ gauge chip near the caption band; tags small | font loaded; proof set moved closer; number/unit offsets fixed; gauge base energies lowered and camera eased; tags enlarged |
| stills 2 | card framed too tight; empty frame before the CTA tile | wider card framing; CTA handoff re-timed |
| stills 3 | the card flew up through the caption band; snacks dropped in front of the card; empty frame before snacks | card exits sideways while the snacks slide in from the left |
| DOM QA | "SAME UNIT" box top at y 542 (rule: ≥ 560) | label at y 632, camera target raised |
| render 1 | ≈ 3 near-empty frames at 26.1–26.2 s before the CTA tile (seen on the final-video transition sheet) | tile pops between the parting bottles from 26.04 s; CTA pull-back starts 25.75 s; **full re-render (render 2)**. Render 1 is in checkpoint ff04e0d and is superseded at the same path. |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked by ASR (Whisper base.en), not a human listener.
- **Prices:** they come from the CMA's snapshot of one unnamed retailer on 9 May 2023 and may not hold today. The publishing
  caption says so.
- **Brand:** the CMA does not name the brand, and none is shown.
- **Unit effect:** this was measured on attribute comparisons such as warranties and snack energy. The video states the kJ
  finding and does not claim a sales or conversion effect for unit pricing.
- **Columns:** pack price and price per 100 g are drawn on two different scales (different units). The columns show which tag
  is higher, not one common axis; this is recorded in the episode notes.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above. QA, sources and production files stay in
  the repo.
- **Earlier videos:** earlier MP4s were verified unchanged (16 files).
