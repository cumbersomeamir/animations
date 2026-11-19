# QA — Werbens English-22 30 s #01 "THE FREE SHIPPING TRAP" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-19-english-22/werbens-30s-english22-01.mp4`
**sha256:** `434afd8b3cb1cbc4d01ba9b374ce049ccdd1e67e1d3b4fb484344b91d2061c49` · 4,353,727 bytes · checked 2026-11-19
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english22-01-thumbnail.png` (1080×1920; sha256 `96758d7478d4a75fc6ec100d7e19f85b41bd78fc0763bff40e0c64a082243e90`)
- `.jpg` (sha256 `d84af91f377d26c08177fbc13506c87c7357dae9901cc66bedc80a41a3fbf285`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule) and §6 (caption
band y 280–460, added from this brief), and the batch22 brief (live feedback: colour theme and logo from app.werbens.com).
**Topic:** why a free-shipping threshold sells one more item (not covered before; see `context/38` §2).

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
**Frame 0** (`qa/frames/f000-firstframe.png`), as the brief asked: a shopping basket with three unbranded products and an
**empty glowing gap**; one more product hovers above the gap, tilted toward it, being pulled in; a free-shipping meter filled
to 40 of 50 with a "50" flag. Headline "THE FREE / SHIPPING TRAP" (4 words, x 121–879, y 330–585). No intro, no fade. The same
image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why does free shipping make you add one more thing?" 0.15–2.70 s. Headline clears by 0.42 s; the item is tugged toward the gap on "add one more thing". |
| Super hook | 3–5 s | L2 "Your basket is 40. Shipping costs 6, but it's free from 50." 3.33–7.14 s. "40" tile; "+6" parcel slides in; the meter's 40 → 50 gap glows. |
| Build-up + proof | 5–21 s, scene changes | L3 7.58–11.18 s: parcel hooks on (total 46); item drops into the gap ("10"), parcel unhooks; total 50, meter full, parcel → FREE. L4 11.63–14.10 s: receipt towers 40+6=46 vs 40+10=50; the 4 glows (ITEM, NOT FEE). L5 14.58–18.50 s: retailer counter; order baskets stack up (EXTRA SALES). L6 18.83–21.70 s: fee parcels pop away; profit coins sink (LOST FEES). Four distinct sets. |
| Payoff | 21–27 s concrete takeaway | L7 22.08–25.70 s: final basket — an unwanted extra drifts toward the gap and away, the wanted item gets a check (ONLY IF WANTED); the seller's margin coins get a check on "check the margin". |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. Pull-back from 25.5 s; stage sinks from 26.25 s; logo tile 26.38–26.74 s; wordmark 27.55 s. |

**The example's arithmetic** (made-up amounts, no currency, no brand) is exact on screen and in narration: 40 + 6 = 46;
40 + 10 = 50 (free shipping from 50); 50 − 46 = 4.

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration. Pauses between lines 0.33–0.57 s (L5→L6 lengthened from 0.13 s after
render 1).

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Wurbins" /
"Warbins"; documented limit, the name is on screen). Per-line windows: L1 10/10 · L2 9/9 · L3 10/10 · L4 11/11 · L5 9/9 ·
L6 8/8 · L7 11/11 · L8 6/7.

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP). I did not watch the video in real
time; frames were inspected as stills (§6).

**Captions:** 11 groups (shortest 1.50 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L1,
L2 and L4). The first group (the whole hook question) runs 0.42–3.21 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 2.2 LU, flat factor 0 (mix checked for NaN samples: 0).
- Voice stem −20.8 LUFS.
- Music stem −31.6 LUFS: the established soundtrack recipe — held pads ducked −10 dB under speech, 8 pads + 14 event-tied piano
  notes, no loops.
- Foley stem −35.8 LUFS (flips, slides, plops, pops, chimes on the beats in `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 130–870, y 309–429 | x 100–900 / **y 280–460 (brief)** |
| Caption pill | x 100–900, y 293–447 | x 100–900 / **y 280–460 (brief)** |
| Frame-0 headline | 13 frames, x 121–879, y 330–585 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 152–848, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines and sit in the band the brief asked for (below the platform account UI).
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300 except the caption pill's top edge (y 293), 0 labels under the caption pill, 0 overlaps, never more than
  one big label at a time. Vital information is kept away from the right-side and bottom platform controls (everything inside
  x ≤ 900, labels/objects above y ≈ 1460).
