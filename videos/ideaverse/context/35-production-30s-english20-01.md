# 35 — Production 30s english20-01 (English): "A stranger's odds of unlocking your Face ID: under one in a million. Your twin's?"

Batch 2026-11-17-english-20 ("NEXT EPISODE — English batch20"; follows the delivered batch19). Workspace
`production/30s/2026-11-17-english-20/` · deliverables `ideaverse-30s-english20-01.mp4` + `ideaverse-30s-english20-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (clean at 6fc1527 when started; no other job running).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules + first-frame rule (context/11).
Latest LIVE feedback applied: CTA exactly "Download the Ideaverse app."; icon re-checked against the live Play listing
(unchanged, pixel-identical); no "how to use AI" tip and no shallow trivia — the episode explains a mechanism with a
surprising, checkable consequence (the published odds do not apply to twins/siblings/kids) and a concrete decision.

## Topic check (history: context/09, 12–34)
- Proposed: "How your phone can read a handwritten shopping list from a photo".
- Already covered: **english07-01** (context/22, photo of a handwritten shopping list → checklist by aisle, check the photo)
  → replaced.
- Chosen (same genre: everyday phone AI with a non-obvious mechanism, a verified number and a useful decision):
  **Face ID odds for look-alikes** — a 3D dot map turned into numbers and compared; Apple's own caveat that the odds rise for
  twins, look-alike siblings and kids under 13, and further with mask mode; use a passcode or turn mask mode off.
  Not covered by any delivered episode (a Face ID draft begun in english-13, git 3b655d1, was stopped and never delivered).

## Script (English, 72 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + superhook | A stranger's odds of unlocking your Face ID: under one in a million. Your twin's? |
| s2 | 5.90 | mechanism | It maps your face in 3D with thousands of invisible dots. |
| s3 | 10.20 | mechanism | A neural network turns that into numbers and compares them with yours. |
| s4 | 14.60 | proof (documented) | Apple says the odds rise for twins, look-alike siblings and kids under thirteen. |
| s5 | 19.95 | twist (documented) | And rise again with mask mode on. |
| s6 | 22.05 | payoff | If that's your home, use a passcode, or turn mask mode off. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed by base.en (punctuation/number normalisation aside) on first synthesis.

## Facts → sources (accessed 2026-11-17)
| claim | type | source |
|---|---|---|
| a stranger's odds are under one in a million | documented (Apple's stated probability) | Apple Support, "About Face ID advanced technology", https://support.apple.com/en-us/102381 — "The probability that a random person in the population could look at your iPhone or iPad Pro and unlock it using Face ID is less than 1 in 1,000,000 with a single enrolled appearance whether or not you're wearing a mask." |
| it maps your face in 3D with thousands of invisible dots | documented | same page — Face ID "captures accurate face data by projecting and analyzing thousands of invisible dots to create a depth map of your face"; "Face ID always requires depth information". |
| a neural network turns that into numbers and compares them with yours | documented | same page — "A portion of your device's neural engine … transforms the depth map and infrared image into a mathematical representation and compares that representation to the enrolled facial data." |
| the odds rise for twins, look-alike siblings and kids under 13; again with mask mode | documented | same page — "The statistical probability is higher — and further increased if using Face ID with a mask — for twins and siblings that look like you, and among children under the age of 13, because their distinct facial features might not have fully developed." |
| use a passcode, or turn mask mode off | documented (Apple's own recommendation) | same page — "If you're concerned about this, we recommend using a passcode to authenticate. You can also use Face ID without enabling Face ID with a mask." |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse face or security feature. |
Not used: Touch ID odds, attention detection, any number for twins (Apple publishes none). "If that's your home" = the
viewer's own household has twins/look-alike siblings/kids under 13 (Apple's wording: "If you're concerned about this").
Illustrative (not measured): the busts, depth colours, dot pattern, bar rows and their values, how close the twin row sits,
all phone screens (EXAMPLE; generic, not Apple's UI).

## Storyboard (cues.js)
1. 0–4.6 hook: two near-identical busts in the newsroom, DOCKET holding a locked phone; 1 IN A MILLION? from frame 0.
2. 4.6–5.75 superhook: "Your twin's?" → the second bust lights amber (YOUR TWIN?).
3. 5.75–10.1 scan: a phone's beam sweeps the face; depth colours near→far (3D MAP); a dot grid fills in (THOUSANDS OF DOTS).
4. 10.1–14.5 card: the face becomes a bar row (FACE → NUMBERS); the new row slides onto the saved one → ✓ (MATCH).
5. 14.5–19.9 the twin's row appears almost on top (TOO CLOSE); chips TWIN / SIBLING / UNDER 13 land on each word.
6. 19.9–22 a mask covers the lower face; its dots go out (MASK MODE: HIGHER).
7. 22–26.85 DOCKET's phone: passcode keypad (USE A PASSCODE) → "Face ID with a Mask" toggle off (MASK MODE OFF).
8. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "1 IN A / MILLION?".

## QA / status — DELIVERED 2026-11-18
- Output: production/30s/2026-11-17-english-20/ideaverse-30s-english20-01.mp4 · sha256 089ada07…5b39, plus
  ideaverse-30s-english20-01-thumbnail.png ("1 IN A / MILLION?"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −2.0 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Frames: 900 in 1432 s (3 workers) + re-renders 297–312 (caption boundary), 597–659 (no easel in the mask shot), 303–325 (saved
  row from the card cut).
- Limitation: ASR-only listening check (no by-ear listen possible here).
