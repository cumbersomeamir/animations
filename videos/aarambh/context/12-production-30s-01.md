# 12 — Production 30 s #01: "Marie Curie: two sciences, two Nobel Prizes"

**Round:** `production-30s-2026-11-02` (user-approved). Format and rules: `11-production-format.md`.

- **Output:** `videos/aarambh/production/30s/2026-11-02/aarambh-30s-production-01.mp4`
- **sha256:** `83cdfef3825d7cb19241a0f02fb117bfeadc5413af33def2129cb5ea825fb986`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Post caption:** `production/30s/2026-11-02/publishing-caption.txt`

## Brief
Archive Light Table, cream/green glowing glass. A public-domain portrait and truthful dated summary cards. The loupe moves from the portrait to a radiation observation (Becquerel's plate) to the two prizes. Ink rays and a gold research thread show continuity across a PHYSICS | CHEMISTRY boundary. No fake letters or certificates, and no invented thoughts or quotes.

## Final script
Minimal edits from the draft:
- "one question" became "one line of research", so the line describes her research rather than inventing her thoughts. Supported by the NobelPrize.org biography.
- A comma was added before "for".

| id | start (s) | text |
|---|---|---|
| S1 | 0.40 | Marie Curie did something no one had done before: she won Nobel Prizes in two different sciences. |
| S2 | 7.50 | In 1903, she shared the Physics prize with Pierre Curie and Henri Becquerel, for research on radiation. |
| S3 | 15.20 | In 1911, she won Chemistry, for her work on radium and polonium. |
| S4 | 20.80 | The lesson is not a motivational slogan. |
| S5 | 23.90 | Look at how one line of research led her across the boundaries between subjects. |

In the TTS text the years are spelled "nineteen oh three" and "nineteen eleven"; captions show 1903 and 1911.
Voice: Kokoro-82M ONNX v1.0, blend 0.7 af_bella + 0.3 am_puck, speed 0.98, en-us. 24.5 s of speech.

## Source-to-claim map (all accessed 2026-11-02)
| claim (narration / screen) | source | wording relied on |
|---|---|---|
| Nobel Prize in Physics 1903, shared with Pierre Curie and Henri Becquerel | https://www.nobelprize.org/prizes/physics/1903/marie-curie/facts/ | page lists "Nobel Prize in Physics 1903 … Laureates Henri Becquerel, Pierre Curie, Marie Curie"; "Prize share: 1/4" |
| "for research on radiation"; card quote "…joint researches on the radiation phenomena…" | same page, prize motivation | "in recognition of the extraordinary services they have rendered by their joint researches on the radiation phenomena discovered by Professor Henri Becquerel" |
| Nobel Prize in Chemistry 1911, "prize share 1/1" | https://www.nobelprize.org/prizes/chemistry/1911/marie-curie/facts/ | "Nobel Prize in Chemistry 1911 … Prize share: 1/1" |
| "for her work on radium and polonium"; card quote "…discovery of the elements radium and polonium…" | same page, prize motivation | "in recognition of her services to the advancement of chemistry by the discovery of the elements radium and polonium, by the isolation of radium…" |
| "did something no one had done before: Nobel Prizes in two different sciences" | https://www.nobelprize.org/prizes/facts/nobel-prize-facts/ (section "Multiple Nobel Prize laureates") | **Derived** from the official list of individuals awarded twice: Bardeen (Physics 1956, 1972), Curie (Physics 1903, Chemistry 1911), Pauling (Chemistry 1954, Peace 1962), Sanger (Chemistry 1958, 1980), Sharpless (Chemistry 2001, 2022). Curie's 1911 award is the earliest second award, and hers are the only pair in two different sciences |
| "one line of research led her across the boundaries between subjects" (interpretive takeaway, not a quote) | https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/ | "The discovery of radioactivity by Henri Becquerel in 1896 inspired the Curies in their brilliant researches and analyses which led to the isolation of polonium … and radium." |
| Becquerel plate shows radiation effects | Wikimedia Commons, File:Becquerel_plate.jpg | description: "Photographic plate made by Henri Becquerel showing effects of exposure to radioactivity." Public domain |
| Portrait | Wikimedia Commons, File:Marie_Curie_c._1920s.jpg | Henri Manuel, c. 1920. Public domain |

## Storyboard (as rendered; times from word timings)
| time (s) | beat | camera / loupe | marks | sound |
|---|---|---|---|---|
| 0–3 | hook | table flickers on; push to the portrait; loupe lands on the face (1.0) | "Marie Curie" name tag | starter clicks, hum, loupe clack |
| 3–8 | setup | loupe lifts; pull back to the whole table | PHYSICS / CHEMISTRY zones; a dashed boundary draws at "two different sciences" (5.1) | pen stroke, glass bell |
| 8–15 | story 1 | glide to the 1903 Physics card, loupe lands at "In 1903" (7.7); it tracks along the laureates line (10.3–11.7), then lifts to Becquerel's plate at "radiation" (12.4) | gold underline under the names; ink rays from the plate; plate-to-card link | paper glides, pen, bell |
| 15–20.3 | story 2 | at "In 1911" a gold line crosses the boundary from the plate to the Chemistry card (15.0); loupe on "Chemistry" (16.9), then on Ra / Po (18.5) | "Chemistry" underline; Ra / Po marks light up gold | clack, ticks, bell |
| 20.3–23 | turn | loupe lifts; pull back to the whole table | name tag returns | glide |
| 23–29 | takeaway | full-table hold | gold research thread traces portrait → plate → Physics card → across the boundary (26.2, ring flash) → Chemistry card | pen stroke, bell |
| 29–30 | end | table dims to 65% | signature only | final bell |

## QA (final exported MP4)
- **ffprobe:**
  - video h264 High, yuv420p, 1080x1920, 30/1, 900 frames counted by decoding, duration 30.000000
  - audio aac LC, 48 kHz, 2 ch, 30.000000
  - format 30.000000
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −1.5 dBTP true peak, LRA 3.6.
- **Captions:** upper centre. Widest line 781 px, so the plate width is 845 px (x 117–963, margins ≥ 117 px). Text ink is about y 362–470, the plate y 336–484.
  - 10 two-line (or shorter) groups timed to ASR words, with no overlapping handoffs.
  - Nothing in the top 0–300 band is text; the portrait's name tag is hidden while the camera is on the cards.
- **ASR, one timing pass on the narration plus one check on the export (faster-whisper tiny.en):** the transcript matches the script except "Nobel" heard once as "no bell" and "Henri Becquerel" heard as "Henry Beckwell". Both are typical small-model misses on names; the captions spell them correctly.
- **Contact sheets:** `qa/contact_representative.jpg` (one frame per second, at 0.5 s offsets) and `qa/contact_transitions.jpg` (beat boundaries).
- **Fix found and made before the final render:**
  - The loupe on the 1911 card magnified empty paper; it now lands on "Chemistry" and then Ra / Po.
  - The name tag entered the top 300 px band during the card beats; it now fades out.

## Remaining limits
- **Listening:** I can't listen to audio here. Intelligibility was checked by ASR only, and the Kokoro pronunciation of "Becquerel" hasn't been verified by ear.
- **Lens optics:** the loupe has no optical distortion (Canvas2D simplification), and the archive objects get no "develop" effect inside the lens.
- **Top band:** while the camera is on the cards, the top of the portrait image sits in the top 300 px. It's background only, with no text.
- **Low-resolution scan:** the Becquerel scan is small (492x397), so it's displayed at about 330 px wide and is soft when magnified.
