# QA — Werbens English-20 30 s #01 "WHY 99, NOT 100?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-17-english-20/werbens-30s-english20-01.mp4`
**sha256:** `23ab87bcbacb8c8327d592ae292b52e0a5796182e2c2a4101b41c4b374c61931` · 4,660,052 bytes · checked 2026-11-17
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english20-01-thumbnail.png` (1080×1920; sha256 `5de14ba4297f4ff9aeaf760d9b90ccf444227802603a86f7282213aa3766dc14`)
- `.jpg` (sha256 `76beab4470c50085d878915a5e41029b81c7f33285909064fcf0a15ace5fee71`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15), and
the batch20 brief (live feedback: colour theme and logo from app.werbens.com).
**Topic:** the left-digit effect and its boundaries (not covered before; see `context/36` §2).

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render2.log`: video written; no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`) is a fully composed, lit stage, with no intro, fade or empty setup:
- a price rail with two signs on spring scales: "99" hangs high (spring barely stretched), "100" hangs low (stretched far);
- split-flap digit tiles (Space Grotesk 700), no currency;
- the headline "WHY 99, / NOT 100?" (4 words, x 193–807, y 330–652), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why do prices end in 99, not a round number?" 0.15–3.15 s. Headline clears by 0.42 s; each sign pulses on its number. |
| Super hook | 3–5 s | L2 "Only a cent less, and the first digit drops." 3.58–6.14 s. Signs spin to 3.00; the left flips to 2.99 in one move on "a cent less"; its spring jumps up and its first tile glows on "the first digit drops" (FIRST DIGIT). |
| Proof | 5–21 s, scene changes | L3 6.58–9.38 s: FELT SMALLER. L4 9.88–14.69 s: left → 3.59, right → 3.60; the springs hang level (NO EFFECT); both first tiles glow on "same first digit". L5 15.13–19.37 s: lateral move to a field-test shelf; tags flip 3.00 → 2.99; queues grow, more for the new item (MOST FOR NEW). |
| Payoff | 21–27 s concrete takeaway | L6 19.83–22.10 s: back to the rail; 3.00 → 2.99 flips the first digit (spring jumps, check) while 3.60 → 3.59 does not move (ONLY IF IT FLIPS). L7 22.58–25.74 s: the right sign spins to a round 100 over a rising gift box (FEELS RIGHT). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. The stage sinks from 26.25 s; the logo tile pops up 26.38–26.74 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration. Prices are spoken as people say them ("two ninety-nine", "three",
"three fifty-nine", "three sixty") via phoneme overrides; the captions keep the digits.

**Final-mix ASR (Whisper base.en):** every word is recognised. The whole-mix pass even writes the spoken prices as "$2.99",
"$3.59 versus $3.60"; the only misses are number formatting ("299", "3", "vs", "9") and "Werbens" ("Warbans"/"Warbins";
documented limit, the name is on screen). Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 9/9 | |
| L2 | 9/9 | |
| L3 | 5/5 | digits written "299", "3" |
| L4 | 6/7 | "versus" written "vs" (the whole-mix pass writes "versus") |
| L5 | 11/11 | |
| L6 | 9/10 | "nine" written "9" |
| L7 | 10/10 | |
| L8 | 6/7 | "Werbens" → "Warbins" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −2.0 dBTP).

**Captions:** 10 groups (shortest 1.54 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L2,
L3, L4 and L6; `WORD_TEXT_FIX` restores "versus" and "nine"). The first group (the whole hook question) runs 0.42–3.46 s,
after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −2.0 dBTP (≤ −1.5), LRA 2.0 LU, flat factor 0.
- Voice stem −20.8 LUFS.
- Music stem −31.6 LUFS: quiet, ducked −10 dB under speech; 8 held pads + 14 event-tied piano notes, no loops.
- Foley stem −34.4 LUFS (flip clicks, spring bloops, plops, tags; event-linked from `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 164–836, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 134–866, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 193–807, y 330–652 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 173–827, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines and sit in the upper band (y 353–507), inside the mobile safe area.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips and no paragraph cards. In-world numbers are the studies' example prices (no currency); the only other mark
  is a check icon.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-17; context/17 + context/36 §3)
Live feedback applied: "only color theme and logo needs to be changed, take from app.werbens.com".
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged from the live site.
- Every scene uses the site's dark-navy hero theme: navy stage, ink base and signs, deep-teal rail, mint-white digit tiles with
  ink digits, mint rims and glows.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/flips-1.png`, `qa/flips-2.png`)
**Every cut / scene change** was inspected in the final MP4: frame 0 → hook; spin to the 3.00 experiment (3.4–3.95 s); the
lateral move to the field shelf (14.75–15.6 s) and back (19.35–20.1 s); the round-price spin (22.6–23.15 s); stage sink → logo
tile (26.25–26.74 s).

**Every price change** was cropped from the final MP4 at full resolution (`qa/flips-1.png`, `qa/flips-2.png`):
3.00 → 2.99 (4.16 s) · 2.99 → 3.59 and 3.00 → 3.60 (10.04 / 11.28 s) · field tags 3.00 → 2.99 (16.28 s) · reset 3.00 / 3.60
(19.95 s) · 3.00 → 2.99 with check vs 3.60 → 3.59 (21.0 s) · 3.59 → round 100 (22.6 s). Each change happens in one move; no
false intermediate price appears.

**Motion and frames:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames; nothing crosses the caption or label band.
- No missing assets: fonts, logo and words.json load, and the page log is clean.

**Beats checked:** f0, f6, f13, f48, f77, f110, f125, f165, f185, f230, f250, f302, f340, f380, f415, f450, f490, f525, f560,
f595, f625, f640, f680, f700, f740, f775, f789, f795, f830, f899.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| voice | prices read "two point nine nine", "three point zero zero" | phoneme overrides ("two ninety-nine", "three", "three fifty-nine", "three sixty"); captions keep digits |
| voice | "One cent less" transcribed "1.0 less"; "feel-good buys" heard as "feel goodbyes"; L4 overlapped L5 | "Only a cent less"; "feel-good purchases"; lines re-spaced |
| stills 1 | camera too close: signs cropped, rail in the label band | camera pulled back; signs and rail widened |
| stills 2–3 | field-test tags hidden by the queues; queues off-frame | tags on the box face; queues fanned and tightened; camera shifted |
| render 1 review | digit tiles changed one at a time, so 3.00 showed a false "3.99" for ~1.2 s (and, for 80 ms, 3.60 a false "3.50") | all tiles of one price flip together (30 ms stagger); render 2 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Sources:** the claims come from the abstracts (publisher pages for Thomas & Morwitz 2005 and Wadhwa & Zhang 2015; RePEc for
  Anderson & Simester 2003); the full texts are behind paywalls, so no effect sizes, sample sizes or sales figures are used;
  findings are stated as direction only. 3.59 vs 3.60 is an illustrative pair of the abstract's condition (leftmost digits
  equal), not necessarily a pair tested in the paper.
- **Illustration:** spring stretch is a metaphor for perceived size, exaggerated for legibility; queue lengths show direction
  only.
- **Not used:** the "Sale cue" moderator (stated as "some evidence" in the abstract) and Manning & Sprott (2009) (abstract not
  read).
- **Other apps' notes in the brief** (Ideaverse, Aarambh, Tensorblue, Mello, CalMeter, WastePaisa) do not apply to this app's
  branch and were not acted on here.
- **Review folder:** the local "video-review" folder named in earlier briefs does not exist in this cloud container. The
  finished MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay
  in the repo.
- **Earlier work:** earlier MP4s were verified unchanged (22 files); nothing was deleted or overwritten.
