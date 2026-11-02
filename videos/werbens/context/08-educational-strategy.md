# 08 — Educational channel strategy (active direction)

Received 2026-11-02 in Claude Code session "Werbens — Educational Pilot 01". This is the **active direction** for Werbens
video work. Earlier campaign-style requirements (02 creative brief, 04 deliverables, 06 style test) do **not** govern the
educational series. Earlier work is preserved untouched (see 05/07 checkpoints: both unfinished, honestly labelled).

## Goal
Grow a niche audience with short, genuinely useful lessons. Each video must teach one thing even if the viewer never installs
the app. Occasional relevant app posts may come later; the lessons themselves are **not ads**: no feature tour, no forced
Google Play CTA, no motivational slogans, no unverified product claims. A small unobtrusive app signature is enough.

## Niche
Marketing craft, positioning, advertising and consumer psychology — for small brands, marketers and creators (the people
Werbens' listing describes: "Discover creators and manage brand campaigns, briefs and conversations").

## Format rules (per episode)
- 15.000 s, 1080×1920 portrait, 30 fps, H.264 + AAC. One concept only; narrow the explanation rather than speed up.
- Structure: **question / physical puzzle (0–2.5 s) → mechanism demonstrated by the cast with props → concise usable takeaway.**
- Short, comfortably paced narration (≈ 2 words/s overall), concise word-timed captions, original score, action-timed SFX.
- Accuracy: public research only, cited in `sources.md` with access dates and a claim-to-source table; hedge where effects vary
  ("can", "often"); no invented percentages, endorsements, testimonials or fake data. If a demo is illustrative, say so on screen.
- Never imply that an illustrative scene is real app UI, experiment data or an impact report.
- Signature: small Werbens icon + wordmark in the last ~1.5 s; research line underneath.

## Visual identity
- Original cast in a violet/lavender **backstage studio** (painted flats seen from behind, ladder, practical bulb string, floor tape,
  cyclorama pool of light). Physical props and side-by-side experiments; browser Three.js (no Blender).
- Palette sampled from the Werbens icon: violet `#6234FB`, lavender `#CCC0F7`, pale `#F0EAFC`, white `#FEFEFD`; ink `#1B1433`
  derived for text/details. Natural material colours (cookie brown, cardboard grey) only on props.
- **Cast (recurring, stable designs — see `education/pilot-01/character/`):**
  - **Pip**, the ad director / host: violet capsule body, tilted lavender beret with stalk, headset boom mic, white mitten hands.
    Voice: original blend of two Apache-2.0 Kokoro voices (af_bella 0.7 + af_heart 0.3), speed 0.94.
  - **Quibble**, the sceptical customer: tall pale rounded block, round ink glasses, single top curl, heavy brows; silent, acts
    with face and body (squint, point, strain, delight, meh, shock, sheepish).
- Inspiration references supplied by the user (instagram.com/battysticky, instagram.com/breakingbreach) are a quality bar only
  (recurring expressive performer, dimensional dark stage, physical demonstrations, visual metaphors). Not viewed in session
  (HTTP 429); nothing copied (characters, scripts, logos, palettes, voices).
- Situations, camera grammar and choreography change every episode; the cast and studio stay consistent.

## Production pipeline (reusable)
`education/pilot-01/` is the template: deterministic Three.js scene (`?t=` freeze harness) → headless Chromium capture →
FFmpeg; Kokoro TTS → Whisper word timing (captions + lip-sync) → procedural score/SFX mix (−14 LUFS) → mux → `qa.sh`
(ffprobe, full decode, loudness, contact + boundary sheets) → ASR on the final mix → QA.md. Rig: `src/rig/character.js`, cast:
`src/rig/cast.js`, props/stage: `src/props.js`.

## Planned follow-on episodes (titles only — NOT rendered; each needs its own research + claim mapping)
1. **The decoy option** — why adding a third choice nobody wants can change which one people pick (Pip adds a "decoy" popcorn size).
2. **Anchors** — why the first number you see frames every price after it (Quibble's guess drifts toward a giant price tag).
3. **Own one word** — positioning: why a brand that means one thing is easier to remember than one that means everything.
4. **Framing** — "80% lean" vs "20% fat": same fact, different feeling (two labels on one prop, Quibble reacts to each).
5. **Busy shop, empty shop** — social proof and when it misleads (two stalls, one queue of cardboard cut-outs).
6. **"Only 3 left!"** — scarcity cues: when they help and when they backfire (hourglass prop that Quibble flips).
7. **Seen it before** — the mere-exposure effect: why familiar ads grow on us, and its limits (posters multiplying on the flats).
8. **Too many jams** — choice overload and why the famous result doesn't always replicate (a collapsing shelf of options).
9. **Shapes you can spot** — distinctive brand assets: why consistent colours/shapes help people find you (silhouette quiz).
10. **Who says it matters** — source credibility: why the same message lands differently from a creator than from an ad
    (Pip swaps the messenger, Quibble's eyebrow decides).

## Status
- Pilot 01 (packaging): see `context/09-educational-pilot-01.md` (brief/storyboard) and `context/10-educational-progress.md`.
