# 15 — Round-02 30 s #01: Hedy Lamarr & George Antheil, frequency hopping

- **Output:** `videos/aarambh/production/30s/2026-11-03-round-02/aarambh-30s-round02-01.mp4`
- **sha256:** `7a3f6da5aa13e91425570956991a585e4efa5d61167a47989dc6dca0bd53b54f`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Recipe:** unchanged accepted feedback-round recipe (`11-production-format.md`). Source: `production/30s/2026-11-03-round-02/src/render.mjs`, started from `production/30s/2026-11-02-feedback-round/src/render.mjs`.
- **Topic history:** not previously covered. Earlier episodes were the lockstitch pilot, Curie, Lovelace and de Mestral.

## Specific feedback applied this round
1. **CTA corrected:** now "Download Aarambh to support livelihood tools.", verified against the live Play listing ("Fund verified livelihood tools and follow their impact."). The card shows the icon, the CTA and the listing line, and no source clutter. Aarambh is never described as a biography or learning app. The rule is updated in `11` (CTA correction).
2. **Kept the accepted style:** many meaningful pages (7), page turns, slide swaps and a hard cut. The magnifier is used once, on a real archival detail. Captions, voice and pacing are unchanged.
3. **Sources:** links are in the repo and `publishing-caption.txt` only; the video carries only short footers.

## Final script (65 words; 26.8 s of speech)
Fitted to 30 s from the brief:
- The year 1942 is shown on screen as the patent stamp rather than spoken.
- The Navy's reason ("too cumbersome") is shown on screen.

| id | start (s) | text |
|---|---|---|
| S1 | 0.30 | Actress Hedy Lamarr and composer George Antheil patented an anti-jamming idea. |
| S2 | 6.25 | A torpedo steered on one fixed radio frequency could be blocked. |
| S3 | 10.40 | Their fix: matching piano-style rolls made sender and receiver hop frequencies together. |
| S4 | 16.30 | The Navy rejected it, but frequency hopping later became common in wireless systems. |
| S5 | 22.00 | Takeaway: a tool from one field can solve a problem in another. |
| S6 | 26.35 | Download Aarambh to support livelihood tools. |

Voice: cached Kokoro-82M ONNX v1.0, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98.

## Sources and claim map (accessed 2026-11-03)
- **[P] Patent:** US 2,292,387, "Secret communication system", inventors Hedy Kiesler Markey and George Antheil, filed 1941-06-10, granted 1942-08-11. https://patents.google.com/patent/US2292387A/en (record and full text). The drawing sheet 2 image is used on screen.
- **[S] Smithsonian Magazine:** Alice George, "Thank This World War II-Era Film Star for Your Wi-Fi", 4 April 2019. https://www.smithsonianmag.com/smithsonian-institution/thank-world-war-ii-era-film-star-your-wi-fi-180971584/
- **[N] National Inventors Hall of Fame:** Hedy Lamarr (inducted 2014). https://www.invent.org/inductees/hedy-lamarr
- **[G] Google Play listing:** https://play.google.com/store/apps/details?id=in.aarambh.app

