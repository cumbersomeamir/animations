# Sources and claim mapping: store-and-forward episode, "How a message can travel without a complete connection"

Checked 2026-11-03. Pages were fetched with curl through the session proxy, quotes were copied from the fetched text, and sha256 values are of the fetched files.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | IETF **RFC 9171**, "Bundle Protocol Version 7" (Burleigh, Fall, Birrane; Standards Track, January 2022), https://www.rfc-editor.org/rfc/rfc9171 | Primary standard | fetched (txt, sha256 `74e542b1…b9ce5`) | "Delay-Tolerant Networking is a network architecture providing communications in and/or through highly stressed environments… with intermittent connectivity, large and/or variable delays" / "forming a store-carry-forward overlay network" / "Ability to use physical motility for the movement of data." / "Ability to cope with intermittent connectivity, including cases where the sender and receiver are not concurrently present in the network." / "When a bundle's age exceeds its lifetime, bundle nodes need no longer retain or forward the bundle; the bundle SHOULD be deleted from the network." |
| S2 | IRTF **RFC 4838**, "Delay-Tolerant Networking Architecture" (Informational, 2007), https://www.rfc-editor.org/rfc/rfc4838 | Primary architecture document | fetched (txt, sha256 `5e24f7c4…6790`) | Internet protocols assume "that an end-to-end path between source and destination exists for the duration of a communication session" / "The bundle layer forms an overlay that employs persistent storage to help combat network interruption." / a period of connectivity "is called a 'contact'" |
| S3 | **NASA**, "Delay/Disruption Tolerant Networking", https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/ (modified 2026-10-15) | Institutional | fetched (sha256 `3152d8af…eb5f1`) | "DTN uses a store-and-forward approach to overcome latency and disruption challenges. In the event of a disruption in communications between network nodes, each node can store data until the next node becomes available — similar to how emails are saved in outboxes until a network connection is established." |
| S4 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." This is the only app statement, and the video makes no feature claim from it. |

## Claim → source
| Narration (final) | Type | Source |
|---|---|---|
| "No connection all the way to your friend? A message can still move." | Principle | S1 (sender and receiver not concurrently present); S2 (DTN drops the assumption of a continuous end-to-end path) |
| "Station A holds the message and waits for a contact." | Principle | S3 (each node can store data until the next node becomes available); S2 (persistent storage; "contact") |
| "A travelling relay passes by and accepts the message." | Principle | S1 ("physical motility for the movement of data"; store-carry-forward) |
| "Later, the relay meets station B and hands it over." | Principle | S1 (store-carry-forward); S3 (store until the next node is available) |
| "This is called store and forward." | Term | S3 ("store-and-forward approach"); S1 ("store-carry-forward") |
| "Delivery is delayed, and not guaranteed." | Fact | S1 (large and/or variable delays; bundles past their lifetime should be deleted); visually, a second message is still waiting with "no contact yet" |
| "But with compatible systems, a missing live route doesn't always mean the message is lost." | Takeaway | S1–S3. "Compatible systems" because nodes must run a common protocol (S1 describes BP as an overlay that nodes implement). |
| "Explore offline communication with Meshline." | CTA (no capability claim) | S4 (the app's own listing category). Not a statement that Meshline implements the Bundle Protocol or guarantees delivery. |

## Illustrations (labelled "Illustrative map · generic networking principle, not a product feature")
- The timeline has no units: "stored → carried → delivered" with a "delay" span. Contact tags read "earlier" and "later".
- The relay rail, stations A and B, and the second waiting message are a generic demonstration. They are not Meshline UI or behaviour.

## Not claimed
- No times, distances or delivery rates.
- No claim that Meshline uses the Bundle Protocol, DTN, relays, or that it guarantees delivery.
