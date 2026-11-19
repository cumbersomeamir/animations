# Sources and claim mapping: batch 2026-11-19-english-22, "Why two short wireless hops can beat one long hop"

Checked 2026-11-19. The files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check
- **Related but different:** episode 14 (english-12) ended on "two clear hops beat one through concrete". Its subject was wall absorption (measured loss through concrete) and relay placement in a doorway.
- **This episode's core (not covered):** distance alone, with no wall. Loss grows with distance, so weak links need retries, and a route's total sends add up over its hops. The relay costs airtime, so a decent direct link still wins. Kept as requested; overlap noted.
- **Not repeated:** batches 19–21 (hidden terminal, towers, pairing); episode 19 (flood control) and episode 20 (route breaks).

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ITU-R P.525-4 (08/2019), "Calculation of free-space attenuation"**, https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.525-4-201908-S!!PDF-E.pdf | Primary (ITU standard) | fetched (sha256 `b1c98e82…`, same file as english-12) | "free-space basic transmission loss (symbols: Lbf or Abf)", Lbf = 20 log(4πd/λ) dB. So halving d lowers the loss by 20 log 2 ≈ 6 dB, which is a factor of about 4 in received power. |
| S2 | **De Couto, Aguayo, Bicket, Morris, "A High-Throughput Path Metric for Multi-Hop Wireless Routing", ACM MobiCom 2003** (MIT CSAIL), https://pdos.csail.mit.edu/papers/grid:mobicom03/paper.pdf | Peer-reviewed paper | fetched (sha256 `7811ff8d…`) | "ETX minimizes the expected total number of packet transmissions (including retransmissions) required to successfully deliver a packet to the ultimate destination." / "Minimizing the hop-count maximizes the distance traveled by each hop, which is likely to minimize signal strength and maximize the loss ratio." / "The ETX of a route is the sum of the ETX for each link in the route. For example, the ETX of a three-hop route with perfect links is three; the ETX of a one-hop route with a 50% delivery ratio is two." / "A single-hop direct route can deliver up to about 450 packets per second, but the fastest two-hop route has only half that capacity. The halving is due to transmissions on the successive hops interfering with each other: the middle node cannot receive a packet from the first node at the same time it is sending a packet to the final node." / "A one-hop link with a loss ratio of less than 50% will outperform any other route." |
| S3 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Range, relay, multi-hop and protocol are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Why can a detour through another phone beat the direct path?" | Hook (a real question; "can") | S2 |
| "Radio signals weaken quickly with distance." | Fact | S1 (loss grows with 20 log d), S2 (longer hops: lower signal strength, higher loss) |
| "Cut each hop in half, and the signal arrives about four times stronger." | Fact for free space (6 dB ≈ 4×). Indoors, loss usually grows faster with distance, so the gain is often larger, not smaller. | S1 |
| "A weak link drops packets, so each one is sent again and again." | Fact | S2 (ETX counts retransmissions; lossy links need more transmissions) |
| "Two strong hops need fewer sends in total." | Fact under the stated condition (strong short links vs a weak long link) | S2 (route ETX is the sum of its link ETXs) |
| "But a relay also takes airtime, so a decent direct link still wins." | Fact | S2 (two-hop capacity halves because the middle node cannot receive and send at once; a one-hop link with < 50% loss outperforms any other route in their testbed) |
| "Download Meshline for private nearby messages, even offline." | CTA | S3. On screen: "Download free · Android" (listing: price 0, Android). No range, relay or mesh claim about Meshline; the diagram is veiled under the CTA. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Islands across a gap** stand for distance. The jump arc is a visual metaphor: radio travels straight, and a lost packet is shown falling into the gap.
- **Geometry:** the relay sits slightly off the direct line (hop length 0.51 of the direct path), so "half" holds within a few percent and the power factor is about 3.8×.
- **Sample run (illustrative):** the weak long hop is lost, lost, then delivered (3 sends); the two strong hops deliver first time (2 sends); a decent direct link delivers in 1 send. As an ETX example: a 30% link averages about 3.3 sends, and two 90% links about 2.2 in total. These are not measurements.
- **Signal readout:** "1×" vs "about 4×" is the free-space ratio from S1, drawn to scale (bar lengths 1:4).
