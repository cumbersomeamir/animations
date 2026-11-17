# Episode record: "why do Mondays feel new?" (the fresh start effect), English, english19-01

Request: "NEXT EDUCATIONAL EPISODE — … next batch19 on 17 November 2026". Proposed topic: "Why writing an if-then plan beats waiting to feel motivated" (implementation intentions; "after the kettle boils, put shoes by the door").
Deliverables:
- `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01.mp4`
- `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01-thumbnail.png` (1080x1920, "WHY MONDAYS FEEL NEW?", the same composition as frame 0)

Durable rules: `10-format-and-style-rules.md` sections 8 (2026-11-11) and 9 (first frame). Palette as in `22`.

## Topic decision (history checked first)
- Implementation intentions (if-then plans) were the subject of hindi04-01 (`14`). They were proposed and swapped out again in english10 (`20`) and english17 (`27`). "Shoes by the door" was english15's payoff (`25`).
- So, as the brief instructs, a genuinely different topic in the same genre (starting a goal when motivation is low) was chosen: **the fresh start effect**.
- Affect labeling ("name it to tame it") was considered and rejected, because feedback-01 (`11`) already used "name it to tame it" framing.
- The fresh start effect is not covered in context 11–28.

## User instructions applied
- **First frame:** a giant standing calendar whose "SUNDAY" page, marked with crossed-out slip-ups, swings open like a door onto "MONDAY 1" with a gold sunrise. The performer faces it. The words "Why do Mondays / feel new?" (5 words) are on screen at frame 0. Hook audio at 0.15 s. The thumbnail is the same composition.
- **Retained:**
  - store-sampled palette (`22`);
  - soothing original bed (12.9 dB under the voice);
  - the approved faceless performer and narrator, synthesized fresh; English only; captions inside x 100–900; the accepted CTA.
- **Evidence-qualified tool, not a cure:** "In one study…", "A second study…", "can make…". The payoff is advice with no promised outcome.

## Research (sources checked 2026-11-17)
1. **Dai, H., Milkman, K. L., & Riis, J. (2015).** Put your imperfections behind you: Temporal landmarks spur goal initiation when they signal new beginnings. *Psychological Science, 26*(12), 1927–1936. https://doi.org/10.1177/0956797615605818 (PMID 26546079; PMC4839284, full text read)
   - **Study 1A** (MTurk, March 2014; N = 165 who signed up for a goal reminder):
     - Participants chose a date (March 18–24) for an email reminder about a goal.
     - March 20 was labeled either "(Thursday; The First Day of Spring 2014)" or "(Thursday; The Third Thursday in March 2014)".
     - "participants in the new-beginning-landmark condition were significantly more likely to choose to receive a goal reminder on March 20, 2014 than were participants in the control condition (25.61% vs. 7.23%, χ2(1) = 10.18, p = .001)".
   - **Study 1B** (university participants, N = 278): May 14 labeled "First Day of Penn's Summer Break" vs "Penn's Administrative Day": 28.57% vs 4.35% (p < .0001).
   - **Studies 2–3:** making New Year's feel meaningful increased engagement with goal websites. A new-cycle birthday raised predicted motivation to quit smoking but not to start.
   - **Study 4 (mechanism):** landmarks that feel like new beginnings raised goal motivation "in part by increasing the subjective distance separating the current self from the imperfect past self" (mediation).
   - The paper's own framing: "Only correlational evidence had previously linked temporal landmarks with goal initiation (Dai et al., 2014)."
2. **Dai, H., Milkman, K. L., & Riis, J. (2014).** The fresh start effect: Temporal landmarks motivate aspirational behavior. *Management Science, 60*(10), 2563–2582. This is the name of the effect; the citation was verified from the 2015 paper's reference list (not read in full). It reports correlational evidence that goal activities rise after landmarks (the start of a week/month/year, holidays, birthdays).

How the script uses them (measured / reported / gloss / advice / illustrative):
- **Hook (correlational, 2014 as cited in 2015):** "Why do Mondays feel new?"
- **Name (2014 title):** "Psychologists call it the fresh start effect."
- **Measured (Study 1A):** "In one study, people picked a day for a goal reminder. When March twentieth was labeled the first day of spring, over three times as many chose it."
  - 25.61 / 7.23 = 3.5×. The card shows "third Thursday" 7% and "first day of spring" 26%, with bars to scale (out of 30%).
