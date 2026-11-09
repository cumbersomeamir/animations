# Sources and claim check — Recall english-10 "Sunglasses on, and your phone goes black"

Sources were read on 2026-11-09. Quotes are verbatim. The patents were read through a fetch that returned their text
verbatim for the opening sections (US10185162B2: about the first 40,000 of 87,000 characters; later sections only
summarised and not quoted). The HyperPhysics pages were read as page text in headless Chromium.

## Topic choice
The batch suggested "Why a QR code still scans when part of it is covered" (redundancy and error correction). That subject
is already covered by **F01** (2026-11-02, context 14: "Why QR codes can still scan with a logo in the middle", with
error-correction tiles rebuilding damaged content and a no-fixed-percentage caveat). So a fresh, equally useful
everyday-technology subject in the same genre was chosen: **why a phone screen can look black through polarized sunglasses,
why turning the phone brings it back, and a rotate test to check whether sunglasses are polarized.** "polariz" and
"sunglass" appear in no earlier context or episode.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | US Patent **US10185162B2** "Single lens glare-reducing eyewear without causing LCD screen blackout" — https://patents.google.com/patent/US10185162B2/en | LCD light is linearly polarized (crossed polarizers); polarized sunglasses use a linear-polarizing filter, some with a vertical film against horizontally polarized glare; blackout when the lens axis is orthogonal to the screen's light; head tilt changes it |
| S2 | US Patent **US7633583B2** "Controlling polarization for liquid crystal displays" — https://patents.google.com/patent/US7633583B2/en | polarized sunglasses usually transmit vertically to block horizontally polarized glare; an LCD can appear black to viewers wearing them; brightness depends on the angle |
| S3 | HyperPhysics (Georgia State University) "Polarization by Reflection" — http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/polref.html | reflected light is polarized parallel to the reflecting surface (fully at Brewster's angle, partially otherwise): the physics of glare |
| S4 | HyperPhysics "Classification of Polarization" — http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/polclas.html | linear polarization; natural light is generally unpolarized ("every direction" in the animation) |

**Attempted but not usable (not cited):** Edmund Optics "Introduction to Polarization" and an OU Health sunglasses article
(Cloudflare challenge), the American Academy of Ophthalmology sunglasses page (HTTP 403). No bot checks or 403s were
circumvented; the patents and HyperPhysics were used instead.

## Verbatim quotes
- **S1:**
  - "Light from an LCD screen is usually linearly polarized."
  - "LCD screens use a pair of crossed linear polarizers."
  - "Polarized sunglasses available in the marketplace make use of a linear-polarizing filter embedded in a lens system"
  - "To reduce glare caused by horizontally-polarized reflections, some sunglasses use a vertical-polarizing film."
  - "linear-polarizing sunglasses tend to blackout the LCD screen when the transmission axis of the linear polarizer is orthogonal to linearly-polarized light from the LCD screen"
  - "when a viewer tilts his/her head at a certain angle in relation to the LCD screen"
- **S2:**
  - "Polarized sunglasses usually have a vertical transmission in order to block out the strong horizontally polarized" (glare)
  - "appears black to viewers wearing polarized sunglasses"
  - "the apparent brightness of the LCD to the viewer will bear a factor of cos θ to the actual brightness of LCD"
- **S3:** "…the reflected light at that angle is linearly polarized with its electric field vectors perpendicular to the plane of incidence and parallel to the plane of the surface from which it is reflecting." "At other angles the reflected light is partially polarized."
- **S4:** "Light in the form of a plane wave in space is said to be linearly polarized." "…natural light is generally unpolarized, all planes of propagation being equally probable."

## Claim → source map (narration)
| narration | support |
|---|---|
| "Sunglasses on, and your phone goes black. Turn it, and it's back. Why?" | S1 (blackout when the axes are orthogonal; changes with the relative angle), S2 ("appears black to viewers wearing polarized sunglasses") |
| "Many screens give off light that vibrates one way, set by a filter." | S1 ("Light from an LCD screen is usually linearly polarized"; "a pair of crossed linear polarizers"); S4 (linear polarization). "Many", not "all": the sources speak of LCDs, and no share claim is made |
| "Polarized sunglasses filter one direction too, cutting glare off water and roads." | S1 (a linear-polarizing filter; a vertical film "to reduce glare caused by horizontally-polarized reflections"); S2 (vertical transmission blocks horizontally polarized glare); S3 (reflected light is polarized parallel to the surface). **Inference:** water and road surfaces are horizontal reflecting surfaces, so their glare is (partly) horizontally polarized |
| "When the filters cross, the light is blocked; turn the phone, and it passes." | S1 (blackout when orthogonal; the relative angle matters); S2 (brightness depends on the angle) |
| "So just rotate the phone. And if it darkens, your sunglasses are polarized." | **Inference** from S1/S2: only a polarizing lens has a transmission axis, so only it changes the screen's brightness as the angle changes; a plain tint dims equally at every angle. The test is stated one way only (darkening means polarized); it does not claim that no darkening proves the lenses are not polarized |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in contexts 16 and 24 |

- **On-screen takeaway (no VO):** "Rotate the phone. / Darkens? Polarized lenses." — same inference as l05.

## How the animation uses the sources (illustrative, not measured)
- **Filters as slotted panels ("picket fences"):** the screen's filter has horizontal slots when the phone is upright, the
  lens has vertical slots (S1, S2: vertical transmission). Waves (ribbons) show the vibration direction: gold = ordinary light
  in every direction (S4), lime = one direction after the screen filter, coral = glare vibrating sideways (S3).
- **Glare set:** the sun, water and lens are placed with mirror geometry (sun → water → lens); the glare's vibration is drawn
  parallel to the water and across the plane of incidence (S3) and stops at the vertical-slot lens.
- **Brightness through the lens** in the POV shots follows Malus's law (cos² of the angle between the two directions), the
  standard textbook relationship for two linear polarizers; it is used only to animate the dimming and is not narrated.
- **Which way the screen's filter points is illustrative:** the video shows an upright phone going dark; real phones differ
  (the caption note says so). The phone screen and "Field notes" page are original designs, not any real phone's interface.

## What the video does not claim
- No claim that every screen is polarized, no share or brand claims, no claim about any specific phone or pair of
  sunglasses, and no eye-safety or UV claims.
