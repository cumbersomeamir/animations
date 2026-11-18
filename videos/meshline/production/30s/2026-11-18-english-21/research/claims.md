# Sources and claim mapping: batch 2026-11-18-english-21, "Why pairing shows the same six digits on both phones"

Checked 2026-11-18. The files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## Topic choice (history checked)
- **Requested:** "Why Bluetooth can reach across a room but struggle through your own body: 2.4 GHz propagation, absorption and geometry", with a placement insight.
- **Already covered:** signal loss through an obstacle, plus placement advice, is the core of episodes 07 (headphones behind a thick wall), 14 (concrete walls, measured loss, relay placement) and 16 (multipath, a hand's width). The app log says: "Obstruction, walls and distance are now fully covered; don't propose them again as the main mechanism." A body is a different obstacle but the same mechanism and the same placement payoff.
- **Chosen instead (same genre, never covered):** Bluetooth numeric comparison. It covers why both phones show the same six digits when pairing, and how comparing them defeats a middleman. It is privacy-relevant ("private nearby messaging") and different from batch 20 (towers) and batch 19 (hidden terminal). SIM vs Bluetooth keys (15) only mentioned that Bluetooth has its own keys.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **NIST SP 800-121 Rev. 2 Upd. 1, *Guide to Bluetooth Security*** (Padgette et al.), https://doi.org/10.6028/NIST.SP.800-121r2-upd1 (PDF: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-121r2-upd1.pdf) | Primary (US government guidance) | fetched (sha256 `72eb105c…`) | §3.1.1: "SSP also improves security through the addition of ECDH public key cryptography for protection against passive eavesdropping and man-in-the-middle (MITM) attacks during pairing." / "Each device generates its own ECDH public-private key pair… Each device sends the public key to the other device." / "During pairing, a user is shown a six-digit number on each display and provides a "yes" response on each device if the numbers match. Otherwise, the user responds "no" and pairing fails." / "the displayed number is not used as input for link key generation." §3.2.2.2: "Numeric comparison provides MITM protection as well as provides confirmation to the user that they are pairing the intended two devices." / Just Works: "The user is required to accept a connection without verifying the calculated value on both devices, so Just Works provides no MITM protection." |
| S2 | **Bluetooth SIG, "Bluetooth® LE secure connections – numeric comparison"**, blog, 19 January 2017 (page author: Steve Karr), https://www.bluetooth.com/blog/bluetooth-pairing-part-4/ | Official (standards body) | fetched (sha256 `d4ebb1bb…`) | "In public key exchange, each device generates its own elliptic curve Diffie-Hellman (ECDH) public-private key pair." / "After the public keys have been exchanged, the device can then start computing the Diffie-Hellman key" / "the two devices each compute six-digit confirmation values that are displayed to the user on their respective devices. The user is expected to check that these six-digit values match and to confirm if there is a match. If no match, pairing aborts." / "A failure at this point indicates the presence of an attacker" |
| S3 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Pairing method, encryption standard and transport are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "When two phones pair, both show the same six digits. Why?" | Fact + hook | S1, S2 (numeric comparison shows a six-digit value on each display) |
| "Because someone in the middle could pose as each phone." | Fact (the threat this step defends against) | S1 (MITM protection; "confirmation… they are pairing the intended two devices") |
| "Each phone sends its public key, and both build one shared secret." | Fact | S1 §3.1.1, S2 (ECDH key pairs; public keys exchanged; Diffie-Hellman key computed) |
| "Then each turns what it received into a six-digit check." | Fact (simplified: the value is computed from the exchanged public keys and random values) | S2 ("compute six-digit confirmation values" after the exchange) |
| "A middleman must swap in its own keys, so the numbers would almost surely differ." | Fact, reasoned from the mechanism. "Almost surely", because a lucky guess is possible but very unlikely; no figure is stated. | S1 (numeric comparison provides MITM protection), S2 ("If no match, pairing aborts"; mismatch "indicates the presence of an attacker") |
| "So only tap pair when both screens show the same number." | Useful payoff | S1 ("yes" only if the numbers match, otherwise "no") |
| "Download Meshline for private nearby messages, even offline." | CTA | S3. On screen: "Download free · Android" (listing: price 0, Android). No pairing, Bluetooth or encryption claim about Meshline; the diagram is veiled under the CTA. |

## Scope notes
- Numeric comparison needs both devices to have a display and yes/no input. Headsets often use "Just Works", which gives no MITM protection (S1). This is not narrated.
- The six-digit value is not the key; seeing it does not reveal the key (S1). This is not narrated.

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Digits:** "482 913" (match) and "731 064" / "295 418" (middleman case) are made-up example values. The screens are a generic prompt ("pair?" + digits + a "Pair" button), not any vendor's UI.
- **The middleman** is a masked coral device on the line between the phones; the speech tags "I'm your friend" / "I'm you" show it posing as each side.
- **Key tokens** are generic key glyphs; "shared secret" is a padlock glyph. Commitments and random values are omitted.
