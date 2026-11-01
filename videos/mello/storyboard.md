# Mello: 30-second storyboard

Format: 1080x1920 portrait, 30 fps, 900 frames, stickman style.
Story: a stickman gets tied up in looping thought threads. He follows a breathing guide from the Mello character, and each exhale loosens the knots until his posture relaxes.
Claims used are limited to the saved listing: guided relaxation, calming exercises, wellness challenges and progress tools. The phone screen and breathing ring are **stylized illustrations**, not verified app UI.

## Look
| Element | Paper world (stress) | Night world (calm, from the icon) |
|---|---|---|
| Background | warm paper `#EFE6D8` with grain | navy gradient `#15112B` to `#2A2155`, stars |
| Stickman ink | `#2A2340` | cream `#F4EFE6` |
| Threads | coral `#E8735A`, mustard `#E2B04A`, violet-grey `#8C84B0`, rose `#D9668A` | thread leftovers fade to lavender sparkles |
| Accent | wall clock with spinning hands | the clock turns into a moon, gold sparkles `#F7C548`, mint `#B6D7C2` |
| Mello character | — | original vector version of the lavender character in the icon `#CDB8F4` |

Type: Nunito (OFL, from the npm package `@fontsource/nunito@5.2.7`). Captions sit in the top safe area (y 220–560); no text below y 1620.

## Scenes (times in seconds; final times come from measured narration in `project/generated/timeline.json`)
| # | Time | Action (verbs) | Cause and effect | Caption / VO |
|---|---|---|---|---|
| 1 Hook | 0.0–2.0 | A coral thread **whips** in from off-screen and **lassos** his head. He **flinches** with an alarm mark, and a second thread **springs** out of his head. The camera pushes in quickly. | thought thread hits, so the body jolts | "Thoughts stuck on a loop?" |
| 2 Tangle | 2.0–8.0 | Two more threads (envelope and bell tags) **dart** in. He **ducks** and **swats**, but the thread **wraps** his arm. The loops **slide** down and **tighten** around his body, he **stumbles**, his knees **buckle** and he **hunches** (thud, camera shake). The clock hands **race**. The phone in his free hand **glows**. | the more he fights, the tighter the loops get | "When your mind won't stop spinning, everything gets tangled." |
| 3 Pause | 8.0–11.0 | His thumb **taps** the phone (flash). The Mello character **pops** out (squash and stretch) and **floats** up, then **puffs** a calm wave that **sweeps** the frame from paper to night. The threads **slow**, the clock **melts** into a moon, and he **looks up**. | tap, then the character, then the wave changes the world | "Take a soft pause with Mello." |
| 4 Breathe | 11.0–21.2 | A breathing ring **expands** (inhale) and **contracts** (exhale) around the character, which **inflates** with it. Inhale: he **straightens** and his chest **rises**. Exhale: the loops **widen**, **unravel** and **burst** into sparkles. Cycle 1 frees his arms; cycle 2 sends his arms **sweeping** up and down, the last knots **dissolve**, the plant **perks up** and he **smiles**. | each exhale releases threads, so his posture opens | "Breathe in…" / "…and slowly let it go." / "Follow a calming exercise," / "one breath at a time." |
| 5 Path | 21.2–25.4 | Sparkles **gather** into three floating platforms. The first **rises** under his feet; he **crouches**, **hops** and **lands** on each in turn. Each landing **lights** its platform and **ticks** a chip at the top. | each landing confirms one listing feature | "Guided relaxation." "Wellness challenges." "And progress tools." |
| 6 End card | 25.4–30.0 | He **sits** cross-legged and keeps breathing. The camera **tilts** up as the character **flies** up and **morphs** into the real app icon. "Mello" **pops** in, then the CTA pill **bounces** in and a shimmer **sweeps** across it. | the guide becomes the brand | "Mello. Explore on Google Play." |

## Sound (all original, made in numpy in `project/src/audio.py`)
- 0–8 s: tense plucked loop with a fast clock tick, plus whip, wrap-zip, notification blips and a thud on the stumble.
- 8.3 s: glass tap chime, pop, then a reverse-swell whoosh for the wave. The tense loop filters away.
- 9–30 s: warm pad (D major colour) with sparse bell notes. Breath-in and breath-out swells follow the ring; sparkle twinkles play as the threads release.
- 21–25 s: three rising marimba notes on the landings. End: resolving chime and fade-out.
- Narration: Kokoro-82M (Apache-2.0) run locally through `kokoro-onnx`, voice `af_heart`. Music ducks under the voice.
