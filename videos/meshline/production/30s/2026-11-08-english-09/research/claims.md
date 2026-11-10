# Sources and claim mapping: batch 2026-11-08-english-09, "Packet loss and jitter: why a video call freezes"

Checked 2026-11-08/10. The ITU-T Y.1541 PDF (freely available from itu.int) was downloaded and its text extracted locally. The RFCs were fetched from rfc-editor.org. The G.114 PDF from english-08 is reused. sha256 values are listed below.

## History check
Packet loss and jitter had never been an episode; there is no mention in `context/`. It follows on from episode 10 (latency vs bandwidth) but teaches different properties: missing packets and uneven spacing. The user's topic was kept.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ITU-T Recommendation Y.1541 (12/2011)**, "Network performance objectives for IP-based services", https://www.itu.int/rec/T-REC-Y.1541-201112-I/en | Primary (international standard) | PDF fetched, text extracted (sha256 `fc4d3ef0…91cf3a`) | Table 1, Class 0: IPDV "Upper bound on the 1 − 10⁻³ quantile of IPTD minus the minimum IPTD": **50 ms**; IPLR "Upper bound on the packet loss probability": **1 × 10⁻³**; mean IPTD 100 ms. Table 2: "0 — Real-time, jitter sensitive, high interaction (VoIP, VTC)". Note 4: "high quality voice applications and voice codecs will be essentially unaffected by a 10⁻³ IPLR." |
| S2 | **IETF RFC 3550**, "RTP: A Transport Protocol for Real-Time Applications", https://www.rfc-editor.org/rfc/rfc3550 | Primary standard | fetched (sha256 `4c210e94…43c539e8`) | "interarrival jitter: … An estimate of the statistical variance of the RTP data packet interarrival time… The interarrival jitter J is defined to be the mean deviation (smoothed absolute value) of the difference D in packet spacing at the receiver compared to the sender for a pair of packets." |
| S3 | **ITU-T G.114 (05/2003)**, https://www.itu.int/rec/T-REC-G.114-200305-I/en | Primary (international standard) | fetched for english-08 (sha256 `82821b2e…fdd4`) | "The contribution of the de-jitter buffer to one-way delay is based on the average time packets spend in the buffer…" (a buffer that smooths jitter adds delay) |
| S4 | **IETF RFC 3393**, "IP Packet Delay Variation Metric for IPPM", https://www.rfc-editor.org/rfc/rfc3393 | Primary standard | fetched (sha256 `bd9170bd…72f2c`) | Defines IP packet delay variation, the network-level metric behind "jitter" |
| S5 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "Your speed test looks fast; why does the video call freeze?" | Hook | S1 (real-time calls have loss and delay-variation objectives that are separate from capacity) |
| "Calls send a steady stream of small packets, timed evenly." | Principle | S2 (RTP real-time media; jitter is measured against the sender's packet spacing) |
| "Missing ones are packet loss: the picture freezes or skips." | Fact / consequence | S1 (IPLR is the loss objective for VoIP/VTC). Freezes and skips are the visible effect of missing media packets. |
| "Uneven arrivals are jitter: the app must wait and buffer." | Fact | S2 (jitter = deviation in packet spacing at the receiver); S3 (a de-jitter buffer adds delay) |
| "Call networks target at most one lost packet per thousand, and jitter within fifty milliseconds." | Fact (standard) | S1 Table 1, Class 0 (VoIP, VTC): IPLR ≤ 1 × 10⁻³ and IPDV ≤ 50 ms. "Jitter" is the everyday name for delay variation (S4). |
| "Bandwidth and latency can look fine; check loss and jitter too." | Takeaway / tip | S1 (separate objectives for delay, delay variation and loss); bandwidth and latency were episodes 09–10 |
| "Download Meshline for nearby messaging, even offline." | CTA | S5. No call-quality, loss, jitter, speed or range claims for Meshline. |

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- Loss and jitter come from a deterministic illustrative schedule: a loss burst in the hook, 42 % loss in the loss beat, and ±0.45 s timing spread in the jitter beat. They are exaggerated so they are visible, not measured.
- The call screen's bouncing ball only moves to the video moment of the newest packet that actually arrived. A gap freezes it; the next arrival makes it skip.
- In the 1,000-dot grid, one coral dot stands for "1 in 1,000".
