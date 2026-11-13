# QA — Werbens English-13 30 s #01 "Identical boxes. Why pay more for one?" (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-13-english-13/werbens-30s-english13-01.mp4`
**sha256:** `7be48804cc1d45e437d1628f067d8a9e0159b7110ecc299f5ec2ffcbb0e209d8` · 4,116,175 bytes · checked 2026-11-13
**Thumbnail:** `werbens-30s-english13-01-thumbnail.png` (1080×1920; sha256 `6d86e50406d8ceb9fdad6ccd0eaa184e96925187f56b742d15596bc7923e9c70`)
and `.jpg` (sha256 `0448f27d83013a3882a508ac8f86e74a8902512ecf7b058da6b027366f7102e6`).
Rules checked against: `context/27-approved-feedback-rules-2026-11-11.md`, re-confirmed in the 2026-11-13 brief.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~194 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Story structure + pacing (context/27)
Times are narration on air, measured from the voice stem.

| Part | Required | As built |
|---|---|---|
| Hook | 0–3 s striking image + hook | Frame 0: two identical boxes falling into place. L1 "Identical boxes. Why pay more for one?" 0.33–2.77 s. Bid coins 5 vs 3. |
| Super hook | 3–5 s escalation | L2 "One difference: you built it." 3.23–4.67 s. The box half-unfolds and snaps back; a hex key turns. |
| Build-up + proof | 5–21 s, scene changes | L3 5.28–7.80 s (IKEA set) · L4 8.43–14.25 s (study set) · L5 15.03–18.15 s (boundary). Two sets, three moves. |
| Payoff | 21–27 s concrete takeaway | L6 19.43–21.51 · L7 22.23–25.74 s. The answer comes once, on "success"; the action is "A REAL STEP / NOT BUSYWORK". |
| CTA | 27–30 s | L8 "Follow Werbens to decode how brands sell." 27.07–29.28 s. Logo tile lands 26.88 s; wordmark 27.55 s. |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
- **Voice:** the established Meshline/Recall narrator: Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us,
  newly synthesised. English only. No Hindi, no reused narration.
- **Final-mix ASR (Whisper base.en):** the whole-mix transcript matches the script, apart from these spellings:
  - "IKEA's" → "IKEA"
  - "busywork" → "busy work"
  - "Werbens" → "Wurbens" (documented vocabulary limit; the name is on screen)
- **Per-line windows:** L1 7/7 · L2 5/5 · L3 8/9 · L4 16/17 · L5 12/12 · L6 8/8 · L7 10/11 · L8 6/7. The misses are the
  spellings above plus "ready-made" → "ready maid".
- **Listening:** this was checked by ASR only; no human listened in this cloud session. Narration sync was checked with ASR
  word windows and the voice-stem envelope. Clipping was checked with astats: flat factor 0, true peak −1.9 dBTP.
- **Captions:** 14 caption groups. Each word brightens at its onset (Whisper onsets, with `WORD_FIX` pins for L1–L5).
  `WORD_TEXT_FIX` corrects the "IKEA's" token text for caption alignment only.
- **Audio levels:**
  - Mix: −15.0 LUFS integrated, true peak −1.9 dBTP (limit ≤ −1.5), LRA 3.1 LU, flat factor 0.
  - Voice stem −20.9 LUFS (the accepted English level).
  - Music stem −31.4 LUFS: quiet, ducked −10 dB under speech; 7 held pads + 14 event notes, no loops.
  - Foley stem −33.7 LUFS.

## 4. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame)
Checked on 900 samples, one per frame, against the context/27 boxes.

| Item | Measured | Allowed box | Result |
|---|---|---|---|
| Caption ink | x 139–861, y 369–489 | x 100–900, y 230–1500 | PASS |
| Caption pill | x 109–891, y 353–507 | x 100–900, y 230–1500 | PASS |
| Caption lines | max 2 | ≤ 2 | PASS |
| Big labels ("WE", "YOU", "A REAL STEP", "NOT BUSYWORK"), wordmark, tagline | x 197–883, y 572–1456 | x 100–900, y 560–1500 | PASS |

Also confirmed on every frame:
- nothing in y 0–300;
- no label under the caption pill;
- no label overlaps;
- never more than one big label at a time;
- no source chips or paragraph cards.

## 5. Brand (live app.werbens.com, re-checked 2026-11-13; context/17 + context/29 §3)
- The site's palette, wordmark styling and `werbens-logo.svg` (sha256 816c1761…) are unchanged since the last check.
- Every scene uses the site's dark-navy hero theme. Measured colours:

  | Element | Measured |
  |---|---|
  | Box teal, key light | ≈ #1F697D |
  | Box teal, payoff spotlight | ≈ #267488–#2F8095 |
  | Mint coins | ≈ #82CCC5–#9BD8D1 |
  | CTA tile (logo SVG drawn unlit) | #7EE7DC / #316879 |

