# Sources and claim check — Recall english-06 "Why your phone compass points the wrong way near a speaker or a steel desk"

Sources were fetched on 2026-11-05 (one fetch per URL, no workarounds). Quotes are verbatim. Where a source wraps a
sentence across lines, the lines are joined with a space.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | Google Help Center, "Find & improve your location's accuracy in Google Maps", Android version — https://support.google.com/maps/answer/2839911?hl=en&co=GENIE.Platform%3DAndroid (the iPhone & iPad version has the same calibration sentences; the Computer version adds the "GPS location" wording) | the dot = your location (GPS); a wrong or wide beam means the compass needs calibrating; the figure-8 calibration |
| S2 | Apple Support 105073, "About the accuracy and performance of the Compass app on Apple Watch" (published 2025-11-14) — https://support.apple.com/en-us/105073 | magnets affect any compass sensor; keep a compass separated from a magnet source |
| S3 | Android Developers, "Position sensors" — https://developer.android.com/develop/sensors-and-location/sensors/sensors_position | phones carry a geomagnetic field sensor that monitors Earth's magnetic field |
| S4 | Android Open Source Project, "Sensor types" — https://source.android.com/docs/core/interaction/sensors/sensor-types | the magnetometer reports the ambient magnetic field; readings are calibrated for hard-iron and soft-iron effects |
| S5 | NXP (Freescale) application note **AN4248** Rev. 4.0 11/2015, "Implementing a Tilt-Compensated eCompass using Accelerometer and Magnetometer Sensors" — https://www.nxp.com/docs/en/application-note/AN4248.pdf (PDF sha256 c053c82b…870e, text extracted locally with pdftotext) | stray fields: fixed (hard-iron) vs induced by the geomagnetic field (soft-iron); hard-iron offsets can greatly exceed Earth's field; Earth's field strength |
| S6 | NXP (Freescale) application note **AN4246** Rev. 4.0 11/2015, "Calibrating an eCompass in the Presence of Hard and Soft Iron Interference" — https://www.nxp.com/docs/en/application-note/AN4246.pdf (PDF sha256 663fa456…8e70, text extracted locally) | soft-iron = field induced by Earth's field in unmagnetised ferromagnetic material; owner calibration |
| S7 | NOAA NCEI, "Geomagnetism Frequently Asked Questions" — https://www.ncei.noaa.gov/products/geomagnetism-frequently-asked-questions | Earth's field strength (weak); a compass follows the local horizontal field |

**Attempted but not usable:** Apple iPhone User Guide pages ("Use the compass on iPhone", "Important safety information")
returned only navigation text to the fetcher, so they are not quoted. USGS geomagnetism pages returned HTTP 404. NXP's
community mirror of AN4246 returned HTTP 403 (the nxp.com copy was used). ST design tips DT0059 / AN3192 returned HTTP 503.

## Verbatim quotes
- **S1 (Android and iPhone & iPad versions):**
  - "The blue dot shows your location on the map."
  - "If your blue dot's beam is wide or points in the wrong direction, calibrate your compass."
  - "Make a figure 8 until the beam becomes narrow and points in the right direction."
  - "You only have to do this a few times."
- **S1 (Computer version):** "If the GPS location of your blue dot on the map is inaccurate or missing, you can take steps to help fix the problem."
- **S2:**
  - "The presence of magnets can affect the accuracy of any compass sensor."
  - "If you're using another compass during activities such as diving, hiking, or navigating, keep it separated from Apple Watch when reading the external compass."
- **S3:**
  - "Most handset and tablet manufacturers include a geomagnetic field sensor."
  - "The geomagnetic field sensor lets you monitor changes in the earth's magnetic field."
