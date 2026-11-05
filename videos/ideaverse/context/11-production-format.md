# 11 — Production format (durable; approved round production-30s-2026-11-02)

Durable context for future Ideaverse production videos. No automation has been created.

## Channel
- Genre (locked): **AI news, tricks and tips**. One useful, sourced tip or explanation per video; no fabricated dated
  "news", no health/legal/income/testimonial/breakthrough claims. App appears only as a subtle signature.
- Art-direction skill (read-only reference): **Riso** —
  https://github.com/cth9191/animate/blob/main/plugins/animate/skills/animate/styles/riso/STYLE.md
  (module `plugins/animate/skills/animate/styles/riso`). Implemented with original code (no kit.js copied/executed).

## Recurring format / scene rules
- 30.000 s, 1080x1920 portrait, 30 fps (900 frames), H.264 High yuv420p, AAC-LC 48 kHz stereo.
- Beats: hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · elegant end 29–30 s.
- One continuous printed scene (episode 01: the AI "Prompt Press"); motion on 2s; misregistration jiggle on impacts;
  no talking mascot, no text slides. Illustrative documents are fictional and labelled EXAMPLE.
- Riso grammar (adapted): three spot-ink plates multiply on cream paper (#f2ece3-ish, flat, faint fibres);
  20-level tones screened at 15°/75°/45°; plates off-register (+4,−3)/(−3,+4) with ±0.3 px boil jitter; ~0.6%
  dropouts; fills knock out, lines overprint, white = paper, no black ink; pitches fine 7 / world 10.8 / field 17.5 px.

## Palette (inks)
| ink | RGB | source |
|---|---|---|
| navy (key, registered, 15°) | (44, 62, 102) | Ideaverse icon navy #1B2333 lifted to a printable translucent ink |
| mint (75°) | (108, 218, 126) | icon mint #6CDA7E |
| amber (45°) | (255, 194, 75) | series accent (provisional, context/08) |
| paper | (242, 236, 227) | Riso STYLE paper |
Overprints: navy×mint deep teal, mint×amber lime, all three olive-dark. Plate roles in ep. 01: GOAL=mint,
CONTEXT=navy, OUTPUT=amber.

## Captions / safe areas
- Upper-centre; caption ink inside y 350–470; horizontal margins ≥ 80 px (max line width 920 px, auto-shrinks
  58→46 px); max 2 short lines; split by word groups timed from narration word timestamps.
- Top 0–300 px: no content (paper/field only). Essential visuals in y 520–1500; bottom overlay region (y > 1500)
  holds only non-essential décor (press base, signature nameplate, end registration mark).
- Captions are printed type on the navy key plate (crisp, solid tone 1). Measured per frame by qa/caption-bounds.

## Audio config
- Narration: Kokoro-82M (Apache-2.0) via kokoro-onnx 0.6.1 (MIT); model onnx-community/Kokoro-82M-v1.0-ONNX @
  1939ad2a8e416c0acfeecc08a694d14ef25f2231 (onnx/model.onnx sha256 8fbea51e…a34cb); voice blend
  **af_bella 0.7 + am_puck 0.3**, **speed 0.98**, **lang en-us**; per-sentence synthesis, silence-trimmed,
  soxr-resampled to 48 kHz. (Not cached in this container on 2026-11-02 — downloaded once from Hugging Face.)
- Music: original synthesized, quiet; voice upfront (music ducked ~8 dB, SFX ~4 dB under speech); event-linked SFX.
- Master: two-pass loudnorm to **−15 LUFS**, **TP −1.5 dBTP** (spec −14…−16 LUFS, TP ≤ −1).
- QA: one ASR (faster-whisper base.en) + timing pass on the final MP4.

## Update — batch production-30s-2026-11-02-batch-02 (user feedback, overrides earlier details)
- Keep the approved **Riso navy/mint Prompt Press** as the recurring app identity; restage it per topic (new slots,
  levers, gates, documents). Do not introduce new characters/mascots.
- Each episode needs **visible scene changes that explain the mechanism** (e.g. loupe window → plate swap → lanes →
  gate → output), not a static diagram; purposeful riso transitions (circle window with rough rim, plate slides,
  stamps, registration jolt on impacts).
- Topic-specific sourcing: cite the primary/institutional guidance for that topic (ep. 02: OWASP LLM01:2025 and
  Anthropic prompt-injection material), not generic prompting advice. Fictional, harmless examples only; never show
  a working attack or private data.
- Script length: about **65–80 words**, fitted to ~24 s of speech with ~0.45 s gaps; minimal edits for accuracy/timing.
- Do not repeat a previous topic. Episodes so far: #01 "A useful prompt has three layers" (2026-11-02),
  #02 "The instruction hidden inside an AI webpage" (2026-11-02-batch-02).
- Lesson for later episodes: avoid leaving the central stage empty for more than ~2 s while action happens elsewhere.

## Update — episode 03 (user-approved style reversion + content correction) — CURRENT DEFAULT
- **Default from episode 03: "practical everyday AI, previous production01 riso press restored".**
- Visual: revert to the **production-01 Riso Prompt Press** (videos/ideaverse/production/30s/2026-11-02/): same press,
  warm paper, GOAL/CONTEXT/OUTPUT overprinted plates (may flip to episode-specific labels), strong large readable
  objects, satisfying print/reveal motion. Do NOT use episode-02's hostile stamp / permission lever / security lesson
  or its sparse central scene. Central action large; no tiny labels (≥ 26 px for anything that matters).
- Content: everyday useful AI for ordinary viewers — no jargon, no technical AI concepts, no security lectures.
  Show an immediately usable workflow: **input → exact prompt (printed, readable) → clear result → one practical
  safeguard**. Say "a tool that supports …" rather than implying every app has a feature.
- Sources go in publishing-caption.txt and context, not as technical disclaimers on screen.
- Skill module unchanged: Riso STYLE.md (cth9191/animate …/styles/riso/STYLE.md), art direction only.
- Palette, audio (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us; −15 LUFS, TP −1.5), captions (ink y 350–470,
  margins ≥ 80, ≤ 2 lines, top 0–300 clear) unchanged.
- Episodes: #01 three-layer prompt · #02 hidden instruction in a webpage (style not to be reused) ·
  #03 messy voice note → clear to-do list (2026-11-02-episode-03).

## STYLE CORRECTION — feedback round 2026-11-02 (user feedback; SUPERSEDES every style rule above) — CURRENT DEFAULT
- The approved "previous style" is the **15-second educational pilot**
  `videos/ideaverse/education/pilot-01/ideaverse-education-pilot-01.mp4` (source `education/pilot-01/src/`), NOT any
  30-second production episode. **Riso is banned for all future episodes**: no Prompt Press, no printer, no paper,
  no halftone/plates/misregistration, no episode-02 stamp/lever look. Do not reuse `production/30s/*/src/riso.mjs`
  or the #01–#03 scene files. Earlier Riso sections above are historical only.
- A rendering library is not the style. The style is this exact recipe (copy the pilot engine, don't re-imagine it):
  - **Character DOCKET** (`education/pilot-01/src/character/docket.js`, unchanged geometry): white/cream filing-cabinet
    robot (shell #E9EFF2, roughness 0.38), dark square screen face (#0E1424 visor, unlit canvas face with mint
    #6CDA7E glow + scanlines), mint ears/antenna-mic/toe caps/drawer handles/cuffs, slim navy #1B2333 tube limbs,
    navy boots, chest drawers NOTES + SOURCES, PRESS tag. 8 expressions (neutral happy wow skeptic puzzled focus
    determined proud), mouth bar lip-synced to narration RMS, blinks, springy antenna kicks on impacts.
  - **Stage**: dark navy-black newsroom — background/fog #0E1424 (fog 4.5→9), floor #141B2B with faint mint grid
    (rgba(108,218,126,0.10), 64 px cells, 4×4 repeat), back wall #1B2333 at z −2.4 with deep #121826 panels, mint neon
    "NEWSROOM" sign, two steel wall monitors with mint labels. Props are rounded boxes (RoundedBoxGeometry) in
    shell/navy/mint/steel; amber #FFC24B only as the warning/"wrong" accent.
  - **Light**: ACES filmic, exposure 1.05; PMREM env (navy room #2A3550, white ×4 top panel, mint ×2.5 side, white
    ×1.5 front; envIntensity 0.55); hemisphere #9FB4D9/#0E1424 0.55; warm key spot #FFF4E6 38 at (1.8,3.6,2.6) with
    PCF-soft shadows; mint rim directional 1.4 from (−2.5,2.5,−2.5); blue fill point #6C8FD9 3 at (−1.6,1.4,2);
    radial vignette 0→0.35 black.
  - **Camera**: PerspectiveCamera fov 44, eased (inOutCubic) keyframed moves between close/medium/insert setups at
    ~1.1–1.4 m height, 2–3.3 m distance; tiny drift + decaying shake kicks on impacts. Motion is character acting
    and physical prop cause-and-effect (anticipation → action → impact → recovery), hands on props via numeric IK.
  - **Captions**: Space Grotesk 700, white with mint/amber key words, on a dark pill rgba(11,16,32,0.72) with a
    2 px mint stroke rgba(108,218,126,0.35), radius 28, pop-in outBack.
- Reference frames to compare before every render: pilot at 1 s, 6 s, 11 s.

## Format rules — feedback round (supersede conflicting rules above)
- Exactly 30.000 s, 1080x1920, 30 fps, H.264 yuv420p + AAC. Strong opening, distinct scenes that show the mechanism
  while it is narrated, clear takeaway, short natural brand/action CTA in the final 3–4 s.
- Captions in the upper safe region below platform account overlays: **y < 300 clear of meaningful text** (no
  signature/badge there), caption ink within **y 340–520, x 90–990**, max two readable lines, no overlaps.
  Nothing meaningful in the bottom/side UI zones (no bottom labels); crucial diagrams centred.
- Not deliverables: contact/source sheets, a static page with camera bob. Re-render if text is small, obstructed or
  a scene is static.
- Topics: broad, relatable "AI you use daily"; no LLM-prompting tutorials or jargon. Research claims in reliable
  original sources; record them in the episode doc and publishing copy; qualifications brief and inside the
  relevant sentence; no filler, empty motivation, long disclaimers, invented app capabilities, guarantees,
  statistics, income or testimonials. Never imply Ideaverse performs the everyday function being explained.
- Voice: cached Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. Music subtle, voice clear, no repetitive
  ticking/looping figures; event-linked SFX only. Master −15 LUFS, TP −1.5.
- No paid APIs, no Blender. Preserve previous MP4s.
- Episodes in this style: feedback-01 "AI you use daily — how spam filters learn to sort email"
  (production/30s/2026-11-02-feedback-round/, see context/15).

## Round 2026-11-03 (round-02) — requested corrections only (everything above in "STYLE CORRECTION" stays as is)
- CTA changed, spoken and visible: **"Download the Ideaverse app."** (replaces "Explore more everyday AI with Ideaverse"),
  in the final 3–4 s, caption with the app icon chip.
- App icon replaced with the current official Google Play icon (fetched 2026-11-03; provenance + old hash in
  context/03-assets.json). Only the icon file changed; palette, renderer, DOCKET, caption treatment, voice, pacing kept.
- Script length for this round: natural 65–75 words. Accepted renderer for reuse: production/30s/2026-11-02-feedback-round/src
  (copied, props/choreography changed per episode).
- Episodes in this style: feedback-01 spam filters (2026-11-02-feedback-round) · round02-01 phone reads text from a photo
  (2026-11-03-round-02, see context/16).

## Round 2026-11-03 hindi-03 — requested corrections only (style recipe above unchanged)
- **Language: all narration and captions in natural Hindi (Devanagari)** for this batch (latest user correction).
  Voice: Kokoro-82M's own Hindi-trained voices (Apache-2.0), blend **hm_omega 0.7 + hf_alpha 0.3**, lang `hi`
  (espeak-ng Hindi phonemes), speed 1.07 — NOT the English af_bella/am_puck voice. Narration text fully Devanagari
  (Latin words make the phonemizer speak a language-switch tag). Piper hi_IN voices rejected: pratham/priyamvada
  CC BY-NC-SA 4.0 (non-commercial), rohan IIT-M IndicTTS licence. Verification: faster-whisper `medium` (hi) ASR on
  every clip and on the final MP4 (spelling-normalised CER) + phoneme review; no celebrity voice, no paid API.
- Captions: same pill/band/style; font stack "Space Grotesk", "Noto Sans Devanagari" (@fontsource 5.3.0, OFL) so
  Devanagari renders with real glyphs. CTA spoken + visible: "आइडियावर्स ऐप डाउनलोड कीजिए" with the icon chip.
- Icon: re-fetched from Google Play on 2026-11-03 — unchanged, no replacement (03-assets.json "checks").
- Episode: hindi03-01 "remove a background distraction from a photo" (2026-11-03-hindi-03, see context/17).

## Experimental MEME format (2026-11-03 meme-01) — reusable recipe, separate from the channel's lesson format
Use only when a meme episode is requested; the established lesson style above stays the default.
- Performer/stage unchanged: DOCKET + newsroom, accepted renderer (copied src from hindi-03), Ideaverse palette + icon.
- Structure (30 s): readable Hindi hook in 0–2 s → punchline at ~4 s with **freeze-frame** → escalation in 3 quick
  beats (each one prop + one short caption) → second freeze-frame on DOCKET's **deadpan** (half-lidded eyes, no blink)
  → payoff/confession → useful visual fix → result + "check it" → spoken + visible CTA (last ~6 s).
- Freeze-frame: picture time holds while voice continues; zoom punch 1.18–1.3× toward a focal point (DOCKET's face
  projected from 3D), slight rotation, saturation 0.55 / contrast 1.12, 0.12 s white flash, micro-shake, synthesized
  boom + sting (no samples).
- Meme captions: Noto Sans Devanagari / Space Grotesk 800, white with mint/amber keywords, thick black outline
  (stroke = 0.2 × size), no pill; outBack pop; single lines centred in the band; still y 344–520, x 90–990, ≤ 2 lines.
- Reaction vocabulary: double take (head snaps camera → prop → camera in 0.4 s), clipboard knocked from DOCKET's hand,
  deadpan stare to camera. Original only — no celebrity likeness/voice, no stock or copyrighted reaction clips.
- Mute test: every beat must read from captions + props alone.

## Round 2026-11-04 hindi-04 — channel style confirmed (no new corrections)
- Lessons use the accepted DOCKET 15 s-pilot newsroom style via the feedback-round renderer (hindi-03 src as the latest
  Hindi base). The meme episode (2026-11-03-meme-01) is a separate experiment; its freeze-frames/outlined captions are NOT
  the default. Three.js is only the engine; the style is the recipe in "STYLE CORRECTION" above.
- Hindi voice unchanged (Kokoro hm_omega 0.7 + hf_alpha 0.3, lang hi); speed 1.1 for this 62-word script.
- Episode: hindi04-01 care-label symbols (2026-11-04-hindi-04, see context/19).

## Batch 2026-11-05-feedback-05 — approved improvements (style unchanged)
- Style: accepted DOCKET 15 s-pilot lesson style via the feedback-round renderer (hindi-04 src as base); meme renderer not used.
  Three.js = engine only. "Meshline/Recall voice character" for this app = the Kokoro 0.7/0.3 blend; for Hindi the
  established Hindi-capable equivalent is used (hm_omega 0.7 + hf_alpha 0.3, lang hi) — never the English voice for Hindi.
- Sheet-driven tweaks: immediate visual hook in 0–2 s (moving scene + readable Hindi caption from 0.15 s), one concrete
  demonstration, short truthful CTA in the last ~4 s ("आइडियावर्स ऐप डाउनलोड कीजिए", "Download the Ideaverse app"), publishing caption matches the final
  transcript exactly with the Ideaverse identity only.
- Performance snapshot supplied by the user (71/72 reels with displayed plays; observed plays 302,810,711; likes 1,734,131;
  median 1.7 M): recorded as context only — unequal post ages, no causal inference; treated as a controlled topic/opening test.
