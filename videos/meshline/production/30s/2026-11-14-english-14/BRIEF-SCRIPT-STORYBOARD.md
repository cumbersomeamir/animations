# 27: Production 30s, batch 2026-11-14-english-14 (English): "Why a hand's width can bring the signal back"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-14-english-14/meshline-30s-english14-01.mp4`, sha256 `9a9802da9e1ff16183d139faee5bfc43d152eed3ab7fe9081c33c48639c05a31`.
- Thumbnail: `…/meshline-30s-english14-01-thumbnail.png` (1080x1920, "DEAD SPOT? / MOVE IT."), sha256 `28f1e93807b4930b1d54095e0179951770e5c579cc3e37f51b3ff495957f3159`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.4 LUFS, −3.4 dBTP, voice/bed +17.4 to +24.4 dB;
  - final-MP4 ASR WER 0.074 raw, 0.0 number-normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Earlier batches are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue:** no other job was running.
- **Read first:** CLAUDE.md, `05-progress.md`, context 00–26, the animation-direction skill and the episode log.
- **Isolation:** no other app's visuals, voice, CTA or assets. English only, with the established narrator (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).

## Topic (history checked; changed before scripting)
- **Proposed:** "Why moving a phone a few steps can restore its connection", via an obstruction/clearer-path mechanism. That overlaps 07 (Hindi wall test), 14 (concrete walls, relays) and 15 (the wall beat).
- **Chosen:** a genuinely new same-genre topic: **multipath dead spots**. Echoes arrive out of sync and add or cancel, so strong and weak spots sit centimetres apart and a hand's-width move can restore a link.
- **Brief elements kept:** interference, positioning, packets stalling vs arriving, before/after positions.

## Story (Theory of Marketing)
- **Thumbnail:** "DEAD SPOT? / MOVE IT."
- **Hook:** the phone sits in a dark spot on a live signal map; a hand's-width slide brings the bars back: "Why?"
- **Build + proof:**
  - several paths bounce off walls (ITU-R P.1238);
  - echoes add or cancel (ITU-R P.1406 §3.3);
  - one 2.4 GHz wave ≈ 12 cm (NIST c / Bluetooth band);
  - weak and strong spots are centimetres apart (minima ≥ λ/2).
- **Payoff:** when a nearby link stalls, shift the phone a little (before vs after).
- **CTA:** "Try Meshline for private nearby messaging, even offline." Listing facts only.

## Final script (78 words; 81 as spoken with the numbers spelled out)
| id | time (s) | line (the TTS text spells out the numbers; captions show 2.4 GHz and 12) |
|---|---|---|
| l1 | 0.25–4.15 | Dead spot? Slide the phone a hand's width, and it can come back. Why? |
| l2 | 4.67–8.51 | The radio wave arrives by several paths, bouncing off walls. |
| l3 | 9.03–12.55 | The echoes arrive out of sync. Here they add up, there they cancel. |
| l4 | 13.07–17.69 | At Bluetooth's 2.4 gigahertz, one wave is about 12 centimetres long. |
| l5 | 18.20–21.26 | So weak and strong spots can be just centimetres apart. |
| l6 | 21.78–25.32 | When a nearby link stalls, shift the phone a little before giving up. |
| l7 | 25.92–29.55 | Try Meshline for private nearby messaging, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.4 | Hook | Signal map close-up; the phone is in a dark spot (coral bars, "dead spot"); an envelope fizzles; the phone slides "a hand's width"; bars rise, "strong", an envelope ✓, "?". |
| 4.4–8.8 | Paths | Room view; direct, ceiling and floor paths ink in with travelling dashes ("3 paths"); "walls". |
| 8.8–13 | Add / cancel | Room veiled; echo 1 + echo 2: in step = big wave "add up"; out of step = flat "cancel". |
| 13–18 | Wavelength | Travelling sine, "2.4 GHz", one-wavelength bracket "≈ 12 cm". |
| 18–21.5 | Spacing | Map close-up; "weak" and "strong" rings, "centimetres apart"; the phone returns to the weak spot. |
| 21.5–25.9 | Payoff | An envelope stalls; the phone shifts; an envelope ✓ (before ✕ / after ✓). |
| 25.9–30 | CTA | Paper veil, icon and wordmark. |

## Production notes
- **Signal map:** computed (direct path + 3 wall reflections via the image method). Its wavelength is roughly to scale with the phone glyph; the room is not to scale. The phone's bars and the instrument sample the same field (meaningful motion, not decoration).
- **Sheet size:** extended from 32 to 40 G so lower strips never show the sheet edge. Camera keys are checked numerically against the sheet's left and right edges.

## Reproduce
From `production/30s/2026-11-14-english-14/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english14-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english14-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
