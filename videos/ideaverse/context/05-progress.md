# Progress — 30s stickman production video (WORK IN PROGRESS, not delivered)

## Verified facts
- App: Ideaverse, package com.ideaverseai, branch claude-video/ideaverse, account amir@tensorblue.com.
- Listing (assets/listing.json, sha256 6046aa27…): name "Ideaverse - All in One AI App"; "a platform for creating Images for Instagram and a lot more!"; category SOCIAL; rated 3+; author Tensorblue AI; price 0 INR in snapshot.
- Icon (assets/icon.png, sha256 71309d83…): navy #1B2333, mint #6CDA7E, white sparkles; lightbulb + planet ring.
- Unverified/not claimed: animation/"bring to life", speed, pricing, metrics, any in-app UI.

## Creative decisions
- Stickman creator with mint scarf on a navy planet; clutter tiles (coral/amber/lavender/sky) = "too many apps"; all absorbed tiles turn mint.
- Story: juggle → bonk → buried → phone (real icon) absorbs tiles → idea bulb thrown in → image resolves → shared to friends → hearts form new bulb → icon end card. See storyboard.md.
- Narration: Piper TTS 1.8.0, voice en_US-ljspeech-high (LJ Speech dataset, public domain). "Ideaverse" spoken via phonemes [[ aɪdˈiːə ]] [[ vˈɜːs ]]. Selected takes committed in src/narration/wav (Piper is stochastic). ASR (faster-whisper base.en) confirmed all 8 lines.

## Completed
- src/ renderer (@napi-rs/canvas 1.0.11 → FFmpeg), all 6 scenes animated; stills inspected (several fix rounds: framing, heap coverage, juggle clutter, wind-up arc wrap, phone hop occlusion, CTA spacing).
- Silent full render verified to build (build/video.mp4, not committed).

## Unresolved / next
- Audio engine (numpy/scipy synth score + SFX from build/events.json + narration ducking) not yet written.
- Final mux, contact sheet, ffprobe, decode check, QA.md, output/ideaverse-30s.mp4 still to do.
- Paused by user's newer request (15s kinetic-reel style test, see 06/07).

## Commands
- cd videos/ideaverse/src && npm ci && node render.mjs --events ../build/events.json --video ../build/video.mp4

---
# CURRENT — production 30s feedback round (2026-11-02) — supersedes the stale notes above
## Facts (verified)
- Style correction recorded in context/11 ("STYLE CORRECTION"): pilot-01 DOCKET newsroom is the default; Riso banned.
- Episode brief + claim/source map: context/15-production-30s-feedback-01.md.
- Narration: cached Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; 6 lines, ASR-verified (src/narration).
## Creative decisions
- Pilot engine reused unchanged (renderer, lights, stage, DOCKET rig, IK, camera system, caption pill style).
- New props: MAIL SORTER cabinet (SPAM SCORE gauge, INBOX/SPAM drawers, reader on top), 3 big example envelopes,
  18 mini examples in two clusters, magnifier with live zoom lens, missing-letter ghost, NOT SPAM sticker.
- Captions: pill y 344–520, x 92–988 (exact geometry exported by `node render.mjs --caplog`); nothing drawn above y 340.
- Music: quiet pad progression, event-linked notes/SFX only, no loops.
## Status — DELIVERED
- ideaverse-30s-feedback-01.mp4 rendered (900 frames, 3 SwiftShader workers, ~27 min + 4 targeted re-renders),
  encoded, mastered (−14.7 LUFS / −1.8 dBTP), muxed; QA in feedback-round/QA.md + qa/.
- Commands: see feedback-round/build.sh and qa.sh (ASRPY=<python with faster-whisper> ./qa.sh).
- Unresolved: none blocking. Minor accepted items listed in QA.md.
- Next: await user review. Do not start another episode or create automation unless asked.

---
# CURRENT — production 30s round-02 (2026-11-03) — supersedes the feedback-round status above
## Facts
- Brief: user-approved round 02; topic "How your phone reads text from a photo" (new; history checked). Record: context/16.
- Icon replaced with the current Play icon (03-assets.json); CTA now "Download the Ideaverse app" (context/11 round-02 note).
## Decisions
- Renderer/style/voice/caption treatment reused unchanged from the feedback round; new props: bus timetable board, phone
  (EXAMPLE screen), pattern cabinet (LETTERS/NUMBERS, MATCH meter), candidate + variant cards, menu card.
## Status — DELIVERED
- ideaverse-30s-round02-01.mp4 rendered (900 frames ~51 min, 3 SwiftShader workers, + targeted re-renders 0–85, 388–430,
  555–570), encoded, mastered (−15.0 LUFS / −1.5 dBTP), muxed; QA in 2026-11-03-round-02/QA.md + qa/.
- Commands: 2026-11-03-round-02/build.sh and qa.sh (ASRPY=<python with faster-whisper> ./qa.sh).
- Next: await user review. No further episode, no automation.

---
# CURRENT — production 30s hindi-03 (2026-11-03) — supersedes round-02 status above
## Facts
- Brief: one new Hindi video (all narration + captions Devanagari); topic: remove a background distraction (Google
  Photos Magic Eraser; free/paid per context/17). Icon re-checked: unchanged.
## Decisions
- Voice: Kokoro Hindi voices hm_omega 0.7 + hf_alpha 0.3 (Apache-2.0), speed 1.07; Piper hi_IN rejected (licences).
- Font: Noto Sans Devanagari via @fontsource 5.3.0. Renderer/style unchanged.
## Status — DELIVERED
- ideaverse-30s-hindi03-01.mp4 rendered (900 frames ~49 min + re-renders 184–191, 375–380, 555–900), encoded, mastered
  (−14.9 LUFS), muxed; QA in 2026-11-03-hindi-03/QA.md + qa/ (Hindi ASR via faster-whisper medium).
- Next: await user review (native-speaker listen suggested). No further episode, no automation.

---
# CURRENT — production 30s meme-01 (2026-11-03) — supersedes hindi-03 status above
- Experimental Hindi meme episode (shopping-list fail; photo-editing premise rejected as a repeat of hindi03-01).
- DELIVERED: production/30s/2026-11-03-meme-01/ideaverse-30s-meme-01.mp4 (QA.md + qa/). Recipe saved in context/11
  "Experimental MEME format"; record context/18. Next: await user review. No further episode, no automation.
