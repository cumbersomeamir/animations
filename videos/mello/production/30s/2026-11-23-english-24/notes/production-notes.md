# Production notes: mello-30s-english24-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** applied with the store-sampled palette (`context/22`) and an original soothing pad, felt-piano and air bed under the voice.
- **Topic swap:** affect labelling (the brief's proposal) is english20-01 (`context/30`). This episode covers the testing effect / retrieval practice (`context/34`, "Topic decision"); it differs from batch23 (incubation, `context/33`) in question, setting and mechanism.
- **Sources:**
  - Roediger & Karpicke 2006, Karpicke & Roediger 2008, Rowland 2014 and Dunlosky et al. 2013 (PubMed abstracts);
  - Sigayret et al. 2026 (PMC full text).

## Retained (approved setup)
The source is a copy of `../../2026-11-21-english-23/project/` (renderer, audit, audio chain, `no_jump_between_cuts`). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (safe-zone audit, caption band x 100–900, y 280–460), the room, the approved faceless performer and `poseStanding`.
- The camera helper, caption mechanics and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain (`BED_GAIN` 0.375).

## New for this episode
- **Setting:** a reading corner. A low lilac bookcase with violet, gold, deep-violet and ink spines; no desk.
- **Notebook:** two canvas pages with grey text lines and gold highlighter on a violet cover. The left half folds over on a hinge to close; a half-open peek on "check".
- **Memory strips:**
  - S1–S2: lilac strips lift off the pages and drift sideways as they fade.
  - S5: lilac (reread) strips stream in bright, then fade and sink; the gold (recalled) ones brighten and stay.
- **Recall card:** a gold card settles onto the closed notebook. Lines are written with a pencil; one dashed gap fills violet when the missed line flies in from the peeked notes.
- **Study cards:**
  - "ONE STUDY / students learning a prose passage": "reread" (book icon) and "tried recalling" (page and pencil);
  - "REMEMBERED LATER": paired bars at 5 minutes (reread taller) and 1 week (recall taller);
  - direction only; no fade-out before the cut.
- **Sound:**
  - Fmaj7 → Dm7 → Am7 → Cadd9, with felt notes on the 1-week result, on "recall lasted" and on the filled gap;
  - SFX: page turns, a soft falling air as the lines drift off, card ticks, a fade swell plus a glass note, the notebook clap, pencil strokes, a paper peek and a glass note on the fill.

## Fix log (stills and audit before the full render)
1. **First stills:**
   - The strips floated up into the caption band, so they now rise to head height and drift sideways. They rise higher only in S1, still below the band.
   - In S6 his head was under the caption. The camera moved to 2.6 m and the clipboard is held higher and tilted toward the camera.
   - The strips were enlarged for frame 0.
2. **ASR on the first takes:**
   - "tried to recall it" → "try to recall it"; "recalling won" → "recalling one"; "not every one" → "not everyone".
   - The lines were rephrased ("or tried recalling it", "recalling did better", "though not all") after testing the alternatives.
   - `asr_check.py` now treats in-word hyphens as spelling variants ("re-reading"), and "5" as "five".
3. **Safe-zone audit:** 2 issues → 2 → 0.
   - The recall card first slid in from his hand through the right rail, then (sliding from below) through the bottom zone.
   - It now settles onto the cover from just above and in front, growing from 70 % size.
4. **Cut contrasts on stills:** 35.8 / 41.2 / 18.5 / 67.9 / 36.6 / 25.5. In-shot motion: 0.9 (clap), 1.1 (card arrival), 0.7 (fill).
5. **ASR on the mix:** exact on all 7 lines (punctuation and the hyphen aside). Voice 13.1 dB over the bed.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-23-english-24/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english24-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- ASR punctuates the hook "Still rereading your notes." with a full stop; whether it sounds like a question needs a human ear.
- Roediger & Karpicke 2006 was read as an abstract, so no percentages are shown or spoken.
- The memory strips, the card lines and the filled gap are illustrations.
