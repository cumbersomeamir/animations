# 14: Production 30s, store-and-forward ("How a message can travel without a complete connection"), 2026-11-03

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-03/meshline-30s-store-forward-01.mp4`, sha256 `9ed0380683c235e840ee61e025a0444fe7b60d3cdc8b82ca43abe0a5a35e05a5`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 yuv420p + AAC 48 kHz stereo.
- Checks: full decode OK. No freeze. −14.2 LUFS, −2.8 dBTP. ASR WER 0.027. Captions inside y 350–470 and x 90–990.
- Prior outputs (01, 02 and earlier) are preserved and untouched.

## Brief (user, 3 Nov 2026)
- One new 30 s English educational video, same accepted batch-02 Transit Map style. Topic: store-and-forward / delay-tolerant networking as an everyday mechanism.
  - Station A stores an envelope, a travelling relay accepts it and later forwards it to B.
  - Compare a broken continuous route with a route assembled over time, and show a clock/timeline so delay and non-guaranteed delivery are visible.
- Sources: RFC 9171 and NASA DTN. Present a generic principle, not a Meshline feature.
- 65–75 words, with the CTA in the last 3 s: "Explore offline communication with Meshline."
- Quiet bed with no repetitive beat. Captions inside y 350–470 and x 90–990, with nothing meaningful in the top 300 px or the bottom/sidebar areas.

## Final script (74 words, Meshline Kokoro blend 0.7 af_bella + 0.3 am_puck, 0.98, en-us)
| id | time (s) | line |
|---|---|---|
| l1 | 0.30–4.18 | No connection all the way to your friend? A message can still move. |
| l2 | 4.63–7.71 | Station A holds the message and waits for a contact. |
| l3 | 8.41–11.56 | A travelling relay passes by and accepts the message. |
| l4 | 12.36–15.41 | Later, the relay meets station B and hands it over. |
| l5 | 16.11–20.59 | This is called store and forward. Delivery is delayed, and not guaranteed. |
| l6 | 21.14–26.40 | But with compatible systems, a missing live route doesn't always mean the message is lost. |
| l7 | 27.00–29.63 | Explore offline communication with Meshline. |

Edits after the ASR intelligibility pass: "Station A stores it and waits" became l2, and "That's store-and-forward." became "This is called store and forward." Both originals were misheard.

## Citations (full mapping in `production/30s/2026-11-03/research/claims.md`)
- IETF RFC 9171 (BPv7, Standards Track, Jan 2022): store-carry-forward overlay; physical motility moves data; sender and receiver not concurrently present; expired bundles SHOULD be deleted (so delivery isn't guaranteed).
- IRTF RFC 4838 (DTN architecture): the end-to-end path assumption; persistent storage; "contact".
- NASA DTN page (modified 2026-10-15): "each node can store data until the next node becomes available".
- App fact: the listing line only. No protocol or delivery claim about Meshline.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–4.4 | Hook | Printed cartouche "Store and forward". Pen tips ink A→ and ←B, but the middle never joins (coral gap ×, "no live route"). An envelope leaves A, hits the gap, fizzles and bounces back. |
| 4.4–8.1 | Setup | Push to A. The envelope drops into A's tray ("stored"). A printed clock sweeps ("waiting…"). The screen-space timeline instrument appears with its "stored" marker. |
| 8.1–11.3 | Mechanism | A travelling relay (white capsule) rolls in on its rail, a pen-drawn contact link joins A and the relay, the envelope hops aboard ("accepted"), and "carried" lands on the timeline. |
| 11.3–14.2 | Mechanism | The camera rides with the relay around a long loop (clamped below the captions). Rail clacks. The timeline cursor runs. |
| 14.2–16.9 | Mechanism | The relay meets B, a second contact link forms, and the envelope is handed over ("delivered later", ring). "delivered" lands on the timeline. The relay leaves. |
| 16.9–21.1 | Delay and not guaranteed | Medium shot. The timeline highlights the "delay" span. A second envelope appears at A with a coral clock and "no contact yet". |
| 21.1–27.0 | Takeaway | Pull back. "live route: broken" vs "route over time" (contact 1 · earlier → contact 2 · later). A looping replay of the envelope riding the assembled route. Printed callout "No live route ≠ always lost · store · carry · forward, if a later contact comes". |
| 27.0–30 | CTA | The timeline fades and the Meshline icon and wordmark appear in the safe area. Slow push-in, replay continues. Caption "Explore offline communication / with Meshline". |

## QA
See `production/30s/2026-11-03/QA.md`: 8 defects fixed, and the limits are listed honestly.

## Reproduce
From `videos/meshline/production/30s/2026-11-03`:
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en dir> meshline-30s-store-forward-01.mp4 qa/asr_final.json`

The narration WAVs are committed; `education/pilot-01/audio/voice.py` regenerates them.

## Next
Await review. No automation was created.
