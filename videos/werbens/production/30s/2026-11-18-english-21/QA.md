# QA — Werbens English-21 30 s #01 "FREE BEATS BETTER?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-18-english-21/werbens-30s-english21-01.mp4`
**sha256:** `87d77b67f3d7955f003f60cada2a4327f9305914f010cb5011a033daa377f4bd` · 4,172,206 bytes · checked 2026-11-18
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english21-01-thumbnail.png` (1080×1920; sha256 `7653fb6aed895cb1ffd408298e77f856cdfe44ceee51e89696f819e5455a36cb`)
- `.jpg` (sha256 `c25841af114c87ee8739d9a7cae26d69983143d1b60242faec047297d34287aa`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15), and
the batch21 brief (live feedback: colour theme and logo from app.werbens.com).
**Topic:** the zero-price effect and its limit. The proposed decoy-vs-compromise topic was already covered by #03 (decoy) and
#18 (compromise); see `context/37` §2.

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
- an ice-cream stand: the better treat (three-scoop sundae, wafer, mint "cherry") priced at one upright coin, beside a single
  scoop whose tag reads **FREE**;
- 7 of 10 shoppers crowd the free scoop;
- the headline "FREE BEATS / BETTER?" (3 words, x 121–879, y 330–652), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why can free pull people away from the better treat?" 0.15–2.71 s. Headline clears by 0.42 s; the sundae glows on "the better treat". |
| Super hook | 3–5 s | L2 "Two scoops, one coin apart. Now cut both by one coin." 3.53–7.07 s. Rewind: 2 coins vs 1, shoppers 7/3 (ONE COIN APART, the extra coin glows); one coin pops off each stack; the scoop's tag flips to FREE. |
| Build-up + proof | 5–21 s, scene changes | L3 7.53–10.04 s: the extra coin glows again (SAME GAP); FREE pops on "now free". L4 10.48–14.74 s: four shoppers hop to the free scoop (FREE WINS); the sundae dims on "fewer". L5 15.03–17.77 s: close on the free scoop; value halo + sparkles (ADDS VALUE). L6 18.33–22.09 s: lateral move to a second stand; FREE scoop vs FREE battery; four undecided shoppers go to the scoop, one to the battery (BEST ON TREATS). |
| Payoff | 21–27 s concrete takeaway | L7 22.43–26.05 s: the battery is repriced (coin back), the FREE scoop glows, its shoppers bounce on "pulls hardest" (FREE FOR TREATS). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. Camera pulls back from 25.5 s; the stand sinks from 26.25 s; the logo tile pops up 26.38–26.74 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Warbins";
documented limit, and the name is on screen). Per-line windows: L1 10/10 · L2 11/11 · L3 10/10 · L4 14/14 · L5 10/10 ·
L6 10/10 · L7 11/11 · L8 6/7.

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.8 dBTP).

**Captions:** 11 groups (shortest 1.84 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L4
and L6). The first group (the whole hook question) runs 0.42–3.31 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.8 dBTP (≤ −1.5), LRA 2.1 LU, flat factor 0 (mix checked for NaN samples: 0).
- Voice stem −20.8 LUFS.
- Music stem −31.6 LUFS: the established soundtrack recipe — quiet held pads ducked −10 dB under speech, 8 pads + 14
  event-tied piano notes, no loops.
- Foley stem −35.4 LUFS (coin drops, flips, plops, tags; event-linked from `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 132–868, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 102–898, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 121–879, y 330–652 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 133–867, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines and sit in the upper band (y 353–507), inside the mobile safe area.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips and no paragraph cards. In-world text: only the FREE chips.

Result: PASS. (A pre-render DOM run caught "TREATS PULL MOST" at x 110–934; it was renamed "BEST ON TREATS" before rendering.)

## 5. Brand (live app.werbens.com, re-checked 2026-11-18; context/17 + context/37 §3)
Live feedback applied: "only color theme and logo needs to be changed, take from app.werbens.com".
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged from the live site.
- Every scene uses the site's dark-navy hero theme: navy stage, ink stands and tags, mint-white cups with teal bands, mint /
  teal / mint-white scoops, mint coins, ink-and-teal battery, mint halo.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/cuts.png`)
**Every cut / move** was inspected in the final MP4 (`qa/cuts.png`): the rewind (3.6–4.1 s); both coin cuts and the FREE flip
(5.9–7.1 s); the shopper hop (12.3–13.0 s); the push-in to the free scoop (15.3–16.0 s); the lateral move to the second stand
(18.3 / 18.5 / 18.65 / 18.8 / 19.0 s — an object is in frame throughout); the battery repricing (23.3–23.6 s); the CTA
pull-back and tile (25.8–26.4 s).

**Motion and frames:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames; nothing crosses the caption or label band.
- No missing assets: fonts, logo and words.json load, and the page log is clean.

**Beats checked:** f0, f6, f13, f78, f117, f147, f177, f201, f216, f255, f294, f324, f348, f378, f417, f465, f492, f519, f558,
f579, f606, f636, f678, f714, f759, f786, f795, f804, f831, f899.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| topic | the proposed decoy-vs-compromise topic duplicates #03 and #18 | switched to the zero-price effect (same genre, new mechanism, documented limit); ice-cream setting kept |
| voice | "The pull was strongest" heard as "The poll"; L2→L3 and L6→L7 nearly touching | "The effect was strongest"; lines re-spaced |
| stills 1 | coin price stacks hidden behind the shoppers | upright coins on tags at the stand's front edge; shoppers between cups and tags |
| stills 2–4 | set too small, then too tight (FREE chips cut, logo tile filling the frame) | stations closer together; framings rebalanced; CTA camera/tile aimed at the final stand, pull-back from 25.5 s |
| DOM QA | "TREATS PULL MOST" label x 110–934 | "BEST ON TREATS" |
| render 1 review | ~0.4 s of near-empty frames at 18.4–18.8 s on the move between the stands | second stand moved closer (X2 0.4 → 0.3); render 2 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Sources:** the claims come from the abstracts (Crossref for Shampanier et al. 2007; RePEc for Hossain & Saini 2015); full
  texts are paywalled, so no study shares, prices or sample sizes are used; findings are stated as direction only.
- **Illustration:** the studies' products were not ice cream; coins are price units (no currency); shopper counts (7/3 → 3/7;
  4 vs 1 on the second stand) are illustrative, not study data. The halo is a metaphor for "seemed to add value".
- **Takeaway:** "save free for things people enjoy" is practical advice derived from the findings, not a measured rule.
- **Other apps' notes in the brief** (Ideaverse, Aarambh, Tensorblue, Mello, CalMeter, WastePaisa) do not apply to this app's
  branch and were not acted on here.
- **Review folder:** the local "video-review" folder named in earlier briefs does not exist in this cloud container. No
  operational files were placed outside the repo; the finished MP4 and thumbnail are delivered as chat attachments and at the
  repo paths above.
- **Earlier work:** earlier MP4s were verified unchanged (23 files); nothing was deleted or overwritten. Batch 20 had no
  unfinished checkpointed work.
