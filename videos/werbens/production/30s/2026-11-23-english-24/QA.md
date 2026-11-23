# QA — Werbens English-24 30 s #01 "WHY ROOMS COME FIRST?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-23-english-24/werbens-30s-english24-01.mp4`
**sha256:** `1835159af742f087994f57558c84deea435a1ff1f49f9838953289ba838eb338` · 9,826,679 bytes · checked 2026-11-23
**Thumbnail (= frame 0 + logo row):**
- `werbens-30s-english24-01-thumbnail.png` (1080×1920; sha256 `fa6c48ee731eb85017dcd93a0a25c0e9c95e4862437f5ad24604c39b2d2d9e5e`)
- `.jpg` (sha256 `df956df15bac0feb1885386e64e1f55946cb3d8c39ca9afddd04c695a1dc97de`)

**Rules checked against:** `context/27-approved-feedback-rules-2026-11-11.md`, including §5 (first-frame rule) and §6 (caption
band y 280–460), and the batch24 brief (live feedback: colour theme and logo from app.werbens.com).
**Topic:** why IKEA walks you through rooms before you buy — room-context merchandising (not covered before; see `context/40` §2).

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/render2.log`: video written; `build/page-log.txt`: no console errors or warnings | PASS |

## 2. First frame + story structure + pacing (context/27 incl. §5)
**Frame 0** (`qa/frames/f000-firstframe.png`), as the brief asked ("original miniature room unfolds from flat products"): an
original miniature living room caught mid-unfold on a store floor — walls hinging up, rug unrolling, sofa lifting, lamp,
tables and plant still lying flat as cut-outs; the next room lies flat in the background. Headline "WHY ROOMS / COME FIRST?"
(4 words, x 118–882, y 330–619). No intro, no fade. The same image is the thumbnail (with the logo row on a backing pill).
Hook audio starts at 0.15 s.

| Part | Required | As built (narration on air) |
|---|---|---|
| Hook | 0–3 s | L1 "Why does IKEA walk you through rooms first?" 0.15–2.13 s. Headline clears by 0.42 s; the room finishes unfolding; its lamp lights on "rooms". |
| Super hook | 3–5 s | L2 "Its store guide says: start with the showroom." 3.03–5.38 s. Pull back over the entrance; a shopper appears; the arrow path lights from the entrance into the showroom (SHOWROOM FIRST). |
| Build-up + proof | 5–21 s, scene changes | L3 5.88–9.18 s: follow-cam walks the path; rooms pop up on either side; flat packs slide onto racks on "Flat packs". L4 9.73–13.96 s: a lone sofa on a plinth gets a size bar and a plain tag, then a room unfolds around it, lamp and night window light (YOUR EVENING). L5 14.53–18.64 s: thought arc, imagined shopper on the sofa reaching for the cup (PICTURE IT). L6 19.18–20.87 s: a flat pack slides onto the cart; a ghost of the finished room rises (FINISH THE ROOM). Distinct sets and camera moves. |
| Payoff | 21–27 s concrete takeaway | L7 "Don't just show the product. Show the life around it." 21.63–24.29 s: overview of the whole path; every room's context folds flat (products alone), then walls, rugs, lamps and people pop back (SHOW THE LIFE); push into the frame-0 room, now lived in. |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.03–29.29 s. Pull-back from 25.7 s; stage sinks from 26.25 s; logo tile 26.38–26.74 s; wordmark 27.55 s. |

**Claims:** store practice quoted from IKEA's own store pages (showroom first, rooms with furniture in action, flat packs in
the self-serve area later; layouts vary by store, so the narration attributes the order to "its store guide"); the research
line is hedged ("studies suggest … can") and comes from ad studies (Escalas 2004; Elder & Krishna 2012); L4 and L6 are
interpretation; L7 is advice. No conversion or sales figures (see `context/40` §4).

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
**Voice:** the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
synthesised. English only, no Hindi, no reused narration. Pauses between lines 0.47–0.87 s (2.68 s before the CTA).

**Final-mix ASR (Whisper base.en):** per-line windows L1 8/8 · L2 8/8 · L3 9/9 · L4 15/15 · L5 13/13 · L6 7/7 · L7 10/10 · L8 6/7
("Werbens" → "Warbins", documented limit; the name is on screen). In the single whole-mix pass Whisper wrote "Its door guide
says" for "Its store guide says" (the per-line window and the clean narration both read "store"); noted as a borderline word,
not changed.

**ASR only; no human listening was performed in this cloud session.** Narration sync was checked with ASR word windows and the
voice-stem envelope (`WORD_FIX` pins for L1, L2, L4, L5, L6); clipping was checked with astats (flat factor 0, true peak
−1.9 dBTP). I did not watch the video in real time; frames were inspected as stills (§6).

**Captions:** 12 groups (shortest 1.48 s), with words brightening at their onsets. The first group (the hook question) runs
0.42–2.70 s, after the headline.

**Audio:**
- Loudness: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 2.6 LU, flat factor 0 (float mix and stems scanned for
  NaN/Inf samples: 0).
- Voice stem −20.7 LUFS.
- Music stem −31.7 LUFS: the established soundtrack recipe — held pads under speech, event-tied piano notes, no loops.
- Foley stem −36.0 LUFS (flaps, rolls, plops, clacks, ticks, slides, zip, flip, glow, shimmer, clink, tags on the beats in
  `src/timeline.js`).

## 4. Captions, headline, labels and safe areas (`qa/dom-bounds.json`, every frame)
900 samples (every frame):

| Element | Measured | Allowed |
|---|---|---|
| Caption ink | x 175–825, y 309–429 | x 100–900 / **y 280–460 (brief)** |
| Caption pill | x 145–855, y 293–447 | x 100–900 / **y 280–460 (brief)** |
| Frame-0 headline | 13 frames, x 118–882, y 330–619 | x 100–900 / y 230–1500 |
| Big labels, wordmark, tagline | x 110–890, y 574–1456 | x 100–900 / y 560–1500 |

- Captions use at most 2 lines and sit in the band the brief asked for (below the platform account UI).
- The headline is never visible together with a caption pill or a big label (0 conflicts).
- Nothing in y 0–300 except the caption pill's top edge (y 293), 0 labels under the caption pill, 0 overlaps, never more than
  one big label at a time. Vital information stays inside x ≤ 900 and above y ≈ 1460.
- Label legibility over the 3D scene was checked in the frame review (§6): every label sits over dark floor, a wall or rack
  posts, not over a light floor plate.
- No source chips and no paragraph cards. No numbers in the scene.

Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-23; `context/17`, `context/40` §3)
Dark-navy hero theme (#0B1120 background, #0F172A ink, #7FE7DC / #316879 / #5CE0D2 accents, #F0FDFA text) applied to every prop
(teal walls, mint furniture, mint-white tables and packs); the logo tile uses the unchanged app logo SVG (sha256 816c1761…);
the wordmark is Space Grotesk 700 with the 135° gradient. No werbens.com assets and no guessed light blue. Live feedback applied.

## 6. Visual review of the final MP4 (frames as stills; `qa/cuts.png`, `qa/cuts-b.png`, `qa/transition-sheet.png`, `qa/contact-sheet.png`, `qa/frames/`)
Inspected every move and transition and the ending in the final file: frame 0; headline → caption (0.4 s); room finishes
unfolding, lamp (1.2–2.0 s); pull-back over the entrance and the path lighting (3.0–5.0 s, label legibility at full size);
descent into the follow-cam (5.8 s); rooms B and C popping up (6.3–7.4 s); racks filling (8.0 s); aisle (8.5–9.5 s); the lone sofa,
size bar, tag (10.0–12.5 s); room D unfolding, YOUR EVENING (13.0–13.7 s); move to the over-the-shoulder shot (14.7 s; a rack post
passes in the foreground for a moment); imagined shopper (15.5–18.9 s); turn to the shelves, pack onto cart, ghost room
(19.3–21.3 s, full size); crane to the overview, fold (21.8–23.0 s); pop + people (23.8–24.7 s); push into room A (25.7 s); stage
sink (26.3 s); tile (26.8 s); wordmark and tagline (27.7–29.97 s). Objects stay in frame through every move; no missing assets;
no text collisions; the ending holds the logo tile, wordmark and tagline to the last frame.

**Render 1 was rejected after this review** (moved to the scratchpad, not committed): at 4.3–5.75 s the "SHOWROOM" part of the
label sat over a light floor plate (low contrast). Its automated checks had passed (30.000 s, 900 frames, 0 decode errors,
−15.0 LUFS); its every-frame DOM check and ASR were stopped once it was rejected. Render 2 re-solves the super-hook overview
camera (no plate in y 560–700) and makes the ghost room more visible; it is the delivered file.

## 7. Checks not performed
- No human listening and no real-time viewing (cloud session): audio was verified by ASR, loudness/peak/flat-factor statistics
  and stem levels; video by full decode, per-frame DOM bounds and still-frame review of every move.
- Not tested on a phone or inside a platform app (overlay positions follow context/27 §6).

## 8. Earlier outputs
All 26 earlier Werbens MP4s were re-hashed before delivery and are unchanged; nothing was deleted or overwritten.
