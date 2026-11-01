# Meshline 30s: storyboard (as rendered)

The format is 1080x1920 at 30 fps, 30.0 s. It is an original stickman piece rendered locally with `@napi-rs/canvas`, piped to FFmpeg.
The palette is sampled from `assets/icon.png`: charcoal `#111714`, mesh blue `#3157FF`, node white `#F7F7F2`. Coral `#FF6A5C` is used only for the offline/error state.
The "mesh line" between the two phones is the icon's wave centerline, extracted from the icon by `project/scripts/extract_icon_path.py`.

| Time | Beat | Action (cause → effect) | Caption | Narration |
|---|---|---|---|---|
| 0.0–1.6 | Hook | A walks and types under a glowing Wi‑Fi sign. The sign flickers (0.30), then its arcs crack off (0.55/0.68/0.81) and fall with gravity, bounce and rock like bowls. The dot rolls to A's heel. A's phone flips white → coral ✕. On the first impact A jumps, and the camera shakes on each impact. | — | — |
| 1.45–3.6 | No internet | A sees the coral phone, shakes it hard (motion streaks), then stands on tiptoe holding it up, hopping for signal. | No internet. | "No internet?" (1.55) |
| 3.5–7.5 | Reveal | The camera pulls back to show B a few steps away, doing the same thing. Both sigh, notice each other and B waves. A gets an idea ("!") and taps; A's phone turns Meshline blue (6.7). | Still nearby. | "Still nearby." (4.35) |
| 7.6–11.5 | Discover | Short-range rings pulse out of A's phone (7.65/8.15/8.65). The first ring hits B's phone and it flips blue (8.0), so B startles. A dotted hint appears. A winds up (10.45) and flicks; the line arcs across (10.95) and snaps into B's phone (11.5) with a node pop, ring burst and wobble. | Private nearby messaging | "Meshline. Private, nearby messaging." (8.1) |
| 12.5–18.0 | Send | Typing taps. A bubble with a lock badge pops out, rides the line (the line sags under it, the node pulses as it passes) and drops into B's phone, so B laughs. B replies (blue bubble). Two faster exchanges follow. | Send a private message | "Send a private message." (13.1) |
| 18.0–23.2 | Keep moving | B turns and both walk with parallax, still linked, with bubbles flowing. They pass a café with a dead, slashed Wi‑Fi sign. They stop, B turns back, both step in and high-five (23.15); the contact makes a white node. | Keep the conversation moving | "Keep the conversation moving, even when the internet doesn't." (18.6) |
| 23.25–24.0 | Transition | The camera dives into the high-five node, giving a brief white-out. | — | — |
| 24.0–30.0 | End card | The white iris shrinks into the logo node, the wave grows out of it, the tile outline draws, and the vector crossfades into the real `icon.png`. The "Meshline" letters rise in, followed by "Private nearby messaging" and the CTA pill "Explore on Google Play" (pops on narration, shimmer sweeps). The mini pair waves at the bottom with beads still travelling. | (end card) | "Meshline. Explore on Google Play." (25.2) |

## Claims check
Every on-screen or spoken claim maps to the listing ("Private nearby messaging that keeps moving, even when the internet does not."): private, nearby, messaging, works when the internet does not.
No transport technology (Bluetooth, Wi‑Fi Direct), multi-hop relay, encryption standard, metric, price or testimonial is claimed. Phones are explicitly stylised glyph screens, not product UI.
