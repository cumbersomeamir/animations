# 23 — English-09 (2026-11-08 batch): "Why does your phone ignore you once you put on gloves?"

**Output:** `videos/recall/production/30s/2026-11-08-english-09/recall-30s-english09-01.mp4`

**Format:** 11. **Style:** 15, retained as most recently accepted in E06–E08 (same café, performer, lime phone, giant
mechanism set, lime/paper/ink palette, Fredoka caption pill, English voice). **Language:** English narration and captions only.
Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Batch 2026-11-08-english-09. One new 30 s English educational episode: why a touchscreen may fail with ordinary gloves but
  work with special touchscreen gloves; show capacitive sensing and conductive material completing the interaction; a useful
  winter-phone takeaway; distinguish capacitive from resistive screens. No quiz. If the topic was covered, choose another.
- Keep the most recently accepted style, palette, character, scene grammar and voice; first second visibly intriguing;
  concrete payoff; one short truthful CTA in the last 3–4 s; no long disclaimer; music quiet under speech; primary sources
  cited; publishing caption = final transcript, correct app identity, no editing instructions, no other app names. Finish
  older running jobs first.
- "The user approved improvements from the Instagram App Performance sheet": the sheet was not provided in this chat; the
  improvements named in the brief were applied. No sheet data is stored here.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations` (origin URL verified), branch `claude-video/recall` at 19668fd (E08 final),
  tree clean, **no running jobs** (`pgrep`). Git author is session-managed; commit trailers carry this session URL.
- **Topic history:** H03 (context 17, Hindi) covered why a **wet** touchscreen misbehaves (water changes the field; dry the
  screen). "glove", "resistive" and "stylus" appear in no earlier episode. Different everyday question and payoff (which
  gloves work; screens that need only pressure), so the suggested topic was **kept**; the mechanism visual is new (not H03's
  giant electrode-grid screen).

## Final script (73 words, 26.07 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.45 | Why does your phone ignore you once you put on gloves? | 2.49 |
| l02 | 3.30 | Your phone's screen is capacitive: it senses the electric charge of your fingertip. | 5.01 |
| l03 | 8.60 | Ordinary knit gloves don't conduct, so they isolate your finger and nothing registers. | 5.06 |
| l04 | 14.05 | Touchscreen gloves weave conductive thread into the fingertips to carry your touch through. | 4.62 |
| l05 | 19.05 | Resistive screens respond to pressure instead, so a gloved finger or plain stylus works. | 5.59 |
| l06 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English "Meshline"/Recall blend; no
  Hindi or earlier audio reused. ASR writes "Touchscreen" as "Touch screen" (same words).
- Wording fix for truthfulness: "Most phone screens are capacitive" (an unsourced share claim) → "Your phone's screen is
  capacitive" (a screen that ignores gloved fingers this way is a capacitive one).

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **US20110047672A1** "Glove with conductive fingertips": "To operate capacitive touchscreens requires electric conductivity
  between the screen and a user's fingers."; conductive yarn from the inner to the outer surface creates "a conductive pathway".
- **US20130104285A1** "Knit Gloves with Conductive Finger Pads": the finger's "electrical charge" changes the screen's
  electrical state; with gloves "the yarn separates and electrically isolates the user's finger pads"; "electrical current does
  not flow through common knit gloves"; conductive yarn transfers the charge.
- **US7163733B2** (resistive): two conductive layers separated by spacer dots; "a finger 13 or stylus deforms the flexible
  cover sheet 16 … causing the conductive layers 14 and 18 to touch and close a circuit."
- **TI TSC2046 datasheet** (PDF text): resistive touch screen controller; "To determine pen or finger touch, the pressure of the
  touch needs to be determined."
- **US10754438B2** (verified for H03): rows/columns of electrodes; a finger changes the capacitance at a crossing.
- Not usable: an Infineon URL serving a different PDF; Google Patents 503 in headless Chromium (read via a normal fetch);
  Analog Devices article 503. No bot check circumvented.

## Product-fact check (CTA)
Same CTA as 16–22. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café, performer and lime phone as F01/E06–E08** (`buildCafe` / `buildPerson` / `buildPhone` byte-identical). The
  performer's hands get a runtime knit-glove material (lime tips later); new real-scale fingers (bare, knit, touchscreen glove);
  an original home screen and notes app.
- **Opening = demonstration:** two knit-gloved taps (faint grey ring, nothing opens), then a bare tap opens the app (0–1.7 s).
- **Mechanism set:** a capacitive cross-section (glass / sensor grid / display) with field arcs, "x-ray" charge dots and a signal
  meter; the same station shows bare (charge flows), knit (coral dots bounce back, meter low) and touchscreen glove (dots ride the
  lime thread, meter up). A resistive stack (flexible sheet on spacer dots) dents under a gloved finger and then a stylus, with a
  lime contact ring.
- **Payoff:** a touchscreen-glove tap opens the app; on-screen takeaway "Winter tip: gloves with conductive fingertips." (no VO).
- **Audio:** accepted score engine retimed; muffled glove taps, clicks, pop, shimmer + rising beeps for the meter, bonk + fizzle
  for blocked charge, squish + contact clicks for the resistive presses, chime; English bed gains 0.5/0.6.

## Skill adjustments learned this round
- Objects meant to be seen "inside" an opaque mesh (charge dots in a glove) need `depthTest:false` and a high `renderOrder`.
- A "press" needs an explicit hold (down, hold, up), not a short pulse, or the contact never reads.
- Avoid share/majority claims ("most …") unless a source states them; re-phrase to what the scene itself proves.

## Progress
- 2026-11-08 batch: setup confirmed; topic kept (H03 covered wet screens, not gloves/resistive); sources verified; narration
  generated and ASR-checked (one wording fix for truthfulness); scene built from E08 tooling; preview stills reviewed and fixed:
  - charge dots hidden inside the glove → drawn x-ray;
  - giant cameras pulled back to include the signal meter; resistive camera lowered to a side view;
  - resistive presses given an explicit hold.
  - Mix −14.63 LUFS, −1.6 dBTP, voice +16.6…+18.3 dB.
  - Pre-render caption sync: all 10 spoken groups 0.04–0.10 s before their first word.
  - Full render started (`WORKERS=3 ./build.sh`, one process).

## QA summary (verification results; details in the output folder's qa/QA.md)
Pending the full render.

## Publishing caption
`production/30s/2026-11-08-english-09/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l05; l06) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app
names; no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-08-english-09 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
