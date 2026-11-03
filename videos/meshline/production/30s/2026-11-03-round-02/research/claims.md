# Sources and claim mapping: round-02 episode, "Why nearby phones can talk directly while a far-away friend needs a route"

Checked 2026-11-03. Pages were fetched with curl through the session proxy (and cross-read with a page reader). Quotes were copied from the fetched text, and sha256 values are of the fetched files.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Bluetooth SIG**, "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Primary (standards body) | fetched (html, sha256 `97c4ffce…f712`) | "The effective, reliable range between Bluetooth devices is anywhere from more than a kilometer down to less than a meter." / "it depends" / "Path loss is the reduction in signal strength that occurs as a radio wave propagates through the air. Path loss, or path attenuation, occurs naturally over distance and is impacted by the environment in which the signal is being transmitted. Obstacles between the transmitter and the receiver can deteriorate the signal. Attenuators can be anything from humidity and precipitation, to walls, windows, and other obstacles made of glass, wood, metal, or concrete" / the PHY includes "the guards in place to counter interference" |
| S2 | **Bluetooth SIG**, "Bluetooth technology overview", https://www.bluetooth.com/learn-about-bluetooth/tech-overview/ | Primary (standards body) | fetched (html, sha256 `0e337257…269a`) | "Supporting point-to-point device communication, Bluetooth Classic…" / "Bluetooth LE supports multiple communication topologies, including point-to-point, broadcast and mesh." / "40 channels in the 2.4GHz unlicensed ISM frequency band" |
| S3 | IETF **RFC 791**, "Internet Protocol" (STD 5), https://www.rfc-editor.org/rfc/rfc791 | Primary standard | fetched (txt, sha256 `6cfb387f…6265`) | "The internet modules use the addresses carried in the internet header to transmit internet datagrams toward their destinations. The selection of a path for transmission is called routing." / an internet module resides "in each gateway that interconnects networks" |
| S4 | IETF **RFC 1812**, "Requirements for IP Version 4 Routers", https://www.rfc-editor.org/rfc/rfc1812 | Primary standard | fetched (txt, sha256 `72c2c27f…f56d`) | "A router connects to two or more logical interfaces… Forwarding an IP datagram generally requires the router to choose the address and relevant interface of the next-hop router or (for the final hop) the destination host." |
| S5 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, availability InStock (Google Play URL). |

## Claim → source
| Narration (final) | Type | Source |
|---|---|---|
| "Why can phones in one room talk directly, but not to a friend in another city?" | Hook question | S1 (range is finite: up to about a kilometre at best, down to under a metre); S2 (point-to-point device communication) |
| "Nearby, Bluetooth radios can link devices directly, without the internet." | Principle | S2 (point-to-point device communication over a 2.4 GHz radio). A direct radio link between two devices doesn't pass through the internet. |
| "But that radio reach is limited by distance, walls and interference." | Fact | S1 (path loss "occurs naturally over distance"; attenuators include "walls, windows…"; the PHY has "guards in place to counter interference", so interference is a factor) |
| "A friend in another city is far beyond that range." | Fact | S1 (effective range from "more than a kilometer" at best down to "less than a meter"; another city is normally many kilometres away) |
| "Their messages need a route across the internet, hopping between routers." | Principle | S3 (routing = selecting a path; gateways interconnect networks); S4 (each router forwards to the next-hop router or, for the final hop, the destination host) |
| "Close by: a direct link. Far away: a network route." | Takeaway | S1–S4 |
| "Download Meshline for offline communication." | CTA (no capability claim) | S5: the app is a free (0 INR, InStock) Android listing whose description is "messaging that keeps moving, even when the internet does not". The CTA claims no radio, range or connectivity. |

## Illustrations (labelled "Illustrative map · not to scale · generic principle, not a product feature")
- The reach bubble, its cut-back at the walls and its shrink under interference are illustrative shapes. They are not measured ranges.
- The signal-bar glyphs along the radius only show "weaker with distance" (S1 path loss). There are no dBm values.
- The route is generic: home router → routers inside a dashed "internet" zone → city router → friend. The number of routers is illustrative.
- The phones are plain glyphs with no app UI.

## Not claimed
- No range numbers in the video, and no claim about any specific phone's range.
- Nothing about which radio Meshline uses, its range, or any guaranteed or unlimited connectivity. Meshline appears only in the CTA.
- The internet-routing line describes internet messaging. Other long-distance networks (for example carrier networks) are also routed networks; the takeaway "far away: a network route" covers both.
