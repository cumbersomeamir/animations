# 23 — Production 30s english08-01 (English): "How your phone fakes a blurry background (portrait mode)"

Batch 2026-11-07-english-08 (user-approved). Workspace `production/30s/2026-11-07-english-08/` · deliverable `ideaverse-30s-english08-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed before edits; tree clean, english-07 already delivered and pushed).
Style: accepted pilot-01 DOCKET newsroom lesson style via the latest renderer (english-07 src). Meme renderer not used.

## Topic decision (history checked: context/09, 12–22)
- Suggested: "remove a stranger from a holiday photo and invent the background; generated fill ≠ recovered scene;
  edited pictures are not evidence". This repeats **hindi03-01** (context/17): remove a distraction with Magic Eraser,
  "AI predicts what would be there and fills the space", "the filled part is only a guess, check edges and shadows".
  The meme round had already rejected photo-editing as a repeat (context/18). So, per the brief, a fresh subject in the same
  everyday-AI-mystery genre was chosen.
- Chosen: **portrait mode** — a tiny phone lens can't make that blur; AI finds the person, the phone estimates depth, and
  software adds blur by distance. Same original → processed → reveal comparison grammar the brief asked for, a concrete
  "computed, so check it" lesson, and a practical payoff (turn the blur down or off afterwards). No earlier episode covers
  portrait mode, depth maps or bokeh (grep of context: none).

## Script (English, 71 words) — placements from ASR word timings (narration/words.json)
| id | start (s) | line |
|---|---|---|
| s1 | 0.20 | A tiny phone lens can't really blur a background like this. So how? |
| s2 | 4.60 | Portrait mode uses AI to find the person, then estimates how far away everything else is. |
| s3 | 11.00 | Then software adds the blur: farther means blurrier. |
| s4 | 14.55 | Frizzy hair or sunglasses can fool it, so check the edges. |
| s5 | 19.20 | And since the blur is added later, you can often turn it down, or off, afterwards. |
| s6 | 26.60 | Download the Ideaverse app. |
Wording change: "A phone lens this tiny can't blur…" → ASR heard "lends" (base.en and small.en) → reworded to
"A tiny phone lens can't really blur…", transcribed exactly by both models.

## Facts → sources (accessed 2026-11-06)
| claim | source |
|---|---|
| a small phone lens can't really blur the background | Google Research blog, "Portrait mode on the Pixel 2 and Pixel 2 XL smartphones" (M. Levoy, Y. Pritch, 17 Oct 2017), https://research.google/blog/portrait-mode-on-the-pixel-2-and-pixel-2-xl-smartphones/ — "mobile phone cameras have a small, fixed-size aperture, which produces pictures with everything more or less in focus." |
| AI finds the person | same post — "we have trained a neural network … that looks at the picture, and produces an estimate of which pixels are people and which aren't … trained on almost a million pictures of people". |
| then estimates how far away everything else is | same post, Step 3 "From dual pixels to a depth map" (stereo from the two halves of the lens → depth map; "Lighter means closer to the camera"). Narration does not say the depth step itself is AI. |
| software adds the blur; farther = blurrier | same post — background features "blurred in proportion to how far they are from the in-focus plane"; "artificially blurring pixels … is called synthetic shallow depth of field". |
| frizzy hair / sunglasses can fool it | same post — album of "hard cases, like people with frizzy hair"; tips: "Remove dark sunglasses, floppy hats, giant scarves, and crocodiles"; "problems in these inputs can produce artifacts in the result". |
| you can often turn it down or off afterwards | Apple iPhone User Guide, "Edit Portrait mode photos on iPhone", https://support.apple.com/guide/iphone/edit-portrait-mode-photos-iph310a9a220/ios — "drag the Depth Control slider … to increase or decrease the background blur effect"; "You can remove the portrait effect … tap Portrait Off." · Google Photos Help, "Edit your photos" (Android), https://support.google.com/photos/answer/6128850 — "select features like portrait blur". "often" because support varies by phone/app. |
| Ideaverse | Name + current Play icon only. No claim that Ideaverse edits photos or offers portrait mode. |
Visual "mistakes" (frizz curls and sunglasses blurred) and the edit-screen UI are illustrative EXAMPLEs, not a real app.

## Storyboard (cues.js)
1. 0–0.9 hook close: a mint scan line sweeps across the fictional portrait (park, string lights, curly hair, sunglasses);
   behind it the background goes soft and the lights bloom into bokeh discs; tag PORTRAIT MODE.
2. 0.9–4.4 two-shot: DOCKET holds its phone back-to-camera; amber ring + "TINY LENS" on the lens ("tiny phone lens");
   points at the blurred photo ("like this"); head tilt + "?" ("So how?").
3. 4.4–10.6 easel: card flips to ORIGINAL (all sharp); mint AI trace around the person → white person mask + "AI: person";
   DEPTH GUESS: ground (light) → trees → sky (dark) recoloured near→far with a NEAR–FAR legend; the frizz and the dark
   sunglasses are left out of the white mask (foreshadowing).
4. 10.6–14.25 BLUR ADDED: blur grows per depth with near/mid/far meters; "Farther" → far bar turns amber; "blurrier" → bokeh pulse.
5. 14.25–18.6 close-up: amber rings + chips "hair blurred" / "glasses blurred"; dashed mint arc traces the edge ("check the edges").
6. 18.6–25.4 phone insert, EXAMPLE "Edit photo": the blur layer lifts off the sharp photo ("added later"); Blur slider
   down ("turn it down"); Portrait effect OFF → all sharp ("or off"); back ON at low blur, "✓ adjusted after the shot".
7. 25.4–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app".

## QA / status — IN PROGRESS (see production/30s/2026-11-07-english-08/QA.md when delivered)
- Pre-render ASR on the mix (base.en): all six lines MATCH; no word outside its caption.
