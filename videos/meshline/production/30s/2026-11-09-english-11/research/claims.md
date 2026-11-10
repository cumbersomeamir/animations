# Sources and claim mapping: batch 2026-11-09-english-11, "Why a text gets through when a call won't"

Checked 2026-11-10. Files were fetched with curl through the session proxy; sha256 values are of the fetched files.

## History check (why the suggested topic was swapped)
The suggested topic was "why mobile networks can fail at a crowded concert even when the signal looks strong". That is already **episode 01** ("Why full bars can still mean slow data", concert capacity), and it was also covered by pilot 01 and the 10 s test. The topic rule in `context/11-production-format.md` says a repeat is swapped for an unused planned title.

**Chosen subject:** the unused planned title "one bar can still send a text", told as **why a text gets through when a call won't**. It is just as useful, it is in the same genre (everyday network behaviour), and it keeps the brief's practical angle:
- the overloaded doorway (a busy tower gate that a crowd's traffic streams through);
- agree a meeting point before a busy event, so one short text is enough;
- a truthful nearby CTA, drawn as a short link inside a limited range ring (not unlimited range).

It does not repeat episode 01 (shared capacity → slow data), 03 (store-and-forward relay route) or 08 (sent vs delivered ticks). Here the subject is *what each kind of message needs from a busy network*.

| ID | Source | Type | Status | Key quote (verbatim) |
|---|---|---|---|---|
| S1 | **FCC / FEMA**, "Tips for communicating before, during & after disasters" (2011), https://docs.fcc.gov/public/attachments/DOC-309723A1.pdf | Primary (US regulator + emergency agency) | fetched (sha256 `ba254b37…9786ebf6`) | "For non-emergency communications, use text messaging, e-mail, or social media instead of making voice calls on your cell phone to avoid tying up voice networks. Data-based services like texts and emails are less likely to experience network congestion." / "Keep all phone calls brief. If you need to use a phone, try to convey only vital information…" / "…wait ten seconds before redialing to help reduce network congestion." |
| S2 | **FCC 14-6**, text-to-911 Policy Statement and Second FNPRM (adopted 30 Jan 2014), https://docs.fcc.gov/public/attachments/FCC-14-6A1.txt | Primary (FCC order) | fetched (sha256 `0a10bb21…1b70f450`) | "during high usage periods where callers find it difficult to establish connections for voice calls due to network congestion, Short Message Service (SMS) text messages – which require much lower signal levels – are often successfully transmitted." (footnote, citing BRETSA reply comments) |
| S3 | **3GPP TS 23.040** V19.0.0 (2025-10), Technical realization of SMS, https://www.3gpp.org/ftp/Specs/archive/23_series/23.040/23040-j00.zip | Primary (standard) | fetched (sha256 `82ac2553…c41abdf2`) | "The provision of SMS makes use of a Service Centre, which acts as a store and forward centre for short messages." / "The text messages to be transferred by means of the SM MT or SM MO contain up to 140 octets." |
| S4 | **3GPP TS 23.038** V20.0.0, Alphabets and language-specific information, https://www.3gpp.org/ftp/Specs/archive/23_series/23.038/23038-k00.zip | Primary (standard) | fetched (sha256 `e37a5f6a…b5f26f9e`) | "…the message can consist of up to 160 characters." / "Therefore, in 140 octets, it is possible to pack (140x8)/7=160 characters." (GSM 7-bit default alphabet; other alphabets allow fewer) |
| S5 | **3GPP TS 23.203** V20.1.0, Policy and charging control architecture, Table 6.1.7-A, https://www.3gpp.org/ftp/Specs/archive/23_series/23.203/23203-k10.zip | Primary (standard) | fetched (sha256 `9fb3cdf7…`) | QCI 1, example service "Conversational Voice", is in the GBR group; "GBR bearer: An IP-CAN bearer with reserved (guaranteed) bitrate resources." |
| S6 | Ready.gov / FEMA family communication plan (meeting places) | Advice (agency guidance) | **not fetched**: ready.gov and fema.gov returned HTTP 403 to automated fetches. Only seen in search results and local-government copies. | Pick a meeting place everyone knows. Used only as everyday planning advice, not as a factual claim. |
| S7 | Meshline listing (`videos/meshline/assets/listing.json`) | App fact | approved asset | "Private nearby messaging that keeps moving, even when the internet does not." Android, Communication, price 0 INR, InStock (Google Play). |

## Claim → source (final narration)
| Line | Type | Source |
|---|---|---|
| "Your call won't connect, but a text still gets through?" | Hook | S2 (voice calls hard to connect under congestion while SMS is often transmitted) |
| "A call needs a path held open for every second you talk." | Fact (simplified) | S5 (conversational voice uses a bearer with reserved bitrate resources); S1 ("tying up voice networks", "keep all phone calls brief") |
| "A text is one tiny burst, up to 160 characters." | Fact | S3 (up to 140 octets), S4 (160 characters in the default 7-bit alphabet) |
| "It needs less signal, and the network can hold it, then deliver it in a gap." | Fact (simplified) | S2 ("require much lower signal levels"); S3 (service centre stores and forwards); S1 (texts "less likely to experience network congestion"). "In a gap" is the map's simplification of a short transfer fitting spare capacity. |
| "So emergency guides say: to check in, text instead of calling." | Guidance | S1 (non-emergency communications: text instead of voice calls). The line says "to check in", matching S1's non-emergency scope; it does not suggest texting emergency services. |
| "Before a busy event, agree a meeting point, so one short text is enough." | Practical tip | The user's brief; S6 (meeting-place planning); S1 ("convey only vital information") |
| "Download Meshline for nearby messaging, even offline." | CTA | S7. No range, relay, protocol or delivery-guarantee claims for Meshline. The nearby link is drawn inside a limited range ring. |

## Illustrations (on screen: "Illustrative map · not to scale · generic principle, not a product feature")
- The tower "doorway", the crowd's grey traffic capsules and the gaps are a teaching metaphor for shared radio capacity, not a model of any specific network.
- The phone glyphs, signal bars, handset and envelope icons are generic drawings, not OS or app screenshots.
- The instrument's example text "At the meeting point." is 21 characters (counted).
