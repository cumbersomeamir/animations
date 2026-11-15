# Sources and claim mapping: batch 2026-11-15-english-17, "Why one message can fill the air"

Checked 2026-11-15. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check
- **Proposed:** "Why a message gets smaller when the network gets worse", with acknowledgements, retry and how flooding a mesh with repeated messages congests it.
- **Never covered (searched: flood, TTL, duplicate, broadcast storm, acknowledg, retransmi):** flood control. Every relay repeating a message, copies multiplying and bouncing back, and the two standard brakes: a hop count that shrinks by one per relay ("the message gets smaller"), and a "seen it" list.
- **Partly covered:** acknowledgements and retries (08 sent vs delivered and "held · retrying"; 17 backoff on a shared channel). So retry is one short beat here, at a different layer (waiting for a reply), not the core.
- **Episode title:** "Why one message can fill the air", matching the brief's frame-zero words "THE AIR IS FULL".

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Bluetooth SIG**, "Bluetooth Mesh Networking: An Introduction for Developers" (2019), https://www.bluetooth.com/wp-content/uploads/2019/03/Mesh-Technology-Overview.pdf | Primary (standards body) | fetched (sha256 `316413d9…`) | "Bluetooth mesh uses a technique known as managed flooding… All nodes receive all messages from nodes that are in direct radio range and, if configured to do so, will then relay received messages. Relaying involves broadcasting the received message again" / "TTL (Time To Live) is a field which all Bluetooth mesh PDUs include. It controls the maximum number of hops, over which a message is relayed." / "Setting TTL to 3, for example, will result in the message being relayed, a maximum number of three hops away" / "A message cache must be implemented by all nodes. The cache contains all recently seen messages and if a message is found to be in the cache… it is immediately discarded." |
| S2 | **IETF RFC 3626** (OLSR, 2003), https://www.rfc-editor.org/rfc/rfc3626.txt | Primary (IETF) | fetched (sha256 `722a7b58…`) | §1.4: multipoint relays "minimize the overhead of flooding messages in the network by reducing redundant retransmissions" / "each node maintains a duplicate set to prevent transmitting the same OLSR control message twice" / §3.3: "Before a message is retransmitted, the Time To Live MUST be decremented by 1. When a node receives a message with a Time To Live equal to 0 or 1, the message MUST NOT be retransmitted…" |
| S3 | **IETF RFC 6298** (Computing TCP's Retransmission Timer), https://www.rfc-editor.org/rfc/rfc6298.txt | Primary (IETF) | fetched (sha256 `f3a6d937…`) | "(5.5) The host MUST set RTO <- RTO * 2 ("back off the timer")." |
| S4 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." The app context lists relay/multi-hop as **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "One message, sent once. So why is the air suddenly full?" | Hook (illustrative simulation) | S1 (every node relays by broadcasting again) |
| "In a flooding mesh, every device that hears it repeats it." | Fact (plain flooding) | S1 |
| "Repeats bounce back and forth, and each one costs airtime." | Fact + reasoning | S2 ("redundant retransmissions"); each relay is another broadcast (S1) |
| "So every copy carries a hop count that drops by one at each relay." | Fact | S2 §3.3 (TTL decremented by 1 before retransmission); S1 (TTL limits hops) |
| "At zero it stops, and devices drop any copy they have already seen." | Fact (simplified) | S2 (not retransmitted at 0/1; duplicate set); S1 (message cache: seen messages discarded) |
| "No reply yet? Good senders wait longer before each retry." | Fact (transport layer) | S3 (RTO doubles after each timeout) |
| "For private nearby messaging, even offline, try Meshline." | CTA | S4. No mesh, relay, hop-count or delivery claim about Meshline; the relay diagram is veiled away under the CTA. |

## The on-screen simulation (illustrative, computed in `src/flood.mjs`)
- **Mesh:** 14 devices, linked when within 3.9 G of each other.
- **Naive flooding:** every reception is repeated in the next round, for 5 rounds (0–4). Cumulative transmissions of one message (the counter): 1 → 2 → 7 → 26 → **111**.
- **Managed flooding:** a hop count starting at 3, minus one per relay, so a copy at 0 is not relayed. Each device relays once (seen-it list). That gives **11** transmissions; the 3 farthest devices receive a 0 and stop ("0 · stop").
- **Retry timer:** waits of 1, 2 and 4 units (doubling, as in S3); illustrative timing.
- **Scope:** these numbers depend on this toy graph and are not measurements of any real network.
