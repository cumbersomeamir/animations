# QA — Werbens English-16 30 s #01 "THE OPTION YOU WON'T BUY" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-15-english-16/werbens-30s-english16-01.mp4`
**sha256:** `f074b38ac0d1bb575714502b563f8251fd3c8741e92496288547f59eb5136171` · 4,319,948 bytes · checked 2026-11-15
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english16-01-thumbnail.png` (1080×1920; sha256 `ec6a02fb0ad421144218f811f9d368cf8625a127eb9e337bb664fea7667f4f78`)
- `.jpg` (sha256 `45cc2933de3a45f3ffcfaf1251cdc648353a19cdea820c0dbe9030a97c65cc9a`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15).
**Topic:** the compromise effect (extremeness aversion). The proposed decoy topic was already covered by episode #03; see
`context/32` §2.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render2.log`: video written in 784.8 s; no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`) is a fully composed, lit stage, with no intro, fade or empty setup:
- three made-up plan pedestals of rising height: BASIC (ink), PLUS (teal), a tall spotlit PREMIUM (mint-white);
- coin stacks show price level only, with no numbers or currency;
- shoppers crowd the middle (3 / 8 / 1), so the tall Premium is visibly "the option you won't buy";
- the headline "THE OPTION / YOU WON'T BUY" (5 words, x 120–880, y 330–569), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why can one option you'll probably skip change what you pick?" 0.15–3.25 s. Headline clears by 0.42 s; Premium glows under the spotlight. |
| Build-up | 3–5 s escalation | L2 "Here are two made-up plans: Basic and Plus." 3.80–6.33 s. Premium sinks away ("MADE-UP PLANS"); shoppers re-split 6 / 6. |
| Build-up → proof | 5–21 s, scene changes | L3 6.78–10.35 s: Premium rises back and shoppers hop to Plus. L4 10.63–13.42 s: Basic and Premium lean in ("neighbors"); Plus pulses ("alone"). L5 13.93–18.06 s: lateral move to the appeal bars: MIDDLE GAINS, then EXTREMES LOSE. Two sets, three camera framings. |
| Payoff | 21–27 s concrete takeaway | L6 19.75–22.08 s: back to the plans; a ripple runs through the menu. L7 22.43–26.56 s: one real customer steps onto each tier ("REAL CUSTOMERS"). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.07–29.28 s. On "bait" (26.3 s) the shoppers clear and Plus sinks; the logo tile rises in its place and lands at 26.84 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Werbens" ("Warbins";
documented limit, and the name is on screen). Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 11/11 | |
| L2 | 9/9 | |
| L3 | 11/11 | |
| L4 | 8/8 | |
| L5 | 10/10 | |
| L6 | 8/8 | |
| L7 | 11/13 | "Use it" written as "You sit" in the line window only; correct in the whole-mix pass and in the clean-narration check (13/13) |
| L8 | 6/7 | "Werbens" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.8 dBTP).

**Captions:** 13 groups, with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L1–L4). The first group
starts at 0.42 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.8 dBTP (≤ −1.5), LRA 3.1 LU, flat factor 0.
- Voice stem −20.7 LUFS.
- Music stem −31.3 LUFS: quiet, ducked −10 dB under speech; 6 held pads + 14 event-tied piano notes, no loops.
- Foley stem −34.5 LUFS (34 event-linked SFX).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 137–863, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 107–893, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 120–880, y 330–569 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 118–882, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips and no paragraph cards.
- In-world plates (not in the DOM check, measured from pixels): on the bar set the right EXTREME chip ends at x 881
  (frame 555). Render 1 had it at x ≈ 1060, under the platform icon rail, and was rejected for that reason (§7).

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-15; context/17 + context/32 §3)
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0 composed; the headline clears as the first caption appears.
2. Premium glows under the spotlight on "you'll probably skip".
3. Premium sinks into the floor ("MADE-UP PLANS"); shoppers hop to an even 6 / 6 split.
4. Premium rises back with a squash; shoppers hop over to Plus ("the middle choice").
5. Basic and Premium lean toward Plus on "neighbors"; Plus pulses on "alone".
6. Lateral move to the appeal bars: the middle bar rises ("MIDDLE GAINS"), then the extremes sink ("EXTREMES LOSE").
7. Back to the plans: a ripple runs through the tiers on "reshapes the whole menu".
8. One shopper steps onto the top of each tier ("REAL CUSTOMERS").
9. Shoppers clear and Plus sinks; Basic and Premium slide apart; the logo tile rises in Plus's place; wordmark and tagline follow.

**Motion and frames:**
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames: mid-move frames show both the plans and the bar set.
- No missing assets: fonts, logo and words.json load, and the page log is clean.
- No stray props under the CTA tile (frames 790–800 checked).

**Beats checked:** f0, f6, f13, f40, f75, f130, f160, f175, f210, f240, f255, f280, f300, f368, f385, f400, f420, f480, f500,
f520, f560, f580, f630, f660, f735, f760, f790, f800, f830, f899, plus f515, f555, f793 and f796 at full size.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| topic | the proposed decoy effect duplicates episode #03 | switched to the compromise effect (same family, different mechanism and evidence) |
| voice | "pricier" heard as "price your"; British "neighbours" broke caption alignment with the en-us voice; L1/L2 overlapped | "more expensive"; "neighbors"; lines re-spaced |
| stills | name plates hidden behind the shoppers; centre props left on stage at the CTA; empty frames on the move to the bars; REAL CUSTOMERS label close to the Premium shopper | plates raised to the pedestal tops; Plus sinks and shoppers shrink for the CTA; proof set moved closer (X2 0.62 → 0.46); payoff camera retargeted |
| render 1 review | right EXTREME chip and bar at x ≈ 920–1060, y ≈ 1390, under the TikTok/Reels icon rail; ~3 frames at 26.6 s with the sinking Plus box and shrinking shoppers showing under the logo tile | narrower bars and chips with a wider camera (chip now ends at x 881); Plus and the shoppers clear from 26.3 s, before the tile grows; render 2 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked with ASR (Whisper base.en), not a human listener.
- **Simonson & Tversky (1992):** the claims come from the published abstract (via OpenAlex). The finding is stated as direction
  only; the bars and shopper counts are illustrative, not study shares.
- **Simonson (1989):** background only. No primary abstract was accessible in this session, so nothing in the script depends on it.
- **Example:** the plans, tiers and coin stacks are made up; no prices or currency appear anywhere.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the
  repo.
- **Earlier work:** earlier MP4s were verified unchanged (18 files).
