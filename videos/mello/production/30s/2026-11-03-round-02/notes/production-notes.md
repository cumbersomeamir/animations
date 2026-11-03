# Production notes: mello-30s-round02-01

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Grounding guidance: NHS inform; the Cwm Taf psychological therapies grounding pack (hosted by NHS Forth Valley); the Hull NHS 5-4-3-2-1 leaflet. Quotes and links are in `context/12-episode-grounding-break.md`.

## Retained, not redesigned (sheet feedback: Satisfied = Yes)
- The source is a copy of the accepted `../2026-11-02-feedback-round/project/`. These are unchanged:
  - `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. The only change is the episode's safe-zone checks.
  - The room, props, performer rig, lighting, camera helper, caption CSS/fit/fade, lock-up and fonts (Instrument Serif, Inter).
  - The Kokoro voice settings and the audio mix chain.
- New for this episode:
  - Props: desk clock and three navy thought chips.
  - Mechanism visuals: lavender rings and number tabs.
  - Motion: choreography and a five-shot list, including a crane with a leading aim point and an optional second keyframe.
  - Captions: progressive caption segments, so each listed item appears as it is spoken.
  - Sound: chord plan and action SFX.

## Fix log (from preview stills, projections and the layout audit)
1. Wall clock in the top / caption zone (S1, S5). Replaced with a desk clock.
2. Hook pose read as relaxed (hands behind the head). Changed to head in hands, with the elbow pole forward and down.
3. S2 head blocked the view, and the lamp tab sat in the caption band. Reframed over the right shoulder; tabs moved beside the objects using projected screen positions.
4. S3 head in the right rail. Zoomed out and shifted.
5. S4 thigh behind the captions in rear and side angles. A low front-right angle under the desk edge keeps the desk top behind the band. A front angle was tested and rejected: the thighs still crossed the band and it flipped the room's left/right.
6. S4 tab in the bottom UI zone. Raised it and fade it out at the start of the crane.
7. Mid-crane, the head passed behind the caption. The crane now finishes before the second caption, and its aim point leads.
8. Gray band behind the S4/S5 captions: the floor-to-wall cove shading. Raised the crane-end elevation; also widened the shadow frustum to ±5.5.
9. S5 room sat too low. Re-aimed, so the room is mid-frame and below the lock-up.
10. Two-line captions at 104 px overflowed the band by 8 px. Capped at the accepted 96 px.
11. Layout audit: 0 issues in 300 sampled frames before each full render.
12. First full cut, then QA: seconds 13 and 15 were near-static (mean frame difference 0.037 and 0.011) because the S4 camera held still before the crane. Added a slow push-in (az 144→152, d 1.95→1.70) for the hold. The crane now starts from that framing, and the "1" tab moved between the feet so it stays clear of the desk leg and the frame edge. Re-rendered.
13. Second full cut, then QA: the crane peaked at a per-frame change of 25.8 (as large as a hard cut, a whip-pan feel). It now starts at the end of the feet line and runs about 4 s (15.8–19.7 s) with a sine ease and a smaller orbit (az 152→48). The peak is 14.8. Safe-zone audit: 0 issues, and the head is never behind a caption. Observed and accepted: the thin white lamp stem sweeps behind the first qualification caption for about 0.5 s mid-crane; the text stays readable. Re-rendered.
14. QA script fixes, not video defects:
    - Planned cut frames now use ceil(): Python's round() rounded 238.5 down. Each planned cut must also be the local peak (±5 frames) above 10, so a fast camera move can't fake or mask a cut.
    - Transition frames are picked the same way.
    - The ASR check falls back to segment timestamps when faster-whisper 1.1.1's word alignment fails on a one-word take.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model.

```bash
cd videos/mello/project && ./setup.sh
```

Install the pinned three.js and fonts:

```bash
cd videos/mello/production/30s/2026-11-03-round-02/project && npm ci
```

Full build: TTS, frames, audio, mux, layout audit and QA:

```bash
cd videos/mello/production/30s/2026-11-03-round-02/project && ./build.sh
```

Preview stills with safe-zone guides:

```bash
cd videos/mello/production/30s/2026-11-03-round-02/project && node render.mjs --stills 0,5.2,15,22.5 --out generated/stills --guides
```

## Known limitations
- Kokoro says "Mello" like "mellow" (unchanged from the accepted episodes).
- The performer is seen from behind, the side or below the desk edge, never face-on. This is consistent with the accepted staging.
- The audio was verified with measurements, a spectrogram and ASR, not by a human listener.
