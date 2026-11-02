# 09 — Educational Pilot 01: How a sewing machine forms a stitch

- **Output:** `videos/aarambh/education/pilot-01/aarambh-education-pilot-01.mp4`
- **Spec:** exactly 15.000 s, 1080x1920, 30 fps (450 frames), H.264 yuv420p, AAC 48 kHz stereo.
- **Source of truth for timing:** `education/pilot-01/src/timeline.json`. The renderer and the audio builder both read it.

## One concept
A **lockstitch** forms when the needle carries a loop of top thread below the cloth. A hook carries that
loop around the bobbin, and pulling the loop up locks the two threads together *inside* the cloth.

Explicitly **not** covered (to stay accurate in 15 s):
- chain stitch (one thread, no bobbin), shown nowhere
- tension adjustment
- hook timing details
- oscillating vs rotary hooks
- the fact that rotary hooks turn twice per stitch

The cutaway is labelled "simplified cutaway".

## Narration (Bindu), as rendered
| id | text | words |
|---|---|---|
| L1 | A needle only dips down and up. | 7 |
| L1b | So what locks the thread? | 5 |
| L2 | A loop forms underneath. | 4 |
| L3 | A hook carries that loop around the bobbin. | 8 |
| L4 | Pulled tight, two threads lock inside the cloth. | 8 |
| L5 | That's a lockstitch! | 3 |

That is 35 words and about 11.3 s of speech, leaving about 3.7 s of breathing room. Exact start times are in `timeline.json`.

## Storyboard (planned; final timings in timeline.json)
| time | scene | camera | Bindu action | mechanism / caption | SFX |
|---|---|---|---|---|---|
| 0.0–2.2 | S1 Workshop | wide on a painted workshop, slow push-in | grips the hand-crank, leans back (anticipation), cranks two strokes | the needle dips into the cloth twice. Caption: "A needle only dips down and up." | crank ratchet, needle thunks |
| 2.2–3.6 | S1 Puzzle | pans left/in toward the needle | hops along the bed, lifts the cloth corner, sees *cream* stitches underneath, puzzled brow, "?" pops | the cloth top shows gold stitches, the underside cream. Caption: "So what locks the thread?" | hop taps, cloth flap |
| 3.6–4.4 | T1 Dive | push into the needle hole, circular cutaway iris opens | dives into the hole, shrinks | the cutaway reveals the hook and bobbin below. Tag: "simplified cutaway" | whoosh, shrink pop |
| 4.4–6.2 | S2 Loop | cross-section, steady | lands on the cloth (squash), points down with the pencil | the needle carries gold thread through the cloth. As it rises a little, a loop forms. Labels: needle thread, bobbin thread. Caption: "A loop forms underneath." | needle push, soft loop pluck |
| 6.2–9.1 | S3 Hook | slight push toward the hook | leans back as the hook sweeps by, eyes track the loop, traces a circle with a finger | the hook beak catches the loop and carries it around the bobbin case. Labels: hook, bobbin. Caption: "A hook carries that loop around the bobbin." | catch tick, rotating swish |
| 9.1–12.3 | S4 Lock | push toward the cloth, then a magnifier | grabs the gold thread and is lifted by the take-up pull (dangles), drops and bounces, then holds a magnifier over the lock | the loop slips off and the take-up lever pulls it up. The loop shrinks around the bobbin thread and the lock settles mid-cloth (gold star). Caption: "Pulled tight, two threads lock inside the cloth." | thread zip, lock "tock", sparkle |
| 12.3–12.8 | T2 Exit | the iris closes back to the needle hole, the workshop zooms out | pops back to normal size | — | reverse whoosh |
| 12.8–15.0 | S5 Takeaway | workshop, medium | tugs a thread and a cream lesson banner unrolls. Bindu lifts the cloth corner again (top gold, underside cream), then winks | banner: "Lockstitch" + mini cross-section + "needle thread + bobbin thread, locked inside the cloth". Small "✦ Aarambh" signature. Caption: "That's a lockstitch!" | banner unroll, chime, music button |

## Accuracy guardrails
- **Two threads:** gold from the needle, cream from the bobbin.
- **The lock is drawn at mid-thickness** of two cloth plies. Wikipedia: "Ideally, the lockstitch is formed in the center of the thickness of the material".
- **The hook carries the needle-thread loop around the bobbin case**, and the bobbin sits inside it.
- **The take-up lever pulls the excess needle thread back up.** The bobbin thread is drawn up with it.
- **No chain-stitch imagery** (loops chained through each other on one thread) anywhere.
- **No claims about the app, income or impact.**
