# QA — Werbens English-18 30 s #01 "SAME DRINK. DIFFERENT FIZZ?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-15-english-18/werbens-30s-english18-01.mp4`
**sha256:** `ba78e2b438bb191dd761dab81e56461faedac560c344bab72ebf3915340c49e7` · 7,400,084 bytes · checked 2026-11-15
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english18-01-thumbnail.png` (1080×1920; sha256 `cbe71a36c0f0f25c08f090bbc2444343fb8472015ec5a1ff9801ad7c87d83ac7`)
- `.jpg` (sha256 `30adc144dc7cefed579cee7165140515c50c3dee9124fce9ea6102c2ff29f03d`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule, 2026-11-15).
**Topic:** sound cues and perceived carbonation. The proposed packaging-taste topic was already covered (pilot + #14), so a
different mechanism in the same genre was chosen; see `context/34` §2.

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
- two identical, unbranded tall glasses of sparkling water on speaker coasters, with identical bubble streams;
- the right glass is "loud" (glowing coaster ring, tall four-bar sound meter); the left one is quiet;
- the headline "SAME DRINK. / DIFFERENT FIZZ?" (4 words, x 118–882, y 330–565), readable at phone size.

The same image is the thumbnail (with the logo row added). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Can a sound make the same drink seem fizzier?" 0.15–2.24 s. Headline clears by 0.42 s; the 1 s pause after it lets the two fizz sounds be heard (right louder and brighter, panned right). |
| Build-up | 3–5 s escalation | L2 "Same water, two glasses. Only the sound changes." 3.33–6.47 s. SAME WATER; the left glass goes quiet, the right louder. |
| Proof | 5–21 s, scene changes | L3 6.98–11.02 s: pull back; rating sliders appear; the right sound is turned up; its slider moves toward fizzy (SEEMS FIZZIER). L4 11.48–14.38 s: sounds and sliders equalise; the right glass is lifted toward the viewer; its slider rises (CLOSER, FIZZIER). L5 14.88–18.55 s: straws in; the right sound pumps but the sliders end level (NO CHANGE); tingle shimmer in both. Three framings. |
| Payoff | 21–27 s concrete takeaway | L6 18.93–21.25 s: straws fade; the right slider moves ahead again (BEFORE THE SIP). L7 22.08–24.89 s: both glasses get sound; the real bubbles in both become denser and both sliders rise (THEN DELIVER). |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. The stage sinks from 26.25 s; the logo tile pops up 26.38–26.74 s; wordmark at 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration.

**Final-mix ASR (Whisper base.en):** identical to the clean-narration result, so the fizz bed does not mask the voice. Every
word is recognised; the only misses are spellings: "fizzier" written "fisier" (L1, L4), "two" written "to" (L2), and
"Werbens" → "Warbins" (documented limit; the name is on screen). Per-line windows:

| Line | Score | Note |
|---|---|---|
| L1 | 8/9 | "fisier" (spelling) |
| L2 | 7/8 | "to" for "two" (homophone) |
| L3 | 13/13 | |
| L4 | 9/10 | "fisier" (spelling) |
| L5 | 12/12 | |
| L6 | 9/9 | |
| L7 | 11/11 | |
| L8 | 6/7 | "Werbens" → "Warbins" |

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP). The left/right fizz difference
was checked by measurement only (SFX stem, 2.3–3.3 s: right −38.3 LUFS vs left −43.3 LUFS), not by listening.

**Captions:** 15 groups (shortest 0.94 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L3,
L5, L6 and L7; `WORD_TEXT_FIX` restores "fizzier" and "two"). The first group (the whole hook question) runs 0.42–2.84 s,
after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 3.2 LU, flat factor 0.
- Voice stem −20.6 LUFS.
- Music stem −31.6 LUFS: quiet, ducked −10 dB under speech; 8 held pads + 14 event-tied piano notes, no loops.
- Foley stem −34.2 LUFS: event-linked SFX plus the two synthesised fizz beds (bubble-pop clicks + hiss following each glass's
  sound level; ducked −4 dB under speech).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 158–842, y 369–489 | x 100–900 / y 230–1500 |
| Caption pill | x 128–872, y 353–507 | x 100–900 / y 230–1500 |
| Frame-0 headline | 13 frames, x 118–882, y 330–565 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 160–840, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines.
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300, 0 labels under the caption pill, 0 overlaps, and never more than one big label at a time.
- No source chips, no paragraph cards and no in-world text.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-15; context/17 + context/34 §3)
- Palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged.
- Every scene uses the site's dark-navy hero theme: navy stage, ink plinth and coasters, deep-teal water, mint meters,
  slider fills and coaster rings, mint-white glass rims and knobs.
- The CTA tile is the logo SVG drawn unlit (#7EE7DC / #316879).
- The wordmark is Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879.
- The headline uses Space Grotesk 700 with the hero gradient.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
**Beats, in order:**
1. Frame 0 composed; the headline clears as the hook caption appears.
2. Same bubbles in both glasses; the right meter and coaster are loud.
3. SAME WATER; the left glass goes quiet, the right louder.
4. Pull back: sliders appear; the right sound is turned up; its slider moves toward fizzy (SEEMS FIZZIER).
5. Sounds and sliders equalise; the right glass is lifted toward the viewer; its slider rises (CLOSER, FIZZIER); it returns.
6. Straws drop in; the right sound pumps; the sliders end level (NO CHANGE); tingle shimmer in both glasses.
7. Straws fade; the right slider moves ahead (BEFORE THE SIP).
8. Both glasses get sound; real bubbles denser in both; both sliders rise (THEN DELIVER).
9. The stage sinks, the logo tile pops up; the wordmark and tagline follow.

**Motion and frames:**
- The real bubbles are identical in both glasses in every frame; only "deliver" raises the real fizz, in both glasses.
- No static page, no camera bobbing, no decorative lines.
- No empty transition frames; no props crossing the caption or label band (straws fade in place).
- No missing assets: fonts, logo and words.json load, and the page log is clean.

**Beats checked:** f0, f6, f13, f45, f85, f118, f170, f215, f235, f260, f310, f330, f345, f365, f415, f440, f455, f490, f505,
f535, f562, f600, f625, f675, f735, f760, f789, f795, f830, f899.

## 7. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| topic | the proposed packaging-taste topic duplicates the pilot and #14 | switched to sound cues and perceived carbonation (same genre, new mechanism, built-in limitation) |
| voice | "touch and tingle won" heard as "one"; L2/L3 touching | "took over"; lines re-spaced |
| stills 1 | camera too close (glasses into the headline); meters seen through the glasses; milky water | pulled back; meters beside each glass; deeper water |
| stills 2–3 | glass tops, straws and the lifted glass touching the labels | every framing lowered; straws shortened; lift mostly forward |
| stills 4 | straws flying out through the caption band | straws fade out in place |
| audio | NaN samples from 14.9 s (`cupLand` without `size`); fizz bed too quiet in the hook gap | `size` added; fizz bed +5 dB |
| render 1 review | the hook caption "Can a sound" on screen for 0.27 s; "But in the mouth," for 0.73 s | groups merged (hook question 0.42–2.84 s; shortest group 0.94 s); render 2 |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility, caption sync and the fizz difference were checked with ASR and loudness measurements, not a
  human listener.
- **Zampini & Spence (2005):** the claims come from the abstract (Europe PMC record); the full text is behind the publisher's
  paywall, so no effect sizes or sample details are used; findings are stated as direction only. The sliders and meters are
  illustrative.
- **Takeaway:** "Let them hear the fizz, then make the drink deliver it" is practical advice derived from the finding, not a
  measured marketing result.
- **Background reviews:** Spence (2015) and Spence & Wang (2015) in *Flavour* were not read (publisher sign-in redirect); nothing
  depends on them.
- **Example:** the glasses and water are made up; no brand, package or price appears.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the
  repo.
- **Earlier work:** earlier MP4s were verified unchanged (20 files).
