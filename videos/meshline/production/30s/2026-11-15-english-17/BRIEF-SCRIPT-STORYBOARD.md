# 30: Production 30s, batch 2026-11-15-english-17 (English): "Why one message can fill the air"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-15-english-17/meshline-30s-english17-01.mp4`, sha256 `7c3afa1eaa68f90eb66d61c781da7dd68c5ca39b3b8d825cb068261160b43d99`.
- Thumbnail: `…/meshline-30s-english17-01-thumbnail.png` (the frame-zero composition, "THE AIR / IS FULL"), sha256 `a537298fffe65408c90e91a7d92fb87c1b0f8bea40aae520df9857b82b305f41`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.3 LUFS, −3.7 dBTP, voice/bed +19.2 to +25.4 dB;
  - final-MP4 ASR WER 0.026 raw, 0.013 normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 16 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue:** batch 16 was already delivered (`2dc38df`); this is the single batch-17 job.

## Topic (history checked)
- **Proposed:** "Why a message gets smaller when the network gets worse": acks, retry, and flooding a mesh with repeats congesting it.
- **Core (never covered):** flood control. Every relay repeats; copies multiply and bounce back; a hop count shrinks by one per relay (the message "gets smaller"); a "seen it" list drops repeats.
- **Secondary (partly covered in 08/17):** acks and retry, kept to one beat (wait longer before each retry, RFC 6298).

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "THE AIR / IS FULL" over a flooded 14-device mesh, counter 111.
- **Hook:** "One message, sent once. So why is the air suddenly full?"
- **Build:** every device repeats; repeats bounce back; each copy costs airtime (counter 1 → 111).
- **Proof:** hop count 3 → 0 (RFC 3626 TTL decrement; Bluetooth mesh TTL); seen-it list (RFC 3626 duplicate set; Bluetooth mesh message cache). Counter 11 vs 111.
- **Payoff:** no reply → wait longer before each retry (RFC 6298 doubling).
- **CTA:** "For private nearby messaging, even offline, try Meshline." Listing facts only; no mesh, relay or delivery claim.

## Final script (74 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.92 | One message, sent once. So why is the air suddenly full? |
| l2 | 4.44–7.72 | In a flooding mesh, every device that hears it repeats it. |
| l3 | 8.23–11.59 | Repeats bounce back and forth, and each one costs airtime. |
| l4 | 12.12–16.25 | So every copy carries a hop count that drops by one at each relay. |
| l5 | 16.76–20.90 | At zero it stops, and devices drop any copy they have already seen. |
| l6 | 21.42–25.24 | No reply yet? Good senders wait longer before each retry. |
| l7 | 25.84–29.55 | For private nearby messaging, even offline, try Meshline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.4 | Hook | Flooded mesh, coral bounce-backs, counter 111. |
| 4.4–12.1 | Naive flood | One sender; rounds of repeats; "every device repeats" → "bouncing back" → "each copy costs airtime"; counter 1 → 2 → 7 → 26 → 111. |
| 12.1–16.7 | Hop count | Badges 3 → 2 → 1 → 0 ride the copies; counter rises to 11. |
| 16.7–21.2 | Stop + seen | "0 · stop" at the 3 far devices; ticks + struck-out coral duplicates; "11 vs 111 without". |
| 21.2–25.8 | Retry | Zoom on the sender; timer rings wait 1, 2, 4; "no reply yet" → "wait longer" → "reply" ✓. |
| 25.8–30 | CTA | Paper veil, icon and wordmark. |

## Reproduce
From `production/30s/2026-11-15-english-17/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english17-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english17-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
