# 35: Production 30s, batch 2026-11-19-english-22 (English): "Why two short wireless hops can beat one long hop"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-19-english-22/meshline-30s-english22-01.mp4`, sha256 `167542696ac408796c09b5e4a676cb65ec8361dd592f8934bee8a84f42bed0db`.
- Thumbnail: `…/meshline-30s-english22-01-thumbnail.png` (the frame-zero composition, "THE SHORTER / WAY AROUND"), sha256 `7391f3beec84e6482533ee28aa78a9cc894185db71d925512e953fad2a408aa9`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −3.7 dBTP, voice/bed +20.5 to +24.3 dB;
  - final-MP4 ASR WER 0.0 (base.en) and 0.0 normalised (whisper-small);
  - captions inside x 100–900 and y 280–460.
- No human watch-through or listen-through. Batches 20–21 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batches 20 (`b612f8e`) and 21 (`25b4884`) were already committed and pushed; there was no checkpointed work. This is the single batch-22 job.

## Topic (history checked; kept)
- **Requested:** why two short wireless hops can beat one long hop.
- **Overlap:** english-12 (episode 14) ended on "two clear hops beat one through concrete", but its subject was wall absorption.
- **New core:** distance alone. Loss gets worse with distance (6 dB per doubling), weak links need retries, a route's sends add up over its hops (ETX), and the relay costs airtime, so a decent direct link still wins.

## Brief and feedback applied
- **Frame zero:** a small message trying to jump a huge gap, "THE SHORTER / WAY AROUND".
- **Captions:** the band was raised to y 280–460 (plate 306–458; baselines 370/430), as this brief asked. The checker now enforces that band.
- **Right-side controls:** the instrument is narrowed to x 96–864, and the scene stays left of about x 870.
- **CTA ("No, call to action needed"):** spoken "Download Meshline for private nearby messages, even offline." plus the "Download free · Android" button. Listing facts only; the relay diagram is veiled under the CTA.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "THE SHORTER / WAY AROUND"; a message mid-jump about to fall short.
- **Hook:** "Why can a detour through another phone beat the direct path?"
- **Superhook:** "Radio signals weaken quickly with distance."
- **Build/proof:** half the hop gives about 4× the signal (ITU-R P.525). A weak link drops packets, so it needs resends. Two strong hops need fewer sends in total (ETX).
- **Payoff:** "But a relay also takes airtime, so a decent direct link still wins."
- **CTA:** "Download Meshline for private nearby messages, even offline." + button.

## Final script (70 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.21 | Why can a detour through another phone beat the direct path? |
| l2 | 3.95–6.45 | Radio signals weaken quickly with distance. |
| l3 | 7.25–11.23 | Cut each hop in half, and the signal arrives about four times stronger. |
| l4 | 12.05–15.68 | A weak link drops packets, so each one is sent again and again. |
| l5 | 16.60–18.97 | Two strong hops need fewer sends in total. |
| l6 | 20.10–24.40 | But a relay also takes airtime, so a decent direct link still wins. |
| l7 | 25.61–29.55 | Download Meshline for private nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–3.9 | Hook | A long jump falls into the gap; the relay route lights up; the message hops via the relay ✓; "?". |
| 3.9–7.2 | Superhook | Signal rings from you fade with distance: "strong" vs "weak". |
| 7.2–11.8 | Half | The ruler "one long hop" splits into "half / half"; the instrument shows 1× vs about 4× (to scale). |
| 11.8–16.3 | Retries | "weak link": ✕ ✕ ✓; the readout counts 3 sends. |
| 16.3–19.8 | Two hops | Strong blue hops ✓ ✓; 2 sends, "fewer sends". |
| 19.8–25.5 | Payoff | The relay's busy ring ("listens, then sends again"); a "decent direct link" delivers in 1 send, which is fewer. |
| 25.5–30 | CTA | Veil, push, icon + wordmark + "Download free · Android". |

## Decisions and lessons
- **TTS/ASR:** "Halve" was heard as "Have"; use "Cut … in half".
- **Metaphors:** a lost packet must land in open space, never on another device (it would read as delivered).
- **Captions:** when a brief names a caption band, change both `partCaps` and `captions_check.mjs` together. This batch uses plate y 306–458.

## Reproduce
From `production/30s/2026-11-19-english-22/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english22-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english22-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created, nothing was uploaded to Drive or social media, and no chat was created or renamed.
