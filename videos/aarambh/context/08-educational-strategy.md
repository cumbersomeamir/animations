# 08 — Educational strategy (active direction)

Status: ACTIVE. Approved by the user on 2026-11-02 for the "Educational Pilot" series.
It replaces the campaign-style requirements in 02 and 04 **for educational lessons only**.
02/04 still describe the older 30 s campaign ad, which this session does not produce.

## Why
The user wants useful lessons that grow a niche audience. Each lesson must teach one thing
even if the viewer never installs the app. App posts come later and occasionally.

## Channel niche
**Tools, skills and everyday livelihoods.** Short lessons on how working tools function: sewing,
carpentry, repair, farming, cooking stalls and small workshops. One physical mechanism per episode.

## Format rules (every lesson)
- 15.000 s, 1080x1920 portrait, 30 fps, H.264 + AAC.
- **Shape:** a question or physical puzzle (0–4 s), then a demonstration of the mechanism, then one concise, useful takeaway.
- **One concept only.** If it doesn't fit in 15 s, narrow the explanation. Don't speed up the voice or add false simplifications.
- **Narration:** short, comfortably paced and intelligible, with burned-in captions in the mobile-safe zone.
- **Sound:** original procedural music plus SFX timed to on-screen actions.
- **No ads:** no feature tour, forced Google Play CTA, motivational slogan, or income/outcome promises.
- **App signature:** small and unobtrusive ("✦ Aarambh"). The scenes are illustrations. They are never app UI, experiment data or an impact report.
- **Accuracy:** every on-screen and spoken claim maps to a cited public source (see the pilot's SOURCES.md).
  Simplified cutaways are labelled "simplified cutaway".

## Visual identity
- **World:** a miniature craftsperson's workshop with painted, textured surfaces. Oversized, *functional* tools are opened as cutaways.
- **Palette:** sampled from `assets/icon.png` (2026-11-02):
  - deep green `#05473A` (with darker and lighter steps)
  - cream `#FBF7EE`
  - star gold `#F1B444`
  - Neither reference channel's palette is used.
- **Thread colours** (two lights on green):
  - needle thread is gold `#F1B444`
  - bobbin thread is cream `#FFF6E2`
  - a cloth sample is mid green `#3F8F72`
- **Type:** Fraunces (display, echoes the icon's serif "A") and Inter (captions, labels). Both are SIL OFL, via @fontsource on npm.

## Recurring performer: Bindu
An original miniature craftsperson. The name means "dot" or "point", the point where a beginning starts.
- **Silhouette keys:** round head, a hair bun pierced by a gold pencil, a gold four-point star bindi (from the icon's star), a deep-green kurta-apron with cream piping, a cream tape-measure sash, mitten hands and cream shoes.
- **Performance:** Bindu *operates, investigates and reacts*. For example, Bindu turns handwheels, peeks under cloth, dives into cutaways (shrinking to "micro" scale), dodges moving parts, gets lifted by mechanisms and unrolls lesson banners. Bindu never stands beside text as decoration.
- **Voice:** an original synthetic character voice (see the pilot's LICENSES.md for provenance).
- **Consistency:** the same rig file (`education/pilot-01/src/lib/bindu.mjs`) and model sheet are used for all episodes. Situations, camera and choreography change every episode.

## References (quality bar only, not copied)
Two references were given as links:
- https://www.instagram.com/battysticky/
- https://www.instagram.com/breakingbreach/

I have **not** watched or heard them in this session. Instagram is not accessible here.
The user's description of what to learn from them:
- **Sticky:** a recurring expressive performer, a dimensional dark stage and physical demonstrations.
- **BreakingBreach:** dimensional objects, visual metaphors and mechanism explanations.

Bindu, the palette, the scripts, the logo treatment and the voice are original. No named character or actor voice is imitated.

## 10 follow-on episode titles (planned, NOT rendered)
| # | Title | Mechanism focus | Bindu's action idea |
|---|---|---|---|
| 02 | Why a potter must centre clay first | centring and symmetric forces on a wheel | wobbles on an off-centre lump, then braces arms |
| 03 | How a bicycle chain carries your push | sprocket teeth, chain links and gear ratio | pedals a giant crank, counts teeth |
| 04 | How a hand plane shaves a thin curl | blade projection and the mouth/chipbreaker | rides a curl like a slide |
| 05 | How a handloom lifts half the threads | heddles and shed formation | swaps pedals and walks through the shed |
| 06 | How a spirit level finds flat | a bubble in a curved vial | balances on a plank, chases the bubble |
| 07 | Why a sharp chisel cuts cleaner | edge angle and force concentration | pushes blunt vs sharp edges into wax |
| 08 | How a beam balance weighs fairly | equal arms and torque | sits on one pan, adds weights |
| 09 | How a hand pump lifts water | two check valves | rides the flap valves up the pipe |
| 10 | How a pressure cooker's weight valve works | pressure versus the weight on a vent | lifts the weight, watches steam escape |
| 11 | How solder holds a wire joint | wetting and a metallic bond vs glue | heats a pad, watches solder flow |

Each episode needs its own public-source verification before production. These are titles only.

## When the app appears
For now, only as the small signature. Occasional relevant app posts are a separate, later brief.
Product facts allowed in them are limited to `assets/listing.json`: "Fund verified livelihood tools and follow their impact."
