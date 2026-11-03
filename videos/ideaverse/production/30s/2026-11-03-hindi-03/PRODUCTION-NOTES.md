# Production notes — Ideaverse 30s hindi03-01 (Hindi)
"फ़ोटो से अनचाही चीज़ हटाना" (remove a background distraction) · round 2026-11-03 hindi-03 · branch claude-video/ideaverse

## Kept (accepted recipe, by source)
`src/` copied from `production/30s/2026-11-03-round-02/src` (accepted feedback-round renderer = pilot-01 engine):
DOCKET rig unchanged; renderer, lights, environment, stage, NEWSROOM sign, fov-44 camera system, IK, caption pill
(y 344–520), quiet pad-bed score engine with ducking and −15 LUFS master. Easel = round-02 board geometry; cabinet kept.

## Changed (requested)
- Language: Hindi narration + Devanagari captions; font stack "Space Grotesk", "Noto Sans Devanagari".
- Voice: Kokoro Hindi voices (hm_omega 0.7 + hf_alpha 0.3, lang hi, speed 1.07) — see context/17 for the test log.
- CTA "आइडियावर्स ऐप डाउनलोड कीजिए" + current icon (re-checked, unchanged).

## New (`src/stage/eraser.js`, `src/stage/cues.js`)
Illustrated personal photo with a dustbin and its shadow; phone screen (tap ripple, rough circle selection, tool row,
free/paid checklist); cut-out lift into "हटाया गया"; checkerboard gap; 24 fill patches flying in from the surrounding
scene; check close-up (edge box, missed shadow, re-selection). Shots: two-shot hook · phone insert · photo close
(lift + fill) · check close-up · phone insert (free/paid) · CTA.

## Narration placements
h1 0.25 · h2 3.55 ("टैप" 6.67, "गोला" 7.79) · h3 9.35 ("अनुमान" 9.99, "भर" 14.51) · h4 15.65 ("ज़ूम" 18.21,
"किनारे" 18.87, "परछाइयाँ" 19.77) · h5 21.15 ("नहीं" 22.65, "फ़ोन" 24.57) · h6 26.30–28.57.

## Commands
build.sh (KOKORO_DIR must contain voices/hm_omega.bin + voices/hf_alpha.bin), qa.sh (ASRPY=<python with faster-whisper>).
