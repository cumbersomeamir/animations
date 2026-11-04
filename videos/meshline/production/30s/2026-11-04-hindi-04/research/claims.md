# Sources and claim mapping: Hindi batch 04, "बिना मोबाइल डेटा जीपीएस, और ऑफ़लाइन नक्शा" (GPS location without mobile data; map tiles need downloading)

Checked 2026-11-04. Pages were fetched with curl through the session proxy, quotes were copied from the fetched text, and sha256 values are of the fetched files.

## History check
GPS / offline maps had never been covered. A grep of `context/` found no GPS, offline-map or satellite episode. Earlier topics:
- full bars vs capacity;
- walkie-talkie;
- store-and-forward;
- Bluetooth direct radio vs internet routing;
- airplane mode (Hindi 03).

The user's topic was therefore used as given.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **GPS.gov** (U.S. government), "GPS: The Global Positioning System", https://www.gps.gov/gps | Primary (system operator) | fetched (sha256 `3aa4a7a7…4841`) | "The space segment consists of a nominal constellation of 24 operating satellites that transmit one-way signals that give the current GPS satellite position and time." / "The user segment consists of the GPS receiver equipment, which receives the signals from the GPS satellites and uses the transmitted information to calculate the user's three-dimensional position and time." / "The civilian service is freely available to all users on a continuous, worldwide basis." |
| S2 | **Google Maps Help**, "Download areas & navigate offline in Google Maps" (Android), https://support.google.com/maps/answer/6291838 | Primary (map-app vendor help) | fetched (sha256 `04613c88…1d29`) | "You can save an area from Google Maps to your mobile device or tablet and use it when you're offline." / to download: "Make sure you're connected to the internet" / "If your internet connection is slow or unavailable, your offline maps can guide you to your destination as long as the entire route is within the offline map." / "Find a list of your offline maps… Offline maps" / "You must update the offline maps you've downloaded… before they expire." / "When you're offline, transit, bicycling, or walking directions are unavailable. If you're offline when you drive, you can't get traffic info or alternate routes." / "You can't download offline maps in some countries or regions…" |
| S3 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play URL). |

## Claim → source (Hindi narration, English gloss)
| Narration (final, Hindi) | English gloss | Type | Source |
|---|---|---|---|
| मोबाइल डेटा बंद, फिर भी मैप पर आपकी जगह दिख रही है? | Mobile data off, yet your location shows on the map? | Hook question | S1 (position comes from the satellite signals) |
| जीपीएस सैटेलाइट एकतरफ़ा सिग्नल भेजते हैं; फ़ोन उन्हें सुनकर जगह निकालता है। | GPS satellites send one-way signals; the phone listens and works out its position. | Fact | S1 ("transmit one-way signals"; the receiver "receives the signals… and uses the transmitted information to calculate… position") |
| इसके लिए मोबाइल डेटा ज़रूरी नहीं। | Mobile data isn't required for that. | Fact | S1 (one-way broadcast received by the receiver; the civilian service is freely available). Phones may also use data to speed up a fix; the line says "not required", not "never used". |
| पर सड़कों वाला नक्शा अलग है; नया नक्शा अक्सर इंटरनेट से आता है। | But the street map is separate; a fresh map often comes from the internet. | Fact | S2 (downloading needs an internet connection; offline use needs a saved area). "अक्सर" (often), because previously saved or cached map data may already be on the phone. |
| सफ़र से पहले वाई-फ़ाई पर पूरे रास्ते का इलाका सेव करके जाँच लें। | Before a trip, save the area covering the whole route on Wi-Fi, and check it. | Practical tip | S2 ("as long as the entire route is within the offline map"; download needs internet; check the "Offline maps" list; maps must be updated before they expire) |
| सैटेलाइट जगह बताते हैं, सेव नक्शा सड़कें। | Satellites give the position; the saved map gives the streets. | Takeaway | S1 + S2 |
| पास वालों से ऑफ़लाइन बात के लिए मेशलाइन डाउनलोड करें। | Download Meshline to talk offline with people nearby. | CTA (with its real limitation) | S3 ("nearby messaging… even when the internet does not"). "पास वालों से" (with people nearby) states the supported scope, with no long-range, guaranteed or map/GPS claim. |

## Illustrations (on screen: "सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य जीपीएस/मैप व्यवहार, ऐप की सुविधा नहीं" = illustrative map · not to scale · general GPS/map behaviour, not an app feature)
- Three printed satellites stand in for the constellation; a fix needs signals from several satellites. The number shown is illustrative.
- The tile grid, the saved-area frame and the "ऑफ़लाइन जाँचा" (checked offline) stamp are a generic map-app diagram, not a screenshot of any app.
- Meshline appears only in the CTA. Meshline has no map or GPS feature, and none is shown.

## Kept out of the video (publishing copy only)
- Offline maps aren't available in some countries or regions.
- Offline maps must be updated before they expire.
- Offline mode has no transit, bicycling or walking directions, and no traffic info.
