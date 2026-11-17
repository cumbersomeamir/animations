# 32: Production 30s, batch 2026-11-17-english-19 (English): "Why two nearby radios can collide without hearing each other"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-17-english-19/meshline-30s-english19-01.mp4`, sha256 `504cd9325ebab6061f1717b6fc2fa8810bb5a7c20bdccdbe0ae3cda7a9340ae4`.
- Thumbnail: `…/meshline-30s-english19-01-thumbnail.png` (the frame-zero composition, "HEARD NOTHING. / STILL CRASHED."), sha256 `0dea5ba466d54df2556581dbdbebf922ecd10248de3d90aeb6e912c4dd4e04ab`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.1 LUFS, −3.7 dBTP, voice/bed +18.7 to +27.5 dB;
  - final-MP4 ASR WER 0.0 (base.en) and 0.0 normalised (whisper-small);
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 18 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batch 18 was already delivered (`90c3452`); this is the single batch-19 job.

## Topic (history checked)
**Hidden-terminal problem and RTS/CTS turn-taking.** Never covered. Related: english-15 (listen-before-talk/backoff when senders *can* hear each other); this episode is the case where listening fails.

## Brief adjustments applied
- Frame zero is the collision itself (burst at the middle phone) with "HEARD NOTHING. / STILL CRASHED.".
- Packet overlap first, then illustrative turn-taking (request → clear to send → far side waits → take turns).
- Generic wireless mechanism (802.11 RTS/CTS, optional) vs no verified Meshline protocol; the CTA uses listing facts only.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "HEARD NOTHING. / STILL CRASHED."
- **Hook:** "Two radios listen first, hear silence, and still collide. How?"
- **Build:** left and right both reach the middle, not each other.
- **Proof:** both hear silence, send, and clash in the middle. Listening happens at the sender; collisions happen at the receiver (MIT 6.033 L13).
- **Payoff:** Wi-Fi can ask first; the middle's "clear to send" reaches the far side too, which waits its turn.
- **CTA:** "Message people nearby, even offline, with Meshline."

## Final script (76 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–4.37 | Two radios listen first, hear silence, and still collide. How? |
| l2 | 4.95–8.86 | The left and right phones both reach the middle one, but not each other. |
| l3 | 9.43–13.36 | So both hear silence, send, and their signals clash in the middle. |
| l4 | 13.94–17.56 | Listening happens at the sender. Collisions happen at the receiver. |
| l5 | 18.14–21.76 | So Wi-Fi can ask first, and the middle replies: clear to send. |
| l6 | 22.33–25.69 | The far side catches that reply too, and waits its turn. |
| l7 | 26.29–29.55 | Message people nearby, even offline, with Meshline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.9 | Hook | Frame 0: collision burst at the middle; "silence" bubbles; both send again and collide; "?". |
| 4.9–9.4 | Setup | "left's reach" / "right's reach" rings; "can't hear each other" ✕. |
| 9.4–13.9 | Overlap | "silence", both send, coral burst "collision"; lane: overlapping coral bars. |
| 13.9–18.1 | Where | "listens here" (left, right) vs coral ring "clash here" (middle). |
| 18.1–22.3 | Ask | "request" pill; "clear to send" rings reach both sides. |
| 22.3–26.3 | Turns | Right "waits" (timer ring); left ✓, then right ✓; "take turns"; lane: clean blue bars. |
| 26.3–30 | CTA | Paper veil, slow push, icon and wordmark. |

## Decisions and lessons
- Letter names ("A and C") were misheard by both ASR models ("Unsee"); phones are named by position (left, middle, right).
- Speech first ran 27.3 s; l5 was trimmed to fit the 21–27 s takeaway window.

## Reproduce
From `production/30s/2026-11-17-english-19/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english19-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english19-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
