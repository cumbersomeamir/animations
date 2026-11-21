# Sources — Media Diet english-22 (30 s): "Five minutes. What's the catch?" — the physical bottleneck behind a five-minute EV charge

Brief (batch 22, authorised 19 Nov 2026): "The physical bottleneck behind a five-minute EV charge" — why a powerful charger cannot simply
force its rated power into any battery; anchor in a new verified fast-charging development; use the actual vehicle/battery/date and one
measured number. Not covered before (english-12 was a BYD top-speed record, not charging). Applies this app's latest feedback (more
powerful/trendy; Chicago Bean benchmark). Production started 19 Nov 2026; finished 21 Nov 2026 after a worker restart (no pending output
was overwritten).

## Dated candidates compared
| | A · BYD Flash Charging: Fangchengbao Tai 9 (Ti 9) launch + Abu Dhabi measured demo (chosen) | B · Tesla Semi Megacharger site, Mesquite TX |
|---|---|---|
| date | Tai 9 launch event 19 Nov 2026, 19:00 Beijing time (CnEVPost 13 Nov; CarNewsChina 14 Nov); Abu Dhabi press demo reported 13 Nov 2026 (New Atlas), 10 Nov (electrive) | Electrek 18 Nov 2026 |
| what | BYD claims 10→70 % in 5 min and 97 % in 9 min on the Tai 9's 66.48 kWh second-generation LFP Blade Battery; reporters timed a megawatt demo at 5:17 to 70 % and 8:57 to 97 % | 8 Megachargers "rated at up to 1.2 MW each"; network at 7 sites vs a 37-site goal |
| measured number | yes (press-demo timings) | no charging curve |
| verdict | chosen: consumer-relevant, measured curve, clear physics | rejected: trucks, no measured curve |

Date honesty: the narration says "BYD's new SUV claims…" (a claim, no launch results). Launch-event coverage with prices was not yet
available when the script was written; the on-screen chip reads "BYD Tai 9 (Ti 9) · launch 19 Nov 2026 · BYD claim".

## Vehicle and claim
- CarNewsChina, 14 Nov 2026 — https://carnewschina.com/2026/11/14/byd-fang-cheng-bao-ti-9-launches-nov-19-with-10-97-flash-charging-in-9-minutes/ :
  "A 66.48 kWh second-generation lithium iron phosphate (LFP) Blade Battery"; "BYD claims its Flash Charging system can charge the battery
  from 10% to 70% in five minutes and reach 97% in nine minutes. At minus 30 degrees Celsius, charging from 20% to 97% takes a claimed 12
  minutes." (Reporting elsewhere notes peak power and test conditions were not disclosed.)
- CnEVPost, 13 Nov 2026 — https://cnevpost.com/2026/11/13/byd-fang-cheng-bao-launch-tai-9-nov-19/ : launch on 19 Nov; second-generation
  Blade Battery with flash charging; 66.48 kWh pack.
- Interesting Engineering, 14 Nov 2026 — https://interestingengineering.com/transportation/chinas-hybrid-9-minute-charge-1000-mile-range (same claims).
- CarNewsChina, 14 Nov 2026 (new Seagull): BYD's 5-minute/9-minute figures "apply to its dedicated flash-charging equipment, not conventional
  public DC chargers."

## Measured demonstration
- New Atlas, Simon Heptinstall, **13 Nov 2026** — https://newatlas.com/automotive/byd-solar-robot-flash-charging-station-abu-dhabi/ :
  "reporters watched the system push a megawatt into a test vehicle, taking its pack from 10% to 70% in five minutes and 17 seconds, and
  hitting 97% in eight minutes and 57 seconds"; flash charging works "only … on vehicles engineered with 1,000-volt architectures and
  second-generation Blade packs". The test vehicle is not named in the report.
- electrive, 10 Nov 2026 — https://www.electrive.com/2026/11/10/byd-combines-solar-arrays-energy-storage-and-megawatt-charging/
- Derived from the demo: 70→97 % took 8:57 − 5:17 = **3 min 40 s** for 27 % (≈ 7.4 %/min) vs 10→70 % at ≈ 11.4 %/min.

## Physics
- M. Tomaszewska et al., "Lithium-ion battery fast charging: A review", *eTransportation* 1 (2019) 100011,
  https://doi.org/10.1016/j.etran.2019.100011 (Crossref-verified): fast charging is limited by lithium transport into the graphite anode;
  at high current and low temperature lithium can plate as metal on the anode; heat generation; charging protocols reduce current as cells
  fill.
- Joule heating: resistive heat P = I²R ("heat grows with current squared").

## Facts vs. explanation vs. illustration
| Claim (narration) | Kind | Source |
|---|---|---|
| Five minutes. What's the catch? | hook (BYD's 5-minute claim) | CarNewsChina |
| BYD's new SUV claims 10 to 70 percent in five minutes. | company claim | CarNewsChina, CnEVPost |
| Why not just pour in a megawatt? | question; BYD's chargers are megawatt-class | New Atlas |
| But in a demo, the last 27 percent took almost four minutes. | measured by reporters (3 min 40 s) | New Atlas |
| Lithium ions must squeeze into the anode; rushed, they plate as metal. | peer-reviewed physics | Tomaszewska 2019 |
| And heat grows with current squared. | physics (Joule heating) | standard physics |
| So the battery sets the pace, slowing when full or cold. | conclusion; the cold claim (12 min at −30 °C) shown on screen as a BYD claim | Tomaszewska 2019; CarNewsChina |
| Five-minute claims mean the middle, not empty to full. | takeaway from the 10→70 % framing and the measured tail | CarNewsChina, New Atlas |

Not claimed: the demo car's model, peak power of the Tai 9, prices, launch results, charging on non-BYD chargers. Visuals: generic paper
reconstruction (nozzle, battery, SUV, charger, curve, cell cross-section, gauge); the curve uses the two measured points (5:17, 8:57) with
smooth interpolation between them.
