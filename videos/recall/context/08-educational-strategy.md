# 08 — Educational channel strategy (active direction)

Received 2026-11-02 (user-approved). **Active direction for Recall short-form video.** Earlier campaign-style
requirements (02, 04, 06) do not govern educational pilots. Existing work is preserved: the 30 s ad
(`output/recall-30s.mp4`) is untouched; the 06 15 s style test is unbuilt (see 07, honest status).

## Goal
Grow a niche audience with genuinely useful micro-lessons. Each video must teach one thing even if the viewer
never installs the app. App posts come later and only occasionally.

## Niche
Broad educational curiosity: science, history, geography, language and everyday mysteries.

## Format rules (every episode)
1. **Question / physical puzzle first** (first 1–2 s): something visibly happens that seems wrong.
2. **Mechanism demonstrated physically**: the recurring character performs the experiment, manipulates
   props, investigates and reacts. No standing beside text, no feature tour.
3. **One concept only**, ending in a short, accurate, reusable takeaway. If it doesn't fit, narrow the
   claim. Don't speed up or oversimplify into something false.
4. Narration ~2.4–2.7 words/s overall, no line faster than ~3.3 words/s; concise captions synced to speech.
5. Sources: public, cited with access dates, with a claim-to-source map kept per episode. Illustrative scenes
   are labelled as illustrations, not experiment data. Proportions that matter (e.g. volume ratios) are
   computed from the cited values.
6. App presence: a small, unobtrusive "Recall" signature (icon + wordmark) in the last seconds. No Google
   Play CTA, no slogans, no product claims beyond the verified listing, no implication that the scene is app UI.

## Recurring performer: **Kip, the clay explorer** (original)
- Off-white clay bean-shaped body, big oval eyes with ink pupils, ink clay brows for expression,
  **lime** pith helmet with ink band, **lime** neckerchief, mitten hands, stubby ink boots.
- Personality: curious, hands-on, tests things, shows surprise and delight; never lectures at camera.
- Props: magnifier (lime rim), small lime flag (marks a finding).
- Model sheet + reusable rig live in each episode folder (pilot: `education/pilot-01/docs/`, `web/character.js`).
- Voice: Kokoro-82M (Apache-2.0) local synthetic voice, a fixed style blend chosen in the pilot and reused,
  not imitating any named actor or character.

## Visual identity
- Tactile clay sets: off-white clay tabletop, deep ink backdrop, soft key light, fingerprint/lump texture.
- Palette sampled from the app icon (`assets/icon.png`): lime `#C7F36B`, paper `#F8FAF3`, ink `#20251B`.
  Functional, topic-specific material colours (water, steel, etc.) are allowed and documented per episode.
- Recurring elements stay consistent (Kip, lime accents, caption style); situations, camera and
  choreography change per lesson.
- Captions: Fredoka (OFL) semibold, off-white on an ink pill, key words in lime, top safe zone.

## References (quality bar only)
User-provided: instagram.com/battysticky and instagram.com/breakingbreach. **Not viewed in this session**
(Instagram not accessed). Used only via the user's description: an expressive recurring performer, a
dimensional stage, physical demonstrations, dimensional objects/visual metaphors for mechanisms. No
characters, scripts, logos, assets, voices or palettes are copied; our palette comes from the Recall icon.

## Production stack (lightweight, local)
Three.js (npm, pinned) rendered frame-by-frame in preinstalled headless Chromium via Playwright → PNG
frames → FFmpeg H.264. Narration via Kokoro ONNX locally; music and SFX synthesised in numpy. No Blender,
paid APIs, subscriptions or secrets.

## 10 follow-on episode titles (planned, NOT rendered)
1. Why does ice float on water when most solids sink in their own liquid? *(science: Kip freezes a clay "pond")*
2. Why does a straw look broken in a glass of water? *(science: Kip traces a light beam with a lime laser rod)*
3. Why is the sky blue but sunsets are orange? *(science: Kip shines a torch through a milky tank)*
4. Why does salt melt ice on winter roads? *(everyday mystery: Kip races two ice cubes)*
5. Why do onions make you cry? *(everyday mystery: Kip chops a clay onion, gas puffs reach the eyes)*
6. Why are there 24 hours in a day? *(history: Kip builds a sundial and counts divisions)*
7. Why do some countries drive on the left? *(history/geography: Kip on a clay map with tiny carts)*
8. Why are there two high tides a day, not one? *(geography/science: Kip spins a clay Earth with a water skin)*
9. Where did the word "OK" come from? *(language: Kip digs up a clay newspaper from 1839)*
10. How can a tiny hot-air balloon lift off? *(science: Kip warms the air in a paper bag; links back to this pilot's average-density idea)*
Each needs its own sources, claim map and accuracy review before scripting.
