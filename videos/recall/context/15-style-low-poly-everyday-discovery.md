# 15 — Style recipe: "Low-poly Everyday Discovery" (Recall only)

A reusable *visual and editing* recipe. It is not a rendering library; this repo happens to implement it with
Three.js. Built 2026-11-02 from the user's description of a reference they watched
(https://www.instagram.com/p/DegzinhSGtF/, an agentpoly CAPTCHA short). **I did not view that post**; nothing from it
(character, set, script, plot) is reproduced, only the craft the user named.

## 1. World
- **Faceted low-poly realism.** Real everyday places (café counter, kitchen, desk, street) built from simple flat-shaded
  meshes (6–14 segments, `flatShading`), believable proportions and no cartoon outlines. Props are plain primitives;
  surfaces get flat colour, with no photo textures.
- **Cinematic warm light.** One warm directional key ("late-afternoon window", ~3200–3800 K look) with soft shadows,
  a cool weak fill from the opposite side, and a rim/back light to separate the character. Visible light shafts are
  allowed (additive translucent beams).
- **Real depth.** Foreground, midground and background layers in every shot; fog or atmospheric falloff toward the
  back wall; lenses about 28–40° vertical FOV for close-ups and 35–50° for wides; no flat cards.
- **Recall accents.** The environment stays in warm neutrals (oak, cream plaster, terracotta, sage). **Lime `#C7F36B`**,
  **paper `#F8FAF3`** and **ink `#20251B`** are reserved for the mechanism highlight, screen UI accents and the brand.

## 2. People
- At most one original everyday person per episode, and only when the story needs one. A new character per topic is
  fine; never a mascot, never a known character.
- Faceted head and body, readable silhouette, clothing in warm neutrals with one lime accent.
- **Acting over talking.** The narrator is off-screen. The person reacts: squint, lean in, head tilt, surprised brows,
  satisfied smile, deadpan stare, shrug, small double-take. Every story beat gets a reaction shot. No lip-sync talking head.
- Hands do things: hold and tilt the phone, cover with a thumb, stick, peel, point.

## 3. Shots and editing
- **Three-way cutting:** (a) person with the problem (medium or close-up), (b) the **readable physical screen** (phone or
  monitor insert, screen ≥ 55 % of frame width, UI text ≥ 40 px, real result text only), (c) an **oversized 3D mechanism
  object** (e.g. a giant QR code you can walk across) where the explanation is shown with lime light.
- Hard cuts on narration beats; shots last 1.5–4 s; **every shot moves** (dolly, push, slow orbit or rack of 2–8 %).
  Static frames and camera bobbing alone are not allowed.
- **Comedic timing:** after a failure, hold 0.5–1 s of silence on the person's reaction before the next line; a small
  understated gag is better than a big one.
- Continuity: the same set, light direction and props across cuts; the mechanism object matches the real object exactly.

## 4. Text on screen
- Captions in the upper safe region: text ink about y 340–520, x 90–990, max 2 lines, Fredoka 600 ≥ 46 px, ink pill
  with paper text and lime key words, synced to narration word groups. Nothing meaningful above y 300.
- In-world labels: 1–3 words, ≥ 34 px, in the central region, attached to what they name, never covering the action.
- No text slides, quiz UI or long disclaimers.

## 5. Narrative template (30 s)
0–3 s question plus visible everyday problem → 3–14 s mechanism in 2 distinct scenes (giant object + screen) → 14–23 s the
limit or failure case, shown physically, with a reaction beat → 23–26 s takeaway shown in action → 26–30 s short CTA
("Download Recall for learning any new subject with AI." — user correction 2026-11-03) with a small Recall mark.

## 6. Sound
Narrator up front (Meshline/Recall Kokoro voice). Subtle warm music that evolves, with no short repeating loop. Foley
for every physical action (phone shutter or beep, tile clicks, sticker slap). One understated comic sting at most.

## 7. Accuracy
Every claim is sourced from the inventor, a standards body or a textbook. Qualifiers go briefly inside sentences.
Anything machine-readable shown on screen must be real and verified.
