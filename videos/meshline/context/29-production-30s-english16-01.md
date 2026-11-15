# 29: Production 30s, batch 2026-11-15-english-16 (English): "Why Bluetooth hops 1,600 times a second"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-15-english-16/meshline-30s-english16-01.mp4`, sha256 `6f408725fa78379813d681fbaaae7d248d1938e3c7768d9aa2b1fdddb4c57a1d`.
- Thumbnail: `…/meshline-30s-english16-01-thumbnail.png` (the frame-zero composition, "1,600 HOPS / A SECOND?"), sha256 `84cf592bbea7e7665d32bcf81c86fe3b8a54d7d739a2ea4ade51d7a96d426973`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.4 LUFS, −4.3 dBTP, voice/bed +18.4 to +26.8 dB;
  - final-MP4 ASR WER 0.153 raw, 0.0 normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 15 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue:** batch 15 was already finished and pushed (`c25ae8d`); this is the single batch-16 job.
- **Interruptions:** the session's worker restarted mid-render after a usage-limit pause. Work resumed from the existing batch folder; nothing was lost or repeated.

## Topic (history checked)
- **Proposed:** store-carry-forward / delay-tolerant networking ("a message may arrive only after someone walks away"). This is a repeat of **episode 03** (2026-11-03, store and forward with a travelling relay; RFC 9171 / RFC 4838 / NASA DTN).
- **Chosen:** **frequency hopping**, a never-covered same-genre nearby-radio story with an equally strong, truthful opening.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "1,600 HOPS / A SECOND?" over a live hop map.
- **Hook:** "Classic Bluetooth hops about 1,600 times a second. Why?"
- **Build:** crowded band (Wi-Fi, gadgets) → devices hop together across 79 channels.
- **Proof:** 625 µs stops, so bursty interference spoils only a few hops (NIST SP 800-121).
- **Adaptive:** skip busy channels (ETSI EN 300 328).
- **Payoff:** keep 2.4 GHz Wi-Fi at 20 MHz to leave Bluetooth room (Apple).
- **CTA:** "Message people nearby, even offline, with Meshline." Listing facts only; no transport claim.

## Final script (70 words)
| id | time (s) | line (TTS spells the numbers out; captions show digits) |
|---|---|---|
| l1 | 0.25–4.29 | Classic Bluetooth hops about 1,600 times a second. Why? |
| l2 | 4.71–7.50 | Its band is crowded with Wi-Fi and other gadgets. |
| l3 | 7.92–11.78 | So connected devices hop together across 79 channels. |
| l4 | 12.20–16.12 | Each stop is so brief that interference spoils only a few hops. |
| l5 | 16.54–19.91 | Adaptive hopping also spots busy channels and skips them. |
| l6 | 20.33–25.69 | Keep your router's 2.4 GHz band at 20 MHz, to leave Bluetooth room. |
| l7 | 26.29–29.55 | Message people nearby, even offline, with Meshline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.6 | Hook | A hop route races over the channel-vs-time map; both devices show the same channel; real-time counter (~1,600/s), "the map is slowed down". |
| 4.6–7.9 | Crowded | Wi-Fi bands 1/6/11 with coral bursts; "other gadgets" blips. |
| 7.9–12.2 | Together | "in sync", then the "79 channels" bracket. |
| 12.2–16.4 | Brief stops | Closer view; "625 µs per stop"; few coral ✕ hits; "only a few hits"; instrument hidden. |
| 16.4–20.2 | Adaptive | Busy bands hatched; the route avoids them; "skip busy channels". |
| 20.2–26.2 | Router tip | "your Wi-Fi" 40 MHz → 20 MHz; freed channels glow; "more room". |
| 26.2–30 | CTA | Paper veil, icon and wordmark. |

## Production notes
- **Honest interference:** draw Wi-Fi as bursts in time, not solid bands, so "only a few hops" stays true on screen.
- **Slow-motion disclosure:** a slowed visual of a real rate is labelled, and the real rate is shown by the instrument counter.

## Reproduce
From `production/30s/2026-11-15-english-16/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english16-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english16-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
