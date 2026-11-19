# Sources and claim check — Recall english-22 "Your phone has springs" (how a phone knows which way is down)

Read on 2026-11-19. S1 and S2 were downloaded as PDFs and read with `pdftotext`; S3 and S4 were read as page text in headless
Chromium. Quotes are verbatim (line breaks normalised). The Analog Devices ADXL335 datasheet (analog.com) did not respond
(an HTTP/2 stream error, then an empty reply on one plain retry); it was not pursued further and is not cited.

## Topic check → topic changed (why)
The suggested topic, "Why a QR code can survive a missing piece" (error correction, missing tiles recovered from redundancy,
correction levels, damage distribution, a phone-camera takeaway), is already covered by **F01** (2026-11-02, context 14,
`production/30s/2026-11-02-feedback-round/`): "Why QR codes can still scan with a logo in the middle" — a real level-H code,
error-correction tiles rebuilding damaged content, DENSO WAVE's correction levels (approx. 7/15/25/30 %), zxing decode tests showing
that a small logo decodes while a big one or a covered finder corner fails, and the takeaway "a bigger logo isn't always better".
The same QR suggestion was already declined for E10. A second QR episode would repeat F01's mechanism, visuals and takeaway. Per
the brief's rule, a **genuinely different subject in the same genre** (how everyday technology works) was chosen: **how a phone
knows which way is down** — the MEMS accelerometer's spring-mounted weight, the capacitive fingers that measure its shift, auto-rotate,
and the rotation-lock takeaway for reading in bed. No earlier episode covers accelerometers, auto-rotate or MEMS; E06 (compass) was
the magnetometer, and E10's "rotate test" was about polarized light, not orientation sensing.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | NXP (Freescale) Application Note AN3461 Rev. 6 (03/2013), M. Pedley, "Tilt Sensing Using a Three-Axis Accelerometer", https://www.nxp.com/docs/en/application-note/AN3461.pdf | the proof mass hangs on restoring springs; gravity deflects it; the deflection is measured from the capacitance change between the mass's fingers and the sensing plates; the gravity reading gives orientation so a smartphone or tablet display switches between portrait and landscape |
| S2 | A. Agliolo Gallitto (Università di Palermo) & L. Lupo, "A mechanical model of the smartphone's accelerometer", arXiv:1507.02224 (2015), https://arxiv.org/abs/1507.02224 | smartphones have an accelerometer that senses orientation to set the display; a proof mass mounted on springs; capacitive cell: one gap grows while the other shrinks, and a circuit measures the two capacitances; three orthogonal axes |
| S3 | Android Developers, "Sensors overview" and "Motion sensors", https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview and https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion | the accelerometer measures acceleration on three axes **including the force of gravity**; most Android devices have one; it is a hardware sensor |
| S4 | Apple Support, "Rotate the screen on your iPhone or iPod touch" (118226), https://support.apple.com/en-us/118226 | the screen rotates between portrait and landscape when you turn the phone sideways; Portrait Orientation Lock; some apps don't rotate |

## Verbatim quotes
- **S1:** "Accelerometers are sensitive to both linear acceleration and the local gravitational field. … the latter provides
  information on the accelerometer orientation which allows a smartphone or tablet display to automatically switch between
  portrait and landscape settings." "The upper proof mass is suspended by the restoring springs. Both a gravitational field
  directed to the left and a linear acceleration of the package to the right will deflect the proof mass to the left." "The
  deflection of the proof mass is measured from the change in capacitance between the fingers of the proof mass and the sensing
  plates." (Figure 1: "Electron Microscope Image of MEMS Accelerometer Proof Mass and Sensing Plates".) "The first high volume use
  of accelerometers in consumer products was to switch a display between landscape and portrait orientations."
