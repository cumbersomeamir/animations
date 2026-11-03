# Sources and claim check — Recall Hindi 03 "गीली स्क्रीन अजीब क्यों चलती है?" (why a wet touchscreen behaves strangely)

Sources were fetched on 2026-11-03. Quotes are verbatim; the two application notes were read from the PDFs with `pdftotext`.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | NXP Semiconductors, **AN11122** "Water and condensation safe touch sensing with the NXP capacitive touch sensors", Rev. 3, 14 March 2014 — https://www.nxp.com/docs/en/application-note/AN11122.pdf | water raises capacitance and can trigger false switching; sensor plates under a glass/acrylic overlay; electric field between sensor pad and ground |
| S2 | Freescale Semiconductor (now NXP), **AN4781** "In-Depth Understanding of Water Tolerance Feature in Touch-Sensing Software Library", Rev 0, 09/2013 — https://www.nxp.com/docs/en/application-note/AN4781.pdf | droplets and water films raise capacitance → false touches; a film can look as large as a fingertip; touches can be suppressed |
| S3 | US Patent **US10754438B2** "False touch and water detection for touch-sensitive displays" (Parade Technologies; priority 2017-05-16; granted 2020-08-25) — https://patents.google.com/patent/US10754438B2/en | touch screens use rows and columns of electrodes; a finger changes the capacitance at the crossing; X/Y location; water can be reported as a touch |
| S4 | Sony Help Guide XAV-9500ES/XAV-9550ES, "The touch screen does not react to your touch correctly." — https://helpguide.sony.net/ev/xav-95/v1/en/contents/TP1000431077.html | wet fingertips / droplets stop the screen reacting; dry and wipe (practical advice only; that unit may be pressure-sensitive) |
| S5 | Huawei Support, "Can I use my phone with wet hands?" — https://consumer.huawei.com/en/support/content/en-us00414591 | phone screens may become unresponsive with wet hands; recommendation: completely dry hands |

**Attempted but not usable:** Britannica "touch screen", Sony Xperia support, and the Xiaomi FAQ all returned HTTP 403 to automated fetches. Google Play returned no readable text.

## Verbatim quotes
- **S1:**
  - "Due to the high dielectric constant of water (εr = 80 compared to εr = 1 for air) the static capacitance between the sensor plates and surrounding ground increases dramatically. For a capacitive sensor measuring the absolute capacitance, the threshold value could be reached easily and a false switch could be triggered."
  - "…in white goods where wet hands and water splash is encountered, special attention needs to be given."
  - "Figure 3 shows the electrical field strength between the sensor pad and the surrounding GND-ring."
  - "For a given overlay of acrylic glass (3 mm) … the capacitive connection between the finger, the sensor plate and the GND ring…"
- **S2:**
  - "The effect of a water droplet on single electrodes is reflected as an increase in the capacitance. … this delta value could cause false touches."
  - "A water film … acts as a large electrode whose electric field will interact with electric field of the electrodes. … This signal drift can be as large as produced by a fingertip touch. Consequently, the system will be detecting false continuous touches unless there's an algorithm to suppress this signal deviation."
  - "…the instant signal is fully suppressed by shielding function, and therefore touch cannot be detected."
- **S3:**
  - "mutual-capacitance sensing measures a change (e.g., a decrease or increase) in capacitance between the column electrode … and the row electrode … resulting from a user's touch (e.g., a finger)."
  - The sensing module "can determine a location … of a touch … using X and Y coordinates of the touch."
  - "when water contacts the touch screen, a touch may be improperly reported at the location of the water."
- **S4:**
  - "The touch screen does not react when touching with a wet fingertip or when water droplets are on the touch screen."
  - "Dry your wet fingertips well, or fully wipe water droplets off of the touch screen."
- **S5:**
  - "The screen may become unresponsive."
  - "It is recommended that your hands are completely dry when you use your phone."

## Claim → source map (Hindi narration, with an English gloss)
| narration | gloss | support |
|---|---|---|
| गीली उंगलियों से स्क्रीन अजीब हरकतें क्यों करती है? | Why does the screen act strangely with wet fingers? | a question; S4, S5 |
| शीशे के नीचे बारीक इलेक्ट्रोड का जाल विद्युत क्षेत्र बनाता है। | Under the glass, a fine grid of electrodes creates an electric field. | S3 (rows/columns of electrodes); S1 (sensor under a glass/acrylic overlay; field between pad and ground) |
| उंगली बिजली की सुचालक है; स्पर्श होते ही वहां क्षेत्र बदलता है, और फ़ोन जगह पहचान लेता है। | The finger conducts electricity; at a touch the field there changes, and the phone finds the place. | S3 (finger changes capacitance at the crossing; X/Y location); S1 (finger–plate capacitive connection) |
| पर पानी भी क्षेत्र बदलता है; बूंदें नकली टच बना सकती हैं, या असली टच छिपा सकती हैं। | But water also changes the field; drops can create fake touches, or hide real touches. | S1, S2, S3 (false touches); S2 (touch suppressed), S4, S5 (screen does not react / unresponsive). "सकती हैं" (can) is the qualification. |
| तो पहले स्क्रीन और उंगलियां सुखा लें। | So first dry the screen and your fingers. | S4 (dry fingertips, wipe droplets); S5 (completely dry hands) |
| कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें। | Download Recall for learning any new subject with AI. | the user's requested CTA; see the product-fact check in context 16/17 |

The application notes S1 and S2 describe capacitive touch buttons and keypads; S3 describes touch-sensitive displays. The video simplifies capacitance to "the field changes" ("क्षेत्र बदलता है"). The giant cross-section, field arcs and signal discs are an illustration, not an engineering drawing of a specific phone. No numbers, dates or currency are spoken.
