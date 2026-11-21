# QA — Werbens English-23 30 s #01 "THE CUSTOMER BECAME THE CHANNEL" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-21-english-23/werbens-30s-english23-01.mp4`
**sha256:** `5b58d4987d445be828caabfc677c2e6babf986e79b2219d1c91795a3447fa228` · 8,047,846 bytes · checked 2026-11-21
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english23-01-thumbnail.png` (1080×1920; sha256 `75acb253dcf2929159714f82dd731dc683f0d44a8960dd60c4f0e3818b07b5ef`)
- `.jpg` (sha256 `a65478838291db4e8497bc3e1d41ad570c51d729f57c4cc23dcfc2728aa55981`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule) and §6 (caption
band y 280–460), and the batch23 brief (live feedback: colour theme and logo from app.werbens.com).
**Topic:** Spotify Wrapped makes the audience the distribution channel (not covered before; see `context/39` §2).

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render2.log`: video written in 682 s; `build/page-log.txt`: no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`), as the brief asked: one personal music-year card (avatar, three artist discs,
five song bars, a minutes ring, a share arrow, a brand tab; no text, no numbers, no Spotify branding) on a stand, with a tree of
glowing dotted share paths branching across the floor (illustrative 6 levels, 1,092 paths) carrying tiny copies of the card to
friend pawns. Headline "THE CUSTOMER / BECAME THE CHANNEL" (5 words, x 119–881, y 330–502). No intro, no fade. The same image
is the thumbnail (with the logo row added on a backing pill). Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why would anyone post a brand's card for free?" 0.15–2.55 s. Headline clears by 0.42 s; the share paths keep growing with a flowing glow. |
| Super hook | 3–5 s | L2 "Each year, Spotify Wrapped turns your listening into your story." 3.33–6.58 s. Paths retract into the card, its face empties, the camera pushes in; eight small records spiral into the card (4.3–6.11 s); the avatar pops on "your story". |
| Build-up + proof | 5–21 s, scene changes | L3 7.13–10.87 s: song bars, artist discs, minutes ring and share arrow appear on their words; the card turns to the viewer. L4 11.23–13.55 s: a generic ad board covers the card and sinks on "an ad"; the avatar glows (IT'S YOU). L5 14.43–17.45 s: friends appear, the camera orbits, the card turns past them and ends facing the viewer, friends lean in (HOW WE LOOK). L6 18.33–21.02 s: crane to top-down; copies of the card travel the paths 3 → 9 → 27 → 81 → 243, brand tabs glow (BRAND TRAVELS). |
| Payoff | 21–27 s concrete takeaway | L7 "Give customers a story about themselves worth sharing." 21.93–24.67 s: descend to the card; its face refills with the person's story (THEIR STORY); the share arrow pulses on "worth sharing"; the first paths regrow. |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. Pull-back from 25.4 s; stage sinks from 26.25 s; logo tile 26.38–26.74 s; wordmark 27.55 s. |

**Claims:** Wrapped's ingredients (yearly, top songs, top artists, minutes, a share card) are documented by Spotify's newsroom;
the sharing motive is hedged ("studies suggest we often") and sourced (Berger 2014; Toubia & Stephen 2013); L4 and L6 are
interpretation; L7 is advice. No launch date, share counts, reach or revenue (see `context/39` §4).

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration. Pauses between lines 0.36–0.91 s (2.36 s before the CTA line).

**Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script word for word, except "Spotify Wrapped" heard
as "Spotify Wrap" (the final t merges into "turns"; also in the clean narration) and "Werbens" ("Warbins" / "Wurbens";
documented limit, the name is on screen). Per-line windows: L1 9/9 · L2 9/10 · L3 12/12 · L4 8/8 · L5 11/11 · L6 9/9 · L7 8/8 ·
L8 6/7.

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope; clipping was checked with astats (flat factor 0, true peak −1.9 dBTP). I did not watch the video in real
time; frames were inspected as stills (§6).

**Captions:** 11 groups (shortest 1.41 s), with words brightening at their onsets (Whisper onsets plus `WORD_FIX` pins for L3,
L5 and L7; `WORD_TEXT_FIX` keeps the caption word "Wrapped"). The first group (the whole hook question) runs 0.42–3.15 s,
after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 3.1 LU, flat factor 0 (mix checked for NaN samples: 0).
- Voice stem −21.1 LUFS.
- Music stem −31.6 LUFS: the established soundtrack recipe — held pads ducked under speech, event-tied piano notes, no loops.
- Foley stem −36.2 LUFS (plinks, whoosh, record ticks, clacks, plops, riser, pops, slides, sink, shimmer, tags, chimes on the
  beats in `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 130–870, y 309–429 | x 100–900 / **y 280–460 (brief)** |
