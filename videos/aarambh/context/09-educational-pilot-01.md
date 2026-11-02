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

That is 35 words and about 11.8 s of speech (measured after processing), with gaps of 0.21–0.53 s between lines.

## Storyboard (as rendered, 2026-11-02; source of truth: src/timeline.json)
| time (s) | scene | camera | Bindu action | mechanism / caption | SFX |
|---|---|---|---|---|---|
| 0.0–2.2 | S1 Workshop | wide on the painted workshop, slow push-in | stands on a big spool, leans back (anticipation), cranks the hand-wheel two turns | the needle dips into the cloth twice. L1 "A needle only dips down and up." | ratchet clicks, needle thunks |
| 2.2–3.5 | S1 Puzzle | pans to the needle and swatch (zoom 1.42) | hops down twice to the table, picks up a stitched swatch and flips it: gold stitches on top, cream underneath. Puzzled brow, "?" pops | L1b "So what locks the thread?" | hop thumps, cloth flip, pop |
| 3.5–4.4 | T1 Dive | pushes into the needle hole (zoom 11); circular cutaway iris opens from the hole | leaps and shrinks into the needle hole (gone by 3.88), sparkle | the cutaway reveals the hook and bobbin; "simplified cutaway" tag | whoosh, shrink "pew", hole "plip" |
| 4.4–6.2 | S2 Loop | cross-section | drops onto the cloth (squash), points down with the pencil | the needle carries gold thread through two plies to the bottom (4.95) and rises a little, so a loop forms. Labels: needle thread, bobbin thread, loop. L2 "A loop forms underneath." | pierce click, loop pluck |
| 5.75 | catch | — | startled (wide eyes) | the hook beak seizes the loop | "tink" |
| 6.2–9.0 | S3 Hook | slight push | eyes track the beak, finger traces the circle | the hook carries the loop around the bobbin case (fully round by 8.55), then releases it. Labels: hook, bobbin. L3 "A hook carries that loop around the bobbin." | rotating whirr and hum, slip |
| 9.0–10.9 | S4 Pull | push toward the cloth | scurries left, grabs the take-up lever eye and is lifted off the cloth as the lever rises | the lever pulls the loop up; it shrinks around the bobbin thread. "take-up lever" label. L4 "Pulled tight, two threads lock inside the cloth." | thread zip with accelerating grains |
| 10.88 | lock | — | flung off, lands right of the foot (11.2) | the interlock snaps into the middle of the plies, with a gold sparkle | woodblock "tock" + sparkles |
| 11.2–12.25 | S4 Lens | slight push | holds a magnifier | lens ×2.3 on the lock; "the lock" label | lens "ting" |
| 12.08–12.32 | feed | — | rides the cloth | the cloth advances one stitch | shuffle |
| 12.2–12.75 | T2 Exit | the iris closes on the cloth while the workshop zooms out | hops out of the cutaway | — | reverse whoosh |
| 12.68–15.0 | S5 Takeaway | workshop medium, slow push | pops back to full size (sparkle), presents the banner, flips the swatch to the cream side and back (13.45 / 13.95), winks (14.2) | banner: "Lockstitch", cross-section with three locks, "Two threads, locked inside the cloth." L5 "That's a lockstitch!" | pop, paper flutter, flips, twinkle, music button (14.45) |

Narration line starts: L1 0.25, L1b 2.55, L2 4.45, L3 6.30, L4 9.05, L5 12.80. Ends are in audio/build/narration_timing.json.

## Accuracy guardrails
- **Two threads:** gold from the needle, cream from the bobbin.
- **The lock is drawn at mid-thickness** of two cloth plies. Wikipedia: "Ideally, the lockstitch is formed in the center of the thickness of the material".
- **The hook carries the needle-thread loop around the bobbin case**, and the bobbin sits inside it.
- **The take-up lever pulls the excess needle thread back up.** The bobbin thread is drawn up with it.
- **No chain-stitch imagery** (loops chained through each other on one thread) anywhere.
- **No claims about the app, income or impact.**
