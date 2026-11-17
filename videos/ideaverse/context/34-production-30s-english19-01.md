# 34 — Production 30s english19-01 (English): "A phone shoots the moon with crisp craters. Where does that detail come from?"

Batch 2026-11-17-english-19 ("NEXT EDUCATIONAL EPISODE", batch19; follows the delivered batch18). Workspace
`production/30s/2026-11-17-english-19/` · deliverables `ideaverse-30s-english19-01.mp4` + `ideaverse-30s-english19-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at a2d2068; no job running, nothing queued).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules + first-frame rule (context/11).

## Topic check (history: context/09, 12–33)
- Proposed: "How your phone removes a stranger from a photo" (mask, surrounding context, plausible reconstruction, not
  recovered truth).
- Already covered: **hindi03-01** (context/17, Magic Eraser: "AI predicts what would be there … the filled part is only a
  guess") — the same proposal was already replaced as a repeat in english-08, english-11 and english-13 → replaced again.
- Chosen (same genre: everyday computational photography that adds detail the camera did not fully capture; verified
  consumer feature; strong opening): **moon photos on Samsung Galaxy phones** — Scene Optimizer recognizes the moon,
  merges 10+ shots, then a deep-learning engine enhances detail; Samsung says it is still reducing confusion between the
  real moon and a picture of it; payoff: turn Scene Optimizer off for only what the lens caught. Not covered before
  (english-15 Night Sight merges a burst in low light; it adds no learned detail of a recognized subject).

## Script (English, 74 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + real question | A phone shoots the moon with crisp craters. Where does that detail come from? |
| s2 | 4.75 | mechanism 1 | On Samsung Galaxy phones, Scene Optimizer first recognizes the moon. |
| s3 | 9.85 | mechanism 2 | It merges more than ten shots to cut the noise. |
| s4 | 12.65 | mechanism 3 (AI) | Then a deep learning engine enhances the details even further. |
| s5 | 16.90 | the limit (company statement) | Samsung says it's still reducing confusion between the real moon and a picture of it. |
| s6 | 22.15 | payoff | For only what the lens caught, turn Scene Optimizer off before you shoot. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en ("ten" comes back as "10"; the checker maps it).

## Facts → sources (accessed 2026-11-17)
| claim | type | source |
|---|---|---|
| Scene Optimizer recognizes the moon (Galaxy phones) | documented (Samsung) | Samsung UK Support, "How Samsung phone camera uses AI for moon photos & pictures", https://www.samsung.com/uk/support/mobile-devices/how-galaxy-cameras-combine-super-resolution-technologies-with-ai-to-produce-high-quality-images-of-the-moon/ — "Since the Galaxy S21 series, Scene Optimiser has had the capacity to recognise the moon as an object"; the engine "recognises the moon as an object, based on a range of moon shapes and details"; "if the moon is obscured by clouds, it will not be recognised". |
| it merges more than ten shots to cut the noise | documented (Samsung) | same page — "Galaxy cameras employ Super Resolution to combine more than 10 images. The image quality is then improved using digital zoom, removing noise, and enhancing illuminations and clarity." |
| then a deep learning engine enhances the details even further | documented (Samsung) | same page — "the Galaxy camera uses Scene Optimiser's deep learning-based AI detail enhancement engine to eliminate any remaining noise and enhance the details of the image even further". |
| Samsung says it's still reducing confusion between the real moon and a picture of it | documented (company statement) | same page — "Samsung is continuously improving Scene Optimiser to reduce any potential confusion that may occur between taking a picture of the real moon and an image of the moon." |
| for only what the lens caught, turn Scene Optimizer off before you shoot | documented (Samsung) | same page — "If you want to take a photo without AI support, deactivate Scene Optimiser: Camera app > Camera settings > Scene Optimiser > Off". ("What the lens caught" = the photo without AI detail enhancement; the camera still processes the image.) |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse camera or photo feature. |
Not used: the 2023 controversy details, third-party tests, zoom levels (25x appears only in a regional newsroom version).
Illustrative: all moon images are procedural drawings (soft = large dark areas only; crisp = added craters and rays), the 12
shots and their grain, the detection boxes, the monitor, the settings screen (EXAMPLE; not Samsung's UI).

## Storyboard (cues.js)
1. 0–4.6 hook: DOCKET holds a phone showing a crisp, cratered moon; behind, a night window with a small, soft real moon;
   DETAIL FROM WHERE? from frame 0; head tilt on "Where…?".
2. 4.6–9.75 phone viewfinder: a soft, grainy moon (SCENE OPTIMIZER), then a mint MOON box (MOON RECOGNIZED).
3. 9.75–12.6 card: 12 grainy shots appear, then fly together into one smoother moon (10+ SHOTS MERGED).
4. 12.6–16.85 card: a sweep turns the soft moon into a crisp, cratered one (AI DETAIL).
5. 16.85–22.05 viewfinder of a monitor showing a soft moon picture; the same box appears, amber "MOON?" (SKY OR SCREEN?).
6. 22.05–26.85 settings: Scene Optimizer toggled off (TURN IT OFF) → the plain, softer capture (WHAT THE LENS CAUGHT).
7. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "DETAIL / FROM WHERE?".

## QA / status — IN PROGRESS (rendering)
