# Courtlens series format (durable — supersedes conflicting parts of 02 and 04)

Set by user feedback on 2026-11-02 ("feedback round"). Read after 00–05. Sections are labelled
**[USER DIRECTIVE]** (from the user), **[VERIFIED FACT]** (checked evidence) or **[CREATIVE DECISION]**
(made in production, open to review).

## 1. Locked genre — "Is this legal in India?" [USER DIRECTIVE]
- One specific everyday situation → the rule → the important distinction → one useful action.
- Label the jurisdiction **INDIA** naturally (series chip "IS THIS LEGAL IN INDIA?" and the rule card header).
- Research factual/legal claims from reliable original sources (India Code, Department of Consumer Affairs,
  Gazette, PIB, Parliament answers) before finalising. If a rule or source cannot be verified,
  checkpoint that specific issue in the progress file instead of inventing law.
- Exact provisions and source links go in repo/publishing notes, not tiny legal text on screen.
- No lengthy generic disclaimer. Put any material qualification briefly in the sentence it qualifies.
- Never promise every purchase is returnable or that every complaint wins. No unqualified giant "ILLEGAL" stamps.
- No unrelated legal-ad content from other repos/apps. No invented app capability, guarantee, statistic,
  income or testimonial. Courtlens product facts come only from `assets/listing.json`
  ("Court records, case tracking and an AI assistant for advocates").
- CTA: short, natural, brand/action, in the final 3–4 s (e.g. "Follow Courtlens for everyday Indian law explained.").

## 2. Style recipe — "Tiny Clause, Big Consequence" [USER DIRECTIVE]
Reference reviewed by the user: https://www.instagram.com/p/De2y__8jAot/
- Borrow the **visual grammar only**: clean ivory canvas, navy typography, small tactile tokens,
  very few explanatory objects, subtle shadows, a clause that changes the visible outcome,
  large readable comparisons, purposeful transitions.
- Do **not** borrow its venture-capital example or its orange/teal brand identity.
- Courtlens's own accent (sampled from its icon) is the only brand colour; neutral paper and dark type carry the scene.
- No lawyer mascot. No static case-file/page with camera bobbing. No contact sheet or static page as a deliverable.
- Five or so distinct changes per 30 s, gentle physical motion (springs, swings, slides, flips), each change shown
  exactly when the narration describes it. An ordinary shopper must follow without reading a law book.
- A rendering library is not the style; the style is the recipe above.

## 3. Brand palette [VERIFIED FACT: sampled from `assets/icon.png` on 2026-11-02]
| Role | Hex | Source |
|---|---|---|
| Navy (type, outlines) | `#02193B` | icon background median |
| Brand accent (cyan glow) | `#12AAD3` | icon glow arc median |
| Accent text on white (darkened cyan, contrast about 4.6:1) | `#0A7EA4` | derived from accent |
| Gold (sparing detail) | `#D7A351` | icon pediment/star |
| Icon ivory | `#F0E9DD` | icon columns |
| Paper canvas [CREATIVE DECISION] | `#F4EEE2` | neutral ivory |
| Seller-banner red [CREATIVE DECISION, episode prop only] | `#B5432F` | not brand colour |
Older brief colour `#85BBDB` (from 01-product-facts previous_brief_reference) is not used; the sampled icon accent is preferred.

## 4. Approved narration voice [USER DIRECTIVE]
- Kokoro v1.0 (open weights, local, no paid API) via `kokoro-onnx` 0.6.1.
- Voice blend **af_bella 0.7 + am_puck 0.3**, language **en-us**, speed **0.98**.
- Model files: `kokoro-v1.0.onnx` (sha256 7d5df8ec…3636a6c5) and `voices-v1.0.bin` (sha256 bca610b8…1fbf7d) from
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 . Reuse cached copies when present;
  this container had no cache, so identical public release files were downloaded (hashes in 05-progress.md).
- Implementation: `production/30s/2026-11-02-feedback-round/src/tts.py`.
- Music subtle, voice clear (voice ≈15 dB over the bed), no repetitive loops; event-synced soft SFX only.
  Deliver at about −16 LUFS integrated, true peak ≤ −1.5 dBTP.

## 5. Safe-caption and layout settings [USER DIRECTIVE + CREATIVE DECISION for exact values]
- Canvas 1080×1920, 30 fps, exactly 30.000 s, H.264 yuv420p + AAC.
- **y < 300: no meaningful text** (platform account overlays).
- Captions: **y 340–520**, **x 90–990** (max width 900), max **two lines**, never overlapping other elements.
  Implementation: Inter ExtraBold 64 px (auto-shrinks to ≥46 px), navy `#02193B`; one line baseline y=453;
  two lines baselines y=412 / y=492; keyword marker `#B4E3F1`. Nothing else may enter y 340–520,
  including elements in mid-transition.
- Crucial diagrams: stage y ≈ 560–1460; x 90–990 above y=1000, x 90–960 at/below y=1000 (right-rail buttons);
  nothing crucial below y≈1460 (bottom UI).
- Re-render if text is small, obstructed, or scenes are static.

## 6. Delivery convention [USER DIRECTIVE]
- `videos/courtlens/production/30s/<date>-<round>/courtlens-30s-<round>-NN.mp4`; sources, notes and QA stay in the repo
  next to it. Preserve all previous MP4s. Deliver the finished MP4 as a Claude attachment too.
- Verify duration/codecs, full FFmpeg decode, narration timing and representative transition frames.
- One English video per request; do not start another episode or create automation unless asked.
