# Sources and claim mapping: batch 2026-11-06-english-06, "One tick, but not two: where is your message?"

Checked 2026-11-05/06. Pages were fetched through the session proxy. The WhatsApp check-mark FAQ renders with JavaScript, so it was read with the page-reading agent and quoted verbatim. The privacy policy and Bluetooth SIG pages were fetched with curl (sha256 below).

## History check (why the suggested topic was replaced)
The suggested topic, "crowded concert: full bars yet messages fail; signal strength ≠ spare capacity", already exists:
- **Episode 01** (`production/30s/2026-11-02`, English, "Why full bars can still mean slow data": a busy concert with many phones sharing a cell's capacity);
- **Educational pilot 01** (a concert queue);
- **The 10s Transit Map test.**

Following the brief, a fresh, equally useful subject in the same genre was chosen. It keeps the brief's "distinguish direct nearby communication from internet delivery" and its truthful Meshline link: what "sent" vs "delivered" means, where a message waits, and how a direct nearby link differs.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **WhatsApp Help Center**, "How to check read receipts", https://faq.whatsapp.com/665923838265756/?locale=en_US | Primary (messaging-service help) | read 2026-11-05 | "One gray check mark: The message was successfully sent." / "Two gray check marks: The message was successfully delivered to the recipient's phone or any of their linked devices." / "Seeing a clock means the message is not yet sent or delivered. This could be due to connectivity issues." / "If the recipient's phone is off and the message isn't delivered to any of their linked devices, the second check mark won't appear." |
| S2 | **WhatsApp Privacy Policy**, https://www.whatsapp.com/legal/privacy-policy | Primary (service policy) | fetched (sha256 `604aeef6…`) | "If a message cannot be delivered immediately (for example, if the recipient is offline), we keep it in encrypted form on our servers for up to 30 days as we try to deliver it." / "Once your messages are delivered, they are deleted from our servers." |
| S3 | **Bluetooth SIG**, "Bluetooth technology overview" and "Understanding Bluetooth® range", https://www.bluetooth.com/learn-about-bluetooth/tech-overview/ and /key-attributes/range/ | Primary (standards body) | fetched 2026-11-05 (sha256 `fa892bcc…`, `11c140c4…`) | "Supporting point-to-point device communication…" / "The effective, reliable range between Bluetooth devices is anywhere from more than a kilometer down to less than a meter." |
| S4 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "One tick, but not two? Your message is stuck halfway." | Hook | S1 (no second tick = not yet delivered) |
| "In many chat apps, one tick means it left your phone and reached the server." | Fact (hedged: "in many chat apps") | S1 (one tick = "successfully sent"); S2 (undelivered messages are held on the service's servers). The video names no app. |
| "Two ticks mean it reached their phone." | Fact | S1 ("delivered to the recipient's phone or… linked devices") |
| "If their phone is off or offline, the server holds it and keeps trying." | Fact | S1 (phone off → no second tick); S2 ("we keep it… on our servers… as we try to deliver it"). The 30-day limit is a service detail and is not spoken. |
| "Seeing a clock? It hasn't left your phone yet; check your connection." | Fact + practical tip | S1 ("a clock means the message is not yet sent… could be due to connectivity issues") |
| "A direct nearby link skips the server entirely, but only works within limited range." | Principle | S3 (point-to-point device links; finite, variable range) |
| "Download Meshline for nearby messaging, even offline." | CTA | S4 ("nearby messaging… even when the internet does not"). No claims about range, relay, protocol, delivery receipts, emergencies or guarantees. |

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- The chat bubble and tick tracker are generic, code-drawn glyphs, not a screenshot of any app.
- The direct link and the range ring are generic, not a Meshline mechanism.
