# 25: Production 30s, batch 2026-11-11-english-12 (English): "Why concrete walls shrink Bluetooth range"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-11-english-12/meshline-30s-english12-01.mp4`, sha256 `f5b63c6bee1021aacb4caf36208937c0340fcf4cd4172edc96dea075711e1698`.
- Thumbnail: `videos/meshline/production/30s/2026-11-11-english-12/meshline-30s-english12-01-thumbnail.png` (1080x1920, "ONE WALL. / NO LINK?"), sha256 `2c651f64…62a1`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.3 LUFS, −4.0 dBTP, voice/bed +18.5 to +28.9 dB;
  - final-MP4 ASR WER 0.13 raw, 0.014 number-normalised;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Earlier renders are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Read first:** CLAUDE.md, `05-progress.md`, the approved context (00–24), `.claude/skills/animation-direction/SKILL.md` and the episode log.
- **Isolation:** no other app's visuals, voice, CTA or assets were used. English only, with the established narrator (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).

## Topic
- **Proposed:** "Why phones lose signal in a packed stadium". This repeats 01, pilot 01, the 10 s test and english-11.
- **User TOPIC OVERRIDE:** "Bluetooth range shrinks through concrete walls: attenuation, obstacles, relay placement".
- **Overlap noted:** Hindi feedback-05 (headphones behind a wall, diagnosis test) and round-02.
- **New angle:** measured loss by material (NIST), the dB → distance conversion (ITU-R P.525) and relay placement. This is the first English treatment.

## Story (Theory of Marketing)
- **Thumbnail:** "ONE WALL. / NO LINK?"
- **Hook:** "Same distance, one concrete wall, and the link drops. Why?" (the wall slams down on screen).
- **Escalation:** "Through thin drywall, it barely changes."
- **Build + proof:**
  - absorbed and reflected;
  - a measured ~30 dB through ~20 cm (NIST, 2 GHz);
  - 30 dB ≈ 30× the distance in open air (ITU-R P.525).
- **Payoff:** a relay in the doorway; two clear hops beat one through concrete.
- **CTA:** "Message people nearby, even offline, with Meshline." It uses only listing facts: no range, transport, relay, emergency reliability or "reach anyone".

## Final script (69 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.90 | Same distance, one concrete wall, and the link drops. Why? |
| l2 | 4.33–6.67 | Through thin drywall, it barely changes. |
| l3 | 7.11–12.82 | Bluetooth's two point four gigahertz wave is absorbed and reflected by dense concrete. |
| l4 | 13.24–17.47 | Lab tests measured about thirty decibels lost through twenty centimetres. |
| l5 | 17.91–20.79 | In open air, that's like thirty times the distance. |
| l6 | 21.22–25.69 | So a relay belongs in the doorway: two clear hops beat one through concrete. |
| l7 | 26.29–29.55 | Message people nearby, even offline, with Meshline. |

## Sources (details in `research/claims.md`)
- Bluetooth SIG range page (no universal range; 2.4 GHz; walls/concrete; type and density).
- NIST IR 6055, measured concrete/drywall/glass loss: ~203 mm concrete −28.6 to −34.9 dB at 2.0 GHz; drywall ≈ −0.6 dB.
- ITU-R P.525-4 (free-space loss 20 log d).
- Bluetooth SIG mesh page (relay over multiple hops, generic).
- The Meshline listing.

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–3.9 | Hook | Envelope already crossing; "same distance"; the concrete wall slams down; the link turns coral, fizzles, ✕, "?". Meter: no wall → concrete. |
| 3.9–6.9 | Escalation | The wall morphs to drywall; the message arrives ✓; "barely any loss"; meter "−0.6 dB". |
| 6.9–13 | Mechanism | Close on the wall: "2.4 GHz" wave; "absorbed" (coral glow); "reflected" (bounce); faint transmitted wave. |
| 13–17.6 | Proof | "−30 dB" stamp and "20 cm" dimension; the instrument is hidden. |
| 17.6–21 | Open-air equivalent | The plan is veiled; close on 1×, pull out while the ruler counts to "30× the distance". |
| 21–26 | Payoff | "relay" in the doorway; two clear hops ✓; the direct path ✕; instrument "✓ 2 clear hops / ✕ 1 through concrete". |
| 26.3–30 | CTA | Paper veil (relay diagram faded), icon and wordmark. |

## Reproduce
From `production/30s/2026-11-11-english-12/` (with `$S` = the scratchpad holding the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english12-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english12-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created, nothing was uploaded to Drive, and no other video was started.
