# 34: Production 30s, batch 2026-11-18-english-21 (English): "Why pairing shows the same six digits on both phones"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-18-english-21/meshline-30s-english21-01.mp4`, sha256 `ef433d2c7ac8e7c85e7b132ca46a61e1b9e7acf4de822eccef50dc80575d8b03`.
- Thumbnail: `…/meshline-30s-english21-01-thumbnail.png` (the frame-zero composition, "SAME SIX DIGITS. / WHY?"), sha256 `34dfd9eb0a297603fca4f256cfaa1c0f4eecf37ea49d4d1904401d1200361453`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −4.3 dBTP, voice/bed +19.9 to +24.8 dB;
  - final-MP4 ASR WER 0.0 (base.en) and 0.0 normalised (whisper-small);
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 20 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batch 21 arrived while batch 20 was running. Batch 20 was finished, committed (`b612f8e`), pushed and attached first; then this single batch-21 job ran.

## Topic (history checked; requested topic swapped)
- **Requested:** Bluetooth through your own body (absorption, geometry, placement).
- **Why swapped:** this is obstruction plus placement again, already the core of 07, 14 and 16. The log says obstruction, walls and distance are fully covered as a main mechanism.
- **Chosen:** Bluetooth numeric comparison. It covers the six digits on both screens, ECDH public keys and a shared secret, the middleman, and "only tap pair on a match". Never covered.

## Feedback applied
- **"No, call to action needed":** the CTA keeps the batch-20 action format: a spoken "Download Meshline for private nearby messages, even offline." plus a "Download free · Android" button.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "SAME SIX DIGITS. / WHY?"
- **Hook:** "When two phones pair, both show the same six digits. Why?"
- **Superhook:** "Because someone in the middle could pose as each phone."
- **Build/proof:** public keys are swapped and a shared secret is built. Each phone computes a six-digit check. A middleman must substitute its own keys, so the numbers almost surely differ.
- **Payoff:** "So only tap pair when both screens show the same number."
- **CTA:** "Download Meshline for private nearby messages, even offline." + button.

## Final script (77 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.73 | When two phones pair, both show the same six digits. Why? |
| l2 | 4.60–7.11 | Because someone in the middle could pose as each phone. |
| l3 | 7.98–11.92 | Each phone sends its public key, and both build one shared secret. |
| l4 | 12.79–15.80 | Then each turns what it received into a six-digit check. |
| l5 | 16.67–21.18 | A middleman must swap in its own keys, so the numbers would almost surely differ. |
| l6 | 22.05–24.99 | So only tap pair when both screens show the same number. |
| l7 | 25.61–29.55 | Download Meshline for private nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.5 | Hook | Two big phones, both "482 913"; the digits pulse; "?". |
| 4.5–7.9 | Superhook | A masked coral middleman on the line: "I'm your friend" / "I'm you". |
| 7.9–12.6 | Keys | Public-key tokens cross; "shared secret" padlocks. |
| 12.6–16.4 | Check | The digits roll and settle; the readout says "match" ✓. |
| 16.4–21.6 | Middleman | Real keys in, coral "its own keys" out; the digits roll to different values; "numbers differ" ✕, "no match". |
| 21.6–25.6 | Payoff | A clean pairing; "Pair" buttons; taps; "same number: pair" ✓. |
| 25.6–30 | CTA | Veil, push, icon + wordmark + "Download free · Android". |

## Decisions and lessons
- **Topic rule:** body blocking counts as obstruction; swap it like walls and lifts.
- **ASR:** base.en can repeat a final "Why?" on an isolated line; judge on the final mix and cross-check with whisper-small.
- **Readouts:** no value on any readout before the visual computes it (roll placeholder digits).

## Reproduce
From `production/30s/2026-11-18-english-21/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english21-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english21-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
