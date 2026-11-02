# Sources and claim mapping: production 30s #02, "Why a walkie-talkie can work when the internet is down"

Checked 2026-11-02. Pages were fetched with curl through the session proxy, the quotes were copied from the fetched text, and sha256 values are of the fetched HTML.

| ID | Source | Type | Status | Key quote |
|---|---|---|---|---|
| S1 | US eCFR, 47 CFR Part 95 Subpart B (Family Radio Service), §95.503 Definitions: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-95/subpart-B | Primary (federal regulation) | fetched via the eCFR renderer API (sha256 `619c45a0…f474`) | "Family Radio Service (FRS). A short-distance two-way voice communication service, with limited data applications, between low power hand-held radios" |
| S2 | US eCFR, 47 CFR Part 95 Subpart E (General Mobile Radio Service), §95.1703, §95.1747: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-95/subpart-E | Primary (federal regulation) | fetched (sha256 `1e13f443…c0b1`) | GMRS is "a mobile two-way voice communication service"; "GMRS repeater stations may be operated by automatic control" (repeaters are part of this radio service) |
| S3 | Bluetooth SIG, "Understanding Bluetooth Range": https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Institutional (standards body) | fetched (sha256 `309e09f7…a7e`) | "The longer answer to the question about the range of Bluetooth® technology is it depends." / "Obstacles between the transmitter and the receiver can deteriorate the signal. Attenuators can be anything from humidity and precipitation, to walls, windows, and other obstacles…" / "guards in place to counter interference" |
| S4 | Wikipedia, "Walkie-talkie": https://en.wikipedia.org/wiki/Walkie-talkie (rev. 2026-10-27) | Secondary (encyclopedia) | fetched (sha256 `c51a71f0…d33`) | "a hand-held, portable, two-way radio transceiver" / "Multiple walkie-talkies use a single radio channel" / range ratings based "on terrain"; "line of sight propagation of UHF signals" |
| S5 | Wikipedia, "Repeater": https://en.wikipedia.org/wiki/Repeater (rev. 2026-06-28) | Secondary (encyclopedia) | fetched (sha256 `3d0c7dc4…ca`) | "Repeaters are used to extend transmissions so that the signal can cover longer distances or be received on the other side of an obstruction." |
| S6 (not used) | FCC GMRS page and Ofcom PMR446 page | Primary | **not fetchable** (403) | Not relied on. |

## Claim → source
| Narration (final) | Type | Source |
|---|---|---|
| "Internet down? A walkie-talkie sends your voice by radio, straight to another radio." | Fact | S1 (two-way voice between hand-held radios); S4 (handheld two-way radio transceiver) |
| "No website, mobile data or internet router needed." | Inference from the definition: a radio-to-radio service between handsets | S1, S4. The animation shows the internet path offline while the direct radio link still carries voice. |
| "Both radios need compatible settings and must be within usable range." | Fact | S4 (radios share a single channel); S1 ("short-distance") |
| "Buildings, hills and interference can weaken the signal." | Fact (general radio physics) | S3 (obstacles and walls deteriorate the signal; interference); S4 (terrain, line of sight); S5 (obstructions) |
| "Some radio systems use repeaters to reach farther." | Fact | S2 (GMRS repeater stations); S5 (repeaters extend transmissions past obstructions and over distance) |
| "Offline messaging apps may use different radios and rules, so check their limits." | Generic advice; deliberately no claim about any app's radio or range | S3 (range "depends" on the technology and environment) |
| "No internet doesn't mean unlimited communication." | Takeaway synthesising the range limits | S1 ("short-distance"), S3, S4 |

## Illustrations (labelled "Illustrative map · not real coverage data")
- The channel bullets "CH 3" and "CH 7" are example settings.
- Coverage-ring radii, the hill and building positions are illustrative, not measured.

## Not claimed
- No distances, frequencies, power levels or licence advice. US FRS/GMRS rules are cited only to support the mechanism; rules differ by country.
- Nothing about Meshline's radio, protocol or range. The app appears only as the small end signature.
