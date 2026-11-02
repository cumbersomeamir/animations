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
