# Sources and claim check — Recall english-24 "This window is a metal net" (why a microwave door has a metal mesh you can see through)

Read on 2026-11-23 (public pages via curl, page text extracted). Quotes are verbatim (whitespace normalised). Not cited: an FDA
"Microwave Ovens" product page URL that returned HTTP 404.

## Topic check → topic kept (why)
The suggested subject — why a microwave door's metal mesh lets you see in but keeps microwaves inside (wavelength vs hole size,
conductive shielding) — is **not** in the topic history. Earlier microwave episodes covered *heating*: R02 (context 16, cold patches /
standing waves), H04's request (turntable, declined → induction), E07's and E21's suggestions (heating / frozen centres, declined as
R02) and E11 (context 25, dielectric heating of water vs the plate). None covers the door screen, shielding or the wavelength-vs-hole
mechanism, so the topic was kept. It differs from batch 23 (E23, smoke alarm) in question (why a see-through metal net blocks
microwaves vs how an alarm detects smoke), setting (counter microwave + a giant perforated door sheet vs café ceiling + optical chamber)
and mechanism (wavelength vs aperture / reflection by conductive metal vs light scattering by particles).

## Sources read
| # | source | used for |
|---|---|---|
| S1 | HyperPhysics, "Microwave Ovens" (R. Nave, Georgia State University), http://hyperphysics.phy-astr.gsu.edu/hbase/Waves/mwoven.html | holes ~1 mm vs a 120 mm wavelength (~120×), waves can't get out; 2,450 MHz → ~12 cm; visible light ~2000× smaller than the holes, so you can see through |
| S2 | NASA Science, "Microwaves", https://science.nasa.gov/ems/06_microwaves/ | oven microwaves about 12 cm long |
| S3 | NASA Science, "Visible Light", https://science.nasa.gov/ems/09_visiblelight/ | the eye detects ~380–700 nm (label "~0.0005 mm" = 500 nm) |
| S4 | U.S. FDA, "Microwave Oven Radiation", https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-oven-radiation | microwaves are reflected by metal; leakage is limited (not zero) by a federal standard; damaged hinges/latches/seals can leak; don't operate an oven whose door doesn't close firmly or is bent, warped or damaged; interlocks stop microwaves when the door opens |
| S5 | 21 CFR 1030.10 (eCFR), https://www.ecfr.gov/current/title-21/part-1030 | leakage limit 1 mW/cm² (new) and 5 mW/cm² thereafter at 5 cm; two interlocks → nothing here claims zero leakage, and the oven is never shown running with its door open |

## Verbatim quotes
- **S1:** "the microwaves are effectively blocked from getting out into the room because the holes in the metal screen on the microwave
  oven door are about 1 mm in diameter compared to a 120 mm wavelength for the microwaves. The wavelength of the microwaves is about 120
  times the size of the holes, and can't "see" the holes to get out." "You can see through the holes because at 500 nm wavelength, the
  visible light wavelengths are about 2000 times smaller than the holes." "Considering the frequency of 2,450 MHz, the wavelength of
  microwave oven radiation is about 12 cm".
- **S2:** "Microwave ovens work by using microwave about 12 centimeters in length".
- **S3:** "Typically, the human eye can detect wavelengths from 380 to 700 nanometers."
- **S4:** "Microwaves have three characteristics that allow them to be used in cooking: they are reflected by metal; they pass through
  glass, paper, plastic, and similar materials; and they are absorbed by foods." "A Federal standard (21 CFR 1030.10) limits the amount of
  microwaves that can leak from an oven throughout its lifetime to 5 milliwatts (mW) of microwave radiation per square centimeter at
  approximately 2 inches from the oven surface." "Don't operate a microwave oven if the door does not close firmly or is bent, warped, or
  otherwise damaged." "The standard also requires all ovens to have two independent interlock systems that stop the production of
  microwaves the moment the latch is released or the door is opened."
- **S5:** "shall not exceed 1 milliwatt per square centimeter at any point 5 centimeters or more from the external surface of the oven,
  measured prior to acquisition by a purchaser, and, thereafter, 5 milliwatts per square centimeter".

## Claim map (narration → source)
| line | claim | source |
|---|---|---|
| l01 | the window is a metal net (perforated metal screen) | S1 |
| l02 | light gets through; why not microwaves? | S1 |
| l03 | microwaves about twelve centimeters long | S1, S2 |
| l04 | holes about a millimeter wide, over a hundred times smaller | S1 (~1 mm vs 120 mm, ~120×) |
| l05 | to waves that long the net is like solid metal, so they bounce back inside | S1 ("can't 'see' the holes"), S4 ("reflected by metal") |
| l06 | light waves about two thousand times smaller than the holes, so they slip through | S1 (500 nm, ~2000×), S3 |
| l07 | if the door is bent or won't close firmly, stop using it | S4 |
| l08 | CTA "Download Recall to turn your study material into lessons." | app listing (`videos/recall/assets/listing.json`), as E13–E23 |

## Facts vs assumptions (illustrative choices, not claims)
- Giant sheet: holes and wave drawn **to scale with each other** (hole 0.05 units = 1 mm, wavelength 6.0 units = 120 mm, 120 : 1);
  hole pitch 1.6 mm and the hex pattern are illustrative (S1 gives only the ~1 mm hole size). The café door uses 1.2 mm holes on a 2.2 mm pitch.
- Light is drawn as straight rays through the holes, **not** as waves at scale (500 nm cannot be drawn next to a 1 mm hole); its size is
  stated in the label "~0.0005 mm".
- The wave is a single sinusoidal ribbon (a schematic of the field), shown travelling and reflecting at an illustrative speed; the
  "like solid metal" tint is a visual metaphor for what the long wave effectively meets.
- The bent-door gap and the wave squeezing out of it are illustrative (S4: damage to hinges, latches or seals may let energy leak); no
  amount is shown or claimed. The oven is never shown running with the door open (S4/S5 interlocks).
- No experiment for viewers is suggested; the payoff is FDA's advice only.
