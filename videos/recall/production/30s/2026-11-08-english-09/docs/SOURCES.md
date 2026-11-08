# Sources and claim check — Recall english-09 "Why does your phone ignore you once you put on gloves?"

Sources were read on 2026-11-08. Quotes are verbatim: the patents were read through a fetch that returned their text
verbatim (Background, Summary and Description; later sections only summarised and not quoted); the TI datasheet was read
from its PDF with `pdftotext`.

## Topic choice
The batch suggested this subject (touchscreens with ordinary gloves vs touchscreen gloves; capacitive vs resistive). The
history has **H03** (2026-11-03, context 17, Hindi): why a **wet** touchscreen misbehaves (water drops change the field and
create false touches; dry the screen). Gloves, conductive thread and resistive screens appear in no earlier episode
(`glove`, `resistive`, `stylus` searched in contexts 11–22). The everyday question and the payoff differ (which gloves work,
which screens only need pressure), so the topic was kept. The mechanism visual is new (a cross-section with charge dots, a
signal meter, three swappable fingertips, and a resistive stack) rather than H03's giant electrode-grid screen.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | US Patent Application **US20110047672A1** "Glove with conductive fingertips" — https://patents.google.com/patent/US20110047672A1/en | capacitive touchscreens need electrical conductivity between screen and finger; conductive thread from the inner to the outer surface of the fingertip |
| S2 | US Patent Application **US20130104285A1** "Knit Gloves with Conductive Finger Pads" — https://patents.google.com/patent/US20130104285A1/en | the finger's electrical charge changes the screen's electrical state; ordinary knit gloves isolate the finger pads; conductive yarn transfers the charge |
| S3 | US Patent **US7163733B2** "Touch screen having spacer dots with channels" — https://patents.google.com/patent/US7163733B2/en | resistive screens: two conductive layers separated by spacer dots; a finger or stylus deforms the flexible cover sheet so the layers touch and close a circuit |
| S4 | Texas Instruments **TSC2046** "Low Voltage I/O Touch Screen Controller" datasheet (SBAS265G, rev. Jan 2008) — https://www.ti.com/lit/ds/symlink/tsc2046.pdf (PDF sha256 88219477…2aa5) | resistive touch screens are read by pressure ("pen or finger touch") |
| S5 | US Patent **US10754438B2** (verified on 2026-11-03 for H03; see `2026-11-03-hindi-03/docs/SOURCES.md`) | capacitive touch screens use rows and columns of electrodes; a finger changes the capacitance at a crossing |

**Attempted but not usable (not cited):** an Infineon AN64846 URL served a different document (a PSoC 4200 datasheet);
Google Patents returned HTTP 503 to headless Chromium (the same patents were then read through a normal fetch); Analog Devices'
AD7873 Analog Dialogue article returned HTTP 503. No bot checks were circumvented. S1/S2 are patent applications (status
"abandoned" on Google Patents); they are cited for how such gloves and screens work, not as proof about any product.

## Verbatim quotes
- **S1:**
  - "To operate capacitive touchscreens requires electric conductivity between the screen and a user's fingers. Thus, users of such electronic devices can find it difficult to operate the device while wearing gloves."
  - "…conductive yarn (28) extends from an outer surface (30) of glove (10) to an inner surface (32) of glove (10) to create a conductive pathway from the user's fingertip, which contacts inner surface (32) of glove (10), to a touchscreen, which contacts outer surface (30) of glove (10)."
- **S2:**
  - "Since the user's finger has an electrical charge associated with it, when the user touches a capacitive touch screen, the screen changes its electrical state at that particular location thereby resulting in a user input to the cell phone or tablet."
  - "However, when the user wears gloves in cold weather, the capacitive touch screen does not operate because the yarn separates and electrically isolates the user's finger pads from the capacitive touch screen. Generally, electrical current does not flow through common knit gloves."
  - "Electrically conductive yarn is deployed over at least an anterior tip region of the thumb sleeve and an anterior tip region of the index finger sleeve to enable the user to activate a capacitive touch screen of an electronic device. The user's electrical skin condition is transferred via the conductive threads to the capacitive touch screen."
- **S3:**
  - "…a second conductive layer 18 that is physically separated from the first conductive layer 14 by spacer dots 20…"
  - "…when an external object such as a finger 13 or stylus deforms the flexible cover sheet 16…" "…thereby causing the conductive layers 14 and 18 to touch and close a circuit."
  - "…a voltage applied across the conductive layers 14 and 18 results in a flow of current proportional to the location…"
  - Summary: "…when a minimum required activation force is applied to the touch screen…"
- **S4 (p. 9, "Pressure measurement"):** "To determine pen or finger touch, the pressure of the touch needs to be determined." Also: "This particular application shows the device being used to digitize a resistive touch screen."

## Claim → source map (narration)
| narration | support |
|---|---|
| "Why does your phone ignore you once you put on gloves?" | S1 ("difficult to operate the device while wearing gloves"), S2 ("the capacitive touch screen does not operate") |
| "Your phone's screen is capacitive: it senses the electric charge of your fingertip." | S2 ("the user's finger has an electrical charge … the screen changes its electrical state at that particular location"); S5. "Your phone's": a screen that ignores gloved fingers in this way is a capacitive one (S1/S2); no market-share claim is made |
| "Ordinary knit gloves don't conduct, so they isolate your finger and nothing registers." | S2 ("electrically isolates the user's finger pads"; "electrical current does not flow through common knit gloves"; "does not operate"); S1 |
| "Touchscreen gloves weave conductive thread into the fingertips to carry your touch through." | S1 (conductive yarn from the inner to the outer surface: a conductive pathway); S2 (conductive yarn at the thumb and index tips; charge transferred via the threads) |
| "Resistive screens respond to pressure instead, so a gloved finger or plain stylus works." | S3 (a finger or stylus deforms the flexible sheet so the layers touch; minimum activation force); S4 ("pen or finger touch", pressure). **Inference:** a gloved finger is an external object pressing the sheet in the same way |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in contexts 16 and 23 |

- **On-screen takeaway (no VO):** "Winter tip: gloves with conductive fingertips." — S1, S2.

## How the animation uses the sources (illustrative, not measured)
- **Capacitive cross-section:** glass over a sensor grid over the display; field arcs above the touch point; lime "charge"
  dots travel from the fingertip to the sensing electrode and the signal meter rises (S2, S5). With a knit glove the dots
  (coral) bounce back inside the yarn and the meter stays low (S2). With a touchscreen glove they ride the lime conductive
  thread to the glass (S1, S2). Dots are drawn "x-ray" through the finger so they can be followed.
- **Resistive stack:** a flexible top sheet on spacer dots over a lower layer; the gloved finger and then a stylus dent the
  sheet onto the lower layer, and a lime ring marks the contact (S3, S4).
- The phone's home screen and app are original minimal designs, not any real phone's interface.

## What the video does not claim
- No claim about what share of phones use which technology, no brand or product claims, and no claim that every
  "touchscreen glove" works with every phone.
