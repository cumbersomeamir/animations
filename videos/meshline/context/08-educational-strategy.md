# 08: Educational strategy (active direction)

Source: the user's latest approved brief, "Meshline — Educational Pilot 01". From now on this file governs educational work. The earlier campaign-style requirements (02 and 04) do **not** govern educational episodes.

## Goal
- Grow a niche audience with genuinely useful 15-second lessons. Each one must teach something even if the viewer never installs the app.
- Relevant app posts come later and occasionally. An episode is never an ad: no feature tour, no forced Google Play CTA, no motivational slogan.
- A small, unobtrusive Meshline signature is enough.

## Niche
Communication, wireless networks and connectivity.

## Episode format (15.000 s, 1080x1920, 30 fps, H.264 + AAC)
1. **Question or physical puzzle** (0–3 s).
2. **The mechanism, demonstrated physically** by the recurring character (props, radio paths, queues). One concept only.
3. **A concise, useful takeaway** spoken and shown, then a small signature.

If an idea doesn't fit in 15 s, narrow the explanation rather than speeding up the voice or adding false simplifications.

## Recurring cast (design: `education/pilot-01/character/`)
- **Bix** is an electric-blue signal sprite whose head crest is four signal bars, with a white node face plate (from the icon's node). Bix performs, investigates and reacts. Voice: original blended Kokoro style vector (Apache-2.0), not modelled on any person or character.
- **Dot** is a small data-packet cube (off-white with a blue band) and Bix's companion: the thing that has to get through.
- **World:** a transparent glass city on a dark, dimensional stage, with physically visible radio paths.
- **Palette:** sampled from the icon (`#111714`, `#3157FF`, `#F7F7F2`), plus soft blue `#8EA2FF`. Coral `#FF6A5C` only for problems.
- **Consistency vs variety:** the cast design stays fixed. Situations, camera and choreography change every lesson.

## Accuracy policy
- Every spoken or on-screen factual claim maps to a dated public source, in that pilot's `research/claims.md`.
- Visual metaphors (queues, lanes, meters) are labelled as illustration. No fake measurements, numbers, experiments or impact reports.
- Never claim that nearby messaging solves every outage, works at any distance, or uses an unverified protocol. Meshline's listing only says "Private nearby messaging that keeps moving, even when the internet does not."

## References (quality bar only)
- The user pointed to @battysticky (a recurring expressive performer, dimensional dark stage, physical demos) and @breakingbreach (dimensional objects, visual metaphors, mechanism explanations).
- These were **not watched or heard in this session**; only the user's description was used.
- Nothing is copied: no characters, scripts, logos, assets, voices or palettes.

## Planned follow-on episodes (titles only; render one at a time)
1. Why one bar can still send a text
2. What 5G actually changes, and what it doesn't
3. Why home Wi‑Fi slows down when everyone gets home
4. How your phone chooses which tower to talk to
5. Why walls, bodies and rain soak up radio signals
6. Latency vs bandwidth: why "fast" internet can still feel laggy
7. What airplane mode actually switches off
8. Why your signal drops in a lift
9. Upload vs download: why sending a video takes longer
10. Short-range radio: how Bluetooth and Wi‑Fi links differ

## Pipeline
- Local, original code: Node + `@napi-rs/canvas` (npm, pinned) with a small hand-written 3D projection for the glass city.
- FFmpeg encoding. Narration with local Kokoro. Synthesised music and SFX.
- No Blender, paid APIs, subscriptions, secrets or unreviewed third-party scripts.