- No source chips and no paragraph cards. In-world numbers: the made-up amounts only.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-19; context/17 + context/38 §3)
Live feedback applied: "only color theme and logo needs to be changed, take from app.werbens.com".
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged from the live site.
- Every scene uses the site's dark-navy hero theme: navy stage, ink bases, mint-white basket/towers with teal bands, teal / mint /
  mint-white products, deep-teal parcels, mint meter fill, coins and glows.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879); the wordmark is Space Grotesk 700, −0.04 em, 135°
  #7FE7DC→#316879; the headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/cuts.png`)
**Every cut / move and the ending** were inspected in the final MP4 (`qa/cuts.png`): frame 0; the tug (2.5 s); parcel in
(5.4 s); 46 (8.4 s); item drop (10.0 s); 50 + FREE (11.0 s); move to the towers (11.6–11.9 s); move to the retailer (14.6–14.8 s);
extra sales (18.0 s); lost fees (20.0 s); move to the final basket (21.95–22.15 s); payoff (23.6, 25.2 s); CTA (26.4 s); last
frame (29.95 s). Objects are in frame through every move; the ending holds the logo tile, wordmark and tagline.

**Motion and frames:** no static page, no camera bobbing, no decorative lines; nothing crosses the caption or label band; no
missing assets (fonts, logo, words.json load; page log clean). Number tiles change with a short flip (0.22 s); mid-flip frames
show the tile edge-on by design.

**Beats checked:** f0, f6, f13, f70, f99, f130, f146, f175, f230, f280, f300, f322, f340, f352, f378, f400, f432, f444, f470,
f530, f580, f600, f640, f650, f675, f700, f750, f790, f830, f899.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| voice | first draft 28 s of speech (L5 overlapped L6); L3 touched L4 | L5–L7 tightened; lines re-spaced |
| stills 1 | the extra item too small to read as a product; framings too tight (meter cut, label over the towers) | taller item, new waiting spot; wider framings |
| stills 2–3 | order stack into the label band; unwanted item near the label; set C's edge visible in the CTA shot | two-column order stack; lower path; time-gated set visibility |
| render 1 review | ~21.9 s move between the retailer and final basket showed only a coin stack and set edges; L5→L6 pause only 0.13 s | sets C/D moved closer (0.6/0.9 → 0.55/0.8); L6/L7 and their beats 0.2 s later (pause 0.33 s); render 2 |

## 8. Remaining limitations (honest)
- **Listening / watching:** intelligibility and caption sync were checked with ASR (Whisper base.en) and the voice-stem envelope,
  not a human listener; the video was inspected as frame stills and sheets, not watched in real time.
- **Source:** the claims come from the publisher-deposited abstract of Lewis, Singh & Fay (2006, Crossref); the full text is
  paywalled, so no effect sizes or the retailer's figures are used. Findings are for **one online retailer** and are stated as
  such. Lewis (2006, *Journal of Retailing*) could not be read (abstract elided / 404) and is not used.
- **Illustration:** amounts are made up (no currency, no real shop); orders, fee parcels and profit coins show direction only.
- **Takeaway:** "add only what you'd buy anyway" and "check the margin" are practical advice derived from the example and the
  finding, not measured rules.
- **Review folder / publishing:** no operational files were placed outside the repo (no Desktop/video-review folder exists in this
  cloud container); nothing was published to social media; no chat was created or renamed.
- **Earlier work:** earlier MP4s were verified unchanged (24 files); nothing was deleted or overwritten. Batches 20–21 had no
  unfinished checkpointed work.
