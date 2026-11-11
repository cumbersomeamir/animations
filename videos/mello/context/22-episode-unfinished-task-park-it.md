# Episode record: "why an unfinished task follows you into bed, and how to park it" (English, english12-01)

Request: "NEXT EDUCATIONAL EPISODE — updated from Published apps, Satisfied? column, read 11 November 2026" (no batch ID given; the established path convention was used).
Deliverables:
- `videos/mello/production/30s/2026-11-11-english-12/mello-30s-english12-01.mp4`
- `videos/mello/production/30s/2026-11-11-english-12/mello-30s-english12-01-thumbnail.png` (1080x1920, "STILL IN YOUR HEAD?")

Durable rules: this is the first episode under `10-format-and-style-rules.md` section 8 (persisted 2026-11-11). This file adds the episode record only.

## User instructions applied
- **Topic (kept):** "Why unfinished tasks keep replaying in your head — and a concrete way to park one."
  - History check: not covered. Closest earlier episodes are english09 (end the workday by *finishing* one task; peak-end memory) and hindi04 (implementation intentions for *acting* on a goal). This one is about intrusive thoughts from an *unfinished* goal and quieting them with a plan.
- **Hook (as given):** "Why does one unfinished task follow you into bed?" with the open task shown as an unfinished loop.
- **Limits stated:** "In studies…", "In a sleep lab…", and "Not a cure, but the loop can wait." No guarantee.
- **Demonstration:** writing the next action and when it will happen ("Email Sam" / "tomorrow, 9:00"); the loop lands on "9:00" and closes.
- **Payoff:** one small usable practice, no breathing session, no guided meditation.
- **Feedback "match published app colors":** palette sampled from the *current* Play listing (below), not from an older asset.
- **Feedback "add soothing audio":** an original, gentle evening bed (slow filtered "air" swells) under the pad, below speech.
- **Thumbnail:** separate vertical PNG, four large words "STILL IN YOUR HEAD?".
- **Kept:** the approved narrator (Kokoro English blend), the 30 s portrait format, the room/rig/motion skill, the lock-up and CTA. No Hindi.

## Store palette (sampled 2026-11-11 from https://play.google.com/store/apps/details?id=mello.tensorblue.com)
- The current store icon is byte-identical to `assets/icon.png` (sha256 `3182c61f…ae81`).
- Seven current screenshots were downloaded to the session scratchpad (not committed) and sampled:

| role | hex | where sampled |
|---|---|---|
| background | #EDE8FE | screenshot backgrounds (gradient to #DFE2F8 / #EAE9FF) |
| headline ink | #191632 | screenshot headlines |
| primary violet | #633BFE | score knob / primary buttons |
| mascot lilac | #E6D2FC | mascot body |
| deep violet | #5B45A3 | mascot cushion |
| dark UI surface | #060513 | phone UI background |
| gold sparkle | #FEC357 | icon sparkles |

How they are used:
- **Stage:** tinted so it renders #EAE4F4. The target is #EDE8FE; the warm key light caps the blue channel. The background is set to the rendered stage colour so no horizon line shows.
- **Captions:** ink #191632, key words in violet #633BFE.
- **Loop:** violet #633BFE with a gold spark.
- **Card:** dark #060513 panel (the app's UI surface) with a deep-violet rim, white and lilac text, violet bars.
- **Duvet and other accents:** lilac.
- **Performer:** deepened to #8270C4 with a #5B45A3 cap, so it separates from the lavender stage.

## Research (sources checked 2026-11-11)
1. **Masicampo, E. J., & Baumeister, R. F. (2011).** Consider it done! Plan making can eliminate the cognitive effects of unfulfilled goals. *Journal of Personality and Social Psychology, 101*(4), 667–683. https://doi.org/10.1037/a0024192 (PubMed abstract, PMID 21688924)
   - "Unfinished goals caused intrusive thoughts during an unrelated reading task (Studies 1 and 5B), high mental accessibility of goal-related words (Studies 2 and 3), and poor performance on an unrelated anagram task (Study 4)."
   - "Allowing participants to formulate specific plans for their unfulfilled goals eliminated the various activation and interference effects."
   - "Once a plan is made, the drive to attain a goal is suspended … and is resumed at the specified later time."
2. **Scullin, M. K., Krueger, M. L., Ballard, H. K., Pruett, N., & Bliwise, D. L. (2018).** The effects of bedtime writing on difficulty falling asleep: A polysomnographic study comparing to-do lists and completed activity lists. *Journal of Experimental Psychology: General, 147*(1), 139–146. https://doi.org/10.1037/xge0000374 (PubMed abstract, PMID 29058942)
   - "Fifty-seven healthy young adults (18-30) completed a writing assignment for 5 min prior to overnight polysomnography."
   - "Participants in the to-do list condition fell asleep significantly faster than those in the completed-list condition. The more specifically participants wrote their to-do list, the faster they subsequently fell asleep."