| Caption pill | x 100–900, y 293–447 | x 100–900 / **y 280–460 (brief)** |
| Frame-0 headline | 13 frames, x 119–881, y 330–502 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 153–847, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines and sit in the band the brief asked for (below the platform account UI).
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300 except the caption pill's top edge (y 293), 0 labels under the caption pill, 0 overlaps, never more than
  one big label at a time. Vital information is kept away from the right-side and bottom platform controls (everything inside
  x ≤ 900, labels/objects above y ≈ 1460).
- No source chips and no paragraph cards. No numbers in the scene.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-21; `context/17`, `context/39` §3)
Dark-navy hero theme (#0B1120 background, #0F172A ink, #7FE7DC / #316879 / #5CE0D2 accents, #F0FDFA text); the card face uses
the app's 135° #7FE7DC→#316879 gradient; the logo tile uses the unchanged app logo SVG (sha256 816c1761…); the wordmark is
Space Grotesk 700 with the 135° gradient. No werbens.com assets and no guessed light blue. Live feedback applied.

## 6. Visual review of the final MP4 (frames as stills; `qa/cuts.png`, `qa/cuts-b.png`, `qa/transition-sheet.png`, `qa/contact-sheet.png`, `qa/frames/`)
Inspected every move and transition and the ending in the final file: frame 0; headline → caption (0.4 s); paths growing (2.0 s);
retract and push-in (3.3–4.3 s); records spiralling in (4.3–6.1 s); avatar (6.2 s); bars, artists, ring, arrow and turn
(7.0–10.9 s); pull-back and ad board in, sinking, card revealed (11.2–12.8 s); friends pop and orbit (14.3–15.0 s); spin, back
face, card facing the viewer (16.3–18.4 s); crane (18.8 s); top-down tree growth (19.4–21.0 s); retract and descend
(21.3–22.2 s); refill (23.0 s); THEIR STORY (23.8 s); regrow (25.3 s); stage sink (26.2 s); tile (26.7 s); wordmark and tagline
(27.1–29.97 s). Objects stay in frame through every move; no missing assets; no text collisions; the ending holds the logo tile,
wordmark and tagline to the last frame.

**Render 1 was rejected after this review** (moved to the scratchpad, not committed):
1. 3.9–6.2 s showed a nearly static empty card; its six small discs were often edge-on.
2. At 17.4–18.4 s the card ended its spin turned away from the orbit camera.

Render 2 fixes: eight larger records spiral in from 4.3 s, face-on and below the caption band; the spin ends facing the viewer
and turns back on the descend. Render 2 is the delivered file.

## 7. Checks not performed
- No human listening and no real-time viewing (cloud session): audio was verified by ASR, loudness/peak/flat-factor statistics
  and stem levels; video by full decode, per-frame DOM bounds and still-frame review of every move.
- Not tested on a phone or inside a platform app (overlay positions follow context/27 §6).

## 8. Earlier outputs
All 25 earlier Werbens MP4s were re-hashed before delivery and are unchanged; nothing was deleted or overwritten.
