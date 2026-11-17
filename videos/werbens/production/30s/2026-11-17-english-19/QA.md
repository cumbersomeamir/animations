# QA — Werbens English-19 30 s #01 "SAME OPTIONS. BIGGER ORDER?" (final export = render 1)

**File:** `videos/werbens/production/30s/2026-11-17-english-19/werbens-30s-english19-01.mp4`
**sha256:** `b468d260ea3d9977ba5192755929ee624f56ebfd43bad7cc85b92a6ed2dcaf95` · 4,143,290 bytes · checked 2026-11-17
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english19-01-thumbnail.png` (1080×1920; sha256 `d6b276c5b948b37ab934c1bcd5a0fe921691b5dada31f75146a04c4fd65c360c`)
- `.jpg` (sha256 `e43ac553886737ed0ce83695580e728bc518e3d00e74f9c36c51c1e1b93f9b1f`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15).
**Topic:** subtractive vs additive option framing (where a choice starts). The proposed decoy topic was already covered by #03;
see `context/35` §2.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render.log`: video written; no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`) is a fully composed, lit stage, with no intro, fade or empty setup:
- two identical, unbranded mint-white products on a low ink plinth, each under the same five ghost option slots;
- the left product is bare; the right one carries all five option modules (teal/mint);
- the headline "SAME OPTIONS. / BIGGER ORDER?" (4 words, x 117–883, y 330–573), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why do shoppers keep more extras when they start full?" 0.15–2.88 s. Headline clears by 0.42 s; the loaded product glows on "start full". |
| Build-up | 3–5 s escalation | L2 "One builds up from basic. One trims down from full." 3.38–6.56 s. Left adds two options; right drops one. |
| Proof | 5–21 s, scene changes | L3 7.03–11.49 s: pull back; MORE KEPT; coins stack (no currency; HIGHER TOTAL). L4 11.98–13.90 s: coins double, products change shape, the gap holds (EVERY TYPE). L5 14.38–17.91 s: close on the full product; a dim shopper walks up and backs away (PUT OFF). Three framings. |
| Payoff | 21–27 s concrete takeaway | L6 18.38–20.12 s: both reset to their starts and move to their ends (START STEERS). L7 20.73–24.74 s: a committed shopper; extras turn pending; four checks light four extras; the fifth is declined (THEIR OWN YES). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. The stage sinks from 26.25 s; the logo tile pops up 26.38–26.74 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Wurbens";
documented limit, and the name is on screen). Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 10/10 | |
| L2 | 10/10 | |
| L3 | 13/13 | |
| L4 | 6/6 | |
| L5 | 12/12 | |
| L6 | 8/8 | |
| L7 | 12/12 | |
| L8 | 6/7 | "Werbens" → "Warbins" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP).

**Captions:** 13 groups (shortest 1.10 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L3,
L5 and L7). The first group (the whole hook question) runs 0.42–3.26 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 3.6 LU, flat factor 0.
- Voice stem −21.0 LUFS.
- Music stem −31.6 LUFS: quiet, ducked −10 dB under speech; 8 held pads + 14 event-tied piano notes, no loops.
- Foley stem −36.1 LUFS (event-linked SFX from `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 152–848, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 122–878, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 117–883, y 330–573 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 173–827, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips, no paragraph cards; the only in-world marks are check icons (no text).

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-17; context/17 + context/35 §3)
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme: navy stage, ink plinth, mint-white products, teal/mint option modules,
  mint coins and check icons, mint ghost rims.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0 composed; the headline clears as the hook caption appears.
2. The loaded product glows on "start full".
3. Left adds two options (slide in from the side); right drops its top option (slides out to a ghost slot).
4. Pull back: MORE KEPT; coins stack 3 vs 6 units (HIGHER TOTAL).
5. Coins double; both products change shape; the 2-vs-4 gap holds (EVERY TYPE); coins clear.
6. The right is full again; a dim shopper walks up and backs away, fading (PUT OFF).
7. Both reset to their starts and move to their ends (START STEERS).
8. A committed shopper; extras turn pending; four checks light four extras; the fifth is declined (THEIR OWN YES).
9. The stage sinks, the logo tile pops up; the wordmark and tagline follow.

**Motion and frames:**
- The five ghost slots are identical on both sides in every frame (same options).
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames; nothing crosses the caption or label band.
- No missing assets: fonts, logo and words.json load, and the page log is clean.

**Beats checked:** f0, f6, f13, f45, f70, f120, f135, f170, f215, f270, f315, f340, f375, f400, f430, f455, f500, f530, f555,
f595, f610, f640, f685, f710, f735, f760, f789, f795, f830, f899.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| topic | the proposed decoy topic duplicates #03 | switched to subtractive vs additive option framing (same genre, new mechanism, built-in limitation) |
| voice | L3 and L4 touching (0.08 s) | lines re-spaced (~0.4 s gaps) |
| stills 1 | coins invisible (station offset applied twice, x ±0.17) | coins placed in front of each product (x ±0.095, z 0.065) |
| stills 2 | coins clearing as floating wafers | stack spacing collapses with the scale |
| pre-render | caption durations | checked before rendering (shortest 1.10 s), after english-18's short-caption re-render |

Render 1 passed review and is the delivered file.

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Park, Jun & MacInnis (2000):** the claims come from the publisher-deposited abstract (Crossref); the full text is behind a
  paywall, so no effect sizes, sample sizes or product details are used; findings are stated as direction only. Module counts
  and coins are illustrative.
- **Law:** "every paid extra needs their own yes" reflects UK SI 2013/3134 reg. 40 (express consent; a pre-ticked box is not
  consent), read on legislation.gov.uk. The parallel EU rule (Directive 2011/83/EU, Art. 22) is noted but was not re-read
  (EUR-Lex bot challenge). Other jurisdictions are not covered. This is not legal advice.
- **"Start committed buyers full"** is practical advice from Study 3's high-commitment result, not a measured outcome for any
  one business.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the
  repo.
- **Earlier work:** earlier MP4s were verified unchanged (21 files).
