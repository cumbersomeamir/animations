# Episode record: "waiting for the perfect words" (undervaluing gratitude), English, english17-01

Request: "NEXT EDUCATIONAL EPISODE — … next batch17 on 15 November 2026". Proposed topic: "Why a tiny first step can beat waiting for motivation". The brief asked for implementation intentions (a concrete if-then cue and action vs vague intentions), shoes by the door, and a frame 0 of a giant IF switch with "STOP WAITING TO FEEL READY".
Deliverables:
- `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01.mp4`
- `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01-thumbnail.png` (1080x1920, "PERFECT WORDS?", the same composition as frame 0)

Durable rules: `10-format-and-style-rules.md` sections 8 (2026-11-11) and 9 (first frame). Palette as in `22`.

## Topic decision (history checked first)
- Implementation intentions (if-then planning) were already the subject of hindi04-01 (`14-episode-implementation-intentions-hindi.md`). They were also the suggested topic swapped out in english10 (`20`).
- "Shoes by the door" was already english15's payoff (`25`), and a specific plan with a time was english12's (`22`).
- As the brief instructs, a genuinely fresh same-genre topic was chosen that keeps the "stop waiting to feel ready" spirit: **people undervalue a thank-you**. Writers expect it to land worse, and to be more awkward, than it does, and they worry most about their wording. Not covered in context 11–26.
- It is a psychology insight with one concrete demonstration (write one thank-you), not a guided meditation.

## User instructions applied
- **First frame:** the writer at his desk beside a heap of crumpled drafts taller than his head, pen hovering over a blank card, with one more draft mid-air. The words "Waiting for the / perfect words?" (5 words) are on screen at frame 0. Hook audio at 0.15 s. The thumbnail is the same composition.
- **Retained:**
  - store-sampled palette: stage #EDE8FE, ink #191632, violet #633BFE key words, lilac, deep violet, dark UI card #060513, gold #FEC357;
  - soothing original bed under the speech (12.9 dB under the voice);
  - the approved faceless performer (plus the second rig from english15 as the recipient) and narrator, synthesized fresh; English only; captions inside x 100–900.
- No guarantee and no clinical claim. Hedged wording: "can keep", "In experiments", "guessed", "rated".

## Research (source checked 2026-11-15)
**Kumar, A., & Epley, N. (2018).** Undervaluing gratitude: Expressers misunderstand the consequences of showing appreciation. *Psychological Science, 29*(9), 1423–1435. https://doi.org/10.1177/0956797618772506
- Read in full from a PDF copy of the published article; its embedded DOI matched. The PubMed and SAGE pages refused automated access, so no PMID is recorded.
- Abstract: "Participants in three experiments wrote gratitude letters and then predicted how surprised, happy, and awkward recipients would feel … Expressers significantly underestimated how surprised recipients would be about why expressers were grateful, overestimated how awkward recipients would feel, and underestimated how positive recipients would feel. Expected awkwardness and mood were both correlated with participants' willingness to express gratitude."
- **Experiment 1** (MBA students; N = 107 writers, 80 recipients responded):
  - Recipients' actual mood vs writers' predictions (−5 to 5 scale): 4.12 vs 3.11.
  - Awkwardness (0–10): 1.95 actual vs 2.95 predicted.
  - These means are reported in the third-party follow-up paragraph.
  - Paired tests: mood t(79) = 6.60, p < .0001; awkwardness t(79) = −2.89, p < .01.
- **Experiment 2** (lab, N = 100 writers, 58 recipients): mood underestimated (d = 0.43) and awkwardness overestimated (d = 0.39) again. Surprise at receiving did *not* replicate, so the script makes no surprise claim.
- **Experiment 4** (N = 127 writers, 78 recipients):
  - Writers predicted how competent (words "just right", articulate) recipients would rate their letter: M = 6.99, vs 9.28 actual (0–10).
  - "Miscalibration was significantly larger for competence … than for warmth."
  - The authors: expressers "may be inordinately concerned about their competence in expressing gratitude".
- **Experiments 3a/3b and a follow-up:** willingness to write was correlated with expected mood (mean r = .33), with expected awkwardness (−.30) and with the expected ability "to get the words just right" (.30).
  - These are correlations; the authors call it a possible "barrier".
- Instructions in the studies: describe "what this person did for them and how it affected their life" (adapted from Lyubomirsky et al., 2011).

