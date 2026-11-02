# Facts file — claim → source → quoted wording (production 30s-02, accessed 2026-11-02)

## Sources
| id | source | date | quoted wording (verbatim) |
|---|---|---|---|
| S1 | Apple Support, *Active Noise Cancellation and Transparency modes for AirPods*, https://support.apple.com/en-us/108918 (formerly HT210643) | published 2026-09-14 | "With Active Noise Cancellation, an outward-facing microphone or microphones detect external sounds, which your AirPods … then counter with anti-noise, canceling the external sounds before you hear them. An inward-facing microphone listens inside your ear for unwanted internal sounds, which your AirPods also counter with anti-noise." |
| S2 | Sony Help Guide WF-SP800N, *What is noise canceling?*, https://helpguide.sony.net/mdr/wfsp800n/v1/en/contents/TP0002755767.html | accessed 2026-11-02 | "The noise canceling circuit actually senses outside noise with built-in microphones and sends an equal-but-opposite canceling signal to the headset." · "The noise canceling function works primarily on noise in the low frequency band such as vehicles and air conditioning. Although noise is reduced, it is not completely canceled." |
| S3 | Sony Help Guide WF-SP800N, *The effect of noise canceling is not sufficient.*, https://helpguide.sony.net/mdr/wfsp800n/v1/en/contents/TP0002755729.html (same wording in the WF-1000X guide) | accessed 2026-11-02 | "The noise canceling function is effective in low frequency ranges such as airplanes, trains, offices, near air-conditioning, and is not as effective for higher frequencies, such as human voices." · "When you feel the noise canceling function and low frequency sound are insufficient, change the earbuds to ones that feel more sealed." |
| S4 | Bose, *How Do Noise Cancelling Headphones Work?*, https://www.bose.com/stories/how-do-noise-cancelling-headphones-work | published 2026-04-27 (modified 2026-04-29) | "Noise cancelling headphones rely on two technologies working together: passive isolation and active noise cancellation. Passive isolation comes from the headphone's physical design, including ear cups, padding, and a secure fit that helps block outside sound. Active noise cancellation adds an electronic layer, using microphones to detect ambient noise and digital processing to generate an opposing signal that reduces what you hear." · "Fit matters, because a better seal helps block more outside sound." · "steady background sounds are usually easier to reduce than sudden or unpredictable ones." · "voices are harder to cancel than steady background noise because they change quickly and cover a wider range of sound." |
| B1 (background, not quoted on screen) | S. M. Kuo & D. R. Morgan, "Active noise control: a tutorial review", *Proceedings of the IEEE* 87(6), 1999, doi:10.1109/5.763310 | 1999 | peer-reviewed overview of anti-noise (secondary sources driven by adaptive electronics); used only to confirm the general principle; full text not accessible from this environment |

## Claims (voice + screen) → sources
| # | claim | where | source | type |
|---|---|---|---|---|
| C1 | "Noise cancelling headphones don't just wall off your ears." (wall = passive part, "+ ?" = the active part) | V1 / L1 | S4 (two technologies: passive isolation + active cancellation) | fact, framing |
| C2 | "Microphones listen to the noise" · outer mic + inner mic | V2 / L2 | S1 (outward- and inward-facing microphones), S2 (built-in microphones), S4 | fact |
| C3 | "and electronics create an opposing wave." · "anti-noise" from the driver | V2 / L2 | S1 ("anti-noise"), S2 ("equal-but-opposite canceling signal"), S4 ("digital processing to generate an opposing signal") | fact |
| C4 | "When the waves meet, part of the noise is reduced." · "reduced, not zero" | V3 / L3 | S2 ("Although noise is reduced, it is not completely canceled."), S4 ("reduces what you hear") | fact |
| C5 | "This works best on steady, low rumbles, like an engine." · "mostly cancelled" (schematic) | V4 / L4 | S2/S3 (low frequency: vehicles, airplanes, trains), S4 (steady sounds easier) | fact; the chart amplitudes are schematic |
| C6 | "Voices and sudden, sharp sounds are harder to cancel." · "gets through" | V5 / L5 | S3 ("not as effective … human voices"), S4 (sudden/unpredictable harder; voices harder) | fact |
| C7 | "Ear cushions also block sound physically." · outside wave large, inside small | V6 / L6 | S4 ("ear cups, padding, and a secure fit that helps block outside sound") | fact; attenuation amount schematic |
| C8 | "So the quiet comes from two mechanisms working together." · ACTIVE / PASSIVE board | V7 / L7 | S4 ("two technologies working together") | fact |
| C9 | "A snug fit helps both." · leak closes; ✓ active ✓ passive | V8 / L8 | S4 (better seal blocks more outside sound — passive), S3 (Sony: for insufficient noise canceling and low frequency sound, use earbuds that feel more sealed — active effect) | fact, practical advice |

## Inferences / schematic elements
- The ear-cup cutaway, chip, driver, wave shapes, amplitudes, "slowed" time scale (ms readouts) and the leak are schematic,
  not measurements of any product. Real products differ (number/placement of microphones, processing, fit).
- Not claimed: hearing-health effects, specific decibel figures, any product ranking, anything about the Media Diet app.
