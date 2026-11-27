# 38: Production 30s, batch 2026-11-27-english-25 (English): "Why a radio can send farther by slowing down"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-27-english-25/meshline-30s-english25-01.mp4`, sha256 `f40fcc89e5479d68568739c1e2c9e77df0f2033f5a9d21d2ecf308e0730f9f4a`.
- Thumbnail: `…/meshline-30s-english25-01-thumbnail.png` (the frame-zero composition, "SEND SLOWER. / REACH FARTHER."), sha256 `f325618c840f717972474d105d70b9523c58b6dd02d10f6c0cb5b23dc54d7782`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.2 LUFS, −4.2 dBTP, voice/bed +19.9 to +25.2 dB;
  - final-MP4 ASR WER 0.0 (base.en and whisper-small);
  - captions inside x 100–900 and y 280–460.
- No human watch-through or listen-through. Batches 20–24 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline` (synced: `a8195a2` was the latest), the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Disk:** checked first; 25 GB free, so no temporary space was needed.
- **Queue:** batch 24 was complete; this is the single batch-25 job.

## Topic (actual history checked; kept)
- **Requested:** why a radio can send a short message farther by slowing down (slower symbols under noise; the throughput–reliability trade-off).
- **Not covered as a core.** Adjacent: batch 24 named "slower data rates" only as a battery cost. Overlap noted.
- **Sourced example:** Bluetooth LE Coded PHY, S=8. One bit becomes 8 symbols through FEC; data decodes at a lower SNR; about 4× the range at the same transmit power; 125 kb/s vs 1 Mb/s (Bluetooth SIG).

## Feedback applied
- **CTA:** spoken "Download Meshline for private nearby messages, even offline." plus the "Download free · Android" button. Listing facts only.
- **Visual identity kept.** Choreography varied: two symbol lanes, a signal-vs-noise strip with moving threshold crossings, a macro close-up (1 bit → 8 symbols), and reach brackets.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "SEND SLOWER. / REACH FARTHER."; fast dots die out and slow groups arrive.
- **Hook:** "How can sending slower make a message reach farther?"
- **Superhook:** "Far away, the signal sinks into the noise."
- **Build/proof:** eight symbols per bit; the code fixes errors in a weak signal (the needed level drops, so the reach moves out); 8× slower, about 4× the range.
- **Payoff:** "That is why long range modes suit short messages, not videos."
- **CTA:** "Download Meshline for private nearby messages, even offline." + button.

## Final script (70 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–2.94 | How can sending slower make a message reach farther? |
| l2 | 3.60–6.06 | Far away, the signal sinks into the noise. |
| l3 | 6.90–10.59 | Bluetooth's long range mode spends eight symbols on every bit. |
| l4 | 11.45–15.31 | That extra code lets the receiver fix errors in a weak signal. |
| l5 | 16.15–20.23 | The cost: eight times slower. The gain: about four times the range. |
| l6 | 21.05–24.98 | That is why long range modes suit short messages, not videos. |
| l7 | 25.61–29.55 | Download Meshline for private nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–3.6 | Hook | Two lanes: fast dots die (✕), slow groups arrive (✓). |
| 3.6–7.0 | Noise | The signal curve sinks toward noise; "fast mode needs"; "lost in noise" at 1×. |
| 7.0–11.0 | Eight symbols | Close-up: "1 bit" → "8 symbols". |
| 11.0–15.9 | Fix errors | Corrupted symbols still decode "→ 1"; "long range needs less"; the crossing slides to 4×. |
| 15.9–21.0 | Cost / gain | Instrument 1 Mb/s vs 125 kb/s; reach brackets 1× and about 4×. |
| 21.0–25.5 | Payoff | A short message arrives ✓; a video crawls. |
| 25.5–30 | CTA | Veil, push, icon + wordmark + "Download free · Android". |

## Decisions and lessons
- **Close-ups:** hide strips, labels and phone names that a close-up would cut or crowd.
- **Repeated tokens:** space symbol groups so they read as discrete units, not a barcode.
- **Ratios over absolutes:** when a source gives ratios (8× slower, ~4× range), draw thresholds and crossings to those ratios and state that there is no dB scale.

## Reproduce
From `production/30s/2026-11-27-english-25/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english25-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english25-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded or published.
