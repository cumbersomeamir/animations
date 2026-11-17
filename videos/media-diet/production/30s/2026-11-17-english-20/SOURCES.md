# Sources — Media Diet english-20 (30 s): "24 hours to say hello." — Voyager 1 reaches one light-day from Earth

Topic selected 17 Nov 2026 (batch 20, after batch 19 was delivered), applying the latest feedback for this app: a more powerful, trendy topic
with a clear question, physical stakes and a first-principles answer (the Chicago Bean episode as the benchmark; the Bean not repeated).
Excluded: Genesis AI robot arms (english-19) and every earlier topic in the context/11 log.

## Two dated candidates compared (last 72 hours)
| | A · ULA Vulcan / Amazon Leo LV-01 failure | B · Voyager 1 reaches one light-day (chosen) |
|---|---|---|
| date | launch 15 Nov 2026, 17:11 UTC (Cape Canaveral) | milestone **18 Nov 2026, 5:16 a.m. EST** (NASA mission-page countdown; PopSci quotes 5:18); NASA's worldwide "Shine Bright for Voyager's Light-Day" event **17 Nov 2026**; NASA media advisory updated 13 Nov |
| primary source | ULA statement: the vehicle "suffered an anomaly 10 minutes into the flight and failed to deliver the Amazon mission to orbit" (via Via Satellite, WESH, DCD, 15–17 Nov); Northrop Grumman: GEM 63XL boosters performed as expected | NASA advisory, NASA Voyager 1 mission page, NASA Voyager blog (29 Oct), NASA Voyager FAQ |
| mechanism | **cause not released** — any "why" would be speculation | inverse-square spreading, dish focusing and collecting area, RTG decay — all well documented |
| measured constraint | 40 satellites lost (fact, not a mechanism) | RTG output falls ~4 W per year (NASA) |
| verdict | rejected: no verifiable mechanism | chosen: trending this week, tangible spacecraft and antennas, clean first-principles payoff |

Date honesty: this episode was produced on 17 Nov 2026, the day of NASA's celebration; the one-light-day crossing itself is on 18 Nov. The
narration states the date ("On November 18th, Voyager 1 hits one light-day from Earth"); no claim says it has already happened.

## Primary (NASA)
1. NASA media advisory, "NASA Invites Media, Public to Join Voyager 1 One Light-Day Activities" (updated 13 Nov 2026) —
   https://www.nasa.gov/news-release/nasa-invites-media-public-to-join-voyager-1-one-light-day-activities/ :
   "on Wednesday, Nov. 18 will have traveled one light-day from Earth, which is more than 16 billion miles (25.9 billion kilometers) …
   any light from Earth would take 24 hours to reach the spacecraft"; "Shine Bright for Voyager's Light-Day" on Tuesday, Nov. 17.
2. NASA Voyager 1 mission page — https://science.nasa.gov/mission/voyager/voyager-1/ : countdown "NOV 18, 2026, 5:16AM EST".
3. NASA Voyager blog, 29 Oct 2026 — https://science.nasa.gov/blogs/voyager/2026/10/29/nasas-voyager-1-conserves-power-resolves-brief-communications-pause/ :
   on 18 Nov Voyager 1 will be 16.09 billion miles (25.89 billion km) away; radio waves take 24 hours each way; the RTGs "convert heat from
   decaying plutonium into electricity … both probes lose about 4 watts of power each year"; nothing changes aboard at the crossing.
4. NASA Voyager FAQ — https://science.nasa.gov/mission/voyager/frequently-asked-questions/ : "The radioisotope thermoelectric generator
   (RTG) on each spacecraft puts out 4 watts less each year"; "The high gain antenna is 3.7 meters across".
5. NASA, 70-meter dish — https://science.nasa.gov/3d-resources/70-meter-dish/ : each Deep Space Network site has one 230-foot (70-meter)
   antenna, "the largest and most sensitive DSN antennas, capable of tracking a spacecraft traveling tens of billions of miles from Earth."

## Secondary (dated coverage and radio details)
- Popular Science, Ben Guarino, 9 Nov 2026 — https://www.popsci.com/science/voyager-1-one-light-day-away/ : "a 23-watt radio transmitter
  (about the output of a small refrigerator lightbulb). Only antennas as sensitive as the 70-meter-wide dishes in the NASA Deep Space
  Network can detect Voyager 1's super-faint signal."
- Popular Science, Andrew Paul, 10 Nov 2026 — https://www.popsci.com/science/voyager-1-nasa-shine-light-morse-code/ (the 17 Nov event).
- ECOticias, 15 Nov 2026 — consistent date/distance summary citing NASA.
- Hackaday (2022), summarising JPL DESCANSO "Voyager Telecommunications" (Ludwig & Taylor): X-band TWTAs of 12 W or 18 W into the 3.7 m
  high-gain antenna, ~48 dBi gain, ~0.5° beamwidth — https://hackaday.com/2022/06/08/how-is-voyager-still-talking-after-all-these-years
  Sources disagree on the exact transmitter power (12–23 W), so the narration says "fridge-bulb radio" rather than a number.

## Calculations (estimates, shown on screen as "estimate")
- One light-day = c × 86,400 s = 25.90 billion km (NASA: 25.89 billion km).
- Inverse-square law: power per area ∝ 1/d² → twice as far, a quarter of the power per area.
- Received power (Friis): Pr = Pt·Gt·Gr·(λ/4πd)², with Pt = 12–23 W, Gt ≈ 48 dBi (3.7 m dish), Gr ≈ 73.6 dBi (70 m dish, 60% efficiency,
  8.4 GHz, λ = 3.57 cm), d = 1 light-day → **Pr ≈ 2–4 × 10⁻¹⁹ W**, i.e. less than a billion-billionth (10⁻¹⁸) of a watt.
- Collecting area: a 70 m dish has ≈ 358× the area of Voyager's 3.7 m dish.

## Facts vs. estimates vs. illustration
| Claim (narration) | Kind | Source |
|---|---|---|
| 24 hours to say hello. | official (radio takes 24 h one way at one light-day) | 1, 3 |
| On November 18th, Voyager 1 hits one light-day from Earth. | official date | 1, 2, 3 |
| So how do we still hear its fridge-bulb radio? | question; "fridge bulb" = PopSci comparison for ~23 W | PopSci |
| Radio spreads out like light: twice as far, a quarter of the power. | physics (inverse-square law) | standard physics |
| By Earth, less than a billion-billionth of a watt arrives. | **estimate** (Friis link budget, above) | calculation |
| Its dish narrows the beam, and 70-meter dishes catch it. | design facts (3.7 m high-gain antenna; 70 m DSN dishes) | 4, 5, PopSci |
| The catch: its nuclear power drops about 4 watts every year. | measured/official | 3, 4 |
| Out there, bigger ears beat a louder voice. | takeaway from the link budget (received power ∝ collecting area; the transmitter can't get louder) | calculation |

Not claimed: the exact transmitter wattage, data rates, instrument counts, end-of-mission dates. Visuals: generic paper models (Voyager from
NASA's published layout, Earth, a 70 m dish with a person for scale); beam cone, footprint, sparks and the 24-hour dial are schematic.
