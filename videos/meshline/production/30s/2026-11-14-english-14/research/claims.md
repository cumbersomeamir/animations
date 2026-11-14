# Sources and claim mapping: batch 2026-11-14-english-14, "Why a hand's width can bring the signal back"

Checked 2026-11-14. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check (why the proposed angle was changed)
- **Proposed:** "Why moving a phone a few steps can restore its connection". The brief's suggested mechanism was packets taking a clearer path around a thick obstruction. That repeats:
  - **07** (Hindi feedback-05): the "come closer, with no wall between" test;
  - **14** (english-12): concrete-wall loss and relay placement;
  - the wall beat in **15** (english-13).
- **Chosen instead (same genre, same story):** *multipath dead spots*. Echoes off walls arrive out of sync and add or cancel, so signal strength changes over a few centimetres and a small shift can bring a link back. This mechanism (interference, not obstruction) has never been covered (searched: multipath, fading, dead spot, wavelength).

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ITU-R P.1406-2** (07/2015), "Propagation effects relating to terrestrial land mobile and broadcasting services in the VHF and UHF bands", https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1406-2-201507-I!!PDF-E.pdf | Primary (standard) | fetched (sha256 `35f9e76c…`) | §3.3: "Constructive and destructive interference between the direct and various reflected waves creates an interference pattern in which the distance between minima is at least one half wavelength." / §3.2.2: "On a scale of a few wavelengths, signal variability is determined by multipath effects." (UHF covers 300 MHz–3 GHz, so 2.4 GHz is in scope.) |
| S2 | **ITU-R P.1238-13** (09/2025), indoor propagation, 300 MHz–450 GHz, https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1238-13-202509-I!!PDF-E.pdf | Primary (standard) | fetched (sha256 `973169a6…`) | §4.1: "The term multipath arises from the fact that, through reflection, diffraction, and scattering, radio-waves can travel from a transmitter to a receiver by many paths." |
| S3 | **NIST CODATA**, speed of light in vacuum, https://physics.nist.gov/cgi-bin/cuu/Value?c | Primary (reference constant) | fetched (sha256 `d7d8bd00…`) | "speed of light in vacuum … 299 792 458 m s-1 … (exact)". So λ = c/f = 0.1249 m at 2.400 GHz and 0.1209 m at 2.480 GHz, i.e. about 12 cm; half a wavelength is about 6 cm. |
| S4 | **Bluetooth SIG**, "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Primary (standards body) | fetched 2026-11-11 (sha256 `8416039b…`) | "Bluetooth® technology uses the 2.4 GHz ISM spectrum band (2400 to 2483.5 MHz)" |
| S5 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." No transport, range, relay or prerequisite is stated. |

## Claim → source (final narration), labelled fact / estimate / illustrative
| Line | Kind | Source |
|---|---|---|
| "Dead spot? Slide the phone a hand's width, and it can come back. Why?" | Hook. Illustrative, and hedged ("can"). | S1 (strength varies over about half a wavelength, so roughly 6–12 cm can move a receiver out of a minimum) |
| "The radio wave arrives by several paths, bouncing off walls." | Fact | S2 (reflection, diffraction and scattering give many paths) |
| "The echoes arrive out of sync. Here they add up, there they cancel." | Fact | S1 (constructive and destructive interference) |
| "At Bluetooth's two point four gigahertz, one wave is about twelve centimetres long." | Fact (computed) | S3 + S4: c/f = 12.1–12.5 cm across the band |
| "So weak and strong spots can be just centimetres apart." | Fact | S1 (minima at least half a wavelength, about 6 cm, apart, with stronger points between) |
| "When a nearby link stalls, shift the phone a little before giving up." | Practical tip (generic) | Follows from S1. It is not a guarantee: if a wall or distance is the cause, a small move may not help (covered in earlier episodes). |
| "Try Meshline for private nearby messaging, even offline." | CTA | S5. No transport, range, relay or emergency claim. |

## The on-screen signal map (illustrative model, not a measurement)
- **Model:** computed in `src/spots.mjs` as a 2-D sum of the direct path plus three wall reflections (image method; reflection amplitudes 0.8/0.8/0.6, 1/r spreading).
- **Scale:** the wavelength is drawn as 1.6 G, standing for 12.5 cm, so near the phone the pattern is roughly to scale with the phone glyph. The room is not to scale.
- **Dead spot and strong spot:** found by search: a null at (13.34, 15.76) G and a peak about 1.3 G away (≈10 cm, "a hand's width"). The contrast in this model is ~16 dB, but that is not a real-world figure, so no dB value is shown or spoken.
- **Live bars:** the phone's signal bars and the instrument meter sample this same field at the phone's position.
