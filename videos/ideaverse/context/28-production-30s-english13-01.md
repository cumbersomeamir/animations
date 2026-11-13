# 28 — Production 30s english13-01 (English): "In total darkness, Face ID still knows it's you"

Batch 2026-11-13-english-13 ("NEXT EDUCATIONAL EPISODE", Satisfied? feedback retained). Workspace
`production/30s/2026-11-13-english-13/` · deliverables `ideaverse-30s-english13-01.mp4` + `ideaverse-30s-english13-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed; tree clean at 8874977 before edits).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules (context/11).

## Topic decision (history checked: context/09, 12–27)
- Proposed: "When your phone erases someone, where does the hidden background come from?" (inpainting; hook "IT WAS NEVER
  THERE"). This is the subject of **hindi03-01** (context/17): Magic Eraser removes a distraction and "AI predicts what
  would be there … the filled part is only a guess" — i.e. prediction vs recovery. It was also proposed and swapped in
  english-08 (context/23) and english-11 (context/26). Per the brief ("if already covered select a genuinely new same-genre
  topic"), it was replaced; no earlier narration reused.
- Chosen: **Face ID's invisible dots** — a surprising mechanism (an infrared dot pattern maps the face in 3D, compared with
  the face stored at setup), visual proof (a flat photo's dots lie in one plane → no depth → fails), and a concrete,
  sourced payoff (twins / look-alike siblings / kids under 13 → use a passcode). Not an "AI-use tip"; not covered before.

## Script (English, 72 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook | In total darkness, Face ID still knows it's you. |
| s2 | 3.40 | escalation (real question) | Yet a photo of you can't fool it. Why? |
| s3 | 6.20 | mechanism | Thousands of invisible dots land on your face, mapping its shape in 3D. |
| s4 | 11.60 | mechanism | It compares that shape with the face stored at setup. |
| s5 | 15.40 | proof | A flat photo has no depth, so it fails. |
| s6 | 19.40 | payoff | Twins, look-alike siblings and kids under thirteen are more likely to unlock it. If that worries you, use a passcode. |
| s7 | 27.40 | CTA | Download the Ideaverse app. |
Pronunciation: "are likelier to unlock it" → base.en heard "likely" → reworded "are more likely" (exact in base.en + small.en).

## Facts → sources (accessed 2026-11-13)
| claim | type | source |
|---|---|---|
| works in total darkness | documented | Apple Support, "About Face ID advanced technology", https://support.apple.com/en-us/102381 — "designed to work indoors, outdoors, and even in total darkness". |
| thousands of invisible dots map the face in 3D | documented | same — "projecting and analyzing thousands of invisible dots to create a depth map of your face and also captures an infrared image of your face" · Apple Platform Security, "Face ID and Touch ID security", https://support.apple.com/guide/security/face-id-and-touch-id-security-sec067eb0c9e/web — "projects and reads thousands of infrared dots to form a depth map of the face along with a 2D infrared image"; "projects a device-specific random pattern". |
| compares that shape with the face stored at setup | documented (simplified) | KB — the neural engine "transforms the depth map and infrared image into a mathematical representation and compares that representation to the enrolled facial data". (Narration mentions the shape only; the IR image is omitted for brevity.) |
| a flat photo has no depth, so it fails | documented | KB — "Face ID always requires depth information, which isn't found in print or 2D digital photographs." |
| twins, look-alike siblings, kids under 13 more likely; use a passcode if concerned | documented (Apple's own numbers context: random person < 1 in 1,000,000) | KB — "The statistical probability is higher … for twins and siblings that look like you, and among children under the age of 13 … If you're concerned about this, we recommend using a passcode to authenticate." |
| Ideaverse | — | Name + current Play icon only. No claim that Ideaverse uses or affects Face ID. |
Illustrative (not measured): the mannequin busts, the dot count/spacing on screen, red dot colour (real dots are invisible
infrared — the label says "drawn in red"), depth colours, lock hologram and passcode screen.

## Storyboard (cues.js)
1. 0–3.3 dark hook: a generic mannequin bust; red dots sweep down the face; lock LOCKED → UNLOCKED on "knows it's you".
2. 3.3–6 escalation: a printed photo of the same face rises in front of it, phone on a stand → NOPE; DOCKET skeptical; "Why?".
3. 6–11.4 close-up: INVISIBLE DOTS (drawn in red) sweep the face → 3D SHAPE: dots recoloured by measured distance (orange
   near → blue far) while the camera orbits to show relief.
4. 11.4–15.2 STORED AT SETUP: a mint copy of the dot cloud slides in from the side and lines up → MATCH ✓.
5. 15.2–19.2 the photo in front: its dots all one colour; the camera swings to the side — one flat sheet → NO DEPTH ✕.
6. 19.2–24.3 twin and child busts slide in beside the original → amber MAY UNLOCK.
7. 24.3–26.95 DOCKET's phone: Enter Passcode → ✓ USE A PASSCODE.  8. 26.95–30 CTA "Download the Ideaverse app."
Thumbnail: the dot-covered face (10.4 s) + "DOTS YOU / CAN'T SEE".

## QA / status — IN PROGRESS
- Pre-render mix ASR: all lines MATCH, no word outside captions.