- **S2:** "Beside microphone and speaker, all the smartphones are equipped by an acceleration sensor, the accelerometer, which senses
  the device's orientation to set the display orientation." "Usually, one-axis acceleration sensor consists of a prof mass, mounted
  on springs, that can move freely in one direction." "When the center plate accelerates, the distance from it to one of the fixed
  plates will increase whereas that to the other plate decreases by the same amount. As the distance between the plates changes,
  each capacitor's value will change. An integrated circuit measures the two capacities and extracts the acceleration data from the
  difference between the two values" "To measure the three components of acceleration independently, three sensors have to be
  positioned orthogonally to each other".
- **S3:** "TYPE_ACCELEROMETER — Hardware — Measures the acceleration force in m/s2 that is applied to a device on all three physical
  axes (x, y, and z), including the force of gravity." "Most Android-powered devices have an accelerometer, and many now include a
  gyroscope." "The accelerometer and gyroscope sensors are always hardware-based."
- **S4:** "The screen on your iPhone and iPod touch can rotate so that you can see apps in portrait or landscape mode." "Some apps
  don't support rotation, so your screen might not rotate even if Portrait Orientation Lock isn't turned on." Steps: "Tap the
  Portrait Orientation Lock button …" "Turn your iPhone sideways."

## Measured facts, estimates and illustrative assumptions
| item | status |
|---|---|
| Phones have an accelerometer; it senses orientation to set the display | S2 ("all the smartphones"), S3 ("Most Android-powered devices"), S1 |
| Inside: a proof mass suspended by springs, deflected by gravity | S1 (MEMS image and text), S2 |
| The deflection is measured as a capacitance change between the mass's fingers and fixed plates (one gap narrows, the other widens) | S1, S2 |
| Turning the phone changes which axis gravity falls on, so the display switches portrait/landscape | S1 (§6 "Selecting Portrait and Landscape Modes"), S2, S4 |
| Lying on your side, gravity still points down, so the screen can flip; rotation lock stops it | S1/S3 (the sensor measures gravity), S4 (Portrait Orientation Lock). Some phones also offer optional extra rotation features (for example camera-based face detection reported for some Android phones; no official Google page was found), so the narration only says what the weight feels and recommends the lock, which works regardless |
| "Microscopic" springs | S1 (an electron-microscope image), S2 ("micro-machined") |
| Two-axis comb layout with four serpentine springs and a "phone top" marker on the die | **illustrative generic design**; real chips differ (S2 describes three orthogonal sensors; layouts vary by maker) |
| Size of the deflection and the spring lag | **greatly exaggerated / illustrative**; no displacement value is claimed |
| The weight drawn centred first, then sagging | **illustrative order** (in a real phone it always feels 1 g) |
| Lime glow on approached plates | **illustrative** stand-in for the measured capacitance change |
| Phone UI ("Notes" reader) and the rotation-lock icon | **generic, original** artwork; not any vendor's exact UI or icon |

## Claim → source map (narration)
| narration | support |
|---|---|
| "Your phone has springs." | S1 ("proof mass is suspended by the restoring springs"), S2 ("proof mass, mounted on springs"; "all the smartphones are equipped by an … accelerometer") |
| "Microscopic ones. So how do they know which way is down?" | S1 (electron microscope image), S2 (micro-machined); the question is answered by the next lines |
| "In a chip, a tiny weight hangs on springs." | S1, S2 |
| "Gravity tugs on it, so it shifts slightly." | S1 ("a gravitational field … will deflect the proof mass") |
| "Its fingers move closer to one set of plates, and the chip measures that change." | S1 (capacitance between the fingers and the sensing plates), S2 (one distance increases, the other decreases; an IC measures both) |
| "Turn the phone sideways, and the weight shifts another way, so the screen turns." | S1 (portrait/landscape switching), S2, S3 (three axes including gravity), S4 |
| "Reading in bed on your side? The weight still feels gravity, so lock rotation." | S1, S3 (the sensor measures gravity), S4 (Portrait Orientation Lock) |
| "Download Recall to turn your study material into lessons." | `assets/listing.json` (approved): "Turn your study material into lessons, practice and spaced reviews." (same verified CTA as E13–E21) |

## What the video does not claim
- No displacement numbers, chip brands or phone models; no claim that every phone uses the same layout; no claim that phones can
  never use the camera for rotation; no app features.
