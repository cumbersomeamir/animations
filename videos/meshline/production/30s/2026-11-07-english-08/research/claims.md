# Sources and claim mapping: batch 2026-11-07-english-08, "Latency vs bandwidth: why a video call still lags"

Checked 2026-11-07. The ITU-T G.114 PDF (freely available from itu.int) was downloaded and its text extracted locally (sha256 below). M-Lab was fetched with curl for english-07 and is reused.

## History check
"Latency vs bandwidth" had never been an episode. It is planned title #6 in `context/08-educational-strategy.md` and was listed as unused in `context/11-production-format.md`. It is distinct from:
- episode 09 (upload vs download: lane widths, asymmetric Mbps);
- episode 01 (capacity under crowd load).

The user's topic was therefore kept.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **ITU-T Recommendation G.114 (05/2003), "One-way transmission time"**, https://www.itu.int/rec/T-REC-G.114-200305-I/en (status: in force) | Primary (international standard) | PDF fetched, text extracted (sha256 `82821b2e…fdd4`) | §4: "Although a few applications may be slightly affected by end-to-end (i.e., "mouth-to-ear" in the case of speech) delays of less than 150 ms, if delays can be kept below this figure, most applications, both speech and non-speech, will experience essentially transparent interactivity." / "it is recommended to not exceed a one-way delay of 400 ms for general network planning" / Table A.1: "Optical fibre cable system, digital transmission — 5 µs/km"; "Satellite system: … – 36 000 km altitude — 260 ms (Propagation through space only (between earth stations))"; "– 400 km altitude — 12 ms" |
| S2 | **Measurement Lab (M-Lab)**, "NDT (Network Diagnostic Tool)", https://www.measurementlab.net/tests/ndt/ | Primary (open measurement platform) | fetched 2026-11-06 (sha256 `360432a4…2daa`) | "NDT is a single stream performance measurement of a connection's capacity for "bulk transport"…" / "NDT reports upload and download speeds and latency metrics." |
| S3 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "Your message lands instantly; why does the video call lag?" | Hook | S1 (delay matters for interactive speech far more than for one-off data) |
| "That speed number is bandwidth: how many packets travel together." | Fact | S2 (the speed figure is a measure of capacity for bulk transport) |
| "Lag is latency: how long each packet takes to arrive." | Fact | S1 (one-way transmission time); S2 (latency is reported separately) |
| "A high satellite hop adds about a quarter second each way, however wide the pipe." | Fact | S1 Table A.1 (36 000 km altitude: 260 ms one way, propagation only; it doesn't depend on link capacity). "High" because low-orbit (400 km) satellites add only about 12 ms (S1). |
| "Past about one hundred fifty milliseconds, conversations stop feeling instant." | Fact | S1 §4 (below 150 ms: "essentially transparent interactivity") |
| "So check ping, not just download speed." | Practical tip | S2 (speed tests report latency separately from download/upload) |
| "Download Meshline for nearby messaging, even offline." | CTA | S3. No latency, speed, range, relay or quality claims for Meshline. |

## Illustrations and arithmetic (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- **Ground route:** 2,000 km of fibre × 5 µs/km = 10 ms one way (S1), shown as "≈ 10 ms"; ping (round trip) ≈ 20 ms.
- **Satellite route:** about 260 ms each way (S1), shown as "≈ 260 ms"; ping (round trip) at least 520 ms, shown as "520+ ms" because propagation alone is the floor.
- **Same width:** both routes are drawn five tracks wide and labelled "100 Mbps" to show that width ≠ delay. 100 Mbps is an illustrative equal figure, not a measured plan.
- **Slowed clock:** the stopwatch row is labelled "one way · clock slowed down"; 10 ms vs 260 ms is stretched over about 6.7 s.