- **S4:** "A magnetic field sensor (also known as magnetometer) reports the ambient magnetic field, as measured along the three sensor axes." Its calibration list includes "Factory (or online) soft-iron calibration" and "Online hard-iron calibration".
- **S5 (p. 1, Introduction):** "The accuracy of an eCompass is highly dependent on the calculation and subtraction in software of stray magnetic fields both within, and in the vicinity of, the magnetometer on the PCB. By convention, these fields are divided into those that are fixed (termed Hard-Iron effects) and those that are induced by the geomagnetic field (termed Soft-Iron effects)."
- **S5 (section 5):** "It is quite normal for the Hard-Iron offset to greatly exceed the geomagnetic field."
- **S5 (section 3):** "B is the geomagnetic field strength which varies over the earth's surface from a minimum of 22 μT over South America to a maximum of 67 μT south of Australia."
- **S6 (section 1.3):** "It is possible for a smartphone eCompass to be calibrated by the owner in the street with no a priori knowledge of location or the direction of magnetic north."
- **S6 (section 2):** "AN4247 defines the soft-iron effect as the interfering magnetic field induced by the geomagnetic field onto normally unmagnetized ferromagnetic components on the PCB."
- **S7:**
  - "Earth's magnetic field intensity is roughly between 25,000 - 65,000 nT (.25 - .65 gauss)."
  - "The compass points in the directions of the horizontal component of the magnetic field where the compass is located, and not to any single point."

## Claim → source map (narration)
| narration | support |
|---|---|
| "The dot is right, so why is the arrow wrong next to a speaker?" | S1 (the dot is your location; the beam can point the wrong way), S2 (magnets affect compass accuracy) |
| "GPS places the dot." | S1 ("the GPS location of your blue dot"; "The blue dot shows your location") |
| "The arrow comes from a tiny compass sensor that feels Earth's magnetic field." | S3, S4 (geomagnetic field sensor / magnetometer); S1 links a wrong beam to the compass |
| "That field is weak." | S7 and S5 (about 22–67 μT, i.e. 25,000–65,000 nT); S5 (magnetised parts can "greatly exceed the geomagnetic field") |
| "Up close, a speaker's magnet or a steel desk can bend it, and the arrow swings." | S2 (magnets affect any compass sensor); S5 (fixed stray fields from magnetised material = hard-iron; fields induced by Earth's field = soft-iron); S6 (soft-iron = field induced in unmagnetised ferromagnetic material). **Applied inference:** S5/S6 describe magnetised and unmagnetised ferromagnetic parts in and near the sensor; a loudspeaker's permanent magnet and a steel (ferromagnetic) desk act the same way from outside the phone. "Up close": magnet fields fall off quickly with distance (dipole field), and S2 advises keeping a compass separated from magnets |
| "Step away from magnets and steel, then calibrate by waving a figure eight." | S2 (keep the compass separated from the magnet source); S1 (calibrate; "Make a figure 8 until the beam becomes narrow and points in the right direction"); S3 (figure-8 pattern improves accuracy); S6 (owner calibration) |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in context 16 and 20 |

- **On-screen takeaway (no VO):** "Away from magnets, then a figure 8." — S1, S2.
- **Order of the takeaway:** calibration fixes offsets that move with the phone (S5/S6 model them in the phone's own frame);
  a magnet or steel object outside the phone does not move with it, so the video says to step away first, then calibrate.

## How the animation uses the sources (illustrative, not measured)
- **Giant desk:** a grid of compass needles shows the local horizontal field (S7: a compass follows the local horizontal
  field). Earth's field is a uniform field to the north. The speaker magnet is drawn as a bar magnet (two poles along the
  speaker's axis). The steel plate has no field of its own; Earth's field magnetises it along the north direction
  ("induced", S5/S6), drawn as a bar magnet aligned with Earth's field. Strengths are tuned so the chip turns about 74° next
  to the speaker and about 32° next to the steel; after the phone moves to the far corner the residual is about 1°. These
  numbers are illustrative only.
- **Beam on the giant phone:** a north-up map; the phone takes "north" to be where the local field points, so the beam turns
  the opposite way from the chip needle (physically consistent). The dot never moves: location comes from GPS, which the
  magnet does not affect (S1).
- **Real café:** the same direction of error (the beam swings away from the speaker), then a wide beam after stepping away
  that narrows after the figure 8 (S1).

## What the video does not claim
- No degree, distance or microtesla figures on screen; no claim about any specific phone, speaker or app.
- No claim that calibration removes interference from a nearby magnet, and no claim that GPS itself is affected.
- No safety, medical or device-damage claims.
