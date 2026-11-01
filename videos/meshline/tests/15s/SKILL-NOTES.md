# How text-message-animation was applied (and adapted)

Source: `iart-ai/text-message-video-skills` → `skills/text-message-animation/SKILL.md` plus `references/bubble-recipes.md` and `references/data-driven.md` (MIT). They were fetched read-only on 2026-11-01; sha256 values are in `context/07-test-progress.md`.
The skill is a Remotion/React recipe. Nothing from the repository was executed, and its `scripts/` helpers returned 404.
**Adaptation:** the skill's grammar is reimplemented in original code (`src/chat.mjs`) on `@napi-rs/canvas` 1.0.11 (npm, pinned), with FFmpeg encoding. Remotion was not installed.

## Used as specified
| Skill rule | Implementation |
|---|---|
| Script first: one messages array (`from/text/typingMs/delayMs/status/reaction`) | `thread/meshline-thread.json`; nothing is hand-placed |
| Timeline: cursor += delay → typing (received only) → enter → +250 ms settle | `buildTimeline()`, a direct port of §4 |
| One message at a time, on a rhythm; snappy delays of 300–900 ms | Delays 300–900 ms, typing 700–900 ms |
| Sent = right; received = left; tail (pinched corner) on the last bubble of a run | `m.tail`, radii `[34,34,9,34]` / `[34,34,34,9]` |
| Bubble max-width 74 %, ~22 px radius, ~34 px type at 1080 | 74 % max width. Type scaled up to 48 px and radius to 34 px for ad legibility (adaptation). |
| Spring entrance: translateY 24→0, scale 0.85→1, opacity, origin at the sender's bottom corner, damping 14 / mass 0.7 | `spring()` uses the same damped-oscillator physics and parameters |
| Three-dot typing indicator; dots breathe on `sin(frame/8 − i·0.9)`; received only | `drawBubble()` typing branch |
| Receipt under the last sent bubble, fading in ~300 ms after it lands; timestamp dividers per time block | "Delivered"/"Read" receipts; "Today 9:12 PM" / "Today 9:41 PM" |
| Tapback ~400 ms after the bubble, with overshoot (damping 9 / mass 0.5) | Heart tapback on "On my way" |
| Auto-scroll: newest bubble in the lower third, gliding, never under the compose bar; flex-end stack | Floor at y=1505 (compose bar at 1560), critically damped follow, simulated once so frames are deterministic |
| Safe areas: status ~120, header ~150 (pinned), bottom ~360 clear, centre ~88 % width | Status 0–110, header 110–270 pinned, compose 1560+, 60 px gutters |
| One cue per message on the frame timeline; keyboard ticks under typing; cues under 300 ms | `cues()` → `build/cues.json` → `audio/mix15.py` |
| Frame-driven only (no `Date.now`, `Math.random` or timers) | Pure `drawFrame(ctx, t)`. Audio RNG is seeded. |
| Verify loop: stills at a typing frame, a mid pop and the last bubble, then encode | Stills inspected at 3.40 s (typing), 2.75 s / 4.15 s (pops) and 14.96 s (last), plus a boundary sheet |

## Deliberately overridden or extended
- **Chrome:** the skill says to match iMessage, SMS or WhatsApp exactly. That would imitate third-party products, and Meshline has no verified UI in our assets. We use a **Meshline-palette stylised chat**, permanently labelled "Stylised illustration · not actual app screens". Sent bubbles are `#3157FF` and received bubbles are `#222B28` on `#111714`, all sampled from the icon.
- **Duration:** the skill derives duration from the data (cursor + 1 s). The brief requires exactly 15.000 s, so `durationMs` is fixed and the end-card hold is asserted to be at least 3 s.
- **App-specific events added to the data model:** `fail` ("Not delivered", coral badge, shake), `system` ("Now messaging nearby"), a re-send **mesh-wave sweep** that refills failed bubbles (cause → effect), `history` (four prior lines on screen at frame 0 for context), and `end` (a chat-native app card with the real icon and the CTA).
- **Header status:** "No internet" → "Nearby", added to tell the story. The status bar Wi‑Fi stays slashed throughout, because the internet never returns.
