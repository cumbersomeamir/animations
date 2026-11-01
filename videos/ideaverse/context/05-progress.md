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
