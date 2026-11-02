# Facts file — claim → source → quoted wording (production 30s-01, accessed 2026-11-02)

## Sources
| id | source | date | quoted wording (verbatim) |
|---|---|---|---|
| S1 | Apple Support, *Use Airplane Mode on your iPhone, iPad, Apple Watch, and Apple Vision Pro*, https://support.apple.com/108785 | published 2026-02-11 | "With Airplane Mode, you can turn off cellular and Wi-Fi on your device during a flight." · "This turns off all radios except for Bluetooth." · "If the airline allows it, you can still use Wi-Fi and Bluetooth in Airplane Mode." · "If you turn off Bluetooth while you're in Airplane Mode, your device turns off Bluetooth the next time that you turn on AirPlane Mode." |
| S2 | Google Pixel Phone Help, *Keep your Android's wireless connections on in Airplane mode*, https://support.google.com/pixelphone/answer/12639358?hl=en | accessed 2026-11-02 | "When you first turn on Airplane mode on your Android phone, Wi-Fi and Bluetooth turn off. To keep your wireless connections on, you can change this setting so you can still connect to devices like your smartwatch or Bluetooth earbuds." · "The next time you turn on Airplane mode, your phone will remember your previous setting." · "On Pixel phone, some of these steps work only on Android 11 and up." |
| S3 | FAA, InFO 13010 *Expanding Use of Passenger Portable Electronic Devices (PED)*, https://www.faa.gov/sites/faa.gov/files/other_visit/aviation_industry/airline_operators/airline_safety/InFO13010.pdf | 2013-10-28 | "The operator should continue to require passengers to place their PEDs in "Airplane Mode" (cellular transmitters off) from the time the aircraft takes off until it lands. If the aircraft is equipped with on-board wireless services, the operator should address the acceptable times for when the passengers may turn on their PEDs and connect to the wireless services." |
| S4 | EASA news, *EASA allows electronic devices to remain On and Connected throughout the flight*, https://www.easa.europa.eu/en/node/17731 | 2014-09-26 | "Passengers must at all times follow the airline crew instructions." · "It is up to each airline to decide to allow the use of PEDs." |

## Claims (voice + screen) → sources
| # | claim | where | source | type |
|---|---|---|---|---|
| C1 | "Airplane mode doesn't turn your phone into a brick." | V1; phone screen stays live, ghost brick struck | S1 (device keeps working; Bluetooth/Wi-Fi usable if allowed), S2 | fact (plain-language framing) |
| C2 | "It switches off cellular connectivity." · KNOWN: "Cellular switches off" | V2; cellular plate OFF + ring; board | S1 "turn off cellular", S3 "(cellular transmitters off)" | fact |
| C3 | "Wi-Fi and Bluetooth may go off too." · plates dashed "MAY BE OFF" | V3; L1/L2 | S1 (iPhone: cellular + Wi-Fi off, Bluetooth stays on); S2 (Android/Pixel: Wi-Fi and Bluetooth turn off at first) | fact; "may" because the two sources differ |
| C4 | Apple card: "This turns off all radios except for Bluetooth." / Google card: "…Wi-Fi and Bluetooth turn off." · "differs by device" | L2 | S1, S2 (verbatim; the Google line is elided with "…" and tagged "at first") | transcription |
| C5 | "Depending on the device, each can be turned back on separately." | V3; Wi-Fi then Bluetooth toggled on separately while cellular stays off | S1 ("you can still use Wi-Fi and Bluetooth in Airplane Mode"), S2 ("you can change this setting") | fact (hedged by device) |
| C6 | "So wireless headphones, or an airline's Wi-Fi, can still work, if the airline allows it." · Apple card "If the airline allows it…" | V4; L4 | S1 (verbatim condition), S2 (Bluetooth earbuds), S3 (operator decides when on-board wireless may be used) | fact, conditional |
| C7 | "The icons are different radios, not one internet switch." | V5; L5 control buttons → separate radio modules; airplane button dashed to several | S1, S2 (cellular, Wi-Fi, Bluetooth controlled separately; airplane mode affects several) | fact / plain-language framing |
| C8 | "Follow the airline's instructions" · KNOWN: "Crew instructions come first" | V6; board | S4 (verbatim), S3 (operator instructions) | fact |
| C9 | "check which connections are actually on" · DEPENDS: "Wi-Fi & Bluetooth defaults", "When cabin Wi-Fi may be used" | V6; board; ringed controls row | S1 + S2 (phones remember previous choices, so radios can stay on), S3 (airline decides) | advice derived from facts |

## Inferences / schematic elements (not claims of measurement)
- The isometric "radio layers", control buttons, headphones and cabin access point are schematic drawings (generic icons),
  not any manufacturer's UI. The event clock is illustrative (one toggle sequence), not a measured timing.
- The bench phone in L3 starts with Wi-Fi and Bluetooth off (Pixel-like default) to show turning each back on; iPhone
  keeps Bluetooth on by default (S1) — shown explicitly in L2.
- Not claimed: that every flight allows Wi-Fi/Bluetooth; that any use forbidden by an airline is allowed; GPS behaviour;
  battery/health effects; anything about the Media Diet app.
