# Sources and claim check — Recall english-07 "Why does your phone rush to 80% then crawl to 100%?"

Sources were read on 2026-11-06. Quotes are verbatim: the Apple pages were checked against the live page text rendered in
headless Chromium (`document.body.innerText`), and the TI note was read from its PDF with `pdftotext`.

## Topic choice
The batch suggested "why a microwave heats food unevenly, and how stirring and a standing time help" (rotating bowl). That
is episode R02 (`2026-11-03-round-02`, context 16: microwave cold patches, turntable, "stir, spread, let it stand"), so per
the user's rule a fresh, equally useful everyday-technology subject in the same genre was chosen: why phone charging is
fast to about 80% and then slows down. No earlier Recall episode covers batteries or charging (contexts 11–20 checked).

## Sources read
| # | source | used for |
|---|---|---|
| S1 | Apple, "Batteries - Why Lithium-ion?" — https://www.apple.com/batteries/why-lithium-ion/ | fast charging to 80%, then slower trickle charging; the slow stage eases the current to extend battery lifespan; software may limit charging above 80% when too warm |
| S2 | Apple, "Batteries - Maximizing Performance" — https://www.apple.com/batteries/maximizing-performance/ | charging may pause in extreme temperatures and resumes when the battery returns to its normal range; ideal comfort zone; high temperatures damage batteries; remove certain cases if the device gets hot while charging |
| S3 | Texas Instruments application note **SLAA287B** "Li-Ion Battery Charger Solution Using an MSP430™ MCU" (Dec 2005, revised Apr 2022) — https://www.ti.com/lit/an/slaa287a/slaa287a.pdf (the URL serves Rev. B; PDF sha256 0d2daa4a…1d31) | the mechanism: constant current until the battery reaches its full-charge voltage, then constant voltage while the current falls |

**Attempted but not used:** Apple Support 108055 (Charge Limit and Optimized Battery Charging) was read only through a
summarizer, so it is not quoted. A Google Pixel help URL returned an unrelated tech-specs page.

## Verbatim quotes
- **S1:**
  - "Your Apple lithium-ion battery uses fast charging to quickly reach 80% of its capacity, then switches to slower trickle charging."
  - "The amount of time it takes to reach that first 80% will vary depending on your settings and which device you’re charging."
  - "Software may limit charging above 80% when the recommended battery temperatures are exceeded."
  - "Stage 2: Trickle Charge" — "Eases the electrical current to extend battery lifespan."
  - "This combined process not only lets you get out and about sooner, it also extends the lifespan of your battery."
- **S2:**
  - "Charging may pause temporarily while in extreme temperature conditions, and will resume once the battery’s temperature returns to its normal operating range."
  - "Your device is designed to perform well in a wide range of ambient temperatures, with 62° to 72° F (16° to 22° C) as the ideal comfort zone."
  - "Charging the device in high ambient temperatures can damage it further."
  - "Charging your device when it’s inside certain styles of cases may generate excess heat, which can affect battery capacity. If you notice that your device gets hot when you charge it, take it out of its case first."
- **S3 (p. 1–2):**
  - "The battery is first charged with a constant current of 1C until the battery voltage reaches 4.1 V or 4.2 V."
  - "When the battery's voltage reaches 4.1 V or 4.2 V, the charger switches to constant voltage charging mode."
  - "The battery is then charged with a constant voltage source at a fixed battery voltage of 4.1 or 4.2 V."
  - "During this process the charging current starts to fall due to internal cell resistance."
  - "Li-ion batteries are extremely sensitive to overcharging, and it is critical that the final voltage be controlled to within ±50 mV of 4.1 V or 4.2 V."

## Claim → source map (narration)
| narration | support |
|---|---|
| "Why does your phone rush to 80% then crawl to 100%?" | S1 (fast to 80%, then slower trickle charging) |
| "At first, the charger pushes a big, steady current into the battery." | S3 (constant current until the full-charge voltage); S1 ("fast charging") |
| "Near full, it holds the voltage steady and lets the current shrink," | S3 (constant voltage; "the charging current starts to fall") |
| "like pouring slower near the top of a glass." | an analogy (not a claim); shown with a real pour |
| "That gentler finish helps the battery last." | S1 ("Eases the electrical current to extend battery lifespan"; "extends the lifespan of your battery"); S3 (sensitivity to overcharging) |
| "Keep it cool, too: when it's too warm, charging past 80% can pause." | S1/S2 ("Software may limit charging above 80% when the recommended battery temperatures are exceeded"); S2 ("Charging may pause temporarily … and will resume once the battery’s temperature returns to its normal operating range"; comfort zone; heat damages) |
| "Download Recall for learning any new subject with AI." | the user's established Recall CTA; see the product-fact check in contexts 16 and 21 |

- **On-screen takeaway (no VO):** "Fast to 80%. Keep it cool." — S1, S2.
- **The 80% point:** Apple describes its batteries; S3 describes the general constant-current / constant-voltage method. The
  exact point where a phone switches varies by device and settings (S1), so the animation marks 80% as Apple describes it
  and the publishing note says speeds vary.

## How the animation uses the sources (illustrative, not measured)
- **Giant battery:** charge slots fill bottom-up with lime beads; a falling stream and a glowing column show the current.
  Constant current until the fill reaches the 80% ring (the voltage dial reaches its max mark there, then holds); after
  that the current decays exponentially (time constant 1.5 s in the animation), so the stream thins and the fill creeps
  toward full (about 95% by the end of the sequence). Times and curve shapes are illustrative.
- **Heat:** a separate "warm" moment just past the 80% ring: the shell glows coral, the thermometer rises, the stream
  stops and a pause badge appears (S1/S2). In the café, the phone lies in a window-light patch, shows a coral pause icon,
  is moved into the shade and resumes charging (S2: "will resume once the battery’s temperature returns to its normal
  operating range").
- The phone's charging screen is an original minimal design, not any real phone's interface.

## What the video does not claim
- No charging times, wattages, temperatures or percentages beyond Apple's 80% description.
- No claim that 80% is the same switch point on every phone, and no claim that charging to 100% is harmful.
- No product or brand claims; no safety or medical claims.
