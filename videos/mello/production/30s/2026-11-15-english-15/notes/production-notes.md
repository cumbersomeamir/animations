# Production notes: mello-30s-english15-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- Palette: store-sampled values from `context/22`.
- Sources: Pronin et al. 2008; Peters & Büchel 2010; Hershfield et al. 2011; Rung & Madden 2018 (PubMed abstracts). Details are in `context/25-episode-future-self.md`.
- New rule persisted: `context/10` section 9 (first frame).

## Retained (approved setup)
The source is a copy of `../2026-11-14-english-14/project/`. Reused unchanged:
- `render.mjs`, the room, the rig and camera helper, caption mechanics (x 100–900) and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## New for this episode
- **First frame:** the thumbnail composition plus the curiosity words as the opening caption; hook audio at 0.15 s.
- **Props:**
  - a second figure: the same rig rebuilt in a lighter, glowing material, driven by `poseStanding()` like the main figure;
  - a TODAY | TOMORROW calendar (canvas) whose tomorrow page fills with a vivid picture;
  - a cupcake, a gold star, a balance with two pans, running shoes, a door and a bench.
- **In-scene text:** calendar "TODAY / now", "TOMORROW / 7:00 run"; card "ONE EXPERIMENT", "a disgusting drink", "now-you", "future-you", "a stranger", "="; label "shoes by the door".
- **Sound:**
  - a chime on "=";
  - wooden knocks as the balance tips each way;
  - an airy glide as tomorrow fills in;
  - a tick at the hand-over and a soft thud as the shoes are set down;
  - felt-piano notes over the soothing air bed;
  - `BED_GAIN` 0.50 puts the bed 13.2 dB under the voice.
- **Audit (`render.mjs`):**
  - captions are checked against the user zone (x 100–900, y 300–1500);
  - crucial objects are checked against the caption box;
  - both heads are checked.

## Fix log
1. Script: 70 words, hook audio at 0.15 s, CTA at 26.80 s; narration ASR CER 0 on all 6 lines.
2. Frame 0: the figures were cut at the edges and the calendar touched the big caption. The camera pulled back (d 4.8) and was raised (y 1.26).
3. S2: the card sat behind today-you's raised hand; it moved forward (z 0.95). The labels were respaced so they don't touch.
4. S3: the first near/far perspective shot was blocked by the calendar and put the cupcake at the frame edge. It was replaced by a balance that tips to "now" as "later" recedes, then tips back in S4.
5. S3/S4: the "now"/"later" pills fell in the bottom UI zone. They were removed; the calendar pages already label the two rewards.
6. S5: the head sat behind the captions, the calendar touched the right rail, and the door label went past the left margin. The aim was adjusted (y 1.21, d 3.8), and the label moved and now fades before the pull-back.
7. Pre-render audit: 300 samples, 0 issues.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-15-english-15/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english15-01-thumbnail.png
```

## Known limitations
- I can't listen to audio; the narration is verified only by a per-line ASR round-trip, and the soothing bed only by level measurements. Someone should give it a listen.
- Pronin et al.'s full text is closed, so the card shows only "future-you = a stranger" (no direction or amounts). The balance, star and cupcake are illustrative.
