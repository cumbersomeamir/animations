# 12: Production 30s #01, "Why full bars can still mean slow data" (round production-30s-2026-11-02)

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-02/meshline-30s-production-01.mp4`, sha256 `99ac6725f731772bc74b3d3717ba21c965af3f939715f2fd15f9048a5edd8578`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 yuv420p + AAC 48 kHz stereo.
- Checks: full decode OK. −14.3 LUFS, −3.4 dBTP. ASR WER 0.0 on the final MP4. Caption ink inside y 350–470 with ≥ 80 px margins.
- Earlier outputs were not touched: 30s campaign, 15s test, pilot 01, 10s test.

## Brief (user-approved)
- One new 30.000 s educational video in the locked genre, using the Transit Map skill. Episode: "Why full bars can still mean slow data".
- Show a signal-strength route distinct from a capacity token queue. All four bars genuinely lit when full. No conflicting labels during camera moves.
- Generic cellular architecture only, with no Meshline protocol, range or guarantee. Agreed Kokoro voice.
- Publishing caption with sources.

## Final script (minimal edits)
The only edit to the draft was "will not" → "won't", for natural timing. Measured placements:

| id | time (s) | line |
|---|---|---|
| l1 | 0.40–3.01 | Full signal bars, but your message won't send? |
| l2 | 3.40–8.11 | Those bars mainly describe the radio signal between your phone and the network. |
| l3 | 8.40–11.02 | They don't show how much spare capacity is available. |
| l4 | 12.00–16.41 | At a busy concert, many phones can compete for the same shared resources. |
| l5 | 17.60–20.40 | Think of a clear road leading to a crowded station. |
| l6 | 22.90–25.48 | Strong signal and fast service are different things. |
| l7 | 25.80–29.42 | Keep an offline way to coordinate when connectivity matters. |

## Storyboard (as rendered)
| Time (s) | Beat | Map action | Caption chunks |
|---|---|---|---|
| 0–3 | Hook | YOUR PHONE's printed bars ink 1→4, then "signal: full" appears. Your message token tries to leave ("sending…", coral). The title is printed on the map. | "Full signal bars, / but your message won't send?" |
| 3–8 | Setup | The camera rides the pen tip inking the solid "radio signal" route. The CELL TOWER interchange lands with weight (6.9 s). | "Those bars mainly describe / the radio signal" → "between your phone / and the network" |
| 8–12 | Mechanism | A printed shared-capacity rack (6 slots) reveals 4 spare (dashed, glowing). | "They don't show how much / spare capacity is available" |
| 12–17 | Mechanism | Pull back over the concert. 15 phone routes ink in and converge, the rack fills ("no spare"), the station turns busy, and tokens queue on a hollow "waiting" siding. | "At a busy concert, / many phones can compete" → "for the same / shared resources" |
| 17.6–22.9 | Mechanism (analogy) | Push to the route. A light pulse runs freely on the "clear road", and your token speeds along it, then waits at the "crowded station". | "Think of a clear road / leading to a crowded station" |
| 22.9–25.7 | Takeaway | Printed legend: Signal strength (4 bars lit) vs Spare capacity (none). | "Strong signal and fast service / are different things" |
| 25.8–29.4 | Takeaway | Paper veil. Walking-dot paths ink from YOUR PHONE and FRIEND to an "agreed meeting spot". | "Keep an offline way / to coordinate" → "when connectivity / matters" |
| 29.4–30 | End | Pull back to the whole network, with a subtle Meshline signature. | (continues) |

## Sources → claims
See `production/30s/2026-11-02/research/claims.md`. The sources are T-Mobile 2026-03-26, Three UK 2026, Vodafone 2026-03-25 and NOAA/NWS (meeting spot). FCC is recorded as unverified.

## QA
See `production/30s/2026-11-02/QA.md`: 7 defects fixed, and the remaining limits are listed honestly.

## Reproduce
From `videos/meshline/production/30s/2026-11-02`, with deps from `education/pilot-01` (Node `@napi-rs/canvas` 1.0.11; Python numpy+scipy; faster-whisper 1.1.1 for ASR):
- `PY=<py> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <whisper-base.en dir> meshline-30s-production-01.mp4 qa/asr_final.json`

The narration WAVs are committed. To regenerate them, run `education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration`.

## Next
Await feedback. Future rounds follow `11-production-format.md`. No automation was created.
