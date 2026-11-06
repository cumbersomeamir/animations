# Sources and claim mapping: batch 2026-11-06-english-07, "Upload vs download: why sending a video takes longer"

Checked 2026-11-06. fcc.gov and speedtest.net refuse automated page fetches here. The FCC press release PDF (docs.fcc.gov) was downloaded and its text extracted locally (sha256 below). M-Lab was fetched with curl.

## History check (why the suggested topic was replaced)
The suggested topic, "Bluetooth nearby range shrinks across walls: the same two phones in an open room, then behind a concrete wall; obstacles and interference; proximity vs internet access", already exists:
- **Episode 07** (`production/30s/2026-11-05-feedback-05`, Hindi): the same phone and a concrete wall, an open path vs behind the wall, obstacles plus radio noise, and a come-closer test.
- **Episode 04** (`production/30s/2026-11-03-round-02`, English): reach limited by distance, walls and interference, and proximity (direct link) vs internet routing.

Following the brief, a fresh, equally useful subject in the same genre was chosen: planned title #9 in `context/08-educational-strategy.md`, "Upload vs download: why sending a video takes longer". It has never been an episode. It gives a concrete worked example (100 MB at 100 vs 20 Mbps) and a practical check (look at upload speed).

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **FCC** press release "FCC Increases Broadband Speed Benchmark", March 14, 2024, https://docs.fcc.gov/public/attachments/DOC-401205A1.pdf (news page https://www.fcc.gov/document/fcc-increases-broadband-speed-benchmark) | Primary (US regulator) | PDF fetched, text extracted (sha256 `69e86094…2b98`) | "raises the Commission's benchmark for high-speed fixed broadband to download speeds of 100 megabits per second and upload speeds of 20 megabits per second – a four-fold increase from the 25/3 Mbps benchmark set by the Commission in 2015." / mobile 5G-NR coverage measured "at minimum speeds of 35/3 Mbps" |
| S2 | **Measurement Lab (M-Lab)**, "NDT (Network Diagnostic Tool)", https://www.measurementlab.net/tests/ndt/ | Primary (open measurement platform) | fetched (sha256 `360432a4…2daa`) | "NDT reports upload and download speeds and latency metrics." / "Have separate views for upload and download because the test details and data processing are different for each direction" |
| S3 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "It downloads in seconds; why does sending a video take forever?" | Hook | S1 (download and upload are different speeds) |
| "Many connections have a wide lane down and a narrow lane up." | Fact (hedged: "many") | S1 (the official fixed benchmark is 100 down / 20 up, and the mobile 5G-NR threshold is 35/3: both asymmetric) |
| "The US broadband benchmark: one hundred megabits down, twenty up." | Fact | S1 (verbatim figures, FCC, March 2024) |
| "So a hundred-megabyte video downloads in about eight seconds, but uploads in about forty." | Arithmetic | 100 MB = 800 megabits; 800 / 100 Mbps = 8 s; 800 / 20 Mbps = 40 s. "About", because real transfers add protocol overhead and speeds vary. |
| "A text is tiny, so it still slips through." | Principle | A text is a few bytes to kilobytes, far below the upload rate (arithmetic; no number is spoken) |
| "When sending crawls, check your upload speed, not just download." | Practical tip | S2 (speed tests report upload and download separately) |
| "Download Meshline for nearby messaging, even offline." | CTA | S3. No speed, range, relay, delivery or guarantee claims, and no claim that Meshline uses the upload lane. |

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- Lane widths are drawn 5:1 to match 100:20.
- The progress bars run on a labelled sped-up clock ("100 MB video · clock sped up"): 8 s vs 40 s is compressed into about 4.4 s of screen time.
- The speed-test readout is a generic card, not a screenshot of any service.
