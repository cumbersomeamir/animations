# Sources and claim mapping: batch 2026-11-15-english-18, "Why a route that worked a minute ago can fail now"

Checked 2026-11-17. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check
- **Never covered (searched: route discovery, route request, RREQ, AODV, stale, hello message, route error, link break):** a moving phone breaking a mesh route, stale routes and route rediscovery.
- **Related but different:**
  - 03: store-and-forward with a travelling relay; delay, not route repair.
  - 14: relay placement through a wall.
  - 15: limited reach when a phone drifts.
  - 19: flood control.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **IETF RFC 3561**, Ad hoc On-Demand Distance Vector (AODV) Routing, July 2003 (Experimental), https://www.rfc-editor.org/rfc/rfc3561.txt | Primary (IETF) | fetched (sha256 `b3294169…`) | §2: "When a route to a new destination is needed, the node broadcasts a RREQ to find a route to the destination… The route is made available by unicasting a RREP back to the origination of the RREQ." / "Nodes monitor the link status of next hops in active routes. When a link break in an active route is detected, a RERR message is used to notify other nodes that the loss of that link has occurred." / §6.9: "…for that neighbor does not receive any packets (Hello messages or otherwise) for more than ALLOWED_HELLO_LOSS * HELLO_INTERVAL milliseconds, the node SHOULD assume that the link to this neighbor is currently lost." / §10 defaults: "ALLOWED_HELLO_LOSS 2", "HELLO_INTERVAL 1,000 Milliseconds". |
| S2 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." The app context lists relay/multi-hop as **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "This route worked a minute ago. Now the message is stuck. Why?" | Hook (illustrative scenario) | S1 (link breaks in active routes) |
| "In a mesh, a route is a chain of phones, and phones move." | Fact (generic) | S1 (next hops in active routes; ad hoc mobile nodes) |
| "Neighbours often say hello every second. Miss two, and the link is treated as lost." | Fact. AODV defaults; "often", because other designs differ. | S1 §6.9 and §10 (HELLO_INTERVAL 1,000 ms; ALLOWED_HELLO_LOSS 2) |
| "The route is now stale, so the break is reported back." | Fact | S1 §2 (RERR notifies nodes of the lost link) |
| "Then a route request spreads, and a reply returns along a fresh path." | Fact | S1 §2 (RREQ broadcast; RREP unicast back) |
| "A route is a snapshot, not a promise." | Takeaway (reasoned) | Follows from S1: routes are discovered on demand and repaired when links break |
| "For private nearby messaging, even offline, try Meshline." | CTA | S2. No routing, relay, mesh or delivery claim about Meshline; the route diagram is veiled away under the CTA. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Network:** 7 phones (you, A, bridge, C, friend, E, F), linked within an illustrative radio range.
- **The bridge's walk** is shown before and after a "a minute ago" rewind.
- **Hello slots** on the instrument (✓ ✓ ✗ ✗) follow the AODV defaults: two missed hellos before the link is treated as lost.
- **The route request** is drawn as spreading rings and the reply as one envelope travelling back. Expanding-ring search, sequence numbers and timers are omitted.
