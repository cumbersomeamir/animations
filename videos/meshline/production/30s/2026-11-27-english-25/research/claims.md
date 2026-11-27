# Sources and claim mapping: batch 2026-11-27-english-25, "Why a radio can send farther by slowing down"

Checked 2026-11-27. The files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check (actual delivered topics 01–26, including replacements)
- **Not covered as a core mechanism:** no episode explained why slowing down (more symbols per bit plus error correction) extends reach.
- **Adjacent:** batch 24 (episode 26, weak signal drains the battery) said "Weak links get slower data rates" as a cost, without explaining the trade-off. Episode 13 (a text gets through when a call won't) was about burst size, not symbol rate. Overlap noted; the topic was kept as requested.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Bluetooth SIG, "Exploring Bluetooth 5 – Going the Distance"** (blog, Martin Woolley, 13 February 2017), https://www.bluetooth.com/blog/exploring-bluetooth-5-going-the-distance/ | Official (standards body) | fetched (sha256 `805eb761…`) | "LE 1M… has a symbol rate of 1 mega symbol per second (Ms/s)… this correlates to a bit rate of 1 Mb/s since one symbol corresponds to one data bit." / "The LE coded PHY allows range to be quadrupled (approximately), compared to Bluetooth® Core 4.0, and this has been accomplished without increasing the transmission power required." / "Correcting errors using advanced error correction techniques has the major advantage that data can be correctly decoded at a lower SNR and hence, at a greater distance from the transmitter." / "The LE coded PHY uses forward error correction (FEC)… It works by adding additional, redundant bits to the transmitted packets." / "With S=2, the range will be approximately doubled, whilst with S=8, it will be approximately quadrupled… this reduces the overall data rate. Specifically, one bit which passed through both the FEC Encoder and the pattern mapper will become 2 bits when S=2 or 8 bits when S=8." |
| S2 | **Bluetooth SIG, "Understanding Bluetooth Range"**, https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Official (standards body) | fetched (sha256 `1fc3ae61…`) | "Bluetooth® technology specifies that devices must be able to achieve a minimum receiver sensitivity of -70 dBm to -82 dBm, depending on the PHY used. However… average implementations of the Bluetooth LE 125K (Coded) PHY are achieving a receiver sensitivity of -103 dBm." |
| S3 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Radio, PHY, range and protocol are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "How can sending slower make a message reach farther?" | Hook (real question) | S1 |
| "Far away, the signal sinks into the noise." | Fact (lower SNR with distance) | S1 ("at a greater distance from the transmitter and hence at a lower SNR") |
| "Bluetooth's long range mode spends eight symbols on every bit." | Fact (LE Coded S=8: FEC + pattern mapper, 1 bit → 8 symbols) | S1 |
| "That extra code lets the receiver fix errors in a weak signal." | Fact (FEC: decoded at a lower SNR) | S1 |
| "The cost: eight times slower. The gain: about four times the range." | Fact (S=8: 1/8 of LE 1M's 1 Mb/s = 125 kb/s; range approximately quadrupled, at the same transmit power) | S1; S2 ("125K (Coded) PHY") |
| "That is why long range modes suit short messages, not videos." | Useful payoff (reasoned from the 1/8 data rate) | S1 |
| "Download Meshline for private nearby messages, even offline." | CTA | S3. On screen: "Download free · Android" (listing: price 0, Android). No PHY, range or protocol claim about Meshline; the diagram is veiled under the CTA. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **The strip:** the signal curve falls with log distance; "fast mode needs" and "long range needs less" are drawn so that the crossings sit at 1× and 4× the distance (the ratio from S1). There is no dB scale.
- **Corrupted symbols:** shown in coral to illustrate noise; the "→ 1" decode is a simplification. Real FEC is convolutional decoding, not a vote.
- **The instrument** shows the stated rates: 1 Mb/s (LE 1M) vs 125 kb/s (LE Coded, S=8).
- **"on my way"** is an example message, and the video progress bar is illustrative.
- **Real range** depends on transmit power, antennas and obstacles; the episode states only the relative ~4× from S1.
