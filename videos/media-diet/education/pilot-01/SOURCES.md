# Sources and claim-to-source map — Pilot 01

All sources are public and were accessed on **2026-11-02** (session date). Quotes are verbatim excerpts.
Nothing here is Media Diet product data; Media Diet listing facts come only from `../../assets/listing.json`.

## Sources
| id | source | accessed | relevant excerpt |
|---|---|---|---|
| S1 | IETF RFC 791, *Internet Protocol* (1981), https://www.rfc-editor.org/rfc/rfc791.html | 2026-11-02 | §1.1 "The internet protocol provides for transmitting blocks of data called datagrams from sources to destinations … where sources and destinations are hosts identified by fixed length addresses." §1.4 "The internet modules use the addresses carried in the internet header to transmit internet datagrams toward their destinations." §2.4 "Gateways implement internet protocol to forward datagrams between networks." |
| S2 | IETF RFC 1812, *Requirements for IP Version 4 Routers* (1995), https://www.rfc-editor.org/rfc/rfc1812.html | 2026-11-02 | §2.2.3 "Forwarding an IP datagram generally requires the router to choose the address and relevant interface of the next-hop router … This choice, called relaying or forwarding depends upon a route database within the router." §2.3 "Chooses a next-hop destination for each IP datagram, based on the information in its routing database." |
| S3 | Wikipedia, *Router (computing)*, https://en.wikipedia.org/wiki/Router_(computing) (page last edited 28 Oct 2026) | 2026-11-02 | "A data packet is forwarded from one router to another through an internetwork until it reaches its destination node"; "the router reads the network address in the packet header to determine the destination"; "home and small office routers that forward IP packets between the home computers and the Internet"; "the default route simply sends all non-local traffic to the Internet service provider". |
| S4 | Apple Platform Security, *How iMessage sends and receives messages securely*, https://support.apple.com/guide/security/sec70e68c949/web | 2026-11-02 | "They are then dispatched to the APNs for delivery." "iMessage messages are queued for delivery to offline devices." "the message is deleted from APNs when it's delivered." "Messages are stored on Apple servers for up to 30 days." "The user's outgoing message is individually encrypted for each of the receiver's devices." |
| S5 | Signal, *Terms & Privacy Policy*, https://signal.org/legal/ | 2026-11-02 | "Signal queues end-to-end encrypted messages on its servers for delivery to devices that are temporarily offline"; "Signal cannot decrypt or otherwise access the content of your messages or calls." |
| S6 | Briar Project, *How it works*, https://briarproject.org/how-it-works/ | 2026-11-02 | "Briar doesn't rely on a central server"; "messages are synchronized directly between the users' devices". (Counter-example: not every messenger relays through company servers.) |
| S7 | IETF RFC 5737, *IPv4 Address Blocks Reserved for Documentation* (Jan 2010), https://www.rfc-editor.org/rfc/rfc5737.html | 2026-11-02 | §3 "The blocks 192.0.2.0/24 (TEST-NET-1), 198.51.100.0/24 (TEST-NET-2), and 203.0.113.0/24 (TEST-NET-3) are provided for use in documentation." |

Attempted but not used: Cloudflare Learning Center pages (HTTP 403 from this environment); WhatsApp FAQ (body not retrievable);
third-party summaries of messaging retention policies (secondary, not relied on).

## Claim-to-source map (everything said or shown as fact)
| # | on-screen / spoken claim | type | support |
|---|---|---|---|
| C1 | "It travels as packets, each with an address." | fact (simplified) | S1 §1.1/§1.4; S3 (address in packet header). Internet data is carried in IP datagrams/packets whose header carries source and destination addresses. A very short message may occupy few packets; plural "packets" covers the exchange. |
| C2 | "Routers pass them along, hop by hop" · routers flash/scan the tag | fact (simplified) | S2 §2.2.3/§2.3 (next-hop forwarding); S3 ("forwarded from one router to another … until it reaches its destination"; router "reads the network address in the packet header"). Visual scan = reading the header address only. |
| C3 | Wi-Fi router is the first hop out of the home | fact (simplified) | S3 (home routers forward packets between home computers and the Internet; default route to the ISP). Mobile data would use a cellular network instead — not shown; covered by "Simplified diagram". |
| C4 | "usually via the app's servers" + server cutaway | fact, hedged | S4 (iMessage dispatched to Apple's APNs, queued/stored on Apple servers), S5 (Signal queues messages on its servers). "Usually" because some apps sync directly between devices (S6). |
| C5 | "Not one jump. Many hand-offs." | conclusion | Follows from C2 + C4: data crosses multiple forwarding devices; the five numbered hops are illustrative (real paths vary in length and route). |
| C6 | Disclaimer: "Simplified diagram. Real routes, storage and encryption vary by service." | caveat | S4/S5/S6 show differing storage/relay/encryption designs. We make **no** claim about which intermediaries can or cannot read message contents. |
| C7 | Tag addresses "203.0.113.7" → "198.51.100.24" | illustrative | S7: documentation-only address ranges (not real hosts). The server re-labelling is a visual metaphor for the server sending the message on toward the recipient in new packets; real protocols vary. |
| C8 | Chat screens ("Alex", "Sam", "On my way!") | illustrative | Generic invented chat UI. Not Media Diet UI, not any real app, no real data. |

## Creative choices that are NOT factual claims
Nodo, the giant phones on a dark stage, packets as glowing cubes, the "straight line" beam (the misconception),
the network rising from the floor, the stamp arm and glass shaft, the tether ride, colours and music.
