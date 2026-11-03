# Production notes: mello-30s-hindi03-01 (Hindi)

## Facts used
- App Mello, `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`. Product wording comes only from `assets/listing.json`. The real icon is `assets/icon.png`.
- Study: Gilovich, Medvec & Savitsky (2000), Study 1 (46% estimated vs 23% actual; "exactly twice as high"). The primary text was read from the archived PDF. Details are in `context/13-episode-spotlight-effect-hindi.md`.

## Retained from the accepted episodes (sheet feedback: Satisfied = Yes)
The source is a copy of `../2026-11-03-round-02/project/`. Reused unchanged:
- `render.mjs`: headless Chromium + three.js 0.170.0 + ffmpeg.
- Renderer, lighting, stage sweep (except the deeper back wall), desk, lamp, mug, pencil and notebook.
- The performer rig, camera helper (kp / lead / k2 / sine), caption fade and fit, accepted caption treatment and lock-up.
- The audio synth and master chain.

## New for this Hindi episode
- **Voice:** Kokoro **hf_beta**, a Hindi-trained voice, with lang "hi" and speed 1.05. It was selected by a Whisper large-v3-turbo Hindi round-trip against hf_alpha, hm_omega, hm_psi and the Piper hi_IN priyamvada and pratham voices. The English af_bella/am_puck blend is not used for Hindi.
- **Script:** rewritten three times. The first draft ran 30.5 s of speech, so it was trimmed. Then three ASR-flagged phrases were rephrased (ने ही → को याद रहा, आंकते → देखते, झेंप → शर्म आना).
- **Font:** Tiro Devanagari Hindi (OFL; `fonts/tiro-devanagari-hindi-devanagari-400-normal.woff2`, @fontsource 5.2.7). It is a fallback after Instrument Serif, with caption line-height 1.16 and two-line captions at 76 px. Real Devanagari renders, including conjuncts and nukta, with no missing squares (checked on full-resolution frames).
- **Scene:**
  - four faceless room-mates at a long table (the study's setup) and the back wall moved to z −4.2;
  - the tipping mug;
  - a spotlight (cone, floor glow, SpotLight, room dim) for the imagined audience;
  - a lavender tint and halos for "imagined";
  - heads down on their tasks for "real";
  - two halos for "half" and one glance for "a quarter";
  - Hindi labels (पढ़ाई, फ़ोन, लैपटॉप, चाय) with edge fade;
  - a shirt print on the performer's back.
- **Sound:**
  - Same pad and felt-piano palette as before.
  - SFX: mug clink, thud and wobble; spotlight "thunk"; switch tick at "असल में"; mug righted; notebook open.
  - Notes: two for "half", one for "a quarter", four rising on the labels.
  - Bed level: `BED_GAIN` raised to 0.62 so the bed sits about 12.6 dB under the voice, as in the accepted episodes.

## Fix log
1. The first draft ran 30.5 s of speech at speed 0.98. Trimmed to 22.9 s of content plus the CTA at speed 1.05.
2. Whisper decoded the full 30 s as one segment and truncated it. The ASR check now runs per placed line.
3. ASR heard "ने ही याद रखा" as "नहीं याद रखा" (a meaning flip). Rephrased; it now transcribes exactly. "आंकते" and "झेंप" were replaced the same way.
4. First staging: standing room-mates in front of and beside the desk cluttered every front shot, the phone pose read as scratching a head, and a label entered the caption band. Restaged: all four seated at a long table behind the desk facing the performer, rear cameras only (the accepted staging language).
5. The room-mates' heads and halos reached the caption band in S2, and heads touched the lock-up in S5. Both shots re-aimed. Layout data: no head or halo is behind caption text in any sampled frame.
6. Labels were cut at the frame edges during the S4 dolly (45 audit issues). They now fade inside 70–130 px of the side margins.
7. Bug: the label edge fade used the previous frame's camera matrices, so the audit and the render disagreed. Fixed by calling `camera.updateMatrixWorld()` in `setCamera`.
8. Final audit before the full render: 300 samples, 0 issues.

## Commands
One-time setup: shared Mello venv and the hash-checked Kokoro model (it includes the Hindi voices).

```bash
cd videos/mello/project && ./setup.sh
```

Install the pinned three.js and fonts, including Tiro Devanagari Hindi:

```bash
cd videos/mello/production/30s/2026-11-03-hindi-03/project && npm ci
```

Full build, with the Hindi ASR check:

```bash
cd videos/mello/production/30s/2026-11-03-hindi-03/project && ASR_PY=<venv with faster-whisper==1.1.1>/bin/python ./build.sh
```

## Known limitations
- I can't listen to audio, so intelligibility was judged by a Hindi ASR round-trip (Whisper large-v3-turbo, per line), not by ear. A native Hindi speaker should still give it a listen.
- Kokoro's Hindi voice is a small model. ASR understands it reliably, but some words may sound slightly synthetic (e.g. "माइंडफुल" is heard as "माइनफुल").
- The narration runs at speed 1.05, slightly brisker than the English episodes, to fit the Hindi script into 30 s.