- **Measured (Study 1B):** "A second study found the same for the first day of summer break."
- **Mechanism (Study 4, hedged):** "A new beginning can make past slip-ups feel further away."
- **Advice (no promised outcome):** "So when starting feels hard, pick a nearby day that feels like day one, and begin there."
- **Not claimed:** that landmarks make people *achieve* goals. The studies measured reminder sign-ups, website engagement and motivation ratings, and the script says only "chose it" / "found the same".
- **Illustrative:** the giant calendar, its pages, the crossed-out slip-ups on Sunday's page, the drifting page, and the gold DAY 1 tag on the coming Monday (the 15th, with today the 10th).

## Voice and verification
- Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, local CPU, synthesized fresh.
- A second proof line ("A second study found the same…") was added so the payoff lands in the 21–27 s window.
- ASR (faster-whisper large-v3-turbo, per line) is exact on the narration and the pre-render mix. "Twentieth" is transcribed as "20th" and normalised.
- Measured word starts (Whisper, about 0.1 s early):

| words | start (s) |
|---|---|
| "Mondays" | 0.43 |
| "fresh start effect" | 3.11 |
| "picked a day" | 5.91 |
| "goal reminder" | 6.79 |
| "March twentieth" | 8.24 |
| "first day of spring" | 9.76 |
| "over three times" | 11.14 |
| "second study" | 13.77 |
| "first day of summer break" | 15.61 |
| "past slip-ups" | 18.26 |
| "further away" | 19.30 |
| "pick a nearby day" | 22.36 |
| "day one" | 24.02 |
| "begin there" | 24.76 |

- I can't listen to audio. The check is an ASR round-trip plus loudness and stem measurements.

## Final script (English, as recorded; 86 words)
| line | text | start | end |
|---|---|---|---|
| hook | Why do Mondays feel new? | 0.15 | 1.40 |
| name | Psychologists call it the fresh start effect. | 1.85 | 4.15 |
| study | In one study, people picked a day for a goal reminder. | 4.55 | 7.72 |
| result | When March twentieth was labeled the first day of spring, over three times as many chose it. | 8.10 | 13.30 |
| again | A second study found the same for the first day of summer break. | 13.65 | 16.95 |
| why | A new beginning can make past slip-ups feel further away. | 17.30 | 20.14 |
| payoff | So when starting feels hard, pick a nearby day that feels like day one, and begin there. | 20.60 | 25.44 |
| cta | Take a mindful break with Mello. | 26.60 | 28.32 |

## Storyboard (7 shots)
- **S1, 0–1.7, frame 0 = thumbnail:** Sunday's page swings open like a door onto MONDAY 1; the performer faces it.
- **S2, 1.7–4.4:** straight on, MONDAY 1 ("the fresh start effect").
- **S3, 4.4–7.9:** dark in-app card "ONE STUDY / pick a day for a goal reminder". A March week strip (18–24); THU 20 is ringed in gold on "picked a day".
- **S4, 7.9–13.45:** new angle, "WHO PICKED MARCH 20 / for a goal reminder, by its label". "third Thursday" 7% (outline), then "first day of spring" 26% (gold).
- **S5, 13.45–17.15:** the MONDAY page swings open onto SUMMER BREAK, DAY 1.
- **S6, 17.15–20.45:** the old Sunday page with its slip-ups drifts away into the back of the room and fades.
- **S7, 20.45–30:** a month view (today the 10th, ringed). He sets a gold DAY 1 tag on the coming Monday, steps back and turns. Lock-up from 26.3 s.

## Result
- Final (render 2): `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01.mp4`
  - sha256 `a075e8c6c7e8025ec10a290c01bd6a35bf7a5bb57b6c732e73213b17e6a0b533`
  - 1080x1920, 30/1 fps, 900 frames, H.264 High yuv420p + AAC-LC 48 kHz, 30.000 s.
- QA: 16/16 (`production/30s/2026-11-17-english-19/qa/QA.md`):
  - full decode clean; −16.0 LUFS, −1.5 dBTP;
  - six cuts on plan;
  - 0 safe-zone issues in 300 samples;
  - ASR CER 0.000 / WER 0.000.
- Render 1 failed only the cut check (8.8 at the card-to-card cut); it was fixed with a low-angle S4.
- No listen-through (ASR and measurements only).

## Skill / scene adjustments for future episodes
- **Big props with text:** audit only the text area (here an invisible plane over the header, numeral and grid rows). Keep the prop at 4.1 m or more so it clears the right rail and the bottom zone.
- **Page flips:** a door-style swing (hinged on one side, opening toward a three-quarter camera on the other side) reads at a glance. An up-flip seen from the front is edge-on and invisible.
- **Two shots of the same card on a plain background:** change both elevation and azimuth substantially (here el +4° → −5°, az 0° → −30°). The cut check needs a frame change above 10.
