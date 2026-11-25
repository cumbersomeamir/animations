# Sources — Media Diet english-24 (30 s): "The safety net spread the crash." — Microsoft's report on the 12 Nov 2026 Outlook outage

Brief (batch 24, authorised 23 Nov 2026): "One real technology announcement from the last 72 hours — and the mechanism it changes." A
real, dated development verified from primary sources within 72 hours of 23 Nov 2026 (20–23 Nov); not robotics recovery, charging,
batteries or a prior topic; a meaningful consumer impact; one first-principles animated mechanism, surprise-first; never invent news or
metrics. Applies this app's latest feedback ("more powerful, trendy … not hit or miss; content is weak") and its rule (context/26
addendum): compare at least two dated candidates and reject any whose mechanism is unverified.

## Topic history check (all prior records read: context/11 rows english06…23; context/19…38)
Batch 23's actual subject: ReLoco humanoid fall recovery (balance/statics on a paper lawn). Batch 22: BYD flash charging. Earlier:
software features (english06–11), drag at 500 km/h, Atlas wheels, metamaterials, Starship catch, electric airliner, tensegrity robots,
eddy currents, robot arms, Voyager's signal, superhot geothermal drilling. None covered a cloud outage or cascading overload. New core
question (why did the safety system spread the crash?), new setting (a paper server floor, a server cutaway, a stylised paper world map),
new mechanism (load redistribution: the same traffic shared by fewer servers until each crosses its limit — a cascade).

## Dated candidates compared
| | A · Microsoft 365 / Outlook outage post-incident report (chosen) | B · Amazon Prime Air drone crash, Huntington Woods, MI |
|---|---|---|
| date | report dated **20 Nov 2026** (outage 12–13 Nov 2026) | incident **20 Nov 2026**; FAA preliminary notice; Ars Technica 24 Nov 2026 |
| primary source | Microsoft's Post Incident Report (PIR) for incidents EX1550543 / MO1550821 | FAA preliminary accident/incident notice; local TV video (WXYZ) |
| consumer impact | most users could not reach Outlook/Exchange mail worldwide for about a day; Teams, Copilot, OneDrive etc. degraded | home drone deliveries ("hundreds of thousands" in 2026 per Amazon) |
| mechanism | **stated by the operator**: a latent defect froze busy servers; automatic rerouting moved their load onto fewer servers and spread the failure across North America, then every region | **unverified**: why the drone's sense-and-avoid missed a fiber-optic cable is under FAA investigation |
| verdict | chosen: widely felt, primary-sourced, verified mechanism + announced fixes | rejected under the app rule (mechanism unverified) |
Also checked and not used: Zoox/Virginia Tech pedestrian-sound study (IEEE Spectrum feature 23 Nov 2026, but the study itself was
announced by Virginia Tech in Sept 2026 — not fresh); 1 MW floating wave-energy converter cleared for sea trials (Interesting Engineering,
23 Nov; weak consumer impact); Bambu Lab P3C printer and the high-altitude wind farm (articles dated 24–25 Nov, outside the window).

## Primary source
- Microsoft, "Post Incident Report for Microsoft 365", **Report Date: November 20, 2026**, incidents EX1550543 / MO1550821 (15 pages).
  Copy read: https://tianyin.github.io/misc/pir_microsoft_365_11-12-2026.pdf (linked from Ars Technica's report below; Microsoft
  distributes PIRs to customers through the Microsoft 365 admin center). Text extracted and read in full for this episode.
- Ars Technica, Nick Indge, "Microsoft's historic cloud outage exposed an engineering 'fog of war'", 24 Nov 2026 —
  https://arstechnica.com/gadgets/2026/11/microsofts-historic-cloud-outage-exposed-an-engineering-fog-of-war/ (context: Reuters-reviewed
  internal "Code Red" memos; summarises the PIR). Not used for narration facts.

Facts used (quoted/paraphrased from the PIR):
- "On November 12, 2026, a latent Windows defect caused widespread failures in Microsoft 365 network gateway servers used by Exchange
  Online … Under increased load, the defect caused affected servers to become unresponsive." Root cause: "lock contention inside an
  internal Windows process" (→ "a hidden bug froze servers that got too busy"; chip "latent Windows defect: lock contention").
