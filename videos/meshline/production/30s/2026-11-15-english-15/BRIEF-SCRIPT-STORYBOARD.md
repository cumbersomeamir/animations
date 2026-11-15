# 28: Production 30s, batch 2026-11-15-english-15 (English): "One channel, many routers: who talks next?"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-15-english-15/meshline-30s-english15-01.mp4`, sha256 `c5ee6defda4f6c164d64ced9a8b908530529a8b64293edba96c065564f315d46`.
- Thumbnail: `…/meshline-30s-english15-01-thumbnail.png` (the frame-zero composition, "SAME CHANNEL. / WHO TALKS?"), sha256 `881d34d15ee7afe0666ba84bf6922ac1ef8f14d4ab6eb18e5bfe8384999fe81e`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.2 LUFS, −3.4 dBTP, voice/bed +20.7 to +28.8 dB;
  - final-MP4 ASR WER 0.039 raw, 0.013 normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Earlier batches are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue:** no job was running.
- **Read first:** CLAUDE.md, `05-progress.md`, context 00–27, the animation-direction skill and the episode log.

## Topic (history checked)
- **Proposed:** a crowded stadium with a "FULL SIGNAL. NO MESSAGE?" opening. That repeats 01 / pilot 01 / the 10 s test / 11, and the user's own english-12 note.
- **Kept (new):** the requested mechanism. Nearby radios sharing one channel use listen-before-talk with random backoff; equal picks collide; the waiting range doubles. Also kept: the internet-vs-air distinction.
- **Reframed:** the unused planned title "home Wi-Fi slowing at peak", shown as a building of 15 routers on one channel.

## First frame (new 2026-11-15 rule)
Frame 0 is the thumbnail composition: building on one channel, overlapping rings, in-flight messages and a coral mid-air clash, with "SAME CHANNEL. / WHO TALKS?" in the caption band. The words hand over to the first caption at 0.55 s. The hook audio starts at 0.25 s.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "SAME CHANNEL. / WHO TALKS?"
- **Hook:** "Every router here shares one channel. So who gets to talk?"
- **Escalation:** a collision scrambles both.
- **Build + proof (ETSI EN 301 893 / EN 300 328):**
  - listen first, then a random count of slots;
  - the lowest goes first while the others freeze;
  - equal picks clash and the range doubles (0–15 → 0–31).
- **Answer:** more neighbours on the channel means more waiting, whatever your internet plan (the internet line is ✓).
- **Payoff:** a quieter channel, or 5 GHz with far more room (Apple: channels are lanes).
- **CTA:** "For private nearby messaging, even offline, try Meshline." Listing facts only; no transport or delivery claim.

## Final script (76 words)
| id | time (s) | line (TTS says "five gigahertz"; captions show 5 GHz) |
|---|---|---|
| l1 | 0.25–3.55 | Every router here shares one channel. So who gets to talk? |
| l2 | 4.10–6.75 | When two transmit together, both get scrambled. |
| l3 | 7.31–11.58 | So Wi-Fi listens first, then waits a random number of tiny slots. |
| l4 | 12.13–16.06 | Pick the same number? They clash, and each doubles its waiting range. |
| l5 | 16.62–20.68 | More neighbours on your channel means more waiting, whatever your internet plan. |
| l6 | 21.23–25.24 | Pick a quieter channel, or move to 5 GHz, with far more room. |
| l7 | 25.84–29.55 | For private nearby messaging, even offline, try Meshline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4 | Hook | Building on "1 channel"; crossing messages, coral mid-air clashes; "?"; live air-time lane. |
| 4–7 | Collision | Two neighbours radiate together; waves turn coral, fizz: "scrambled" ✕. |
| 7.3–12 | Backoff | "listen first"; counters 5/2/7; B "GO"; A and C "wait" (frozen), then resume. |
| 12–16.3 | Clash | "same pick" 3-2-1; ✕; ranges "0–15 → 0–31" ("×2 range"); new picks 12/27. |
| 16.3–21 | Many | Whole building: frozen counters, one GO at a time; "more waiting" → "the air is busy"; "internet ✓"; instrument hidden. |
| 21–25.8 | Payoff | Lanes: 3 busy 2.4 GHz lanes → 6 5 GHz lanes; the stuck message moves to a free lane: "quieter", "more room". |
| 25.8–30 | CTA | Paper veil, icon and wordmark. |

## Reproduce
From `production/30s/2026-11-15-english-15/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english15-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english15-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
