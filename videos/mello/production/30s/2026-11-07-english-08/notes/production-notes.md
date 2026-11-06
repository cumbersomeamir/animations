# Production notes: mello-30s-english08-01 (English)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Sources:
  - Rozenblit & Keil (2002, *Cognitive Science*; PubMed abstract);
  - Meyers et al. (2023, *Judgment and Decision Making*; open-access full text, zipper procedure and effect);
  - Sundback (1917), US 1,219,881 (Y-shaped slider channel).
  - Details are in `context/18-episode-illusion-of-explanatory-depth.md`.

## Retained (latest accepted setup)
The source is a copy of `../2026-11-06-english-07/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg. three.js is the renderer here, not the visual style.
- The accepted room, desk, lamp, mug, pencil, notebook, plant, stool, performer rig and camera helper.
- The English caption treatment (Instrument Serif, lavender highlighter) and the lock-up "On Google Play".
- The accepted English voice (Kokoro 0.7 af_bella + 0.3 am_puck, en-us, 0.98), synthesized fresh. The audio synth and master chain are unchanged.
- The card helpers, per-object crucial-text audit and projected-sphere head check.

## New for this episode
- **Props:**
  - a procedural brass zipper (20 + 20 staggered teeth on lavender-gray tape patches; meshed behind the slider, fanned ahead);
  - a navy slider with a pull tab that turns see-through to show the lavender Y-shaped channel.
- **In-scene text:**
  - the confidence card: "How well do I understand a zipper?", a 1–7 rating 4 → 6 → 3 with "before" / "after explaining", "Explain it, step by step:", steps 1–2 and a "?" stamp, then the "the illusion of explanatory depth" pill;
  - the speech bubble "“So the teeth… um…”";
  - the labels "stuck here → learn next" and "Y-shaped channel".
- **Choreography:**
  - seated: looking at the card, a small head drop at the rating drop;
  - explaining out loud with a right-hand gesture and an "um" head tilt;
  - the zipper moves on its own, like a diagram.
- **Sound:**
  - one tiny metallic click per tooth passing the slider, computed from the scene's slider curve;
  - the "?" stamp tick and a soft chime for the X-ray;
  - felt-piano notes on sure, the drop (falling pair), the name, the X-ray, the label and the lock-up.
- **Bed:** `BED_GAIN` 0.45, so the music sits 13.1 dB under the voice.
- **QA:**
  - zipper-behind-caption check (oriented footprint);
  - labels audited without a size filter;
  - ASR normalisation ignores quote marks.

## Fix log
1. The script came in at 21.0 s of speech (76 words), with the CTA at 26.30 s. Narration ASR was CER 0 except for the quote marks around 'I get it' (normalisation fixed).
2. **S1 and S4:** the zipper ran vertically through the caption band, the slider passed behind the hook caption, and an arm crossed the zipper. Final:
   - the zipper is laid diagonally across the desk (yaw 1.15, L 0.4 m);
   - the cameras are wider (S1 d 1.55→1.4, S4 1.3→1.18);
   - the zipper moves on its own (no pulling arm).
3. **S4 labels:** clipped at the left edge, then in the bottom zone, then too small. Final: anchored in front of the zipper's centre at scale 0.4. The slider's travel was narrowed (0.38 → 0.66) so it stays in frame.
4. **S3:** the speech bubble was off-screen left, then in the band and past the right edge. Final: right of the head at scale 0.7, with the camera aim shifted right.
5. **S2:** the taller confidence card touched the band; it was lowered (y 1.32) and scaled to 0.88.
6. Audit before the first full render: 300 samples, 0 issues.
7. Render 1 review: the S3 speech bubble began typing at "explain it out loud" and finished only about 0.2 s before fading at the cut, so the stalled explanation could not be read. It now starts at "So before you say…" and holds for over a second. Rendered a second and final time; render 1 outputs were not committed.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model.

```bash
cd videos/mello/project && ./setup.sh
```

Full build, including the English ASR check:

```bash
cd videos/mello/production/30s/2026-11-07-english-08/project && npm ci && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was verified only by a per-line English ASR round-trip. Someone should give it a listen.
- The zipper is a stylised diagram. The teeth interlock as staggered blocks, not modelled hooks and recesses.
- The 6 → 3 rating on the card illustrates the direction of the effect, not a reported mean.
