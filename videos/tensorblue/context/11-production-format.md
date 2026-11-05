# 11 — Tensorblue production format (recurring rules for every round)

Durable context for future rounds and any later automation. **No automation exists; do not create one unless the user asks.**
**Latest user feedback overrides older style details.** The current default is **Blue Receipt Theatre** (from the 2026-11-02 feedback round). It supersedes the batch-02 "software cutaway" and the round-01 crosshatch notebook (both kept below as history only).

## Channel genre (locked)
Practical system design · useful new GitHub tools · research explained through something viewers can actually understand. Not academic research diagrams, not generic AI news. See `00-channel.md` for scope and claim rules.

## Default style: "Blue Receipt Theatre" (custom style recipe — a rendering library is not the style)
**Recipe:** premium kinetic typography **+** tactile minimal UI cards **+** a simple isometric stage — joined by purposeful wipes, staged as clear before/after.

| ingredient | rules |
|---|---|
| **Kinetic typography** | Inter Display ExtraBold, large (80–136 px) and simple; words rise out of a mask line on the beat they are spoken; one key word in electric blue `#3B82F6`, the rest white. Max ~3 words per kinetic line. Lives in the stage area, never in the caption band. |
| **Tactile minimal UI cards** | Pale cards (`#D8E3F5`, or white `#FFFFFF` for paper) with dark readable text (`#030610`), generous corner radius, a darker base edge and a soft contact shadow so they feel like physical objects. One recognisable UI per story (e.g. one checkout). |
| **Simple isometric stage** | One flat slab (navy) and at most one physical machine (pale faces `#D8E3F5`/`#B7C7DF`/blue-gray mix) with a meaningful part (e.g. a duplicate-check slot). Label text skewed onto the face; no wiring diagrams. |
| **Story objects** | A single **blue token** = the active thing (in round feedback-01: one purchase; its white notch bars ARE the key, so "same key" is visible as the same bars without reading code). A **white receipt** = the result. Repeat the same token to show "same"; change the bars to show "different". |
| **Transitions** | ≥ 5 purposeful scene changes per 30 s, using solid electric-blue wipe bands (L→R, R→L, bottom→top) or object hand-offs. A new scene must change the staging, not just move a camera over one diagram. |
| **Staging** | Spacious composition, one idea per scene, clear before/after (e.g. two receipts = the fear → one receipt = the fix). |

**Never:** moving-line networks, drifting particles, decorative rings, wandering connector lines, persistent fine-grid motion, camera bobbing over a static page, mascots/random characters, brown/orange/cream-dominant looks, research-paper diagram slides, contact-sheet-as-video.

### Feedback log (append-only)
- **2026-11-03 round 02:** "Current style is fine." Keep the Blue Receipt Theatre grammar, official palette/logo, accepted caption treatment, voice, pacing and the accepted CTA ("Follow Tensorblue for software explained simply."). Use simpler content and readable everyday examples (e.g. one photo, one logo), not abstract moving-line research diagrams. Captions may also use the tighter accepted band y 350–470. Update context only with requested corrections plus the episode record.

- **2026-11-03 Hindi batch 03:** latest correction — narration and captions in natural **Hindi (Devanagari)** for this batch. Done with the same model's Hindi pipeline (Kokoro-82M `lang_code='h'`, official voices `hf_alpha`×0.7 + `hm_omega`×0.3, speed ~1.12), never the English voices; Devanagari set in **Mukta** (OFL) with zero letter-spacing; Hindi ASR with faster-whisper `medium`, `language='hi'`, sentence by sentence. Brand wordmark "Tensorblue" stays Latin; CTA spoken/captioned as "टेंसरब्लू फ़ॉलो करें, सॉफ़्टवेयर आसान भाषा में।" (TTS spelling "टेन्सर ब्लू"). Details: `16-production-30s-hindi03-01.md`.

- **2026-11-04 Hindi batch 04:** keep the satisfied design exactly; the renderer is the original Node + `@napi-rs/canvas` code (`brt.mjs` + per-episode `scene.mjs`) — **not Three.js**; the *style* is the Blue Receipt Theatre recipe. Re-fetch tensorblue.com colours each round (unchanged on 2026-11-04). Hindi wording rule: prefer native "चाबी" over the loanword "की" (espeak-hi makes "की" = postposition /ki/). Listening is not supported in the build container: record ASR-only verification. Details: `17-production-30s-hindi04-01.md`.

- **2026-11-05 feedback-05:** keep the satisfied design and Hindi setup; treat the user's performance snapshot as a controlled topic/opening test, not causal evidence or a reason to change style. Open on the working result inside 1–2 s. Real demos must use invented documents only and run the actual tool (here OCRmyPDF + Tesseract on a fictional slip). Hindi TTS: spell acronyms with spaces in `tts` ("ओ सी आर", "पी डी एफ़") — espeak-hi glides unspaced acronyms. Check every "how it works" claim against the tool's actual output (the OCR text layer is *beneath* the image, not on top). Publishing caption = the final transcript verbatim + sources + Tensorblue CTA only. Details: `18-production-30s-feedback05-01.md`.

