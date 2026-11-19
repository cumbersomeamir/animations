# Production notes: mello-30s-english22-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`, identical to the current store icon (checked 2026-11-11).
- **Live feedback "No, match the colors of the published app, soothing audio also add":** applied with the store-sampled palette (`context/22`) and an original soothing pad, felt-piano and air bed under the voice.
- Topic swap: third-person self-talk ("What should Alex do next?") is english14-01 (`context/24`), so this episode covers self-compassion after a mistake (`context/32`).
- Source: Breines & Chen 2012 (PubMed abstract; full text closed access).

## Retained (approved setup)
The source is a copy of `../../2026-11-18-english-21/project/` (renderer, audit, audio chain). The scene is spliced onto the english15 room scene. Reused unchanged:
- `render.mjs` (safe-zone audit), the room, the faceless performer rig and `poseStanding`.
- The camera helper, caption mechanics and the dark in-app card.
- The narrator (synthesized fresh), the soothing air bed and the master chain.

## Changed for this brief
- **Caption band y 280–460:** `scene/index.html` `#cap` is now an 800 × 180 px box at top 280 (x 100–900). `render.mjs` audits the caption text against x 100–900, y 280–460, and flags anything crucial above y 274. Caption sizes dropped to fit two lines in 180 px: 100 px at frame 0, 96 px for one-liners, 88 px for two-liners.
- **A different original character:** the same rig restyled — soft lilac figure `#9F8CE8`, indigo hair `#2E2468` with a bun, a gold scarf (torus and tail).

## New for this episode
- **The oversized thought:** a camera-facing billboard cloud (canvas circles, `#B9A4FF` outline, near-white fill) 3.9 × 4.5 m behind her. It shrinks to 0.13× beside her head over 16.3–18.3 s and fades out under the lock-up.
- **The replay:** 10 dark zig-zag tube scribbles (`#3B2F6E`) orbiting her, faster on "harsh"; in S5 they turn into soft lilac and gold balls.
- **The message screen:** "fine. whatever." with "Read 9:12 PM"; later she types "Sorry, that came out wrong." and it is sent (gold "Sent").
- **The card:** dark "ONE EXPERIMENT / motivation to make amends" (other groups vs kind view arrows), then from a low angle "AFTER FAILING A TEST / time spent studying for the retest" (equal bars, then the kind-view bar grows). Direction only, no values. No fade-out before the cut.
- **Sound:** Em7 → Cmaj7 → Am7 → Gadd9 pad with felt-piano notes; a glass blip for the sent message, a low air swell for the harsh replay that eases as the thought softens, ticks for the card and typing, a soft "sent" chime. `BED_GAIN` 0.36 (13.0 dB under the voice).

## Fix log
1. **Framing iterations on stills:** the cloud first sat inside the caption band and read as a washed-out translucent shape; it became an outlined, near-opaque billboard placed lower and behind her. Scribbles and message were kept clear of the caption band and the right rail.
2. The pre-render audit (300 samples) found 0 issues. Cut contrasts on stills: 45.4 / 49.9 / 17.7 / 70.3 / 26.3 / 28.8.
3. ASR is exact on all 7 lines, on the narration and on the mix.

## Commands
```bash
cd videos/mello/project && ./setup.sh
```

```bash
cd videos/mello/production/30s/2026-11-19-english-22/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh && node thumbnail.mjs ../mello-30s-english22-01-thumbnail.png
```

## Known limitations
- I can't listen to audio. The narration is verified only by a per-line ASR round-trip, and the bed only by level measurements. Someone should give it a listen.
- The source is read as an abstract only (no effect sizes); the card shows direction only.
- The apology is illustrative advice, not something the study tested.
