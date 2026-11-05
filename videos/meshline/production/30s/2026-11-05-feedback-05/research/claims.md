# Sources and claim mapping: batch 2026-11-05-feedback-05 (Hindi), "दीवार के पीछे हेडफ़ोन की आवाज़ क्यों टूटती है?" (why Bluetooth headphones break up behind a thick wall)

Checked 2026-11-05. Pages were fetched with curl through the session proxy, quotes were copied from the fetched text, and sha256 values are of the fetched files.

## History check
This exact topic was not covered. Related earlier material:
- **Round 02 (English, 2026-11-03):** walls appeared as one of three reach limits inside a "direct link vs internet route" lesson.
- **Hindi 03 (airplane mode):** earbuds appeared only as the hook.

This episode is new in three ways:
- it is a Hindi diagnosis of headphone dropouts in one home scene;
- it includes a hands-on test (come near with no wall between);
- it separates phone signal bars (the tower link) from the headphone link, with a live comparison.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **Bluetooth SIG**, "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/key-attributes/range/ | Primary (standards body) | fetched 2026-11-05 (sha256 `11c140c4…cf21`) | "Path loss, or path attenuation, occurs naturally over distance and is impacted by the environment in which the signal is being transmitted. Obstacles between the transmitter and the receiver can deteriorate the signal. Attenuators can be anything from humidity and precipitation, to walls, windows, and other obstacles made of glass, wood, metal, or concrete" / "the amount of attenuation and effective path loss varies with the type and density of the obstruction" / the PHY includes "the guards in place to counter interference" |
| S2 | **Bluetooth SIG**, "Bluetooth technology overview", https://www.bluetooth.com/learn-about-bluetooth/tech-overview/ | Primary (standards body) | fetched 2026-11-05 (sha256 `fa892bcc…4c0f`) | "Supporting point-to-point device communication, Bluetooth Classic is mainly used to enable wireless audio streaming and has become the standard radio protocol behind wireless speakers, headphones, and in-car entertainment systems." / "40 channels in the 2.4GHz unlicensed ISM frequency band" |
| S3 | **T-Mobile**, "What Do the Bars On My Phone Mean?", https://www.t-mobile.com/dialed-in/wireless/what-do-cell-phone-bars-mean (first cited in this app's pilot 01) | Carrier explainer | fetched 2026-11-05 (sha256 `e4b59de2…4885`) | "Signal bars are a rough visual estimate of your phone's connection to a nearby cell site (a tower or small cell) - not a precise measure of speed or call quality." |
| S4 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play URL). |

## Claim → source (final Hindi narration, English gloss)
| Narration (final, Hindi) | English gloss | Type | Source |
|---|---|---|---|
| दीवार के पीछे गए, हेडफ़ोन की आवाज़ टूटने लगी? | Went behind the wall and the headphone audio started breaking up? | Hook | S1 (obstacles deteriorate the signal) |
| हेडफ़ोन, फ़ोन से ब्लूटूथ रेडियो पर सीधे जुड़ते हैं। | Headphones connect directly to the phone over Bluetooth radio. | Fact | S2 (point-to-point; "the standard radio protocol behind… headphones") |
| मोटी कंक्रीट या धातु की दीवार सिग्नल कमज़ोर करती है; दूरी और रेडियो-शोर भी। | A thick concrete or metal wall weakens the signal; so do distance and radio noise. | Fact | S1 (walls of metal or concrete; type and density; path loss over distance; interference) and S2 (shared 2.4 GHz unlicensed band) |
| जाँच: फ़ोन के पास, बिना दीवार आइए; आवाज़ सुधरे, तो वजह दूरी या रुकावट थी। | Test: come near the phone with no wall between; if the audio improves, the cause was distance or the obstruction. | Practical test | S1. Both distance and obstruction change in this test, so the sentence names both as the cause and doesn't pin it on the wall alone. |
| सिग्नल बार मोबाइल टावर के हैं, हेडफ़ोन लिंक के नहीं। | Signal bars are about the mobile tower, not the headphone link. | Fact | S3 (bars estimate the phone's connection to a nearby cell site) |
| सीधे लिंक को चाहिए: कम दूरी, साफ़ रास्ता। | A direct link needs short distance and a clear path. | Takeaway | S1 |
| पास वालों से ऑफ़लाइन बात के लिए मेशलाइन डाउनलोड करें। | Download Meshline to talk offline with people nearby. | CTA | S4: the documented scope is nearby and offline. There is no range, emergency or guaranteed-connectivity claim, and no claim about which radio Meshline uses. |

## Illustrations (on screen: "सांकेतिक नक्शा · पैमाने पर नहीं · सामान्य ब्लूटूथ व्यवहार, ऐप की सुविधा नहीं" = illustrative map · not to scale · general Bluetooth behaviour, not an app feature)
- The bars and waveform in the instrument come from an illustrative formula on the drawn geometry (distance + wall crossing + noise), not from measurements.
- The router stands in for "another radio on the shared band" and is labelled only "रेडियो-शोर" (radio noise).
