# QA — Werbens English-17 30 s #01 "LESS SELLS MORE?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-15-english-17/werbens-30s-english17-01.mp4`
**sha256:** `2b2d5d4388c2c346e69872169d157b7613b05d630e3b72b8852e01f9a3dba5d3` · 4,612,395 bytes · checked 2026-11-15
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english17-01-thumbnail.png` (1080×1920; sha256 `0b64c9b27bbc4df58db0a58dae5fea57a1764c443acc9d8162fd4c431af12d75`)
- `.jpg` (sha256 `ba145307145b822f46ccd0470cb4dfe2979468e9c17be78b4b7a591587a88b13`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15).
**Topic:** the space-to-product ratio effect (negative space in displays). The proposed topic was not covered before; see
`context/33` §2.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render2.log`: video written in 720.2 s; no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`) is a fully composed, lit stage, with no intro, fade or empty setup:
- a two-shelf display unit crammed with 34 identical unbranded bottles (deep-teal back panel, ink shelves);
- one of them, bottom shelf centre, stands slightly forward in a spotlight (whiter body, soft mint glow) while the crowd sits in
  the unit's shade;
- the headline "LESS SELLS / MORE?" (3 words, x 128–872, y 330–652), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why can empty space make a product look more premium?" 0.15–3.09 s. Headline clears by 0.42 s; the crowd sinks into the shelves in a wave from the edges, leaving the lone lit bottle by ~2.4 s. |
| Build-up | 3–5 s escalation | L2 "Same bottle, two displays: packed tight, or given room." 3.53–6.83 s. Lateral move to two plinths; same bottle on both; PACKED (3 tight) vs ROOM (3 spaced). |
| Proof | 5–21 s, scene changes | L3 7.28–11.37 s: value columns rise, the roomy one higher (MORE VALUABLE). L4 11.83–15.19 s: glints on the roomy display; a store arch rises behind it (MORE PRESTIGE). L5 15.63–18.43 s: equal-count hops ("not scarcity"), the packed bottles straighten ("not tidiness"), then the packed display gets the same space and its column matches (SPACE ITSELF). Two sets, five framings. |
| Payoff | 21–27 s concrete takeaway | L6 18.83–21.73 s: back to the shelf unit (crowd returned on top); the lone bottle's light pool widens, then settles on "no guaranteed sale". L7 22.13–25.52 s: GIVE IT ROOM; six of the crowd sink ("fewer items"); three spread, each with a light pool ("space around each"). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. Bottles clear and the unit sinks from 26.25 s; the logo tile pops up 26.38–26.74 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Wurbens";
documented limit, and the name is on screen). Whisper writes "space made" as "space-made". Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 10/10 | |
| L2 | 9/9 | |
| L3 | 12/12 | |
| L4 | 9/9 | |
| L5 | 7/7 | |
| L6 | 10/10 | |
| L7 | 10/10 | |
| L8 | 6/7 | "Werbens" → "Warbins" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP).

**Captions:** 15 groups, with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L1, L2, L5, L6 and
L7). The first group starts at 0.42 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 2.2 LU, flat factor 0.
- Voice stem −20.8 LUFS.
- Music stem −31.6 LUFS: quiet, ducked −10 dB under speech; 8 held pads + 14 event-tied piano notes, no loops.
- Foley stem −35.7 LUFS (event-linked SFX from `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 166–834, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 136–864, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 128–872, y 330–652 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 146–854, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips and no paragraph cards.
- In-world plates (not in the DOM check; checked on full-size crops of frames 250, 400 and 540): the ROOM chip's right edge
  is at x ≈ 877 in the close framing and ≈ 852 / 825 in the wide ones, inside x 900.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-15; context/17 + context/33 §3)
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme: navy stage, deep-teal back panel, ink shelves and plinths, mint-white
  bottles with teal caps and mint bands, mint value columns and light pools.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0 composed; the headline clears as the first caption appears.
2. The crowd sinks into both shelves from the edges inward; the lone bottle stays lit.
3. Lateral move: the shelf unit leaves as the two plinths arrive; one bottle drops onto each.
4. Two more packed tight (PACKED, slightly jumbled), two more with room (ROOM).
5. Value columns rise (MORE VALUABLE); glints on the roomy display; the store arch rises (MORE PRESTIGE).
6. Equal-count hops; the packed bottles straighten; the packed plinth widens and its bottles spread; its column turns mint and
   matches (SPACE ITSELF).
7. Back to the shelf unit: the top-shelf crowd has returned; the lone bottle's light pool widens, then settles.
8. GIVE IT ROOM: six sink, three spread with their own light pools.
9. Bottles clear, the unit sinks, the logo tile pops up; the wordmark and tagline follow.

**Motion and frames:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames: mid-move frames (f116 at 3.87 s, f565 at 18.83 s) show both sets.
- No missing assets: fonts, logo and words.json load, and the page log is clean.
- No stray props under the CTA tile (f788, f795).

**Beats checked:** f0, f6, f13, f30, f60, f87, f105, f116, f128, f165, f190, f230, f318, f345, f390, f425, f445, f480, f512,
f540, f565, f600, f640, f695, f725, f755, f788, f795, f830, f899, plus full-size crops of f250, f400 and f540.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| voice | first draft ran 27.2 s of speech; L2 and L3 touched (6.86 / 6.90 s) | L5–L7 tightened; 0.34–0.40 s gaps, CTA at 27.0 s |
| stills 1 | headline touching the shelf top | camera retargeted so the unit sits lower |
| stills 2 | the lit bottle did not stand out at frame 0 | stronger spot, bottle nudged forward, crowd body slightly greyer (shade) |
| stills 3 | close plinth framing cut the ROOM display; ROOM chip at x ≈ 923 | displays tightened (centres ±0.085, radii 0.048/0.072), close camera widened |
| stills 4 | store arch top touching MORE PRESTIGE / SPACE ITSELF; arch at the right edge in the L5 framing | arch and columns lowered/narrowed; L5 framing recentred |
| stills 5 | near-empty frame at 26.45 s before the logo tile | tile starts at 26.38 s while the unit sinks |
| render 1 review | ~0.3 s of near-empty frames at 3.7–3.9 s on the move to the plinths | proof set moved closer (X2 0.5 → 0.42); render 2 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Sevilla & Townsend (2016):** the claims come from the publisher-deposited abstract (Crossref). The full text and the
  publisher page were not reachable (403), so no effect sizes, study details or sales figures are used; findings are stated as
  direction only. The value columns are illustrative.
- **"No guaranteed sale":** a careful interpretation, not a measured claim. The abstract reports effects on sales and purchase
  likelihood in lab and field studies, but no single shop is promised an outcome.
- **Pracejus et al. (2006):** background only (abstract does not name specific meanings); the 2012 follow-up could not be read.
- **Example:** the bottle, shelves, plinths and counts are made up; no prices, currency or brand appear on the products.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the
  repo.
- **Earlier work:** earlier MP4s were verified unchanged (19 files).
