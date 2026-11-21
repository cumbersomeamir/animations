# Production notes: mello-30s-english23-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** applied with the store-sampled palette (`context/22`) and an original soothing pad, felt-piano and air bed under the voice.
- Topic: as requested (creative incubation); not covered in context 11–32 (`context/33`, "Topic decision").
- Sources:
  - Baird et al. 2012 (PubMed abstract);
  - Sio & Ormerod 2009 (PubMed abstract);
  - Murray et al. 2021 (abstract via Semantic Scholar);
  - Teng & Lien 2022 (PMC full text);
  - McDaniel et al. 2025 (PubMed abstract).

## Retained (approved setup)
The source is a copy of `../../2026-11-19-english-22/project/` (renderer, audit, audio chain, the `no_jump_between_cuts` QA check). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (safe-zone audit, caption band x 100–900, y 280–460), the room and desk, the approved faceless performer and `poseStanding`.
- The camera helper, caption mechanics and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **Performer:** the approved performer in store-palette tones (as english20/21). Batch22's restyled character is not used.
- **Puzzle pieces:** two extruded jigsaw pieces with classic knob edges (`pieceOutline`):
  - violet A: blank left, tab right; gold B: tab left, blank right;
  - tab meets tab, so they cannot fit until B is turned 180° in its own plane.
- **The wall's third shape (S1 only):** a lilac canvas shape with a gold outline: the one bigger piece the two make once B is turned. It is the frame-0 hint, and S7 answers it.
- **The card:**
  - "ONE STUDY / new uses for everyday objects": chips TRY 1 (mug icon, list), "in between ?", TRY 2 ("same problems");
  - then, from a low angle, "IMPROVEMENT ON TRY 2": the gold "easy task" bar pulls ahead of "hard task, rest, or no break";
  - direction only, no values; no fade-out before the cut.
- **S5:** an easy task (a ball tossed hand to hand) and a gold dotted trail drifting from her head; on the caveat it greys and a "?" appears inside its loop.
- **S6–S7:** a "?" sticky note on piece A; she waters the desk plant; she turns B around and it clicks in (a small radial glow at the seam).
- **Sound:**
  - Dm9 (stuck) → Fmaj7 → Am7 → Cadd9, with felt-piano notes;
  - SFX: soft bumps on each shove, two knocks as the pieces are set down, card ticks, ball pats, a faint airy rise (wandering) and settle (doubt), a paper tap, a water trickle, a soft click and a glass note;
  - `BED_GAIN` 0.375 (13.0 dB under the voice).

## Fix log (stills and audit before the full render)
1. **First stills:**
   - The wall shape was huge and behind the caption, and it was cut off.
   - The arms crossed: at yaw π her left is world +x, so the hand targets were swapped.
   - Her head sat under the caption in the close shots, and the seam glow was a flat rectangle.
   - The wall shape sat behind the lock-up, and the final pieces were in the bottom zone.
   - Fixes: the wall shape is smaller, lower and only in S1; the hands are swapped; the shots are reframed with the distance and aim computed against the y 280–460 band; the glow is a radial sprite.
2. **S5:** the "?" first rose into the top UI area; it now sits inside the trail's loop. A stray first trail dot showed before the wandering began (`f <= 0`); it is fixed.
3. **Safe-zone audit:** 134 issues → 8 → 0.
   - Piece A was past the left margin in S2.
   - The pieces were in the bottom zone and the right rail during the S7 spin.
   - Fixes: S2 reframed; B no longer drifts right and forward while turning; S7 opens at 4.1 m.
4. **Cut contrasts on stills:** 22.6 / 22.9 / 18.6 / 65.1 / 32.4 / 33.2. In-shot motion: 3.8 (set-down), 1.1 (spin), 0.1 (click).
5. **ASR:** exact on all 7 lines (narration and mix).

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-21-english-23/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english23-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- Baird 2012 was read as an abstract (closed access); its design details come from Teng & Lien 2022. No effect sizes are shown.
- The puzzle, ball toss and watering are illustrations; the study's tasks were the Unusual Uses Task with 0-back / 1-back / rest / no-break conditions.