| claim | source | wording relied on |
|---|---|---|
| Actress Hedy Lamarr and composer George Antheil | N; S | N: "Actress Hedy Lamarr … worked with Hollywood composer George Antheil". S: "an eccentric composer named George Antheil" |
| Patented (1942; patent no. and grant date on screen) | P | "Publication date 1942-08-11 … Application filed 1941-06-10"; inventors "Markey Hedy Kiesler, Antheil George" |
| Born 1914, Austria (plate) | N | "Born Nov. 9, 1914"; "Born in Austria" |
| Antheil born 1900, USA (plate) | not verified against an institutional source this round | **open item:** remove or verify before reuse |
| Anti-jamming purpose; a torpedo on one frequency could be blocked | S; N; P | S: "a device to block enemy ships from jamming torpedo guidance signals". N: "reduced the risk of detection or jamming of radio-controlled torpedoes". P: "especially useful in the remote control of dirigible craft, such as torpedoes" |
| Piano-style rolls; sender and receiver hop together; up to 88 frequencies | P; N | P: "records of the type used for many years in player pianos … 88 rows of perforations … 88 different carrier frequencies, from one to another of which both the transmitting and receiving station would be changed". N: "if both the sender and receiver of the signal hopped frequencies at the same time, the signal was clear" |
| Navy rejected it, "too cumbersome" | S | "when Lamarr and Antheil offered their creation to the U.S. Navy, engineers rejected it, saying it was too cumbersome" |
| 1962: frequency-hopping torpedoes on U.S. blockade ships, Cuba (page 5) | S | "In 1962's Cuban Missile Crisis, all U.S. ships on a blockade line around Cuba were armed with torpedoes guided by a 'frequency-hopping' system." |
| Later common in wireless systems (no Wi-Fi invention claim) | S | "Frequency hopping is often a component of wireless communication systems that allows more users to communicate simultaneously with less signal interference." |
| Takeaway: a tool from one field can solve a problem in another | interpretive: a music technology (player-piano rolls) applied to radio control | P (player-piano records) |
| CTA | G | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:** that they invented Wi-Fi or Bluetooth (the Smithsonian ties later spread-spectrum uses to their work only in a curator's attribution), any money or valuation figures, or personal quotes.

**Portraits:** omitted. Commons/Wikipedia licence checks were rate-limited all session, so typeset name plates are used, per the accepted rule. The real inventor signatures are cropped from patent sheet 2 instead.

## Storyboard (as rendered; times from ASR words)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–5.95 | P1 the inventors | table on | "Hedy Lamarr · actress" plate (0.10); "George Antheil · composer" plate (1.84); real patent signatures brighten and the stamp "U.S. PATENT 2,292,387 · granted Aug. 11, 1942" lands at "patented" (3.96) |
| 5.95–10.00 | P2 the problem | **page turn** | a guidance wave on one channel runs from sender to a moving torpedo. At "blocked" (9.52) a jammer floods the same channel, the wave fades, the torpedo veers, and a "BLOCKED" stamp lands |
| 10.00–12.96 | P3 the real patent drawing (sheet 2: Fig. 7 torpedo path, Fig. 4 record strip) | **slide swap** | the **magnifier (only use)** lands on Fig. 4's perforations (11.56) and tracks along the strip; "record strip: a perforated roll" label |
| 12.96–15.95 | P4 how it worked | **hard cut** on "made" | SENDER and RECEIVER rolls scroll in step past a read line; the same hole lights the same channel on both; a jammer is stuck on one channel; "same holes = same channel" label; one SFX blip per hop |
| 15.95–21.70 | P5 what happened next | **page turn** | "REJECTED · U.S. Navy: 'too cumbersome'" at "rejected" (16.80); the "1962 … Cuba" line at "later" (19.08); three generic wireless devices ping, then "later: common in wireless systems" |
| 21.70–25.90 | P6 takeaway | **slide swap** | a piano-roll strip travels from MUSIC to RADIO and becomes a hopping signal; plate "a music tool solved a radio problem" |
| 25.90–30 | P7 CTA card | **slide swap** | app icon, "Download Aarambh", "to support livelihood tools", the listing line, "Get it on Google Play" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −1.2 dBTP true peak (≤ −1 required), LRA 3.5.
- **Captions:** 12 groups of at most 2 lines. The widest line is 715 px, so the plate runs x 151–929 and y 350–510. No overlaps, and y < 300 is clear.
- **ASR on the export (faster-whisper tiny.en):** the transcript matches the script except for name and spelling errors: "Lammar" for Lamarr, "roles" for rolls, and "RM" for Aarambh. The CTA card shows the name.
- **Word-to-event sync:**
```
actress      spoken 0.0  ->  name plate 1 at 0.10
composer     spoken 1.84  ->  name plate 2 at 1.84
patented     spoken 3.94  ->  patent stamp at 3.96
blocked      spoken 9.64  ->  jammer + BLOCKED at 9.52
rolls/roles  spoken 12.68  ->  loupe on Fig.4 at 11.56
made         spoken 13.04  ->  cut to sync rolls at 12.96
rejected     spoken 16.8  ->  REJECTED stamp at 16.80
later        spoken 19.08  ->  1962 line at 19.08
wireless     spoken 20.6  ->  devices at 20.90
download     spoken 25.96  ->  CTA card at 26.35
```
- **Contact sheets:** `qa/contact_representative.jpg` and `qa/contact_transitions.jpg`.
- **Fixes before the final render:**
  - The magnifier sat above Fig. 4 and showed blank paper; it now tracks the perforations.
  - "RECEIVER roll" overlapped the 88-frequencies line.
  - The signature crop clipped "George Antheil".

## Remaining limits
- **Listening:** I can't listen here; the ASR check is the only voice check.
- **One unsourced fact:** Antheil's "born 1900, USA" on the name plate wasn't verified against an institutional source this round.
- **No portraits:** licence checks were rate-limited, so name plates stand in.
- **Simplified illustrations:** the patent describes 88 frequencies and perforated records; the animation shows 8 channels for legibility.
- **No review folder:** this is a cloud container. The MP4 is attached in chat and pushed; no local Desktop/video-review folder exists here.
