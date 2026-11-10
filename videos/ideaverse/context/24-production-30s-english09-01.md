# 24 — Production 30s english09-01 (English): "Why photo search finds a dog no file name mentions"

Batch 2026-11-08-english-09 (user-approved). Workspace `production/30s/2026-11-08-english-09/` · deliverable `ideaverse-30s-english09-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed before edits; english-08 delivered + pushed first).
Style: accepted pilot-01 DOCKET newsroom lesson style via the latest renderer (english-08 src). Meme renderer not used.

## Topic check (history: context/09, 12–23)
- Suggested subject (search a messy photo library by what is in the pictures) is new: no earlier episode covers photo
  search, tags or recognition (round02-01 is copying text from a photo; english-08 is portrait blur). Used as suggested.
- No jargon in the script: "looks at each picture and tags what it sees", "matches your word to those tags".

## Script (English, 66 words) — placements from ASR word timings (narration/words.json)
| id | start (s) | line |
|---|---|---|
| s1 | 0.20 | None of these photos is called dog. So how did search find him? |
| s2 | 4.80 | Your photos app looks at each picture and tags what it sees: dog, beach, cake. |
| s3 | 10.30 | Search matches your word to those tags, not only file names. |
| s4 | 14.75 | Mistakes happen: this goat got tagged as a dog. |
| s5 | 18.60 | So search for what was in a lost photo: a receipt, a beach, a cake. |
| s6 | 26.60 | Download the Ideaverse app. |
Wording: s3 was "not to file names" → changed for accuracy (apps can also match file names/captions/text) to "not just to
file names" → base.en heard "not just a file names" → final "not only file names" (exact in base.en + small.en).

## Facts → sources (accessed 2026-11-08/10)
| claim | source |
|---|---|
| search works without anyone labelling the photos; file names say little | Google Research blog, "Improving Photo Search: A Step Across the Semantic Gap" (C. Rosenberg, June 2013), https://research.google/blog/improving-photo-search-a-step-across-the-semantic-gap/ — "you can now easily search your own photos without having to manually label each and every one of them … uses the visual content of an image to generate searchable tags"; "in the case of photos, there is typically little or no information beyond the pixels". |
| the app tags what it sees (dog, beach, cake) | same post — "search across thousands of concepts like a flower, food, car, jet ski, or turtle" · Apple Machine Learning Research, "A Multi-Task Neural Architecture for On-Device Scene Analysis", https://machinelearning.apple.com/research/on-device-scene-analysis — "Visual content search … serviced through a fixed taxonomy image tagger. Synonyms of tags in the taxonomy are searchable"; "Detecting food, mountains, beaches, birthdays, pets …"; runs fully on-device. |
| search matches your word to those tags, not only file names | the two sources above (tags combined with "other sources like text tags and EXIF metadata"; synonyms searchable). |
| mistakes: a goat tagged as a dog | Google post, "Reasonable errors" — "confusing things that look similar … for example, mistaking a goat for a dog". |
| search for what was in a photo (receipt, beach, cake) | Apple iPhone User Guide, "Search for photos and videos on iPhone", https://support.apple.com/guide/iphone/search-for-photos-and-videos-iph392d77d5f/ios — search field accepts "Category (beach or sunset, for example)", "Text …"; Apple guide "Find receipts, QR codes, recently edited photos, and more" (TOC); Google Photos Help, "Search by people, things & places in your photos", https://support.google.com/photos/answer/15235862 — classic search examples incl. "A photo of a pet's vet invoice by the vet clinic's name". |
| Ideaverse | Name + current Play icon only. No claim that Ideaverse searches photos. |
Photos, file names, results and phone screens are fictional EXAMPLEs drawn in code.

## Storyboard (cues.js)
1. 0–2.3 hook (easel): messy 12-photo grid with IMG_####.JPG names; "dog" typed (0.15–0.5); the grid reshuffles, 4 matches
   (3 dogs + a goat) fly to the top, the rest dim; amber rings on the matches' file names + "no file name says “dog”".
2. 2.3–4.6 two-shot: DOCKET looks at the result, points, head tilt + "?" ("So how did search find him?").
3. 4.6–10.2 card flips to the tagging view: scan bars sweep three photos ("looks at each picture"), tag chips pop
   ("tags what it sees"), main tags dog / beach / cake light up on the words.
4. 10.2–14.6 "dog" typed in the search bar → line to the "dog" tag ✓ ("matches your word to those tags"); dashed line to
   the file name → "✕ no match" ("not only file names").
5. 14.6–18.45 results for "dog" (4); camera pushes in on the goat: amber ring, "tagged: dog", "it's a goat".
6. 18.45–25.4 phone Photos search (EXAMPLE): "receipt" → 2 results, "beach" → 2, "cake" → 2, then the forgotten receipt
   opens full screen + "✓ found it".
7. 25.4–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app".

## QA / status — IN PROGRESS
- Pre-render mix ASR: all lines MATCH, no word outside captions (after moving query ticks out of "a beach").
