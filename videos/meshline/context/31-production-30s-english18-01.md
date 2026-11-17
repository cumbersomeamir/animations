# 31: Production 30s, batch 2026-11-15-english-18 (English): "Why a route that worked a minute ago can fail now"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-15-english-18/meshline-30s-english18-01.mp4`, sha256 `3b5950838589f3ccb697e93b170eeaabbd2faf39efc0724c469dc878f4153394`.
- Thumbnail: `…/meshline-30s-english18-01-thumbnail.png` (the frame-zero composition, "THE BRIDGE / WALKED AWAY"), sha256 `a5d8481400d1a05aaf61c8e41f271b0d82af29d5eacccb23e83ab5f3b38b4c8b`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.1 LUFS, −2.9 dBTP, voice/bed +20.7 to +26.3 dB;
  - final-MP4 ASR WER 0.05 raw, 0.025 normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 17 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue:** batch 17 was already delivered (`37bcb81`); this is the single batch-18 job. It resumed after a "Try again" with the history check and RFC download already done.

## Topic (history checked)
**Route breaks under mobility, stale routes and rediscovery.** Never covered.

## Brief adjustments applied
- **Brighter frame-zero hook:** stronger bridge glow, a larger coral stuck message.
- **Essential labels enlarged:** "you", "bridge", "friend" and beat labels at 0.6–0.75 G.
- **Clear distinction:** generic mesh principle (AODV as the documented example) vs no verified Meshline routing feature; the CTA uses listing facts only.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "THE BRIDGE / WALKED AWAY".
- **Hook:** "This route worked a minute ago. Now the message is stuck. Why?"
- **Build:** a route is a chain of phones, and phones move (rewind, then walk-off).
- **Proof:** hellos about every second; two missed → link lost (RFC 3561 defaults). The stale route's break is reported back (RERR). A route request spreads (RREQ) and a reply returns along a fresh path (RREP).
- **Payoff:** "A route is a snapshot, not a promise."
- **CTA:** "For private nearby messaging, even offline, try Meshline."

## Final script (73 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.86 | This route worked a minute ago. Now the message is stuck. Why? |
| l2 | 4.56–7.88 | In a mesh, a route is a chain of phones, and phones move. |
| l3 | 8.58–13.88 | Neighbours often say hello every second. Miss two, and the link is treated as lost. |
| l4 | 14.57–17.73 | The route is now stale, so the break is reported back. |
| l5 | 18.43–22.60 | Then a route request spreads, and a reply returns along a fresh path. |
| l6 | 23.30–25.24 | A route is a snapshot, not a promise. |
| l7 | 25.84–29.55 | For private nearby messaging, even offline, try Meshline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.4 | Hook | The bridge walks off; coral broken link ✕; the message is stuck at "you". |
| 4.4–8.5 | Chain | "a minute ago" rewind: blue route you → A → bridge → C → friend; "phones move": the bridge walks off again. |
| 8.5–14.4 | Hellos | Hello rings; "hello?" → "2 missed" → "link lost"; instrument ✓ ✓ ✗ ✗. |
| 14.4–18.2 | Stale | Grey dashed "stale" route; coral route error back to you ("break reported"). |
| 18.2–23.2 | Rediscover | Request rings spread; "reply" envelope returns; fresh path you → E → F → friend. |
| 23.2–25.8 | Snapshot | The message travels the fresh path ✓; "a minute ago" vs "now". |
| 25.8–30 | CTA | Paper veil, slow push, icon and wordmark. |

## Reproduce
From `production/30s/2026-11-15-english-18/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english18-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english18-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