- "Nearly 14% of server capacity for the networking gateway was out of service as part of routine operations" (chip in the rerouting shot).
- "When gateway servers become unresponsive, our traffic management systems automatically route traffic to other healthy 'capacity
  units' … normally what makes the service resilient." "As servers became unresponsive, the same traffic load was distributed across
  fewer healthy servers, placing additional pressure on them and causing the issue to spread." (→ V4, V5; the hook's "safety net")
- "In less than two hours, this previously unknown defect was triggered across a significant portion of the North American server fleet.
  At the lowest point, more than 80% of servers were unresponsive." (→ V6, "over 80 percent of North American servers froze")
- "This redistribution further spread the impact to other regions … Within about two hours of the broad failures that began in North
  America, servers in every region were affected globally." (→ V7)
- Impact: "most users being unable to access their mailbox through Outlook or other mail clients"; start Thursday 12 Nov 2026 4:20 PM
  UTC; Friday 13 Nov 4:10 PM UTC "Customers were no longer experiencing active impact" (→ "≈ 24 hours of disruption").
  "No mail was lost"; "not … caused by a cyberattack".
- Next steps (the mechanism it changes): "[Blast radius] Partition the network gateway capacity into pools that serve different
  workloads to isolate" (CY27 Q1); "Design traffic distribution for smaller fault zones" (TBD); "Fix traffic distribution to eliminate
  cascaded failures to other regions" (CY26 Q4); "Add gradual traffic ramp-up and admission control when servers rejoin" (TBD);
  "[Capacity Design] Add additional capacity for more headroom" (CY27 Q1). (→ V8 "Rerouting needs spare room, so Microsoft plans
  walled-off server pools.")

## First principles (explanation)
- A fixed amount of traffic shared by N servers gives each traffic ÷ N. When servers drop out, the traffic does not shrink — the
  survivors each get more. If the per-server share crosses the level at which servers fail, rerouting hands the problem on: a cascade.
- Illustrative numbers on screen (labelled "illustrative"): 90 units of traffic, 10 servers, limit 10 each → 9 each; one freezes →
  10 each (at the limit); the next → 11.3 each, and so on until all freeze. With 13 servers (spare room) one failure only raises the
  share from 6.9 to 7.5, below the limit, so it is absorbed. These are not Microsoft's numbers.
- Walls (partitioned pools / smaller fault zones) stop a failing pool from pushing its load onto every other pool.

## Facts vs. explanation vs. illustration
| Narration | Kind | Source |
|---|---|---|
| The safety net spread the crash. | hook: automatic rerouting (a resilience feature) expanded the impact | PIR (executive summary; "How the disruption spread") |
| Microsoft just explained how Outlook went down worldwide. | fact: report dated 20 Nov 2026 on the 12 Nov outage | PIR |
| A hidden bug froze servers that got too busy. | fact (latent defect; unresponsive under load; lock contention) | PIR Factor 1 |
| When one froze, its traffic shifted to the others. | fact (automatic routing to healthy capacity units) | PIR "How the disruption spread" |
| The neighbors overloaded, froze, and passed it on. | fact (cascading failure) + illustrative numbers on screen | PIR |
| In two hours, over 80 percent of North American servers froze. | fact ("less than two hours"; "more than 80% … unresponsive") | PIR |
| Then traffic spilled into every other region. | fact (cross-region redistribution; every region within ~2 h) | PIR |
| Rerouting needs spare room, so Microsoft plans walled-off server pools. | first-principles conclusion + Microsoft's planned fixes (partitioned pools, smaller fault zones, more headroom) | PIR "Next Steps" |

Not claimed: that the fixes are done (they are planned with target quarters), any count of affected users, Microsoft's internal
capacity numbers, the "Code Red" memo contents (reported by Reuters, not published). Visuals: generic paper servers, laptop, map and
envelopes — no Microsoft, Outlook or Windows logos or screenshots; the world map is stylised and site positions are illustrative.
