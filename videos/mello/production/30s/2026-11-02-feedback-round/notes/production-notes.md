# Production notes: mello-30s-feedback-01

## Facts used
- App Mello, package `mello.tensorblue.com`, branch `claude-video/mello`, workspace `videos/mello/`.
- Listing (`assets/listing.json`, sha256 `1e16a600…c71`, matches 03-assets.json): "Guided relaxation, calming exercises, wellness challenges and progress tools."
- Icon (`assets/icon.png`, sha256 `3182c61f…ae81`, matches 03-assets.json): lavender #D9BCF5 character on navy. This is the verified brand accent.
- Technique and wording: sources in `../../../../context/11-episode-thought-is-not-a-fact.md` (Luoma & Hayes; NHS Northern Cancer Alliance ACT slides; TherapistAid sheet hosted by Homerton NHS FT).

## Creative decisions
- Style recipe "Thoughts in a Quiet Room" (exact text in `context/10-format-and-style-rules.md` §6), implemented as a real 3D scene: three.js 0.170.0 in headless Chromium (SwiftShader WebGL). No Blender, no paid API.
- Metaphor: the thought is a solid card that blocks the view. Naming it turns the card into a clear frame that still shows the words and floats beside the person. The person turns attention back to the desk and places one notebook. The thought is never deleted.
- Five shots: S1 rear 3/4 medium (0–3.8), S2 tight over-the-shoulder (3.8–9.7), S3 wider rear-left (9.7–18.6), S4 overhead insert (18.6–24.3), S5 wide calm room with lock-up (24.3–30).
- The rephrasing breathes: 0.45 s before "I'll mess this up." the second time, then 1.8 s of silence while the card clears and moves.
- Captions: Instrument Serif 92–118 px, navy, no box, lavender highlighter on "I'm noticing the thought that…" and on "cognitive defusion". Always inside y 340–520.
- CTA: "Take a mindful break with Mello." (spoken and captioned), with the real icon, "Mello" and "On Google Play" from 26.0 s.
- Music: synthesized pad. Bm(add11), then Gmaj9 when the card clears, then D(add9), Esus, and Dmaj9 on the notebook landing. There is no loop, and felt-piano notes play only on beats. SFX only for: card landing, tab, glass clearing, frame drift, rim glow, notebook lowering and landing, cover opening.

## Fix log (from preview stills and the layout audit)
1. Gray stage: the floor sweep was wound clockwise, and DoubleSide flipped its normals so it lit like a back face. Fixed the index winding and switched to FrontSide.
2. Key light from behind left visible surfaces in shade. Moved it to front-right and added a frontal fill for an airy white wall.
3. The notebook's elastic band was offset outside the cover and read as a stray stick. Corrected its position.
4. The lamp, sitting under the floating frame, read as a stand for it. Moved the lamp, mug and pencil to the right side of the desk. The plant moved to the back-left, out of the S3 view.
5. The card dropped through the caption band, and S2/S3 framings crossed the margins. Reframed all cameras with target/azimuth/elevation/distance, and verified with the layout report: card x ≥ 94, inside the right rail, below y 560.
6. The frame's projected lavender trace sat behind the S4 captions. With the key light now front-right, the trace falls on the floor off the desk.
7. Frame 0 was nearly empty. The caption is now fully visible at frame 0 and the card is already landing.
8. The music bed was 8 dB under the voice. Lowered to about 12 dB under (BED_GAIN 0.4).
9. Pronunciation: espeak-ng phonemized "defusion" exactly like "diffusion" (`dᵻfjˈuːʒən`). `narration.py` now swaps that word's phonemes to `diːfjˈuːʒən` ("dee-FYOO-zhun"). Only that line changed (its end moved from 18.07 to 18.14 s), and every other take is byte-identical.
10. First full cut, then audit: `render.mjs --layout` found 31 issues:
    - Caption slide-in pushed text 7–13 px below y 520. Captions now fade with a slight scale and no slide.
    - The S2 card touched the right rail by 2–6 px. The camera target shifted.
    - The notebook sat in the bottom UI zone at the start of S4. It is now already over the desk before the cut.
    - The opened notebook crossed the left margin. It now lands at x 0.14, and the pencil moved out of its way.
11. The S3 thought text was too small. The frame now floats higher and closer to the head at 0.96 scale, with a tighter camera, so the text is about 35% larger. It rises only after the S2→S3 cut, so it never sweeps through the captions.
12. In the S4 overhead insert the frame is cheated out of the shot; otherwise its underside would show as a purple block. A soft lavender point light at the frame keeps it "present" and brightens on "Notice it" (and on "cognitive defusion" in S3).
13. Second audit, run on the scene before the final render: 300 samples, 0 issues. Max head x in S3 is 903 px; minimum card x is 100 px.

## Exact commands
```bash
cd videos/mello/project && ./setup.sh
```
Shared venv plus Kokoro model, hash-checked. Run once.

```bash
cd videos/mello/production/30s/2026-11-02-feedback-round/project && npm ci
```

```bash
cd videos/mello/production/30s/2026-11-02-feedback-round/project && ./build.sh
```
Runs TTS, frames, audio, mux and QA.

```bash
cd videos/mello/production/30s/2026-11-02-feedback-round/project && node render.mjs --stills 0,8.6,23.1 --out generated/stills --guides
```
Preview stills with safe-zone guides.

## Known limitations
- Kokoro says "Mello" like "mellow". The official pronunciation is not documented.
- The figure is seen from behind or above in every shot. This is a deliberate choice, since the viewer shares the person's view of the thought, but no front view of the figure exists.
- The audio was checked with measurements, ASR and a spectrum check, not by a human listener.
