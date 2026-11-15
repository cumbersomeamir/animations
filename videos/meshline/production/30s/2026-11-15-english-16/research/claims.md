# Sources and claim mapping: batch 2026-11-15-english-16, "Why Bluetooth hops 1,600 times a second"

Checked 2026-11-15. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check (why the proposed topic was replaced)
- **Proposed:** "Why a message may arrive only after someone walks away" (store-carry-forward / delay-tolerant networking, with a moving relay carrying the message later). That is **episode 03** (2026-11-03, "How a message can travel without a complete connection"): store and forward, a travelling relay that accepts the message and hands it over later, delayed and not guaranteed, with RFC 9171 / RFC 4838 / NASA DTN sources. Repeating it would duplicate the story.
- **Chosen instead (same genre, equally strong opening):** *frequency hopping*. Why Classic Bluetooth changes channel about 1,600 times a second, how connected devices hop together, why interference spoils only a few hops, how adaptive hopping skips busy channels, and a practical router setting. Never covered (searched: hop/hopping/1600 in all context and claims files). It is nearby-radio education, relevant to the app's "nearby messaging" without claiming its transport.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **NIST SP 800-121 Rev. 2 (upd. 1)**, Guide to Bluetooth Security, §2.1, https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-121r2-upd1.pdf | Primary (government guide) | fetched 2026-11-13 (sha256 `72eb105c…`) | "Bluetooth operates in the unlicensed 2.4000 gigahertz (GHz) to 2.4835 GHz … ISM frequency band. Numerous technologies operate in this band, including the IEEE 802.11b/g/n wireless local area network (WLAN) standard, making it somewhat crowded…" / "Bluetooth employs frequency hopping spread spectrum (FHSS)… FHSS reduces interference and transmission errors" / "communications between Bluetooth Basic Rate (BR)/EDR devices use 79 different 1 megahertz (MHz) radio channels by hopping (i.e., changing) frequencies about 1600 times per second for data/voice links" / "A channel is used for a very short period (e.g., 625 μs for data/voice links), followed by a hop to another channel designated by a pre-determined pseudo-random sequence" / "The frequency-hopping scheme, primarily a technique to avoid interference…" / a piconet's devices "operate on the same channel using the same frequency hopping sequence". |
| S2 | **ETSI EN 300 328 V2.2.2**, https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf | Primary (regulatory standard) | fetched 2026-11-15 (sha256 `35211bae…`) | "adaptive frequency hopping: mechanism that allows FHSS equipment to adapt to its radio environment by identifying channels that are being used and excluding them from the list of available channels" |
| S3 | **Apple Support**, "Recommended settings for Wi-Fi routers and access points", https://support.apple.com/en-us/102766 | Reliable vendor guidance | fetched 2026-11-15 (sha256 `f8106222…`) | "Set to 20 MHz for the 2.4 GHz band." / "20 MHz for the 2.4 GHz band helps to avoid performance and reliability issues, especially near other Wi-Fi networks and 2.4 GHz devices, including Bluetooth devices." / "Wider channels are faster but more susceptible to interference and more likely to interfere with other devices." |
| S4 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." No transport (Bluetooth or otherwise), range or delivery guarantee is stated. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Classic Bluetooth hops about 1,600 times a second. Why?" | Fact (Classic = BR/EDR data/voice links) | S1 ("about 1600 times per second for data/voice links"). The frame-zero words "1,600 HOPS A SECOND?" are a question rounding S1's "about". |
| "Its band is crowded with Wi-Fi and other gadgets." | Fact | S1 ("numerous technologies… including IEEE 802.11… somewhat crowded") |
| "So connected devices hop together across 79 channels." | Fact | S1 (79 × 1 MHz channels; piconet devices share one hopping sequence) |
| "Each stop is so brief that interference spoils only a few hops." | Fact + reasoning | S1 (625 μs per channel; FHSS "reduces interference and transmission errors") |
| "Adaptive hopping also spots busy channels and skips them." | Fact | S2 (adaptive frequency hopping excludes channels in use) |
| "Keep your router's 2.4 GHz band at 20 MHz, to leave Bluetooth room." | Practical tip | S3 (20 MHz on 2.4 GHz avoids issues with Bluetooth devices; wider channels interfere more). On the map, a 40 MHz allocation covers about 40 of the 79 one-MHz channels and a 20 MHz one about 20 (arithmetic, illustrative). |
| "Message people nearby, even offline, with Meshline." | CTA | S4. The episode explains Bluetooth generically; nothing says Meshline uses Bluetooth. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **The hop map** (channels vs time) is slowed down: about 6–9 hops a second on screen vs about 1,600 in reality. The instrument says so ("the map is slowed down") and counts hops at the real ~1,600/s rate.
- **The hop sequence** is a deterministic pseudo-random stand-in, not Bluetooth's actual algorithm.
- **The Wi-Fi bursts** occupy channels 1, 6 and 11 (20 MHz each) for about a quarter of the slots: an assumption chosen to show bursty interference. A hop is drawn coral (with ✕) only when it lands inside an active burst.