3. Not used: claims about the classic Zeigarnik memory effect (mixed replication). The narration speaks only about intrusive thoughts and plans (study 1) and sleep onset (study 2).

How the script uses them (measured / interpretation / illustrative):
- **Measured (Masicampo & Baumeister 2011, lab studies):** "In studies, unfinished goals kept intruding on other tasks." "Writing a specific plan made those intrusions stop." The abstract says plans "eliminated" the effects in those studies.
- **Measured (Scullin et al. 2018, one sleep-lab study, n = 57 young adults):** "In a sleep lab, people who wrote a to-do list fell asleep faster than those listing finished tasks."
- **Interpretation, kept short:** "Not a cure, but the loop can wait." It reflects "the drive … is suspended … and is resumed at the specified later time" and limits the claim.
- **Application (advice):** "So park it: jot down the next step, and when you'll do it. Email Sam, tomorrow at nine." "Email Sam" and "9:00" are an illustrative example.
- **Illustrative visuals:** the blips on the "intrusions" card and the bar lengths on "falling asleep" show direction only, not data.

## Voice and verification
- Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, local CPU. No cloning, no celebrity imitation.
- "write the next step" was transcribed as "right the next step" (a homophone). The line became "jot down the next step", and ASR is exact on all 8 lines before render ("9" mapped to "nine").
- Measured word starts used for timing: "unfinished task" 0.87 s, "follow you into bed" 1.73, "kept intruding" 5.02, "specific plan" 7.72, "made those intrusions stop" 8.54, "sleep lab" 10.87, "to-do list" 12.61, "fell asleep faster" 13.17, "finished tasks" 15.27, "the loop can wait" 17.65, "park it" 19.27, "jot down the next step" 20.0, "when you'll do it" 21.2, "Email Sam" 22.4, "tomorrow at nine" 23.35.
- I can't listen to audio. The check is an ASR round-trip plus loudness and stem measurements.

## Final script (English, as recorded; 70 words)
| line | text | start | end |
|---|---|---|---|
| hook | Why does one unfinished task follow you into bed? | 0.30 | 2.79 |
| intrude | In studies, unfinished goals kept intruding on other tasks. | 3.25 | 6.78 |
| plan | Writing a specific plan made those intrusions stop. | 7.25 | 10.13 |
| sleep | In a sleep lab, people who wrote a to-do list fell asleep faster than those listing finished tasks. | 10.60 | 16.34 |
| qual | Not a cure, but the loop can wait. | 16.80 | 18.61 |
| park | So park it: jot down the next step, and when you'll do it. | 19.10 | 22.00 |
| example | Email Sam, tomorrow at nine. | 22.40 | 24.22 |
| cta | Take a mindful break with Mello. | 26.80 | 28.52 |

## Story and storyboard (Theory of Marketing; 5 shots)
- **Thumbnail:** "STILL IN YOUR HEAD?" over the open loop beside the performer's head.
- **Hook (0–3 s), S1, front-right:** the performer on the bed edge, lamp on; an open violet loop with a gold spark orbits his head from frame 0.
- **Escalation (3–7 s), S2, front-left close:** he reads; the loop cuts between his eyes and the page three times (intrusions).
- **Build-up and proof (7–18.8 s):**
  - S3, front-right: a dark in-app-style card titled "intrusions". Blips stream along a line, a note lands ("plan") and the line goes quiet.
  - S4, front-left: the card becomes "falling asleep", with a "to-do list" bar (short, violet) and a "done list" bar (longer, grey). On "Not a cure, but the loop can wait" the card fades, the camera settles on the performer, and the loop drifts to hang calmly by the lamp.
- **Payoff (18.8–26 s), S5, front-right lower:**
  - A note card writes "NEXT STEP / Email Sam / tomorrow, 9:00" in sync with the pencil on his lap.
  - On "tomorrow at nine" the loop flies onto "9:00" and closes, and a soft chime marks it parked.
  - The note drops into the notebook, which closes with the small closed ring on its cover. The lamp dims.
- **CTA (26.8–28.5 s):** a slow move to the room; lock-up (real icon, "Mello", "On Google Play") from 26.5 s.

## Skill / scene adjustments for future episodes
- **Readable writing:** the page on the lap is unreadable from any angle that keeps the head out of the captions. A camera-facing note card at a fixed screen spot carries the written words large and in sync with the pencil.
- **Highlighting on a lavender stage:** a lilac band behind violet text looked like a strikethrough. Use violet text alone.
- **Matching the store background:** the rendered stage is the colour to match. Set `scene.background` to it so the horizon disappears.
- **Ambience level:** the first ambience pass was 24 dB under the pad (inaudible). Raised to about 10 dB under the pad; the whole bed is 13.1 dB under the voice.
