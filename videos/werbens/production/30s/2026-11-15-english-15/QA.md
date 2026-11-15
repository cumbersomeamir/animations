# QA — Werbens English-15 30 s #01 "TRY BEATS TELL?" (final export = render 1)

**File:** `videos/werbens/production/30s/2026-11-15-english-15/werbens-30s-english15-01.mp4`
**sha256:** `f860c0db6a349f974099837d3f85255f91276469155b6dec948acde153c8a07c` · 4,860,418 bytes · checked 2026-11-15
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english15-01-thumbnail.png` (1080×1920; sha256 `8065bbc3b21802dc81c14d9c68479b7caf86cd57a59cb3d2fbd1766b3ea96bae`)
- `.jpg` (sha256 `425612633a3c05dca899ef68b0451ba1a49f7dc214c26aa45f1323ab01eb2d83`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15).

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~192 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`) is a fully composed, lit booth, with no intro, fade or empty setup:
- an untouched ad poster on an easel (product hero + "!" claim bubble);
- a tray of sample cups, one lifting away in a mint glow;
- the headline "TRY BEATS / TELL?" (3 words, x 152–848, y 330–652), readable at phone size.

The same image is the thumbnail. Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why can a free sample sell what a perfect ad can't?" 0.15–2.93 s. Headline clears by 0.42 s; samples are taken one by one. |
| Build-up | 3–5 s escalation | L2 "An ad asks you to believe; a sample lets you check." 3.28–5.98 s, with BELIEVE? and then CHECK. |
| Proof | 5–21 s, scene changes | L3 6.63–12.46 s (TRIED vs AD) · L4 12.98–17.62 s (new buyers, 12 MONTHS) · L5 18.03–20.04 s (VARIES). Three sets. |
| Payoff | 21–27 s concrete takeaway | L6 20.54–22.86 s (LET THEM TRY) · L7 23.33–25.00 s (PROVE THE CLAIM: the ad's claim becomes a check on the sample). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.07–29.28 s. Logo tile pops up 26.00–26.38 s; wordmark 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Warbins";
documented limit, and the name is on screen). Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 10/11 | "sell" spelled "cell" in the line window; correct in the whole-mix pass |
| L2 | 11/11 | |
| L3 | 13/13 | |
| L4 | 15/15 | |
| L5 | 5/5 | |
| L6 | 9/9 | |
| L7 | 7/7 | |
| L8 | 6/7 | "Werbens" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP).

**Captions:** 13 groups, with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L1–L4). The first group
starts at 0.42 s, after the headline.

**Audio:**
- Loudness: −15.1 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 2.6 LU, flat factor 0.
- Voice stem −21.0 LUFS.
- Music stem −31.2 LUFS: quiet, ducked −10 dB under speech; 6 held pads + 15 event notes, no loops.
- Foley stem −35.1 LUFS.

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 175–825, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 145–855, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 152–848, y 330–652 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 124–876, y 562–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips and no paragraph cards.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-15; context/17 + context/31 §3)
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0 composed; the headline clears as the first caption appears.
2. Samples are taken one by one while the ad stays untouched; the ad gets a sheen on "perfect ad".
3. "BELIEVE?" as the claim bubble swells, then "CHECK" with a check over the tray.
4. Lateral move to the study set: TRIED / AD bases appear first.
5. The LIKE columns rise equal. TRIED's BUY rises to match; AD's BUY stops short.
6. Lateral move to the field-test set: five new-buyer tokens hop out of a sample.
7. A glow travels across 12 month tiles ("12 MONTHS"); row B stays faint ("VARIES").
8. Back to the booth: the tray refills ("LET THEM TRY").
9. The ad's claim flies onto the samples and becomes a check ("PROVE THE CLAIM").
10. The booth parts as the logo tile pops up; the wordmark and tagline follow.

**Motion and frames:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames: f10 shows the TRIED/AD bases and f15 the month tiles entering.
- No missing assets: fonts, logo and words.json load, and the page log is clean.

**Beats checked:** f0, f6, f13, f20, f45, f70, f130, f172, f190, f215, f240, f265, f320, f360, f383, f393, f410, f460, f490,
f510, f540, f565, f600, f625, f680, f720, f740, f783, f790, f800.

## 7. Defects found and fixed before the final render (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| voice | "sell what" heard as "cell with"; "won new buyers" heard as "one new buyers" | stressed "what"; reworded to "brought in new buyers" |
| stills 1 | booth framed for landscape: ad clipped, tray cut, claim bubble poking into the headline band; bars and month rows cramped | recomposed as a portrait stack (ad behind and above, tray in front); wider proof framings |
| stills 2 | duplicate claim bubbles (printed + 3D); labels touching the poster top; months set clipped on the right | printed bubble removed; booth framed lower; month rows re-laid out; A/B chips inside the frame |
| stills 3 | back-row cups hidden behind the front row; ~1.5 s of empty bases before the study | back row staggered half a pitch; booth held longer, move to the study set at 6.9–7.8 s |
| DOM QA | headline flagged as a label (y < 560); "12 MONTHS" top at y 554 | QA treats the frame-0 headline as caption-equivalent (caption box + no coexistence check); labels at y 630 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Bawa & Shoemaker:** the claims come from the published abstract. The full text sits behind a publisher paywall that
  returned 403, so no sales percentages are used. The brands in their experiments are not named.
- **Smith & Swinyard:** the finding is stated as direction only. The LIKE/BUY columns depict reduced attitude–behaviour
  consistency, not the study's values.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the
  repo.
- **Earlier work:** earlier MP4s were verified unchanged (17 files).
