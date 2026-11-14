# Production notes: mello-30s-english14-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`.
- Topic swap: the proposed Zeigarnik / next-action topic overlaps english12-01, so this episode covers Solomon's paradox and self-distancing (`context/24`).
- Sources: Grossmann & Kross 2014; Kross et al. 2014 (PubMed abstracts).

## Retained (approved setup)
The source is a copy of `../2026-11-13-english-13/project/`. Reused unchanged:
- `render.mjs`, the room, desk and rig, the camera helper, caption mechanics inside x 100–900 and the audit.
- The dark in-app card, the note card, the narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **Props:** two torus-knot "threads" that can loosen into a calm ring (rebuilt per frame from lerped points); a speech bubble.
- **In-scene text:** "a friend's", "yours"; card: crown + "Solomon's paradox", then "wise reasoning" with "someone else's" / "your own" bars; bubble "Why am I nervous?" → "Why is Alex nervous?"; note "Alex, / what would you tell a friend?".
- **Camera:** a literal pull-back from the card on "from a distance".
- **Choreography:** looks from one knot to the other; nervous clasped hands that open; writes the note.
- **Sound:**
  - airy glides as knots loosen and as the gap closes;
  - a soft chime for the name, a paper whisk as "I" becomes "Alex", pencil scratches;
  - felt-piano notes over the soothing air bed;
  - `BED_GAIN` 0.42 puts the bed 13.4 dB under the voice.

## Fix log
1. ASR misheard "…in self-talk helped too…"; the line was rephrased and ASR is CER 0 on all 7 lines.
2. The knots and their labels were at the frame edges and in the right rail; they moved inward, higher and smaller, and stay clear of the caption band.
3. The pull-back first started too close (card cut) and ended with the card past the left margin; it was re-aimed (d 3.3 → 4.1).
4. The self-talk bubble was cut at the right edge and then past the left margin; it was centred above his head at 0.75 scale.
5. Thumbnail: the words overlapped the knots, so the camera was lowered so the knots sit under the words.
6. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-14-english-14/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english14-01-thumbnail.png
```

## Known limitations
- I can't listen to audio; the narration is verified only by a per-line ASR round-trip, and the soothing bed only by level measurements. Someone should give it a listen.
- The knots, bar lengths and bubble are illustrative. "Alex" is an example name.
