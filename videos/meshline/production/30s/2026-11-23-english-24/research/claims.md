# Sources and claim mapping: batch 2026-11-23-english-24, "Why a weak signal drains your battery faster"

Checked 2026-11-23. The file was fetched with curl through the session proxy; the sha256 prefix is of the fetched file.

## Topic choice (all prior topic records read: episodes 01–25, including batch 23's actual subject)
- **Requested:** "Why two radios talking at once can silence each other": shared-channel collision and random backoff (one radio retries after a random delay).
- **Already covered:** this is exactly episode 17 (english-15: listen-before-talk, collision, random backoff, doubling window). Collisions are also the core of 21 (english-19, hidden terminal), and retry backoff appears in 19 (english-17).
- **Chosen instead (unrelated, same genre):** why a weak signal drains your battery faster. The radio does more work for the same data: a slower data rate, resends and higher transmit power. The payoff is to save big uploads for a stronger signal.
  - **Different from batch 23** (Bluetooth address privacy) and batch 22 (two hops vs one long hop) in core question (energy), setting (a vertical shot with one tower and two phones doing the same download) and mechanism (rate adaptation, retransmissions, power control).

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Ding, Wagner, Chen, Pathak, Hu, Rice, "Characterizing and Modeling the Impact of Wireless Signal Strength on Smartphone Battery Drain", ACM SIGMETRICS 2013** (Purdue / Cambridge), author copy https://www.cl.cam.ac.uk/~acr31/pubs/ding-signalstrength.pdf | Peer-reviewed measurement study | fetched (sha256 `9022b28a…`) | "reduced signal strength triggers rate adaptation at the PHY layer to lower the data rate which elongates packet transmission and hence increases power consumption by the radio." / "Weak signal strength can result in retransmissions… all of which lead to extra radio power consumption." / Power control: "Increased transmission power can increase the SNR… However, it can also increase the power consumption of the transmitting radio, e.g., of a mobile device". / "for 3G the increased energy on data transfer and RRC state demotion when the RSSI drops from -85dBm to -105dBm dominates the extra energy consumption, resulting in 52.0% more energy for the same 100KB download with 30ms server RTT." / "opportunistically delaying background network traffic till the signal strength becomes better, can reduce the total energy consumption of data communication by up to 23.7% and 21.5% under WiFi and 3G, respectively." |
| S2 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Battery use, radio and protocol are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Why does a weak signal drain your battery faster?" | Hook (real question; anecdotal effect quantified by S1) | S1 |
| "The radio has to work harder for every message." | Fact (summary) | S1 ("inflate the actual energy consumption by the wireless interface… while transferring the same amount of network traffic") |
| "Weak links get slower data rates, so each send takes longer." | Fact | S1 (rate adaptation elongates packet transmission) |
| "Lost pieces are sent again, and the phone may transmit at higher power." | Fact ("may") | S1 (retransmissions; transmission power control) |
| "In one study, the same download used about fifty percent more energy." | Measured fact (52.0%; 3G; RSSI −85 → −105 dBm; 100 KB; 30 ms RTT). On screen: "+52%" with "one study, 3G". | S1 |
| "So save big uploads for a stronger signal when you can." | Useful payoff (reasoned; S1's what-if shows deferring background traffic saves energy) | S1 |
| "Download Meshline for private nearby messages, even offline." | CTA | S2. On screen: "Download free · Android" (listing: price 0, Android). No battery, radio or protocol claim about Meshline; the diagram is veiled under the CTA. |

## Scope notes
- **Dates and networks:** S1 measured 3G and Wi-Fi phones (2013). 4G/5G details differ, but the same levers (rate adaptation, retransmissions, transmit power) exist. The narration says "in one study", and the screen names 3G.
- **Wi-Fi in S1:** the gap was much larger in their Wi-Fi test (810.5% more energy from −50 to −90 dBm). The conservative 3G figure is used instead.

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Phones and tower:** generic phone glyphs (bars and a battery icon) and a lattice tower. The hook's battery countdown (41% → 37%) is sped up and labelled "sped up".
- **Send schedules** (`S_SENDS`, `W_SENDS`) and the power step are illustrative.
- **Energy bars:** the instrument integrates those schedules, and the weak lane is scaled so it ends at the measured 1.52× (`src/drain.mjs`: `eS`, `eW`).
- **Payoff:** the phone's bars rise (the signal improves), then the queued upload goes in one short burst. No saving figure is shown for this.
