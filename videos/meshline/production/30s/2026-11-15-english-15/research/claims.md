# Sources and claim mapping: batch 2026-11-15-english-15, "One channel, many routers: who talks next?"

Checked 2026-11-15. Files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## History check (why the framing changed)
- **Proposed:** "The crowded stadium where every phone fights for the same air", with a "FULL SIGNAL. NO MESSAGE?" first frame. Stadium/concert crowds and full-bars congestion are already **episode 01**, pilot 01, the 10 s test and **english-11**. The user's own override note on english-12 also says so.
- **Kept, because it is new:** the requested mechanism. Nearby radios sharing one channel take turns using listen-before-talk and random backoff; equal picks collide and the waiting range doubles. No earlier episode covers it (searched: CSMA, backoff, listen before, contention). The internet-vs-air distinction is kept too.
- **New framing:** the unused planned title "home Wi-Fi slowing at peak": a building of routers on ONE channel. Frame zero is "SAME CHANNEL. / WHO TALKS?" with a mid-air clash. It is just as strong an opening, but not a stadium or full-bars story.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ETSI EN 301 893 V2.2.1 (2024-11)**, 5 GHz RLAN harmonised standard, https://www.etsi.org/deliver/etsi_en/301800_301899/301893/02.02.01_60/en_301893v020201p.pdf | Primary (regulatory standard) | fetched (sha256 `7779f8a8…`) | "Clear Channel Assessment (CCA): mechanism used by an equipment to identify other transmissions in the channel" / "Contention Window (CW): main parameter that determines the duration of the backoff procedure" / "The CAE shall select a random number q from a uniform distribution over the range 0 to CW." / occupied channel → the backoff waits / "If the feedback indicates failure, CW shall be set to min(CW × 2 + 1, CWmax)." / "If the feedback indicates success, CW shall be set to CWmin." / Table 6, priority class 1: CWmin 15, CWmax 1 023. |
| S2 | **ETSI EN 300 328 V2.2.2**, 2.4 GHz wideband transmission systems, https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf | Primary (regulatory standard) | fetched (sha256 `35211bae…`) | "Listen Before Talk (LBT): mechanism by which an equipment first applies CCA before using the channel"; names "IEEE 802.11™ RLANs" among such equipment. |
| S3 | **Apple Support**, "Recommended settings for Wi-Fi routers and access points", https://support.apple.com/en-us/102766 | Reliable vendor guidance | fetched (sha256 `f8106222…`) | "Each band of your router is divided into multiple, independent communication channels, like lanes in a street. When channel selection is set to automatic, your router selects the best Wi-Fi channel for you." / "…interference from other routers and devices that are using the same channel." / for 5 GHz and 6 GHz: "Wireless interference is less of a concern in these bands." |
| S4 | Band edges in S2 / S1: 2.4 GHz band 2 400–2 483.5 MHz (83.5 MHz); 5 GHz RLAN bands 5 150–5 350 and 5 470–5 725 MHz (455 MHz) | Computed from primary | — | ≈ 5.4× more spectrum at 5 GHz, hence "far more room" (more channels). |
| S5 | Meshline listing (`assets/listing.json`, `context/01-product-facts.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." No transport, range or delivery guarantee is stated. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Every router here shares one channel. So who gets to talk?" | Hook (illustrative building) | S3 (other routers on the same channel) |
| "When two transmit together, both get scrambled." | Fact (simplified) | S1 (a transmission whose feedback indicates failure; occupied channel detected by CCA) |
| "So Wi-Fi listens first, then waits a random number of tiny slots." | Fact | S2 (LBT: CCA before using the channel); S1 (random q in 0..CW, counted down in observation slots, waiting while occupied) |
| "Pick the same number? They clash, and each doubles its waiting range." | Fact | S1 (failure → CW = min(CW×2+1, CWmax); on screen 0–15 → 0–31, the class-1 CWmin and its first doubling) |
| "More neighbours on your channel means more waiting, whatever your internet plan." | Fact (reasoned) | S1 (more contenders → more busy slots and failures); S3 (same-channel interference). The internet line is shown with ✓ as not being the bottleneck in this scenario. |
| "Pick a quieter channel, or move to five gigahertz, with far more room." | Practical tip | S3 (channels as lanes; automatic selection picks the best; 5 GHz less interference); S4 (more spectrum) |
| "For private nearby messaging, even offline, try Meshline." | CTA | S5. No transport, range, relay or delivery claim. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- The 15 routers, the counter values (5, 2, 7; then 3, 3; then 12, 27) and the air-time lane are illustrative. The lane is driven by the same scripted transmissions the map shows.
- The "0–15 → 0–31" window follows S1's class-1 CWmin and its CW×2+1 rule; real Wi-Fi uses several access classes.
- The frame-zero collision burst is a dramatised illustration of a failed simultaneous transmission.
