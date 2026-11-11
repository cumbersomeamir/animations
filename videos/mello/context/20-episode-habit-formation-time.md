# Episode record: "how long a habit takes, and one missed day" (English, english10-01)

Batch: 2026-11-09 "english-10". Deliverable: `videos/mello/production/30s/2026-11-09-english-10/mello-30s-english10-01.mp4` (one video).
Durable rules: `10-format-and-style-rules.md` sections 1–7 (this batch was requested before the 2026-11-11 rules in section 8). This file adds the episode record only.

## User instructions applied
- **Suggested topic: implementation intentions.** Already covered in `14-episode-implementation-intentions-hindi.md` (hindi04-01). Following the batch rule "if this suggested subject already exists choose a fresh equally useful subject in the same genre", the episode teaches **how long habit formation takes and why one missed day doesn't derail it** (Lally et al. 2010).
- **Kept from the brief:** the evening cue "after I put my work bag down I will walk" is the visual: the bag goes down on the desk, then the performer turns and walks. Behavioural research cited without guaranteed results. No guided meditation.
- **Language:** English narration and captions only. Mello's accepted English voice, synthesized fresh; no Hindi audio reused.
- **Keep:** the accepted style (english06–09): room, slate performer, lavender/ivory palette, caption treatment, lock-up "On Google Play", CTA. Renderer unchanged.
- **First second:** a "21 days?" calendar is already crossing itself off at frame 0 (5 squares crossed); by 2 s all 21 are crossed, then "not quite" stamps on and dashed extra rows appear.
- **Not applicable:** "approved Meshline/Recall voice character" refers to other apps; Mello isolation applies.

## Research (source checked 2026-11-10)
**Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010).** How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology, 40*(6), 998–1009. https://doi.org/10.1002/ejsp.674 (abstract via Crossref)
- "96 volunteers chose an eating, drinking or activity behaviour to carry out daily in the same context (for example 'after breakfast') for 12 weeks."
- "The majority (82) of participants provided sufficient data for analysis … Nonlinear regressions fitted an asymptotic curve to each individual's automaticity scores over the 84 days."
- "The time it took participants to reach 95% of their asymptote of automaticity ranged from 18 to 254 days."
- "Missing one opportunity to perform the behaviour did not materially affect the habit formation process."
- "With repetition of a behaviour in a consistent context, automaticity increases following an asymptotic curve."
- The often-quoted 66-day median is **not** in the abstract, so it is not used.

How the script uses it (measured vs estimated vs illustrative):
- **Measured:** one new daily action in the same context, 12 weeks (84 days); the asymptotic shape ("climbs fast at first, then levels off"); one missed opportunity didn't materially affect the process ("didn't materially derail it", the authors' wording).
- **Estimated:** 18 to 254 days to reach 95% of each person's automaticity limit. 254 lies beyond the 84 study days, so it is a model estimate; the narration says "was estimated" and the card says "254 (estimated)", with the curves dashed beyond day 84.
- **Illustrative:** "e.g. a walk" on the card, the three curve shapes, the 21-square calendar and the week strip with one missed Thursday. The tip ("if you skip one evening walk, just walk the next evening, after the same cue") applies the missed-day finding; it is advice, not a promised outcome.
- "Twenty-one days … Not quite." contrasts a popular rule of thumb with the measured range; no claim is made about where the 21-day figure comes from.

## Voice and verification
- Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, local CPU. No cloning, no celebrity imitation.
- I can't listen to audio. ASR round-trip (faster-whisper large-v3-turbo, English, per line): CER 0 on all 7 lines before render. Whisper writes the numbers as digits (21, 18, 254); `src/asr_check.py` maps those three to words before scoring.
- Measured word starts used for caption timing: "not quite" 2.23 s, "people" 4.43, "same context" 6.79, "after breakfast" 8.35, "eighteen" 12.34, "two hundred fifty-four" 13.04, "levels off" 16.66, "missing" 17.86, "didn't" 18.60, "just walk" 22.62, "after the same cue" 24.12.

## Final script (English, as recorded; 73 words)
| line | text | start | end |
|---|---|---|---|
| hook | Twenty-one days to build a habit? Not quite. | 0.30 | 2.98 |
| study | In one study, people repeated one new daily action in the same context, like after breakfast. | 3.40 | 9.32 |
| range | Reaching near-automatic was estimated at eighteen to two hundred fifty-four days. | 9.75 | 14.66 |
| curve | It climbs fast at first, then levels off. | 15.05 | 17.37 |
| missed | And missing one day didn't materially derail it. | 17.75 | 20.38 |
| tip | So if you skip one evening walk, just walk the next evening, after the same cue. | 20.75 | 25.29 |
| cta | Take a mindful break with Mello. | 26.30 | 28.02 |

## Storyboard (5 shots, inside the accepted room)
1. **S1, 0.00–3.20: in front of the card.** "21 days?": 21 squares crossing themselves off from frame 0; "not quite" stamp; dashed extra rows.
2. **S2, 3.20–9.55: rear-left, closer.** "one study": "same context" → "after breakfast", "one new daily action" → "e.g. a walk"; 84 dots fill ("day N of 84 · 12 weeks").
3. **S3, 9.55–17.60: high rear-left.** "automaticity": three schematic curves draw (dashed beyond day 84); "18 days", "254 (estimated)", "fast at first", "then levels off". The performer stands up with the work bag before the cut.
4. **S4, 17.60–25.75: front-right, full figure.** A week strip fills M–S with Thursday left empty ("one missed day") and an onward arrow. On "after the same cue" the bag goes down on the desk ("same cue → walk"), the performer turns and starts walking.
5. **S5, 25.75–30.00: wide room.** The walk continues past the desk; lock-up from 26.0 s.

## Skill / scene adjustments for future episodes
- **Screen-anchored cards in a wide shot.** When the camera is wide enough for a standing figure, a world-placed card is too small to read. Place it camera-facing at a fixed screen spot (2.2 m in front of the camera, sized in pixels) and aim the shot so the head sits below it.
- **Fewer labels per diagram.** "study ends" was dropped from the curve card: the dashed segments already say "projected".
- **Mix.** `BED_GAIN` 0.40 gives 13.0 dB voice-over-music with this narration.
