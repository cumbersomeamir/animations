# Sources and claim mapping: batch 2026-11-11-english-12, "Why concrete walls shrink Bluetooth range"

Checked 2026-11-11. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check (why this topic was made despite overlap)
- **Proposed topic:** "Why phones lose signal in a packed stadium". This repeats episode 01, pilot 01, the 10 s test and english-11 (crowd capacity). The user's own TOPIC OVERRIDE replaced it with this subject.
- **Overlap acknowledged:**
  - Hindi feedback-05 (Bluetooth headphones behind a thick wall) taught a diagnosis test: move closer, bars ≠ headphone link.
  - Round-02 (episode 04) mentioned walls as one reach limit.
  - english-07 had swapped a similar "walls" proposal for upload vs download.
- **Made anyway** because the user explicitly overrode the topic, and the angle is new:
  - measured loss by material (NIST);
  - the decibel → distance conversion (ITU-R P.525);
  - why relay placement matters.

None of these three were covered before, and this is the first English treatment.

| ID | Source | Type | Status | Key quote / data (verbatim or computed from published coefficients) |
|---|---|---|---|---|
| S1 | **Bluetooth SIG**, "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Primary (standards body) | fetched (sha256 `8416039b…`) | "The effective, reliable range between Bluetooth devices is anywhere from more than a kilometer down to less than a meter." / "Bluetooth® technology uses the 2.4 GHz ISM spectrum band (2400 to 2483.5 MHz)" / "Attenuators can be anything from humidity and precipitation, to walls, windows, and other obstacles made of glass, wood, metal, or concrete… the amount of attenuation and effective path loss varies with the type and density of the obstruction." |
| S2 | **NIST IR 6055**, W. C. Stone, "Electromagnetic Signal Attenuation in Construction Materials" (Oct 1997), https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nistir6055.pdf | Primary (government lab, measured) | fetched (sha256 `e5923af2…`) | "The strongest signal absorption ocurred for concrete specimens." / "a 13 mm thick drywall panel dissipated only 6% of the transmitted power" / "In general, the signal attenuation (dB/mm) increases with increasing frequency." / "complete absorption (or reflection) of the signal by the target material". **Measured regression fits (Tables 4.4b–4.11b, low band 0.5–2.0 GHz) evaluated at 2.0 GHz**, the top of the measured band just below Bluetooth's 2.4 GHz, for the eight plain-concrete mixes: ~102 mm → −14.1 to −18.0 dB; **~203 mm → −28.6 to −34.9 dB**; ~305 mm → −35.7 to −42.5 dB. Drywall (Table 4.13b) ≈ −0.6 dB. Glass (4.14b) −1.4 to −3.9 dB. |
| S3 | **ITU-R P.525-4** (08/2019), "Calculation of free-space attenuation", https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.525-4-201908-S!!PDF-E.pdf | Primary (standard) | fetched (sha256 `b1c98e82…`) | Eq. (3): free-space basic transmission loss Lbf = 20 log(4πd/λ) dB. So each doubling of distance adds 6 dB, and an extra 30 dB equals a distance factor of 10^(30/20) ≈ 31.6. |
| S4 | **Bluetooth SIG**, "Bluetooth® Mesh Networking", https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/mesh/ | Primary (standards body) | fetched (sha256 `ba108e52…`) | "Bluetooth® Mesh Networking offers multiple options for message relay." / "Managed Flood provides reliable, multi-path messaging over multiple hops." (relays and hops exist as a generic concept) |
| S5 | Meshline listing (`videos/meshline/assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, free, InStock. **No transport, range, relay or prerequisite is stated anywhere in the app context.** |

## Claim → source (final narration), labelled measured / estimate / illustrative
| Line | Kind | Source |
|---|---|---|
| "Same distance, one concrete wall, and the link drops. Why?" | Hook (illustrative scenario) | S1 (walls of concrete attenuate; type and density matter) |
| "Through thin drywall, it barely changes." | **Measured** | S2 (drywall ≈ −0.6 dB at 2 GHz; "dissipated only 6%") |
| "Bluetooth's two point four gigahertz wave is absorbed and reflected by dense concrete." | Fact | S1 (2.4 GHz band; density); S2 (concrete strongest absorption; "absorption (or reflection)") |
| "Lab tests measured about thirty decibels lost through twenty centimetres." | **Measured** (at 2.0 GHz, rounded) | S2: 28.6–34.9 dB through ~203 mm across eight mixes at 2.0 GHz. NIST notes attenuation generally rises with frequency, so the 2.4 GHz loss is likely no lower (**estimate**, not measured). |
| "In open air, that's like thirty times the distance." | **Estimate** from physics | S3: 30 dB ≈ 31.6× distance under the free-space (inverse-square) law. Indoors, loss grows faster than free space, so the factor differs; the line says "in open air". |
| "So a relay belongs in the doorway: two clear hops beat one through concrete." | **Illustrative principle** | S3 + S2 (each clear hop avoids the ~30 dB wall loss); S4 (relays/hops are a real, generic concept). This is not a Meshline feature claim. |
| "Message people nearby, even offline, with Meshline." | CTA | S5. No range number, transport, relay, emergency-reliability or "reach anyone" claim. |

## CTA prerequisite check (requested)
- **Supported behaviour:** "private nearby messaging that keeps moving, even when the internet does not" (S5). That is all the context states.
- **Range assumptions:** none are stated in the context, so no range is shown or spoken. On screen, "nearby" is never given a distance.
- **Prerequisites (radio type, permissions, relays):** unknown, so none are claimed. The CTA does not say Bluetooth, does not say relay, and during the CTA the relay diagram is veiled away.

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- The floor plan, the phone glyphs and the wave are generic drawings. The "−30 dB" stamp and the "20 cm" dimension restate S2's rounded measurement.
- The 30× ruler restates the S3 arithmetic. It is not a measured range, and no absolute distance is shown.
