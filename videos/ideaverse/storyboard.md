# Ideaverse — 30s stickman promo: storyboard

Format: 1080x1920 portrait, 30 fps, 900 frames (30.0 s). Music grid: 120 BPM (1 beat = 15 frames).
World: the creator stands on a small navy planet in a starry "idea-verse" (palette sampled from the
app icon: navy `#1B2333`, mint `#6CDA7E`, white). Clutter tiles use coral/amber/lavender/sky so the
chaos reads as "many other tools"; everything absorbed by Ideaverse turns mint.

Claims used (all from `assets/listing.json`): app name "Ideaverse - All in One AI App"; it is for
"creating Images" (for social sharing). No UI is depicted except the app icon on a stylized phone;
"how" an image is made is shown as a metaphor (idea bulb → image), not as a fake interface.

| # | Frames (s) | Action (verbs) | Cause → effect | Caption / narration |
|---|---|---|---|---|
| S1 Juggle | 0–96 (0–3.2) | Creator **juggles** 3 app tiles under his glowing idea bulb; 3 more tiles **whoosh** in, juggling **speeds up**, he **sweats**; a 7th tile **drops** and **bonks** his head; juggle **breaks**, tiles **clatter** down, he **staggers** dizzy | more tools → frantic → bonk → chaos | "One idea." / "Too many apps." (n1 f8, n2 f42) |
| S2 Buried | 96–204 (3.2–6.8) | He **shakes** off, **looks up**, **catches** a rain of 8 tiles as a tower; knees **buckle**, tower **wobbles** and **topples**, **burying** him; dust **puffs**; his bulb **wriggles** out, **flickers** and dims; a hand **reaches** out | trying to hold every tool → collapse → idea fades | "Your idea gets buried." (n3 f160) |
| S3 All in one | 204–348 (6.8–11.6) | A giant phone **falls** and **thuds** upright; screen **lights** with the Ideaverse icon; a vortex **sucks** all 15 tiles into the screen (each turns mint with a rising ping); heap clears, creator **sits up**, **stands**, **walks** over, **grins** and thumbs at the phone | one app absorbs the clutter → creator freed | "Meet Ideaverse" + "the all-in-one AI app" (n4 f244) |
| S4 Create | 348–546 (11.6–18.2) | He **grabs** his dim bulb, **winds up**, **throws** it into the screen (splash ripple); screen **resolves** noise into an image (sky-whale illustration); **ding**; the picture **pops out**, he **catches** it; phone **shrinks** and **hops** into his other hand | idea in → image out | "Drop in your idea…" / "…and create an image." (n5 f356, n6 f428) |
| S5 Share | 546–700 (18.2–23.3) | Camera **pulls out** to reveal friends on mini-planets; he **winds up** and **flings** the picture; it **splits** into 4 copies; friends **catch**, **cheer**; hearts **pop** and **stream** back | sharing → community reaction | "Share your creation." (n7 f582) |
| S6 Payoff + CTA | 700–900 (23.3–30) | Hearts **merge** into a new bulb over his head; it **rises**, **grows**, a ring **sweeps** round it and it **becomes** the real app icon; name, subtitle and CTA **pop** in; creator **points** at CTA, friends **hop** in and **wave** | appreciation sparks the next idea → Ideaverse | "Ideaverse" / "All in One AI App" / "Explore on Google Play" (n8 f800) |

Hook (first 2 s): frame 0 already has tiles mid-air over a moving character; new tiles fly in by f16;
caption pops at f4; bonk lands at f50 (1.7 s).

Sound: every SFX is placed from the animation's own event list (`build/events.json`, exported by
`render.mjs --events`) so impacts, landings, catches and pings are frame-synchronous.
