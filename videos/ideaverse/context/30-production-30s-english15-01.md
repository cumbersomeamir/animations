# 30 — Production 30s english15-01 (English): "Your phone can shoot a room almost too dark to see. How?"

Batch 2026-11-15-english-15 ("NEXT EDUCATIONAL EPISODE", Satisfied? feedback retained; first-frame rule added). Workspace
`production/30s/2026-11-15-english-15/` · deliverables `ideaverse-30s-english15-01.mp4` + `ideaverse-30s-english15-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at 64c06c8; no job running, nothing queued).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules (context/11).

## Topic check (history: context/09, 12–29)
- Proposed: "Your phone can read a menu you cannot understand" — live camera translation (detection, OCR, translation,
  overlay), first frame an unfamiliar menu becoming readable.
- Already covered: **round02-01** (context/16, "How your phone reads text from a photo") explained finding where the text
  is and recognising letters, then narrated "translate a menu into your language" over an insert of a Spanish menu
  flipping to English (ES → EN). english07-01 (handwritten list) and hindi04-01 (care-label photo) used the same photo-text
  mechanism. Detection + OCR + menu translation would repeat that episode → replaced.
- Chosen (same genre: an everyday camera-AI mechanism + one real limitation, verified current consumer feature, equally
  strong transformation opening): **Night Sight / night mode** — how a phone photographs a room almost too dark to see
  (a burst of frames, lined up and averaged, then a neural network cleans up), and why anything that moves blurs.
  Not covered by any earlier episode (portrait blur in english-08 is a different mechanism).

## Script (English, 70 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.25 | hook + real question | Your phone can shoot a room almost too dark to see. How? |
| s2 | 3.85 | escalation | Night Sight, on a Pixel, takes a burst, not one photo. |
| s3 | 7.50 | mechanism + proof | The grain differs in every frame, so lining them up and averaging cancels it out. |
| s4 | 12.75 | AI step | A neural network then cleans up what's left. |
| s5 | 16.50 | the limit | But anything that moves won't line up. It blurs. |
| s6 | 20.90 | payoff | So brace the phone, and ask people to freeze until it's done. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en. Wording change: "Night Sight on a Pixel takes…" was heard as
"Nightside" by base.en → commas added ("Night Sight, on a Pixel, takes…"), exact in both models.

## Facts → sources (accessed 2026-11-15)
| claim | type | source |
|---|---|---|
| a phone can photograph a scene almost too dark to see | documented | Google Research blog, "Night Sight: Seeing in the Dark on Pixel Phones" (M. Levoy, Y. Pritch, 14 Nov 2018), https://research.google/blog/night-sight-seeing-in-the-dark-on-pixel-phones/ — "sharp, clean photographs in very low light, even in light so dim you can't see much with your own eyes"; also "can't operate in complete darkness" (hence "almost"). |
| Night Sight on a Pixel takes a burst, not one photo | documented (current) | same post — "capturing a burst of frames, aligning the frames in software, and merging them together"; "15 frames of 1/15 second (or less) each, or 6 frames of 1 second each" (Pixel 3 era) · Google blog, "How we made Pixel's Night Sight even faster" (18 Apr 2023), https://blog.google/products/pixel/night-sight-ai-faster/ — "the camera takes a burst of longer-exposure frames" (Pixel 7/7 Pro) · Pixel Camera Help, https://support.google.com/pixelcamera/answer/9708795 — "Take photos in low light with Night Sight … Hold still for a few seconds while your device captures the photo." |
| the grain differs in every frame; lining up + averaging cancels it | documented | 2018 post — noise "looks like random variations in brightness from pixel to pixel" (shot noise, read noise); "The idea of averaging frames to reduce imaging noise is as old as digital imaging … the hard part is getting the alignment right when the camera is handheld"; merging "averages multiple images together". |
| a neural network then cleans up what's left | documented (Pixel 7 and later) | 2023 post — "a new machine learning algorithm that runs on Tensor reduces unwanted noise in the final photo"; "a new neural network that dramatically reduces noise". |
| anything that moves won't line up; it blurs | documented | 2018 post — "motion blur, which might be due to handshake or to moving objects in the scene"; example: "The dog's head is motion blurred"; misaligned pieces are detected and rejected. |
| brace the phone; ask people to freeze until it's done | documented tip + practical inference | 2018 post tips — "brace your phone against a wall or tree, or prop it on a table or rock"; "whatever you're photographing probably won't hold still either" · Pixel Camera Help — "Hold still for a few seconds" · Apple iPhone User Guide, "Take Night mode photos", https://support.apple.com/guide/iphone/take-night-mode-photos-iph1a3c5b4c3/ios — "hold your iPhone still to take your shot"; "Use a tripod". ("Ask people to freeze" = inference from the moving-subject limit, not a quoted instruction.) |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse camera or photo feature. |
Not used on screen: frame counts, exposure times, lux values. Apple's mechanism is not documented in the same detail, so the
mechanism is attributed to Pixel's Night Sight only.
Illustrative (not measured): the room, the phone UI (moon chip, shutter, 15-tick capture ring; labelled EXAMPLE), 8 frames,
the grain (simulated Gaussian), the "neural network" sweep. The phone "photos" are real renders of the scene from the phone's
position with the room lit (a stand-in for a long clean exposure); averages and the motion smear are computed exactly from
those renders (8 noisy frames; 10 arm positions).

## Storyboard (cues.js)
1. 0–3.7 hook: dark newsroom, only a candle and DOCKET's glowing face; in front, a phone shows a bright, clean photo of the
   same scene; IT WAS THIS DARK? from frame 0; "How?".
2. 3.7–7.35 burst: close on the phone; shutter flash on "takes a burst"; 8 dark, grainy frames fly out one by one → BURST.
3. 7.35–12.6 frames: one frame brightened shows heavy GRAIN; the front frames slide aside (each grain pattern different);
   3/4 view: the shaky stack snaps into line (LINE UP); frames fly into one card, the grain fading as each is added (AVERAGE).
4. 12.6–15.6 NEURAL NETWORK: a sweep clears the remaining grain → ✓.
5. 15.6–20.65 DOCKET waves while the phone captures (ring ticks); push to the result: the arm smeared → MOVING = BLUR.
6. 20.65–26.85 the phone is set down on a stack of books (BRACE IT); DOCKET freezes mid-wave (FREEZE); the ring completes;
   the result is crisp → SHARP ✓.
7. 26.85–30 CTA: lights up; DOCKET waves; "Download the / [icon] Ideaverse app."
Thumbnail: the dark room + bright phone photo + "IT WAS / THIS DARK?".

## QA / status — DELIVERED 2026-11-15
- Output: production/30s/2026-11-15-english-15/ideaverse-30s-english15-01.mp4 · sha256 e6d03c9b…c35c, plus
  ideaverse-30s-english15-01-thumbnail.png ("IT WAS / THIS DARK?"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.8 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Limitation: ASR-only listening check (no by-ear listen possible here).