### References (from the user's sheet; borrow spacing, strong type, clean physical forms, purposeful wipes, before/after staging — never their characters or claims)
- https://www.instagram.com/p/De9jkaXhMo0/
- https://www.instagram.com/p/DfKmIL6C5vq/
- https://www.instagram.com/p/DfLY1llu3AT/
- https://www.instagram.com/p/DfFEMw3BPui/

These posts could not be viewed from the build container (Instagram shows a logged-out page); the recipe follows the user's written description of what to borrow.

### Palette (exact, checked by the user at https://www.tensorblue.com/ and confirmed in the site CSS on 2026-11-02)
| role | colour |
|---|---|
| background | near-black navy `#030610` |
| active object / highlight / key word | electric blue `#3B82F6` |
| text on dark, receipt paper | white `#FFFFFF` |
| cards | cool pale blue `#D8E3F5` |
| secondary text, machine side | muted blue-gray `#B7C7DF` |
| logo mark only | logo blue `#0A6CFF` (from `assets/brand/tensorblue-logo.svg`) |
Shades are only mixes of these (e.g. token base `#2757A6`, stage slab `#0C1834`). **Logo relationship:** blue drop with a white tensor grid; wordmark "Tensor" in white + "blue" in electric blue.

### Type
Inter Display ExtraBold/Bold for kinetic type and titles; Inter SemiBold for captions; Inter Medium/Bold for small UI text (`assets/fonts/inter/`, SIL OFL 1.1). Keep type large: nothing essential under ~30 px; captions 54 px.

### Brand / CTA
Final 3–4 s: logo drop + "Tensorblue" wordmark + one short useful line (round feedback-01: "Follow Tensorblue for software explained simply." spoken, with a blue "Follow" pill). The CTA must say "Tensorblue" explicitly and stay short; no app advert, no invented capability.

## Storyboard clock (30 s)
Strong opening (real UI on frame 0) · problem/hook by ~4.5 s · mechanism in distinct scenes as it is narrated · clear takeaway · CTA in the final 3–4 s. Narration is the clock: every visual cue is keyed to a word time from Kokoro.

## Technical spec (export gate)
1080×1920 · 30 fps · exactly 900 frames · H.264 High yuv420p (CRF 18, cap 12 Mb/s) · AAC-LC 48 kHz stereo · exactly 30.000 s · `+faststart`.

## Caption and safe areas (from the feedback round)
- **y < 300: no meaningful text** (platform account overlays).
- Captions in the **upper safe region: text ink inside y 340–520, x 90–990**, max two readable lines, Inter SemiBold 54 px / 64 px leading, split by word groups (renderer rejects lines wider than 880 px). No overlaps with stage content: the stage is clipped to start at y 540.
- Crucial visuals inside x 90–950, y 540–1480 (keep out of side and bottom platform UI).
- Verified by `qa.mjs` each round (pixel diff with/without captions; y 0–539 must equal the background except captions, every 10th frame).

## Audio configuration
- **Narration:** Kokoro-82M (`hexgrad/Kokoro-82M` rev `f3ff3571791e39611d31c381e3a41a3af07b4987`) via `kokoro==0.9.4`/`misaki[en]==0.9.4`, `lang_code='a'` (en-us), voice **`af_bella`×0.7 + `am_puck`×0.3**, **speed 0.98** — the established cached voice; run with `HF_HUB_OFFLINE=1`. No Piper, no imitation of real people.
- **Pronunciation:** check misaki phonemes for brand/technical words before rendering; use inline overrides `[word](/phonemes/)` when needed. Known: `[Tensorblue](/tˈɛnsəɹblˌu/)` (not in the lexicon). Avoid "retrying" (misaki stresses it on the first syllable); "retry" is fine.
- Script length ~65–75 words (≈ 22–23 s of speech) so scenes have breathing room.
- **Music:** subtle and non-repetitive: one sustained chord per scene + one soft felt note at each scene change (no arpeggio loop), ~20 dB under the voice during speech, ducked further.
- **SFX:** synthesized, each tied to an on-screen action (tap, token clack, wipe, receipt paper, slot, match, chime).
- **Targets:** −14 to −16 LUFS integrated (aim −15), true peak ≤ −1 dBTP.

## QA gates (every round)
1. ffprobe streams/codecs, 900 frames counted, 30.000 s; whole-file decode with zero errors; `+faststart`.
2. Loudness + true peak (ffmpeg `ebur128=peak=true`) on the exported MP4.
3. Caption bounds and clean top band (`qa.mjs`).
4. 1-fps contact sheet and a transitions sheet from the exported MP4 viewed; full-resolution crops for small/obstructed text and compression artefacts. Re-render if text is small, obstructed or scenes are static.
5. ASR (faster-whisper base.en) on the exported audio: WER and word-start drift vs caption timing.
6. Claims mapped to original/official sources; provenance and licences recorded; MP4 checksum recorded.

## History (superseded looks — do not reuse unless asked)
- **Batch 02 (2026-11-02):** brand-aligned software cutaway (dark navy UI panels, static crosshatch texture, match-cut layers, palette `#0A6CFF`-led). Superseded because the feedback round asked for kinetic type + tactile cards + isometric stage and banned connector lines.
- **Round 01 (2026-11-02):** Crosshatch notebook (cream paper, brown ink, boiling lines) from `cth9191/animate` STYLE.md (read-only, never run). Retired by batch-02 feedback ("replace distracting boiling/moving crosshatch lines").
