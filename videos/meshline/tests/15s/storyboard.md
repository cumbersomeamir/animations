# Meshline 15s style test: storyboard (text-message-animation)

Medium: a full-frame chat thread at 1080x1920 and 30 fps, exactly 15.000 s. Every beat is a chat event: a pop, typing, a receipt, a tapback or an auto-scroll.
All timings come from `thread/meshline-thread.json` through `buildTimeline()` (the skill's cursor model). The values below are the computed times.
The UI is an **explicitly labelled stylised illustration** ("Stylised illustration · not actual app screens", always on screen).

| Time (s) | Chat event | Motion / cause → effect | Sound |
|---|---|---|---|
| 0.00 | Frame 0: four prior messages (packed venue, "Lost you in the crowd"), then a "Today 9:41 PM" divider and a coral **No internet connection** notice. The header reads Sam · No internet, and the status bar shows the Wi‑Fi slashed and blinking. | The notice pulses. | Low muffled pad, sparse ticks |
| 0.30 | Sent: "Where are you?" | Spring pop from the bottom-right; the send button presses. | Send swoosh |
| 0.85 | It fails: "Not delivered" and a coral "!" badge | The bubble shakes and the screen shakes. | Dull double bonk; VO "No internet?" (0.95) |
| 1.25 / 1.80 | Sent: "Hello??", which also fails | Pop, then shake. | Swoosh, bonk |
| 2.25 | System pill: **Now messaging nearby** | Header status slides "No internet" → "Nearby" with dot ripples. The avatar ring turns blue, the Meshline glyph pops into the status bar (Wi‑Fi stays slashed) and the screen bumps. | Link chime (E5–G#5–B5–E6). The groove fades in. |
| 2.30–3.05 | Re-send sweep | The icon's wave sweeps down the thread. Each failed bubble refills blue as the wave crosses it, the "!" badge pops away and the receipt flips to "Delivered". | Air sweep and two refill ticks (2.73, 2.77) |
| 3.15–4.05 | Sam is typing… | Three-dot typing bubble (frame-driven sine), then the reply pops: "Right behind you. Blue jacket." | Keyboard ticks, then a receive ding |
| 5.10 | Sent: "No signal here at all" | Pop; the thread auto-scrolls. | Swoosh |
| 5.80–6.60 | Typing, then "Same. Still getting yours." | Pop. | Ticks, ding |
| 7.75 | Sent: "Meet by the stage?" | Pop. "Delivered" appears, then "Read" at 8.45. | Swoosh, soft read tick |
| 8.45–9.15 | Typing, then "On my way" | Pop, then a heart tapback overshoots onto the corner (9.55). | Ticks, ding, tapback pop |
| 10.30 | End: a centred app-card message | Older messages recede, the card springs in and the thread scrolls it to centre. | Whoosh |
| 10.35 / 10.70 / 11.05 / 11.45 | Card parts pop in sequence: icon (`assets/icon.png`), **Meshline**, "Private nearby messaging", CTA pill **Explore on Google Play** | Spring pops; CTA shimmer sweeps at 12.35 and 13.55. | Pops, bright CTA chord; VO "Meshline. Private, nearby messaging. Explore on Google Play." (10.70–14.59) |
| 14.75–15.00 | Hold | 25 % fade at the very end. The CTA stays legible on the last frame. | Emaj9 ring-out, 0.35 s fade |

## Claims
On screen and in the VO: no internet, nearby, private, messaging, still delivered. Everything maps to the listing ("Private nearby messaging that keeps moving, even when the internet does not.").
No transport technology, range, encryption standard, metric, price or testimonial is claimed. The story is fictional chat copy, not user quotes.
