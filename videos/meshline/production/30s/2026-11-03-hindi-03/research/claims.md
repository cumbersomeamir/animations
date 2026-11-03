# Sources and claim mapping: Hindi batch 03, "एयरप्लेन मोड असल में क्या बंद करता है?" (What airplane mode actually switches off)

Checked 2026-11-03. Pages were fetched with curl through the session proxy (and cross-read with a page reader). Quotes were copied from the fetched text, and sha256 values are of the fetched files.

## Why this topic (history check)
The brief proposed "why a crowded concert can show full signal bars but messages fail (signal strength vs capacity)". That mechanism is already covered three times:
- production 01 (`production/30s/2026-11-02`, "Why full bars can still mean slow data", busy-concert capacity);
- educational pilot 01 (concert, bars vs throughput);
- the 10s Transit Map test.

Following the brief's rule, an equally concrete planned title in the same genre was chosen instead: #7 in `context/08-educational-strategy.md`, "What airplane mode actually switches off". It keeps the brief's second half, what local offline communication can and cannot do: nearby direct links work only over a limited distance, and the internet still needs a network.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Android Developers**, `Settings.Global` reference, https://developer.android.com/reference/android/provider/Settings.Global | Primary (platform docs) | fetched (sha256 `2c12b2d6…b734`) | AIRPLANE_MODE_RADIOS: "A comma separated list of radios that need to be disabled when airplane mode is on." / RADIO_CELL: "Constant for use in AIRPLANE_MODE_RADIOS to specify Cellular radio." (RADIO_WIFI and RADIO_BLUETOOTH are listed the same way) |
| S2 | **Google**, Pixel Phone Help, "Keep your Android's wireless connections on in Airplane mode", https://support.google.com/pixelphone/answer/12639358 | Primary (platform vendor help) | fetched (sha256 `9291133f…ed87`) | "When you first turn on Airplane mode on your Android phone, Wi-Fi and Bluetooth turn off. To keep your wireless connections on, you can change this setting so you can still connect to devices like your smartwatch or Bluetooth earbuds." / "The next time you turn on Airplane mode, your phone will remember your previous setting." / "On Pixel phone, some of these steps work only on Android 11 and up." |
| S3 | **Apple Support**, "Use Airplane Mode on your iPhone, iPad, Apple Watch, and Apple Vision Pro", https://support.apple.com/en-us/HT204234 | Primary (platform vendor help) | fetched (sha256 `a446ddf8…304f`) | "If the airline allows it, you can still use Wi-Fi and Bluetooth in Airplane Mode." |
| S4 | **Bluetooth SIG**, "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Primary (standards body) | fetched 2026-11-03 for round 02 (sha256 `97c4ffce…f712`) | "The effective, reliable range between Bluetooth devices is anywhere from more than a kilometer down to less than a meter." / path loss "occurs naturally over distance" |
| S5 | **Bluetooth SIG**, "Bluetooth technology overview", https://www.bluetooth.com/learn-about-bluetooth/tech-overview/ | Primary (standards body) | fetched for round 02 (sha256 `0e337257…269a`) | "Supporting point-to-point device communication, Bluetooth Classic…" |
| S6 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play URL). |

## Claim → source (Hindi narration, English gloss)
| Narration (final, Hindi) | English gloss | Type | Source |
|---|---|---|---|
| एयरप्लेन मोड ऑन, फिर भी ईयरबड्स चल रहे हैं? | Airplane mode on, yet the earbuds still play? | Hook question | S2 (Bluetooth can be kept on so earbuds stay connected) |
| यह मोबाइल नेटवर्क वाला रेडियो बंद करके टावर से जुड़ाव काटता है। | It switches off the mobile-network radio and cuts the link to the tower. | Fact | S1 (the cellular radio is in the airplane-mode radio list) |
| वाई-फ़ाई, ब्लूटूथ भी बंद होते हैं, पर दोबारा चालू हो सकते हैं। | Wi-Fi and Bluetooth turn off too, but can be turned on again. | Fact | S2 (they turn off when airplane mode is first turned on, and can be kept on; the phone remembers the choice); S3 |
| तब ईयरबड्स या पास का फ़ोन सीधे रेडियो से जुड़ सकता है। | Then earbuds or a nearby phone can connect directly by radio. | Principle | S2 (earbuds, smartwatch); S5 (point-to-point device communication) |
| पर यह लिंक सीमित दूरी तक ही चलता है; इंटरनेट के लिए वाई-फ़ाई चाहिए। | But this link only works up to a limited distance; for the internet you need Wi-Fi. | Fact | S4 (range is finite and varies). With the cellular radio off (S1), internet access needs a Wi-Fi network. |
| यानी यह मोबाइल नेटवर्क काटता है, हर रेडियो नहीं। | So it cuts the mobile network, not every radio. | Takeaway | S1–S3 |
| ऑफ़लाइन संचार के लिए मेशलाइन डाउनलोड करें। | Download Meshline for offline communication. | CTA (no capability claim) | S6: a free (0 INR, InStock) Android listing whose description is "messaging that keeps moving, even when the internet does not". No radio, range, relay or guaranteed connectivity is claimed. |

Wording choice: "सीमित दूरी" (a limited distance) instead of "कम दूरी" (a short distance), because Bluetooth SIG gives range anywhere from under a metre to over a kilometre depending on the implementation.

## Illustrations (on screen: "सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य फ़ोन व्यवहार, ऐप की सुविधा नहीं" = illustrative map · not to scale · general phone behaviour, not an app feature)
- The radio toggles in the instrument are a generic diagram, not a screenshot of any phone or app UI.
- The reach circle ("सीमित पहुँच", limited reach) and the far phone ("पहुँच से बाहर", out of reach) are illustrative, not measured.

## Not claimed
- No Meshline radio stack, range, relay, mesh or delivery behaviour. Meshline appears only in the CTA.
- Nothing about airline rules. The publishing caption carries Apple's "if the airline allows it" qualification and the menu-varies note.
- No numbers, dates or currency are spoken.
