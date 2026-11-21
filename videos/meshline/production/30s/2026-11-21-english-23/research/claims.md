# Sources and claim mapping: batch 2026-11-21-english-23, "Why your phone keeps changing its Bluetooth address"

Checked 2026-11-21. The files were fetched with curl through the session proxy; sha256 prefixes are of the fetched files.

## Topic choice (all prior topic records read: episodes 01–24, including batch 22's actual subject)
- **Requested:** "Why an elevator can swallow your wireless signal" (a metal enclosure, attenuation, position and obstruction).
- **Already covered:** obstruction and placement are the core of 07 (headphones behind a wall), 14 (concrete walls, relay placement) and 16 (multipath). The ledger lists "signal in a lift (overlaps walls, so avoid)", and since batch 21 "Body, pocket, hand and lift blocking stories all count as obstruction repeats." A metal lift is the same core question (why a barrier weakens the signal) with the same payoff (position and obstruction matter).
- **Chosen instead (unrelated, same genre):** Bluetooth LE address privacy. Why your phone keeps changing its Bluetooth address, how strangers' scanners see "new devices" while paired devices still recognise it, and why a plain device name matters.
  - **Different from batch 22** (two short hops vs one long hop: distance loss, retries, airtime) in core question, visual setting (a transit-map street with three scanners) and mechanism (address rotation and key resolution).
  - **Different from batch 21** (pairing numeric comparison against a middleman): that was about confirming *who you pair with*; this is about *not being followed* while the radio is on.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **NIST SP 800-121 Rev. 2 Upd. 1, *Guide to Bluetooth Security***, https://doi.org/10.6028/NIST.SP.800-121r2-upd1 | Primary (US government guidance) | fetched (sha256 `72eb105c…`, same file as english-21) | §3.2.1: "With low energy's privacy feature enabled, the IRK is used to map a Resolvable Private Address (RPA) to an Identity Address… This allows a trusted device to determine another device's Identity Address from a periodically-changing RPA. Previously, a device would be assigned a static "public" address that would be made available during discovery. If that device remained discoverable, its location could easily be tracked by an adversary. The use of a periodically-changing random address (a hashed and randomized address created with the IRK) mitigates this threat." / Table 4-2, recommendation 7: "the default device name should usually be changed to be non-descriptive (i.e., so that it does not reveal the platform type)." |
| S2 | **Bluetooth SIG, "Enhancing Device Privacy and Energy Efficiency with Bluetooth Randomized RPA Updates"** (blog), https://www.bluetooth.com/blog/enhancing-device-privacy-and-energy-efficiency-with-bluetooth-randomized-rpa-updates/ | Official (standards body) | fetched (sha256 `c1d6b887…`) | "An RPA is a random private address that becomes resolvable only to devices sharing a common Identity Resolving Key (IRK)… exchanged by Bluetooth devices during pairing." / "RPAs can help protect device privacy in two ways: By making it challenging for external observers to correlate device behavior through address patterns, which prevents long-term tracking, and by allowing only trusted devices to identify each other." / HCI RPA_Timeout default "0x0384 (900s)". |
| S3 | **Android 15 Compatibility Definition Document, §7.4.3 Bluetooth, [C-3-5]**, https://source.android.com/docs/compatibility/15/android-15-cdd | Primary (Android platform requirement) | fetched (sha256 `abb718c2…`) | "MUST implement a Resolvable Private Address (RPA) timeout no longer than 15 minutes and rotate the address at timeout to protect user privacy when device is actively using BLE for scanning or advertising. To prevent timing attacks, timeout intervals MUST also be randomized between 5 and 15 minutes." |
| S4 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Bluetooth use, addressing and privacy features are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Why does your phone keep changing its Bluetooth address?" | Hook (fact + real question) | S1, S3 |
| "A fixed address would let scanners follow you around." | Fact | S1 ("its location could easily be tracked by an adversary"), S2 ("prevents long-term tracking") |
| "So Android swaps in a new random address at least every fifteen minutes." | Fact. Scope: Android devices with Bluetooth LE, while actively scanning or advertising; intervals are randomized between 5 and 15 minutes. | S3 |
| "To a stranger's scanner, it is a new device each time." | Fact (simplified: an observer cannot link the addresses by pattern) | S2 |
| "But paired devices share a secret key, so they still know it is you." | Fact (the IRK, exchanged during pairing) | S1, S2 |
| "Your device name can still give you away, so keep it plain." | Useful payoff | S1 (make the default name non-descriptive) |
| "Download Meshline for private nearby messages, even offline." | CTA | S4. On screen: "Download free · Android" (listing: price 0, Android). No Bluetooth, address or privacy-feature claim about Meshline; the street diagram is veiled under the CTA. |

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Addresses:** shown as three bytes plus "…" (real addresses are six bytes); all values are made up.
- **The timer** is sped up and labelled "sped up"; the "≤ 15 min" label is the Android ceiling from S3.
- **"Sam's Phone"** is a fictional example name.
- **The scanners** stand for any stranger's Bluetooth receiver.
- **The fixed-address run** is a what-if, shown in coral and labelled "never changes".
- **Limits not narrated:** classic Bluetooth (BR/EDR) addresses and Wi-Fi MAC randomization are separate mechanisms. Whether a name is visible depends on what a device advertises and whether it is discoverable.
