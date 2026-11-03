# Production notes — Ideaverse 30s meme-01 (Hindi, experimental meme)
Branch claude-video/ideaverse · round 2026-11-03 meme-01 · recipe context/11 "Experimental MEME format" · record context/18.

## Kept
src copied from hindi-03 (accepted renderer = pilot-01 engine): DOCKET rig, lights, stage, camera system, IK, Hindi
voice blend, Noto Sans Devanagari, quiet score engine with ducking, −15 LUFS master, caption safe band y 344–520.

## New for the meme
- `stage/meme.js`: original cart + grocery props, phone chat screen states (vague prompt → endless list → 4 questions →
  constraint chips → modest list), clipboard knock, freeze-frames (`window.renderAt` holds picture time, zoom punch,
  desaturate, flash), outlined meme captions (no pill), deadpan face (half-lid, no blink).
- `stage/cues.js`: meme beats placed on Hindi ASR word times. `music/score.mjs`: freeze booms, stings, bonks, clinks.

## Commands
build.sh (KOKORO_DIR with voices hm_omega.bin + hf_alpha.bin); qa.sh (ASRPY=<python with faster-whisper>).
