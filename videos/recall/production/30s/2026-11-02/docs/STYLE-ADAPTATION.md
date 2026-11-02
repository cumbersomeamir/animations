# Style adaptation — Microgame Frenzy → Recall knowledge challenge

Skill used as read-only art direction: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/microgame/STYLE.md
("Microgame Frenzy — Style Prompt"; 120 lines, read in full 2026-11-02 via a web fetch). No commit hash was visible
in the fetched page. The linked DEMO.md and the repo's `demo/*.js` engine files were **not** fetched, cloned or run;
everything here is original code.

## What the document asks for (summary)
A microgame = shouted command word + 2.5–4 s + one action + one result. A fixed home stage (flat toon, thick outline,
hard shadow, frame-within-the-frame, lives board, stage badge, trigger prop), each game drawn in a different medium,
acceleration, a timer that is "visible and on the beat" (fuse with one knot per beat), push-in/shrink transitions with
✓/✗ stamps, "no fades, no blank frames", the command word slamming in over ~3 frames then shrinking to a corner tag
before the action ("so the result is never covered"; tags never pile up), music first (tempo grid + cue table, every
picture hit on a cue), the host ticking on every beat, silence before the biggest hit, a heavy display face (e.g.
Titan One), rounded cards with hard shadows, duck music ~11 dB and foley ~6 dB under the voice at −14 LUFS.

## Applied in this video
| skill rule | here |
|---|---|
| command word slam → corner tag | WATCH! / GUESS! / ANSWER! / FILL IT! / REPLAY! in Titan One with lime burst, skew, 3-frame overshoot; shrinks to a lime tag in the UI row; the old tag flies out |
| timer on the beat | 2.0 s fuse at 120 BPM, four knots on beats 6.5/7.0/7.5/8.0 s, ends on the 8.5 s answer stab |
| ✓/✗ stamps | SINKS ✗ (ball, flooded ship), FLOATS ✓ (ship), ✓ inside answer chip B |
| frame-within-the-frame | the two-chamber challenge tank with a lime cabinet frame and BALL/SHIP podium plates |
| stage badge | "Q1 · GRADE 5 SCIENCE" chip; TAKEAWAY chip at the end |
| music first, hits on cues | `build/cue_table.json`; 120 BPM grid; stabs on commands; events in `qa/audio_report.json` |
| host ticks on the beat | sunburst brightness pulse + Kip's beat bob |
| silence before the biggest hit | the groove drops to heartbeat + fuse ticks for the 2 s guess; the answer gets the biggest stab + crash |
| no fades / blank frames | camera push-ins and slams only; the video ends on a held, composed frame |
| hard-shadow cards, heavy display face | caption pill, chips, tags, stamps |
| instant replay | REPLAY! rewinds the flooded ship back to floating for the takeaway |
| hero silhouette marks | Kip keeps lime helmet + scarf |
| duck ~11 dB / ~6 dB | implemented in `audio/mix.py` |

## Deliberate deviations (and why)
- **One medium (clay), not a new art style per game.** The brief requires "continuous coherent scene language" and
  a physical miniature tank; switching media would break the explanation.
- **Palette:** Recall icon lime/paper/ink instead of a saturated party palette (brief: brand colours from app assets).
- **No lives board, failures or acceleration.** The genre is a passive knowledge question with one mechanism; the
  "failure" is the flooded ship's ✗, which is the teaching point, not a joke.
- **Portrait layout:** fixed safe-area zones (top 300 px clear, captions y 350–470, UI row 500–612) replace the
  skill's 40 %-width game screen.
- **Loudness:** −14.5 LUFS integrated (inside the brief's −14 to −16) for true-peak headroom, rather than exactly −14.
- **Captions:** the brief requires captions, so narration captions sit in an upper-centre pill; command words are
  separate on-screen titles, not repeated in the captions.
