# 10 — Educational progress log (Pilot 01)

## Verified facts (public sources; full list + claim mapping in education/pilot-01/SOURCES.md; accessed 2026-11-02)
- NIST AI 600-1 (July 2024): "Confabulation: The production of confidently stated but erroneous or false content…";
  LLMs "predict the next token… can also produce outputs that are factually inaccurate"; outputs "may also include
  confabulated logic or citations that purport to justify… the system's answer".
- Kalai, Nachum, Vempala, Zhang, "Why Language Models Hallucinate", arXiv:2509.04664 (4 Sep 2025): models produce
  "plausible yet incorrect statements instead of admitting uncertainty".
- Magesh et al., "Hallucination-Free? …AI Legal Research Tools", arXiv:2405.20362 (30 May 2024): retrieval-based tools
  reduce hallucinations vs a general chatbot yet "each hallucinate between 17% and 33% of the time".
- Wineburg & McGrew, "Lateral Reading and the Nature of Expertise", Teachers College Record 121 (2019): professional
  fact checkers verified by leaving the page to consult other sources.
- App facts used: name only (Ideaverse) + icon palette. No product claims.

## Creative choices (not facts)
- Character DOCKET, newsroom stage, props, palette usage, script wording, music — see 09 and pilot-01/CHARACTER.md.

## Provenance / adaptations
- kinetic-reel skill (read earlier: SKILL.md, style-guide.md, sound.md): reused method only — every frame a pure
  function of t in headless Chromium + Three.js; shared cue file for picture and score; in-key cues instead of noise
  whooshes; "look at it" contact-sheet loop; honest-data/illustrative labelling. NOT reused: kinetic type-as-hero,
  HUD/progress bar, chrome knot, particle terrain (wrong medium for a character-led lesson).
- Local animation-direction skill: anticipation → action → impact → recovery; props carry cause and effect.

## Build state (2026-11-02)
- Workspace: education/pilot-01/ (src/, character/, qa/, CHARACTER.md, SOURCES.md, LICENSES.md, build.sh, qa.sh).
- Character DOCKET built (src/character/docket.js) + model sheet character/docket-model-sheet.png (turnaround, poses, 8 faces, palette).
- Stage/choreography src/stage/{cues.js,pilot.js}: one continuous newsroom set; numeric IK puts hands on box sides,
  gauge, drawer handle, chain, book and stamp. Lip-sync from narration amplitude.
- Voice: 6 lines, best ASR-verified takes in src/narration/wav (d5 rephrased to "Label it unconfirmed" because
  "Mark it" was heard as "Market").
- Mix: src/music/score.mjs → build/mix.wav → limiter → mix_master.wav (−13.0 LUFS, −1.48 dBTP). ASR on mix: all
  lines correct (final line correct when transcribed as its own segment; full-file decode said "Sound Ensure").
- Fix log from stills: held box hid the face → lowered; hands missed props → added IK; ribbon behind DOCKET →
  redirected; narrow portrait lens → FOV 44 + wider shots; drawer reveal occluded → dedicated insert shot + hand
  moves away; chain too small → enlarged; stamp text overprinted → amber sticker; ticker read as caption → removed.

## Render / QA state (2026-11-02) — DELIVERED
- Final: education/pilot-01/ideaverse-education-pilot-01.mp4 (sha256 2886236d…f69460): 15.000 s, H.264 1080x1920 30 fps,
  450 frames, AAC 48 kHz stereo; full decode OK; −12.7 LUFS / −1.4 dBFS; all 6 narration lines ASR-correct from the MP4.
- QA.md lists 10 defects fixed and 3 accepted minor issues. Render: 450 frames in 11m49s (3 SwiftShader workers).

## Next action
Pilot 01 complete. Next: user review of pilot + DOCKET design; if approved, script episode 2 from the 10-title plan
(context/08) reusing src/character/docket.js with a new situation/camera. Do not overwrite pilot-01.
