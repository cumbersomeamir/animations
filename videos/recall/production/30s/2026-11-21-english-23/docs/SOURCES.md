# Sources and claim check — Recall english-23 "How does it see smoke?" (how a smoke alarm detects smoke)

Read on 2026-11-22 (public pages; curl or WebFetch, page text extracted). Quotes are verbatim (whitespace normalised). Not cited:
NFPA pages (rendered by script, no readable text without a browser), Britannica (HTTP 403), CPSC (HTTP 403), a NIST technical-note
PDF link (HTTP 404), and the NRC smoke-detector backgrounder (ionization only, not needed for this script).

## Topic check → topic changed (why)
The suggested topic, "An induction hob makes the pan into the heater" (electromagnetic induction, eddy currents, magnetic cookware,
a coil-and-pan cutaway, glass heated by the pan), is already covered by **H04** (2026-11-04, context 18,
`production/30s/2026-11-04-hindi-04/`): "इंडक्शन पर बर्तन गर्म कैसे होता है?" — how the pan, not the cooktop, heats on induction.
The same induction suggestion was already declined for E19 ("the suggested induction topic was already H04", context 32). Another
induction episode would repeat H04's question, mechanism and visuals. Per the brief's rule, an **unrelated subject inside the fixed
genre** (how everyday technology works) was chosen: **how a smoke alarm "sees" smoke** — the photoelectric chamber, light aimed
away from the sensor, smoke scattering light onto it — with the monthly test-button takeaway.
It differs from batch 22 (E22, MEMS accelerometer: mechanics/capacitance, café + bedroom) in its core question (detecting smoke, not
orientation), setting (café ceiling + a giant optical chamber) and mechanism (light scattering by particles). No earlier episode
covers smoke alarms; E08 (infrared remote) and E20 (refraction in water) are different optical effects.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | US EPA, Radiation Protection, "Photoelectric Technology" (Smoke Detectors & Radiation), http://epa.gov/radiation/sources/smoke_photo.html — archived 2009-05-08 in the End of Term Web Archive (UNT): https://webarchive.library.unt.edu/eot2008/20090508081844/http://epa.gov/radiation/sources/smoke_photo.html | chamber with an LED and a photocell; in clean air the beam crosses without striking the photocell; smoke particles scatter some light, some reaches the photocell; enough light activates it |
| S2 | Nebraska State Fire Marshal Agency, "Photoelectric smoke alarms", https://sfm.nebraska.gov/node/319 (text marked "(NFPA)") | the light source is aimed into the sensing chamber at an angle away from the sensor; smoke reflects light onto the sensor, triggering the alarm |
| S3 | U.S. Fire Administration (FEMA), "Smoke alarms", https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/ | two basic types (ionization and photoelectric) → "many alarms"; an alarm can sound while cooking or "taking a shower with lots of steam"; test the alarm monthly |
| S4 | U.S. Fire Administration (FEMA), pictograph "When to test smoke alarms", https://www.usfa.fema.gov/gallery/pictographs/pictograph04.html | "Test smoke alarms at least once a month using the test button." |

## Verbatim quotes
- **S1:** "Photoelectric technology smoke alarms use a T-shaped chamber fitted with a light-emitting diode (LED) and a photocell."
  "Under normal, smoke-free conditions, the LED beam moves in a straight line, through the chamber without striking the photo cell.
  When smoke enters the chamber, smoke particles deflect some of the light rays, scattering them in all directions. Some of it reaches
  the photocell. When enough light rays hit the photocell, they activate it."
- **S2:** "Photoelectric-type alarms aim a light source into a sensing chamber at an angle away from the sensor." "Smoke enters the
  chamber, reflecting light onto the light sensor; triggering the alarm(NFPA)."
- **S3:** "There are many brands of smoke alarms on the market, but they fall under 2 basic types: ionization and photoelectric."
  "If a smoke alarm sounds while you're cooking or taking a shower with lots of steam, do not remove the battery." "Test the alarm monthly."
- **S4:** "Test smoke alarms at least once a month using the test button."

## Claim map (narration → source)
| line | claim | source |
|---|---|---|
| l01 | "How does it see smoke?" (question; photoelectric alarms do detect smoke optically) | S1, S2 |
| l02 | burnt toast sets the alarm off | S3 (alarm sounding while cooking) |
| l03 | "Many alarms hide a small chamber with a tiny light." ("many": photoelectric is one of 2 basic types) | S1, S3 |
| l04 | the light aims away from the sensor, so normally it sees nothing | S1 ("without striking the photo cell"), S2 ("at an angle away from the sensor") |
| l05 | smoke particles scatter the light, and some hits the sensor | S1, S2 |
| l06 | enough light, and the alarm sounds | S1 ("When enough light rays hit the photocell, they activate it"), S2 |
| l07 | thick steam can set it off too, even with no fire | S3 (sounding while "taking a shower with lots of steam") |
| l08 | test yours once a month, using the test button | S4, S3 |
| l09 | CTA "Download Recall to turn your study material into lessons." | app listing (`videos/recall/assets/listing.json`) as E13–E22 |

## Facts vs assumptions (illustrative choices, not claims)
- The giant chamber is a simplified, generic model (round cut-away, labyrinth vanes, LED, light trap, sensor at 90° to the beam);
  real layouts vary by maker (S1 describes a T-shaped chamber). Particle sizes are hugely exaggerated; rays are drawn lines.
- The sensor glow stands for the photocell's signal; the alarm's real decision electronics are not shown.
- **Steam drawn as droplets scattering light in the chamber is an illustration** of why steam can trigger an alarm; S3 states that
  steam can set alarms off but does not describe the mechanism. Narration only says steam "can set it off".
- Ionization alarms (the other basic type) work differently and are not explained; the narration says "many alarms", not "all".
- Pressing the test button with a broom handle is a visual gag/practical reach, not a claim; the beeps are a softened illustration,
  not a recording of a real alarm. No claim that testing guarantees safety.
