# 29 — english-16 (2026-11-15, batch 16) 30 s #01 — English: "No address, no access?" — address proof for Aadhaar without a home

**Status: DONE.** `videos/help/production/30s/2026-11-15-english-16/help-30s-english16-01.mp4` · SHA-256 `aa258415ebb7acb5d7c6c6a0c29412bbc45e9e9d3ec19268a06f33f6af75b7aa`.
Thumbnail `help-30s-english16-thumbnail.png` (frame 0 + "NO ADDRESS, NO ACCESS?") · SHA-256 `3c183d8c161763931200f085ef8dd52f4b24f8e10e3d1217374d264b0129d816`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`fcd9814`, batch 15 already pushed — not repeated); no render/voice/ffmpeg job running.

## Topic check
Proposed: "The hidden cost of having no permanent address" (address/document barriers for people experiencing homelessness; a documented Indian
system that helps obtain identity/access; no promise of universal entitlement). **Not covered** — no earlier script mentions homelessness, address
proof or Aadhaar enrolment (checked every `src/script.json`); nearest is english-14 (ration-card portability for migrants) — a different barrier.
Used as proposed. System chosen: UIDAI's acceptable-documents schedule (address certificate on the UIDAI standard format). Considered and not used:
the Election Commission's night verification for homeless voters (entangled with the contested 2026 electoral-roll revision; current manual not
read) and UIDAI's older "introducer" route (absent from the 2024 schedule that was read).

## Store / icon check (2026-11-15, before this render)
Play listing downloaded directly: "Updated on Sep 15, 2026"; description "Donate essentials in Lucknow with next-day delivery and verified proof.";
=s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4). No Apple App Store link. CTA = verified capability.

## First frame
Frame 0 is the composed hook image at full lamp level: a closed door with an "ADDRESS ?" plate (door) and a person holding a PROOF OF ADDRESS form
with an empty, dashed address box (document) — the door/document mismatch — under "NO ADDRESS, NO ACCESS?" (4 words). No caption on frame 0;
narration from 0.10 s promises the answer ("For Aadhaar, there's an official route") that scenes D–G deliver.

## Story (Theory of Marketing) and final script (English; 76 words; 25.4 s of speech)
| Beat | Start–end (s) | Line |
|---|---|---|
| Hook | 0.10–3.59 | No address, no access? For Aadhaar, there's an official route. |
| Escalation | 3.90–5.69 | Many proofs of address assume a home: |
| Escalation | 5.95–8.66 | an electricity bill, a water bill, a rent agreement. |
| Open question | 9.00–10.54 | So what if you sleep in a shelter? |
| Proof 1 | 10.95–15.95 | The 2024 Aadhaar list also accepts a certificate on its standard format, |
| Proof 2 | 16.30–20.61 | signed by a municipal councillor, a tehsildar or a gazetted officer. |
| Payoff | 21.30–25.32 | It's not automatic, but it's a real route: ask the councillor's office. |
| CTA | 27.10–29.67 | To donate essentials in Lucknow, download Help. |
Voice-only spellings (`tts`): "Aadhar" (Kokoro ˈɑːdhɑːɹ), "tehseeldar" (tˈeɪsiːldˌɑːɹ), "twenty twenty-four"; captions keep "Aadhaar", "tehsildar", "2024".

## Source (accessed 2026-11-15) and claim status
- **U1** UIDAI, Aadhaar (Enrolment and Update) Regulations — "SCHEDULE II [see regulations 10(2) and 19(4)] List of Acceptable Documents for
  Enrolment and Update" (PDF created 14 Feb 2024; official copy hosted by the Government of Goa,
  https://www.dpse.goa.gov.in/list-of-Supporting-Document-for-Aadhaar-Enrolment-and-Update.pdf ; local SHA-256 4d2f9b8f…6411). For individuals five
  years and above: item 15 "Certificate issued on UIDAI Standard Certificate format by: (i) MP/ MLA/ MLC/ Municipal Councillor … (ii) Gazetted Officer
  Group 'A' /Employees Provident Fund Organisation (EPFO) Officer … (iii) Tehsildar/ Gazetted Officer Group 'B' … (vii) Village Panchayat Head/
  President or Mukhiya/ Gaon Bura/ equivalent authority (for rural areas)…" — marked ✔ for Proof of Address and ✗ for Proof of Identity for (i)–(iii)
  and (vii); items 16–22: electricity bill, water bill, telephone/broadband bill, sale/rent/lease agreement, gas bill, government accommodation
  allotment letter, insurance policy (address only). Notes: "(c) A document is accepted as Proof of Address (PoA) document only if it contains Name
  and Address of the individual." · "(g) Head of Family (HoF) based enrolment shall be used in case individual does not have PoI and PoA documents."
