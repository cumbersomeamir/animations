# Sources and claim mapping: batch 2026-11-09-english-10, "Full Wi-Fi bars, but no internet"

Checked 2026-11-10. Pages were fetched with curl through the session proxy; sha256 values are of the fetched files.

## History check
Not covered before. Related earlier material:
- **Episode 01:** cellular bars vs network capacity at a concert.
- **Episode 05 (Hindi):** airplane mode, which drew a Wi-Fi line to a router.

This episode separates the phone ↔ router Wi-Fi radio link from the router ↔ provider internet link, and gives the "another device" check. The user's topic was kept.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Android Developers**, `WifiInfo`, https://developer.android.com/reference/android/net/wifi/WifiInfo | Primary (platform docs) | fetched (sha256 `9e309cab…daf2ad0`) | `getRssi()`: "Returns the received signal strength indicator of the current 802.11 network, in dBm." |
| S2 | **Android Developers**, `WifiManager`, https://developer.android.com/reference/android/net/wifi/WifiManager | Primary (platform docs) | fetched (sha256 `99767646…69`) | `calculateSignalLevel`: "Calculates the level of the signal. This should be used any time a signal is being shown." / "Given a raw RSSI, return the RSSI signal quality rating…" (so bars come from radio signal strength) |
| S3 | **Android Developers**, `NetworkCapabilities`, https://developer.android.com/reference/android/net/NetworkCapabilities | Primary (platform docs) | fetched (sha256 `e29bdfa1…04e9`) | `NET_CAPABILITY_VALIDATED`: "Indicates that connectivity on this network was successfully validated." (internet reachability is a separate check from the radio connection) |
| S4 | **Google Pixel Phone Help**, "Fix Wi-Fi connection problems / Manage Wi-Fi", https://support.google.com/pixelphone/answer/6183600 | Primary (platform vendor help) | fetched (sha256 `b40394f5…`) | "Phone: Try connecting to the Wi-Fi network with another device, like a laptop computer or friend's phone. If other devices can use the network, the problem is most likely with your phone." / "Internet: If your phone connects to the Wi-Fi network but you still have no internet, the problem is most likely with your internet connection." / "How to restart the router & modem… Unplug the router and modem's power cords from the power outlet for 15 seconds… Check that all cords and cables are secure at both ends." / Auto-switch applies if "There's no internet connection over Wi-Fi" or "The local Wi-Fi connection between your Pixel and the Access Point (AP) is weak." |
| S5 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "Full Wi-Fi bars, but nothing loads?" | Hook | S4 (connected to Wi-Fi but no internet) |
| "Those bars measure only the radio link between your phone and the router." | Fact | S1, S2 (bars are computed from the Wi-Fi RSSI); S4 ("local Wi-Fi connection between your Pixel and the Access Point") |
| "The internet is a second link, from the router out to your provider." | Fact | S3 (internet connectivity is validated separately); S4 (the "Internet" case vs the local Wi-Fi connection) |
| "When that link is down, the bars stay full and nothing gets through." | Fact | S4 ("connects to the Wi-Fi network but you still have no internet") |
| "Quick check: if another device can't load either, it's the connection, not your phone." | Practical test | S4 (the another-device test) |
| "Then check the router's cables, or restart the router and modem." | Practical tip | S4 (check cables; restart router and modem) |
| "Download Meshline for nearby messaging, even offline." | CTA | S5. No Wi-Fi, internet or range claims for Meshline. |

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- The phone and laptop glyphs are generic. The Wi-Fi fan icon is a drawn symbol, not an OS screenshot.
- The "internet provider" block stands in for the ISP side. The router's status dot is illustrative.
