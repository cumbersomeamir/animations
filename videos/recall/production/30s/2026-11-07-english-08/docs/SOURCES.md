# Sources and claim check — Recall english-08 "Your eyes can't see this remote's light. So why can your phone camera?"

Sources were read on 2026-11-06/07. Quotes are verbatim: web pages were checked against their live text rendered in headless
Chromium (`document.body.innerText`); the Vishay datasheet was read from its PDF with `pdftotext`.

## Topic choice
The batch suggested "why noise-cancelling headphones struggle with sudden voices but reduce a steady engine hum" (microphone,
opposing wave, timing). That is episode **F05** (`2026-11-05-feedback-05`, context 19: the AC hum is reduced but a friend's
sudden "अरे, सुनो!" is heard; outer mic, opposite wave, "the opposite wave is formed a little late"). Per the user's rule a
fresh, equally useful everyday-technology mystery in the same genre was chosen: why a phone camera shows a TV remote's
invisible light, with a practical remote test. "infrared" and "remote" appear in no earlier episode (contexts 11–21 checked).

## Sources read
| # | source | used for |
|---|---|---|
| S1 | NASA Science, "Infrared Waves" — https://science.nasa.gov/ems/07_infraredwaves | remotes use infrared just beyond visible light (~940 nm); you cannot see it, but some digital and phone cameras are sensitive to it |
| S2 | Samsung Gulf Support, "How do I test my Samsung TV remote control?" — https://www.samsung.com/ae/support/tv-audio-video/how-to-test-the-samsung-tv-remote-control/ | the camera test; no light can mean low battery power (or a hardware issue); some remotes use Bluetooth |
| S3 | Vishay Semiconductors **TSOP382.., TSOP384..** "IR Receiver Modules for Remote Control Systems" (datasheet) — https://www.vishay.com/docs/82491/tsop382.pdf (PDF sha256 5f81c36a…c074) | the TV's receiver gets bursts on a carrier (e.g. 38 kHz) and a microprocessor decodes them ("a quick code the TV reads") |
| S4 | US Patent **US8237121B2** "Alternating row infrared filter for an image sensor" (Google Patents) — https://patents.google.com/patent/US8237121B2/en | silicon image sensors respond to visible and near-infrared light; cameras use infrared-cut filters (why "many", not all, cameras show it) |

**Attempted but not usable (not cited):** Sony support article 00025283 (HTTP 403 in Chromium and in a plain fetch),
Cambridge Audio remote FAQs (Cloudflare challenge), LG UK help library (HTTP 403), Philips TV support (only one relevant
sentence rendered), Samsung US TSG01001488 (a maintenance page). No bot checks were circumvented.

## Verbatim quotes
- **S1:**
  - "A remote control uses light waves just beyond the visible spectrum of light—infrared light waves—to change channels on your TV."
  - "A typical television remote control uses infrared energy at a wavelength around 940 nanometers." (rendered as "around940" on the page)
  - "While you cannot "see" the light emitting from a remote, some digital and cell phone cameras are sensitive to that wavelength of radiation."
  - "When he noticed an even warmer temperature measurement just beyond the red end of the visible spectrum, Herschel had discovered infrared light!"
- **S2:**
  - "If your Samsung TV remote isn't responding, you can quickly test its functionality using a digital camera or smartphone."
  - "Low battery power can prevent the remote from emitting a signal."
  - "Some remotes use both infrared and Bluetooth; ensure the correct signal type is being tested."
  - "Turn on the digital camera or smartphone camera app." / "Point the front tip of the remote control toward the camera lens." / "Look at the camera screen for a visible light or flash coming from the remote's tip." / "If no light appears, the remote may have a hardware issue or low battery power."
- **S3 (p. 1):** "IR Receiver Modules for Remote Control Systems"; "This IR receiver series is optimized for long burst remote control systems in different environments."; "The demodulated output signal can be directly connected to a microprocessor for decoding."; parts table: "Carrier frequency" "38 kHz".
- **S4:**
  - "The most common semiconductor-based image sensing devices are silicon-based and respond not only to visible light, but also to infrared and/or near infrared light."
  - "It is difficult to capture quality images in normal light conditions without an infrared and/or near infrared blocking filter because the infrared light typically swamps the image sensor performance and thereby corrupts the output levels."

## Claim → source map (narration)
| narration | support |
|---|---|
| "Your eyes can't see this remote's light. So why can your phone camera?" | S1 ("you cannot 'see' the light emitting from a remote, some digital and cell phone cameras are sensitive") |
| "Remotes blink infrared, light just past the red end your eyes detect," | S1 (infrared "just beyond the visible spectrum"; "just beyond the red end of the visible spectrum"; ~940 nm) |
| "in a quick code the TV reads." | S3 (burst remote-control signals on a carrier, demodulated and decoded by a microprocessor) |
| "Many camera sensors respond to that infrared, so the blinks show up on screen." | S1 ("some … cameras are sensitive to that wavelength"); S4 (silicon sensors respond to near-infrared; filters reduce it — hence "many", not "all") |
| "Remote not working? Aim it at the camera and press a button." | S2 (point the tip at the lens, watch the screen for a light or flash) |
| "No flicker? Try new batteries, or another camera." | S2 ("Low battery power can prevent the remote from emitting a signal"; "If no light appears, the remote may have a hardware issue or low battery power"); S1/S4 (only some cameras show infrared, so a different camera may) |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in contexts 16 and 22 |

- **On-screen takeaway (no VO):** "Flicker on camera = the remote is sending." — S2 ("a visible light or flash coming from the remote's tip").
- **Publishing note:** "Some remotes use Bluetooth instead of infrared and won't flash." — S2.

## How the animation uses the sources (illustrative, not measured)
- **Spectrum column:** violet at the bottom to red at 70% of the height, then a dark hatched infrared band; a paper bracket
  spans what eyes see, a violet bracket spans visible plus part of the infrared (what many camera sensors catch). Proportions
  are illustrative, not a wavelength scale.
- **Invisible light:** drawn as dim ghost rings (so viewers can follow it); the camera's view shows it as a violet-white flash
  (a false colour, as phone screens typically render it). The real remote's LED stays dark in every real-world shot.
- **Code:** the LED blinks in a repeating on/off pattern; each received pattern steps the TV volume bar (illustrative code).
- **Dead batteries:** before the swap, pressing the button produces no flash on the phone and no response on the TV; after new
  batteries, the phone shows the flash and the TV responds.

## What the video does not claim
- No claim that every phone camera shows infrared, and no claim that no flicker always means flat batteries (the narration
  offers "or another camera"; the publishing note mentions Bluetooth remotes).
- No wavelengths, carrier frequencies or brand claims on screen; the remote, phone screen and TV are original designs.
