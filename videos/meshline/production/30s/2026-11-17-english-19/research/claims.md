# Sources and claim mapping: batch 2026-11-17-english-19, "Why two nearby radios can collide without hearing each other"

Checked 2026-11-17. The file was fetched with curl through the session proxy; the sha256 prefix is of the fetched file.

## History check
- **Never covered (searched: hidden terminal, RTS, CTS, clear to send, receiver, sender sensing):** the hidden-terminal problem and RTS/CTS.
- **Related but different:**
  - 17 (english-15): listen-before-talk and random backoff on one shared channel, where every sender *can* hear the others. This episode covers the case where listening fails because two senders cannot hear each other.
  - 18 (english-16): frequency hopping. 19 (english-17): flood control.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **MIT 6.033 Computer Systems Engineering, Spring 2017, Lecture 13 "Wireless Networks: MAC Protocols (CSMA/CA, RTS/CTS)"**, https://web.mit.edu/6.033/2017/wwwdocs/lec/s13.pdf | University lecture notes | fetched (sha256 `a4ccdd3d…`) | "this is a typical 802.11 setup" / "wireless is a broadcast medium. nodes can overhear communications from other nodes (which nodes depends on how their ranges overlap)" / "problem: if two (or more) nodes send at once, their packets will interfere ("collide") and be lost where their ranges overlap" / "hidden terminals: clients will send when they shouldn't" / "problem: sensing happens at the sender, but interference at the receiver is what matters" / "RTS/CTS: clients make a request to send (RTS), and send when they get a "clear to send" (CTS)" / "clients who overhear CTS messages for other clients don't send" / "RTS/CTS solve these problems in theory, but not always in practice; moreover, it adds a large amount of overhead to the common case" |
| S2 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Transport, relay and multi-hop are **unknown and not claimed**. |

Not used: DTIC copies of the original MACA paper (403) and RFC 2501 (no hidden-terminal content). Secondary search results also describe RTS/CTS as optional in 802.11 (used only above a size threshold or when enabled); the narration therefore says "Wi-Fi **can** ask first", not "does".

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Two radios listen first, hear silence, and still collide. How?" | Hook (real question) | S1: hidden terminals send when they shouldn't |
| "The left and right phones both reach the middle one, but not each other." | Illustrative setup (fact about overlapping ranges) | S1: which nodes overhear "depends on how their ranges overlap" |
| "So both hear silence, send, and their signals clash in the middle." | Fact (generic) | S1: packets "collide… and be lost where their ranges overlap" |
| "Listening happens at the sender. Collisions happen at the receiver." | Fact | S1: "sensing happens at the sender, but interference at the receiver is what matters" |
| "So Wi-Fi can ask first, and the middle replies: clear to send." | Fact (optional mechanism; "can") | S1: RTS/CTS in 802.11 |
| "The far side catches that reply too, and waits its turn." | Fact | S1: "clients who overhear CTS messages for other clients don't send" |
| "Message people nearby, even offline, with Meshline." | CTA | S2. No transport, MAC, RTS/CTS or relay claim about Meshline; the diagram is veiled away under the CTA. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Three phones** named by position (left, middle, right) and two dashed range circles; real ranges are irregular.
- **Turn-taking** is simplified: the request, the "clear to send" ring reaching both sides, the right phone's wait ring, then left ✓ and right ✓. Timers (NAV), acknowledgements and the request from the right are omitted.
- **The instrument lane** ("what the middle phone receives") is a schematic timeline, not a measurement.
- RTS/CTS is not always used and has overhead (S1); the episode does not claim it removes all collisions.
