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
## Status / next
- Stills inspected in 9 rounds (framing under captions, drawer visibility, insert angles, IK reach, ghost placement).
- Full render running: `cd production/30s/2026-11-02-feedback-round/src && node render.mjs --frames --workers=3`.
- Next: encode, score (`node music/score.mjs`), loudnorm −15 LUFS/TP −1.5, mux, `./qa.sh` (ASRPY=…), QA.md, commit, push.