- Not readable: uidai.gov.in (all pages: connection reset / 404 / 503), including the June 2026 regulation revision listed in search results.

| Claim (spoken) | Status | Support |
|---|---|---|
| No address, no access? For Aadhaar, there's an official route | framing + documented route | U1 item 15 |
| Many proofs of address assume a home: an electricity bill, a water bill, a rent agreement | documented (7 of ~18 address proofs are home-linked bills/tenancy papers; the rest also print an address) | U1 items 16–22 |
| So what if you sleep in a shelter? | open question (illustrative situation) | — |
| The 2024 Aadhaar list also accepts a certificate on its standard format | documented (dated) | U1 item 15 |
| signed by a municipal councillor, a tehsildar or a gazetted officer | documented (subset of the listed issuers) | U1 item 15 (i)–(iii) |
| It's not automatic, but it's a real route: ask the councillor's office | editorial takeaway; "not automatic" = the certificate must be issued by the official | U1 |
| To donate essentials in Lucknow, download Help | verified capability | Play listing (2026-11-15) |
Not claimed: that the certificate proves identity (it does not), that every homeless person can enrol, any count, any current-2026 rule. Estimates:
none. Illustrative: the person, door, house, shelter, stamps.

## Storyboard (7 scenes; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–3.75 | Frame 0: closed door "ADDRESS ?"; a person holds a PROOF OF ADDRESS form with an empty box; "NO ADDRESS, NO ACCESS?"; camera eases out. |
| B Home proofs | 3.75–8.85 | "PROOF OF ADDRESS" → a house rises ("ASSUMES A HOME"); ELECTRICITY, WATER and RENT papers fly to it one by one. |
| C Question | 8.85–10.8 | A SHELTER building; the person with the empty form; "?". |
| D Certificate | 10.8–16.15 | The empty form; "UIDAI LIST, 2024"; a CERTIFICATE on the STANDARD FORMAT appears. |
| E Signed | 16.15–21.45 | Seals appear in turn as spoken — COUNCILLOR, TEHSILDAR, GAZETTED OFFICER ("SIGNED BY" → "ANY ONE"); one stamps the certificate, which slots into the form's address box ✓. |
| G Payoff | 21.45–26.9 | Helper and the person walk to a COUNCILLOR office door ("NOT AUTOMATIC" → "A REAL ROUTE" → "ASK THE COUNCILLOR"); the door opens into warm light ✓. |
| I CTA | 26.9–30 | Helper + neighbour with the essentials sack; real Help icon + name; "LUCKNOW". |

## Captions (English; zone x 100..900, y 230..1500)
| Time (s) | Card |
|---|---|
| 0.07–1.64 | No address, no access? |
| 1.71–3.68 | For Aadhaar, there's an official route. |
| 3.75–5.75 | Many proofs of address assume a home: |
| 5.82–8.78 | an electricity bill, a water bill, a rent agreement. |
| 8.85–10.73 | So what if you sleep in a shelter? |
| 10.80–13.34 | The 2024 Aadhaar list also |
| 13.41–16.10 | accepts a certificate on its standard format, |
| 16.17–18.23 | signed by a municipal councillor, |
| 18.30–20.96 | a tehsildar or a gazetted officer. |
| 21.18–23.51 | It's not automatic, but it's a real route: |
| 23.58–25.67 | ask the councillor's office. |
| 26.97–28.67 | To donate essentials in Lucknow, |
| 28.74–29.70 | download Help. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean · AAC-LC 48 kHz stereo · −15.1 LUFS / −1.6 dBTP · captions
x 152–848, y 376–496, 0 violations · frame 0 = hook image (no fade, no caption) · **not listened to** (ASR-only; Indian terms by phonemes). Details: `QA.md`.
