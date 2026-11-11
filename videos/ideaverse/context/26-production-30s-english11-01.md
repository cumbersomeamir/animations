# 26 — Production 30s english11-01 (English): "Name a song you can only hum"

Batch 2026-11-09-english-11 (user-approved). Workspace `production/30s/2026-11-09-english-11/` · deliverable `ideaverse-30s-english11-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed; english-09 and english-10 finished first, in order).
Style: accepted pilot-01 DOCKET newsroom lesson style via the latest renderer (english-10 src). Meme renderer not used.

## Topic decision (history checked: context/09, 12–25)
- Suggested: "remove an unwanted passer-by from a holiday photo; the filled background is generated, not recovered;
  keep the original". This repeats **hindi03-01** (context/17: Magic Eraser, "AI predicts what would be there… the filled
  part is only a guess") — the same reason english-08 swapped it (context/23). So a fresh everyday-AI subject was chosen.
- Chosen: **hum to search** — a real, documented phone feature (Google app / Search widget "Search a song"), explained
  without jargon (the hum becomes the shape of the melody, compared with songs), with a mistaken top match and a
  practical rule (play a few seconds of each before trusting the name). Not covered by any earlier episode.
- Naming "the Google app" in narration/copy describes the real feature being taught (as hindi03-01 named Magic Eraser);
  the CTA and app identity remain Ideaverse only.

## Script (English, 71 words) — placements from ASR word timings (narration/words.json)
| id | start (s) | line |
|---|---|---|
| (hook) | 0.06–1.0 | DOCKET hums an original 6-note tune (synthesized; not a real song); no words, no caption |
| s1 | 1.10 | A tune stuck in your head, but no words? Just hum it. |
| s2 | 4.60 | In the Google app, tap Search a song, then hum for ten to fifteen seconds. |
| s3 | 9.40 | It turns your hum into the shape of the melody and compares it with songs. No perfect pitch needed. |
| s4 | 16.00 | You get the likeliest matches, and the top one can be wrong. |
| s5 | 20.20 | So play a few seconds of each before you trust the name. |
| s6 | 26.60 | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en on first synthesis (numbers come back as digits "10"/"15"; the
checker maps them). Captions show "10 to 15 seconds".

## Facts → sources (accessed 2026-11-10)
| claim | source |
|---|---|
| in the Google app, tap Search a song, hum for 10–15 seconds | Google blog, "Song stuck in your head? Just hum to search" (Oct 2020), https://blog.google/products/search/hum-to-search/ — "open the latest version of the Google app or find your Google Search widget, tap the mic icon and say 'what's this song?' or click the 'Search a song' button. Then start humming for 10-15 seconds." (then: "available in English on iOS, and in more than 20 languages on Android") |
| it turns your hum into the shape of the melody and compares it with songs | same post — "our machine learning models transform the audio into a number-based sequence representing the song's melody … take away all the other details, like accompanying instruments and the voice's timbre and tone"; "We compare these sequences to thousands of songs". |
| no perfect pitch needed | same post — "you don't need perfect pitch to use this feature" · Google Research, "The Machine Learning Behind Hum to Search" (Nov 2020), https://research.google/blog/the-machine-learning-behind-hum-to-search/ — hummed "pitch, key, tempo or rhythm may vary"; training varied "the pitch or tempo of the sung input". |
| you get the likeliest matches; the top one can be wrong → play to check | blog — "We'll show you the most likely options based on the tune. Then you can select the best match … listen to the song". (A ranked list of likely options implies the first is not guaranteed.) |
| Ideaverse | Name + current Play icon only. No claim that Ideaverse identifies songs. |
Song titles, percentages and screens are fictional EXAMPLEs; the tune is original.

## Storyboard (cues.js)
1. 0–4.5 two-shot from frame 0: DOCKET hums (sound + head sway), each note flies from DOCKET onto a staff card titled
   "What's this song?"; "but no words?" → blank lyrics + "?"; "Just hum it" → nod + "just hum it" chip.
2. 4.5–9.2 phone (EXAMPLE): Search field + "Search a song" button, tap ripple; "Listening…" pulse with a progress ring
   and 10 s / 15 s marks, "hum for 10–15 seconds".
3. 9.2–15.85 card: YOUR HUM wobbly pitch line → clean melody shape; three fictional songs slide in and are compared
   (74 %, 68 %, 41 %); "No perfect pitch needed" → the shape lifts higher ("higher pitch, same shape").
4. 15.85–19.9 card flips to "Likely matches"; push-in on the top row → amber ring "can be wrong".
5. 19.9–25.4 phone results: play #1 → "✕ not it"; play #2 → the hummed tune plays (after the narration) → "✓ that's it".
6. 25.4–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app".

## QA / status — DELIVERED 2026-11-11
- Output: production/30s/2026-11-09-english-11/ideaverse-30s-english11-01.mp4 · sha256 cab458f8…8b59 (QA.md in that folder).
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.5 dBTP.
- English ASR on the final MP4: all six lines MATCH, no word outside its caption; captions SPEC PASS; top 300 px text-free.
- Limitation: ASR-only listening check.
