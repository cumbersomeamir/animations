# Production notes: mello-30s-english11-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources: Maas, de Ridder, de Vet & de Wit (2012), *Psychology & Health*, PubMed abstract; background: Hollands et al. (2019), Cochrane review, PubMed abstract. Details and the measured / illustrative split are in `context/21-episode-environmental-friction.md`.

## Retained (latest accepted setup)
The source is a copy of `../2026-11-09-english-10/project/`. Reused unchanged:
- `render.mjs` (headless Chromium + three.js 0.170.0 + ffmpeg), the room, desk, lamp, mug, pencil, plant, stool, performer rig and camera helper.
- The English caption treatment, the lock-up "On Google Play", the accepted English voice (synthesized fresh) and the audio synth/master chain.

## New for this episode
- **Set:** a bed (birch base, white sheet, lilac duvet, pillow, headboard) and a nightstand left of the desk; a phone with a canvas screen (notifications → feed → charging), a charging pad with a lavender ring, an ochre hardcover book whose cover opens, a dashed outline left where the phone was.
- **In-scene text:** "across the room"; card: "one study", "you", "20 cm" → "70 cm", "fewer people ate any"; "what changed?", "20 cm", "70 cm", "more effort"; "friction", "easy", "harder"; "charging"; "the easy reach".
- **Choreography:** seated on the bed edge the performer picks up the phone and scrolls (S1–S3); standing at the desk he sets the phone on the charger and takes the book (S4); back on the bed edge he sets the book where the phone was, then lifts it and opens it to read (S5).
- **Sound:** soft notification buzzes, a tick as the phone lands on the pad, a small chime when charging starts, the book lifted and set down, the cover opening; felt-piano notes on the beats. `BED_GAIN` 0.40 (13.5 dB under the voice in the pre-render mix).

## Fix log
1. Script: 71 words, CTA at 26.30 s; narration ASR CER 0 on all 7 lines ("metre"/"meter" normalised).
2. S1: an over-the-shoulder opening hid the phone and let the head fill the frame; replaced by a front-right view of the performer and the lit phone that rises and pulls back on "Your book isn't" to reveal the book on the desk. The book, pad and standing spot moved so the reveal frames the book and the hands still reach in S4.
3. S2/S3: the card faced away from the key light and read grey; the panel got a small emissive lift. The card moved above the bed and the cameras moved in front of the performer (the earlier rear views made the phone look like a phone call).
4. Card reached the caption band and the right rail; lowered (y 1.64), cameras pulled back (d 3.5/3.45) and re-centred.
5. S5 opens with the same framing as S1 (bookend), so the book visibly replaces the phone; the head stays below the caption band.
6. "the easy reach" and "across the room" labels resized and moved inside the margins.
7. Pre-render audit: 300 samples, 0 issues.
8. Render 1 failed one QA check, `moving_every_second`: after the S5 pull-back ended at 27.0 s, seconds 27–30 were almost static (mean frame difference 0.005–0.012).
   - Fix: a slow camera drift (`k2`) under the lock-up from 27.0 s to the end.
   - A tail-only re-render spliced onto render 1 gave non-monotonic timestamps at the join, so it was discarded.
   - The final file is a clean full render 2. Render 1 outputs were kept out of the repo.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-09-english-11/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio; intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- The study is about snacks; the phone/book swap applies the idea and is presented as a tip. The card's bars and the room schematic are illustrative.