How the script uses it (measured / hedged / advice / illustrative):
- **Hedged (correlational, authors' "barrier"):** "That worry can keep a thank-you unsent."
- **Measured (Exps 1, 2, 4):** "In experiments, people wrote thank-you letters and guessed the recipient's reaction. Recipients felt better than the writers expected, and less awkward."
- **Measured (Exp 4, one experiment):** "And the wording? Writers guessed about seven out of ten. Recipients rated it over nine." (6.99 → "about seven"; 9.28 → "over nine"; the card says "one experiment, averages" and shows 7 and 9.3.)
- **Advice (mirrors the study instructions, no promised outcome):** "Don't wait to feel ready. Write one thank-you today: what they did, and how it helped."
- **Card data:** the feelings card draws Experiment 1's averages to scale (mood rescaled to 0–10: 8.1 vs 9.1; awkward 3.0 vs 2.0); the wording card shows 7 vs 9.3.
- **Illustrative:** the heap of drafts, the handwritten note handed over in person, the "?" guess bubble, the recipient's hand on the chest. This is staging; the studies did not specify a handwritten note.

## Voice and verification
- Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, local CPU, synthesized fresh. First takes were used; no rewording was needed.
- ASR (faster-whisper large-v3-turbo, per line) was exact on the narration and on the pre-render mix. Digits "7", "10", "9" are normalised.
- Measured word starts (Whisper, about 0.1 s early):

| words | start (s) |
|---|---|
| "perfect words" | 0.75 |
| "worry" | 2.21 |
| "unsent" | 3.29 |
| "people wrote" | 5.51 |
| "thank-you letters" | 6.09 |
| "guessed" | 7.15 |
| "recipient's reaction" | 7.59 |
| "felt better" | 9.74 |
| "expected" | 10.80 |
| "less awkward" | 12.04 |
| "wording" | 13.55 |
| "seven" | 15.27 |
| "recipients rated it" | 16.77 |
| "over nine" | 17.83 |
| "don't wait" | 19.50 |
| "write one thank-you today" | 20.88 |
| "what they did" | 22.60 |
| "how it helped" | 23.52 |

- I can't listen to audio. The check is an ASR round-trip plus loudness and stem measurements.

## Final script (English, as recorded; 70 words)
| line | text | start | end |
|---|---|---|---|
| hook | Waiting for the perfect words? | 0.15 | 1.59 |
| worry | That worry can keep a thank-you unsent. | 2.05 | 3.85 |
| study | In experiments, people wrote thank-you letters and guessed the recipient's reaction. | 4.35 | 8.75 |
| felt | Recipients felt better than the writers expected, and less awkward. | 9.20 | 12.85 |
| words | And the wording? Writers guessed about seven out of ten. Recipients rated it over nine. | 13.35 | 18.55 |
| payoff | Don't wait to feel ready. Write one thank-you today: what they did, and how it helped. | 19.60 | 24.30 |
| cta | Take a mindful break with Mello. | 26.60 | 28.32 |

## Storyboard (7 shots)
- **S1, 0–1.95, frame 0 = thumbnail:** the writer at the desk, a heap of crumpled drafts beside him, one more draft landing; pen hovering over a blank card. "Waiting for the / perfect words?".
- **S2, 1.95–4.3:** closer. He crumples the card and tosses it onto the heap; the sealed envelope stays on the desk.
- **S3, 4.3–9.05:** wide, with the recipient. He writes, seals and hands over the envelope ("writer" label). A "?" bubble shows his guess. The recipient ("recipient" label) opens it and puts a hand on the chest.
- **S4, 9.05–13.2:** dark in-app card "HOW THE RECIPIENTS FELT". Writers' guess (outlined) vs what they felt (gold), for "felt good", then "awkward".
- **S5, 13.2–19.4:** light card "THEIR WORDING, OUT OF 10" ("one experiment, averages"). "7" (writers' guess) → "9.3" (recipients), with a gold ring.
- **S6, 19.4–24.3:** a flat-lay from above. He writes "Thank you," and two lines on the card as the narration says "what they did" and "how it helped".
  - The card is turned to the camera so the heading reads, a staging cheat.
- **S7, 24.3–30:** wide. He hands it over; the recipient opens it and glows a little. Lock-up from 26.3 s.

## Result
- Final: `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01.mp4`
  - sha256 `01155602871dd0f31dc91680b3334c5a3ac59a5ead1784d2984717725c0bfb44`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 (`production/30s/2026-11-15-english-17/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.4 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - ASR CER 0.000 / WER 0.000.
- No listen-through (ASR and measurements only).

## Skill / scene adjustments for future episodes
- **Writing close-ups:** an over-the-shoulder camera is blocked by the rig's head and arms. A near-vertical flat-lay, rotated so the writing arm enters from the side, keeps the caption band over the desk.
  - Rest the other hand in the lap, out of view.
- **Labels:** put labels above heads, not at waist height, where desk props can hide them.
- **Second figure:** `makeRig` and `poseStanding` from english15 work as a separate person (lighter body, violet hair).
