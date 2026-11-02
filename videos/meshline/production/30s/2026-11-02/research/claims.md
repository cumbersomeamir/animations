# Sources and claim mapping: production 30s #01, "Why full bars can still mean slow data"

Checked 2026-11-02. Pages were fetched with curl through the session proxy and the quotes were copied from the fetched text.

| ID | Source | Date | Status | Key quote |
|---|---|---|---|---|
| S1 | T-Mobile, *Dialed In*: "What Do the Bars On My Phone Mean? Cell Bars 101", https://www.t-mobile.com/dialed-in/wireless/what-do-cell-phone-bars-mean | 2026-03-26 | fetched (pilot 01) | "Signal bars are a rough visual estimate of your phone's connection to a nearby cell site … not a precise measure of speed" / "Bars show signal strength - not how busy the network is or how much capacity is available. You can have full bars but slow speeds in crowded areas like stadiums" / "Network congestion: High demand can slow speeds even with strong signal" |
| S2 | Three UK: "Cells on wheels", https://www.three.co.uk/blog/cells-on-wheels | 2026 | fetched (pilot 01) | Temporary masts "provide additional network capacity … at major events"; "places where thousands of people are using their phones at the same time" |
| S3 | Vodafone UK newscentre: "VodafoneThree Cells on Wheels are coming to a 2026 event near you", https://www.vodafone.co.uk/newscentre/our-network/network-cows-coming-to-event-near-you/ | 2026-03-25 | fetched (pilot 01) | COWs deployed for event demand, sized by "the estimated number of attendees" |
| S4 | NOAA National Weather Service: "Communications Plan" (Owlie Skywarn), https://www.weather.gov/owlie/communicationsplan | live page | fetched 2026-11-02 | "Pick a Family Meeting Spot. b. Draw a Map of the Family Meeting Spot." / "Text messages often have an easier time getting through during emergencies" (links ready.gov/make-a-plan) |
| S5 (not relied on) | FCC/FEMA "Tips for communicating in an emergency" | 2011-era | **not fetched** (fcc.gov returned 403; search excerpt only) | Calls may fail during congestion; texting is suggested. Context only. |

## Claim → source
| Narration / caption | Type | Source |
|---|---|---|
| "Full signal bars, but your message won't send?" | The puzzle | S1 (full bars, slow speeds in crowded areas) |
| "Those bars mainly describe the radio signal between your phone and the network." | Fact | S1 ("rough visual estimate of your phone's connection to a nearby cell site") |
| "They don't show how much spare capacity is available." | Fact | S1 ("not how busy the network is or how much capacity is available") |
| "At a busy concert, many phones can compete for the same shared resources." | Fact, generic | S1 (crowded stadiums; high demand slows speeds); S2/S3 (thousands of phones at events need added capacity) |
| "Think of a clear road leading to a crowded station." + map (solid route, 6-slot rack, hollow waiting siding) | **Analogy / illustration.** Real networks schedule shared radio resources; the six slots and the queue are not real counts. | Labelled "Illustrative map · not real network data" |
| "Strong signal and fast service are different things." + legend | Takeaway paraphrasing S1 | S1 |
| "Keep an offline way to coordinate when connectivity matters." + agreed meeting spot drawn with walking dots | Practical advice (planning, not a product claim) | S4 (pick and map a meeting spot) |

## Not claimed
- No numbers about real networks.
- No statement that congestion is the only cause of slow data.
- Nothing about Meshline features, protocols or range. The app appears only as a small end signature.