- Wordmark: Space Grotesk 700, −0.04 em, 135° gradient #7FE7DC→#316879.
- The copy and the CTA name only Werbens; no sales pitch.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
- **Beats, in order:**
  1. Frame 0: boxes falling. "=" between them. Bid coins 5 : 3.
  2. The coins clear. The left box half-unfolds and snaps back while a hex key turns.
  3. Lateral move to the IKEA set: the flat pack lands; "WE"; "YOU". The pack opens into a net that folds into a box. "YOU"
     fades before the panels rise (`qa/frames/f234-youfix.jpg`).
  4. Back to the study set: the left box lies flat, then folds up with the hex key. Its 5-coin stack rises. The identical
     ready-made box is handed in and gets 3 coins.
  5. Two sides drop (unfinished); the rest fold flat (taken apart). The extra coins vanish; stacks are 3 : 3.
  6. Refold. On "success" the last side clicks in, with a check mark and glow, and the coins come back.
  7. The front side drops for "A REAL STEP" and snaps up on "finish". "NOT BUSYWORK".
  8. The boxes slide off, the logo tile lands, then the wordmark and tagline appear.
- **Motion and assets:** no static page, no camera bobbing, no decorative lines. Transition frames always show a prop (f7 and
  f11 are mid-move). No missing assets: fonts, logo and words.json all loaded, and the page log is clean.
- **Beats checked:** f0, f15, f70, f88, f98, f135, f150, f160, f195, f215, f233, f260, f285, f315, f340, f357, f390, f475,
  f500, f530, f590, f615, f640, f663, f690, f715, f740, f760, f790, f800.
- **Thumbnail:**
  - Separate 1080×1920 image tied to the hook.
  - Headline "SAME BOX." / "PAY MORE?": 4 words, Space Grotesk 700, hero gradient.
  - Image: two identical teal boxes; the left one has a hex key in front and the taller bid stack.
  - Logo and wordmark at the bottom.
  - Text inside x ≈ 180–910; no text in the top 300 px.

## 7. Defects found and fixed (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| script | the first draft had no study year | "2012" added; lines re-timed (proof ends 18.2 s, payoff 19.4–25.9 s, CTA 27.0 s) |
| captions | Whisper dropped the possessive ("IKEA's" → "IKEA"), which shifted the L3 caption words | `WORD_TEXT_FIX` corrects the token text; times untouched |
| stills 1 | hook boxes small and coin stacks clipped at the frame edges; near-empty frame before the CTA tile | narrower boxes set closer together, coins centred in front, tighter cameras; CTA handoff re-timed |
| stills 2 | hook coins competing with the super-hook replay; the replay's flat side would reach the other box | coins clear at 2.98 s; the replay keeps the facing side up; the ready-made box is handed in further right |
| colour | box teal too dark under the key and too light under the spotlight | lit base recalibrated from pixel samples; spotlight dimmed; floor tint navier |
| honesty | illustrative stacks of 6 : 3 implied 2 : 1 (measured mean bids ≈ 1.6 : 1) | 5 : 3; the first render was stopped and restarted |
| render 1 | the "YOU" label touched the IKEA box as it rose at ≈ 7.8 s | label fades by 7.62 s; eased camera push; **full re-render (render 2)**. Render 1 is in checkpoint 8957b35 and is superseded at the same path |

## 8. Remaining limitations (honest)
- **Listening:** intelligibility and caption sync were checked by ASR (Whisper base.en), not by a human listener.
- **Scope of the study:** findings come from small, low-priced items (a storage box, origami, Lego sets) with student samples.
  The video says what happened "in a study". It does not claim a sales or conversion effect, and the payoff is framed as
  advice.
- **Which study showed what:** in the study, "took it apart" was the Lego experiment and "couldn't finish" was the IKEA-box
  experiment. The video shows both conditions on one illustrative box, and the episode notes record this.
- **Working paper vs published version:** study details and bid amounts come from the authors' working paper (HBS 11-091).
  The published abstract confirms the effect and its boundary conditions.
- **Review folder:** the local "video-review" folder named in the brief does not exist in this cloud container. The finished
  MP4 and thumbnail are delivered as chat attachments and at the repo paths above. QA, sources and production files stay in
  the repo.
- **Earlier videos:** all earlier MP4s were verified unchanged (15 files).
