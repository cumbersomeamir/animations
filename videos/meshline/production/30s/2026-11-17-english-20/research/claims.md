# Sources and claim mapping: batch 2026-11-17-english-20, "Why your phone skips the nearest tower"

Checked 2026-11-17/18. sha256 prefixes are of the fetched files. ETSI and 3GPP served bot-check pages to curl; the ETSI PDF below was retrieved with the session's web fetcher and its text extracted locally.

## Topic choice (history checked)
- **Requested:** "Why a crowd can kill a wireless connection even with full signal bars: airtime contention versus signal strength."
- **Already covered:** episode 01 (why full bars can still mean slow data), 12 (full Wi-Fi bars, no internet) and 17 (one channel, many senders: listen-before-talk and backoff). The app log also says crowd, stadium and full-bars stories are repeats.
- **Chosen instead (same genre, never covered):** how a phone picks a tower. This was a planned, unused title. It covers network membership, ranking by measured signal, and switching only after a margin and a set time. It is not batch 19's subject (the hidden terminal).

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ETSI TS 136 304 V18.2.0 (2024-08)** = 3GPP TS 36.304 v18.2.0, *E-UTRA; User Equipment (UE) procedures in idle mode*, https://www.etsi.org/deliver/etsi_TS/136300_136399/136304/18.02.00_60/ts_136304v180200p.pdf | Primary (3GPP/ETSI spec) | fetched (sha256 `a0bf9abe…`) | §4.1: "With the cell selection, the UE searches for a suitable cell of the selected PLMN and chooses that cell to provide available services". §3.1 suitable cell: "The cell is part of either: the selected PLMN, or: the registered PLMN, or: a PLMN of the Equivalent PLMN list". §5.2.3.2: "Qrxlevmeas  Measured cell RX level value (RSRP)". §5.2.4.6: "The cells shall be ranked according to the R criteria specified above, deriving Qmeas,n and Qmeas,s and calculating the R values using averaged RSRP results." / "Qhyst: This specifies the hysteresis value for ranking criteria." / "In all cases, the UE shall reselect the new cell, only if the following conditions are met: the new cell is better ranked than the serving cell during a time interval TreselectionRAT; more than 1 second has elapsed since the UE camped on the current serving cell." |
| S2 | **Benzaghta, Ammar, López-Pérez, Shihada, Geraci, "Data-Driven Design of 3GPP Handover Parameters with Bayesian Optimization and Transfer Learning", arXiv:2504.02633 (2025)**, https://arxiv.org/pdf/2504.02633 | Peer-authored research preprint (UPF, KAUST, UPV, Telefónica Research) | fetched (sha256 `23c71e12…`) | "Event A3 is met when the target cell's L3-filtered RSRP exceeds that of the serving cell by a hysteresis margin (A3 offset). Once triggered, the UE starts a Time-to-Trigger (TTT) timer. If the condition holds throughout the TTT, the UE sends a measurement report to the serving cell, initiating HO preparation." / "A HO ping-pong occurs when a UE briefly connects to a cell before handing over again." / "Small A3-offset and TTT values may trigger premature handovers, increasing ping-pongs" |
| S3 | Viering, Wegmann, Lobinger, Awada, Martikainen, "Mobility Robustness Optimization beyond Doppler Effect and WSS Assumption", ISWCS 2011 (TU Darmstadt copy), https://www.kt.tu-darmstadt.de/media/kt/publikationen_1/10/11/ISWCS_Awada2.pdf | Peer-reviewed conference paper | fetched (sha256 `d39634cf…`) | Supporting only: names the handover margin ("also called hysteresis or margin") and time to trigger, and the trade-off between radio link failures and "pingpongs". |
| S4 | Meshline listing (`assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not."; operatingSystem ANDROID; price 0. Cellular behaviour, transport and relay are **unknown and not claimed**. |

## Claim → source (final narration)
| Line | Kind | Source |
|---|---|---|
| "Your phone is beside a tower, yet it uses a farther one. Why?" | Hook (illustrative scenario, real question) | S1 (selection is by network membership and measured RSRP; distance is not a criterion) |
| "That tower may not belong to your network." | Fact ("may") | S1 §4.1, §3.1 (a suitable cell must belong to the selected/registered/equivalent PLMN). One mast can host several operators; the episode only says "may". |
| "Among your network's towers, measured signal counts, not distance." | Fact | S1 §5.2.3.2, §5.2.4.6 (ranking on measured, averaged RSRP) |
| "And when a stronger tower appears, the switch still waits." | Fact | S1 §5.2.4.6 (Qhyst; Treselection); S2 (A3 offset; TTT) |
| "It must win by a margin, for a set time, to avoid bouncing back and forth." | Fact | S1 (hysteresis; better ranked during Treselection); S2 (offset + TTT; small values increase ping-pongs) |
| "So the nearest tower is not always yours, and switches take a moment." | Takeaway (reasoned from S1 and S2) | S1, S2 |
| "Download Meshline for nearby messages, even offline." | CTA | S4. On screen: "Download free · Android" (price 0, Android: listing). No cellular, radio, range or relay claim about Meshline; the map is veiled under the CTA. |

## Scope notes
- "Tower" stands for a cell (a tower can carry several cells and operators).
- In idle mode the phone reselects itself (S1). During a call or data session the network decides the handover from the phone's measurement reports (S2). The narration's "the switch" and "it must win by a margin, for a set time" apply to both.
- Real margins and timers are set by each network; no values are stated.

## Illustrative choices (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Layout:** a street with the nearest tower (another network's), tower 1 (yours, farther), a building, and tower 2 (yours, nearer but behind the building).
- **One walk model** drives the phone's position, both signal bars, the "stronger" label, the margin crossing and the switch time (`src/tower.mjs`: `walkW`, `sig1`, `sig2`, `MARGIN`). The bar levels are illustrative, not measurements.
- **The set time** shown is 3.0 s, illustrative. The "bouncing" ghost link is a what-if without a margin, shown in coral and struck out.
