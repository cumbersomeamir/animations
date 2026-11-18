# 33: Production 30s, batch 2026-11-17-english-20 (English): "Why your phone skips the nearest tower"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-17-english-20/meshline-30s-english20-01.mp4`, sha256 `34cd0eaf8a0f82ab5c100eefc29788cc1146b46c28b5f0c2a234fb83e7a97d18`.
- Thumbnail: `…/meshline-30s-english20-01-thumbnail.png` (the frame-zero composition, "NEAREST TOWER. / NOT CHOSEN."), sha256 `ab9f59c0e06bd1a3dfd930c311198e96925bde539166d578c509c819a6e3658f`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −3.2 dBTP, voice/bed +20.3 to +25.4 dB;
  - final-MP4 ASR WER 0.0 (base.en) and 0.0 normalised (whisper-small);
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Batch 19 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batch 19 was delivered (`0bb904b`). Batch 21 arrived while this job was running; it was queued and started after this one was committed.

## Topic (history checked; requested topic swapped)
- **Requested:** crowd + full bars (airtime contention vs signal strength). This repeats episodes 01, 12 and 17, and the log marks crowd and full-bars framing as repeats.
- **Chosen:** how a phone picks a tower. This was a planned, unused title. It covers network membership, ranking by measured signal, and switching after a margin and a set time.

## Feedback applied
- **"No, call to action needed":** the spoken CTA now starts with an action verb ("Download Meshline for nearby messages, even offline."). The end card adds an explicit blue button, "Download free · Android", under the icon and wordmark. Listing facts only.
- The visual skill, palette, narrator and caption safe area are unchanged.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "NEAREST TOWER. / NOT CHOSEN."
- **Hook:** "Your phone is beside a tower, yet it uses a farther one. Why?"
- **Superhook:** "That tower may not belong to your network."
- **Build/proof:** measured signal counts, not distance (TS 36.304 ranking on RSRP). A stronger tower appears, but the switch waits; it must win by a margin for a set time (Qhyst + Treselection; A3 offset + TTT) to avoid ping-pong.
- **Payoff:** "So the nearest tower is not always yours, and switches take a moment."
- **CTA:** "Download Meshline for nearby messages, even offline." + button.

## Final script (75 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–4.17 | Your phone is beside a tower, yet it uses a farther one. Why? |
| l2 | 4.67–6.78 | That tower may not belong to your network. |
| l3 | 7.66–11.22 | Among your network's towers, measured signal counts, not distance. |
| l4 | 12.10–14.97 | And when a stronger tower appears, the switch still waits. |
| l5 | 15.86–20.68 | It must win by a margin, for a set time, to avoid bouncing back and forth. |
| l6 | 21.56–25.49 | So the nearest tower is not always yours, and switches take a moment. |
| l7 | 26.09–29.55 | Download Meshline for nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.6 | Hook | The phone at the foot of the nearest tower; the blue link goes to a far tower; "?". |
| 4.6–7.5 | Superhook | The nearest tower turns grey, "other network"; its dashed link is struck out. |
| 7.5–11.6 | Measured | Pull out: "tower 1 / stronger" vs "tower 2 / nearer" behind a "building"; the instrument appears. |
| 11.6–15.8 | Walk | The phone walks past the building; tower 2's bar crosses tower 1's ("stronger" moves); the link stays, "waits". |
| 15.8–21.0 | Margin | "margin" band; timer ring "set time"; coral ghost "bouncing" struck out; the link swings to tower 2 ✓. |
| 21.0–26.0 | Payoff | Wide view: "nearest / other network", "a moment". |
| 26.0–30 | CTA | Veil, push, icon + wordmark + "Download free · Android" button. |

## Decisions and lessons
- **Topic swap:** crowd/full bars is a repeat; how a phone picks a tower is new.
- **ASR wording:** "wins" was heard as "winds"; prefer "counts".
- **CTA concision:** commas add TTS pauses; "Download Meshline for nearby messages, even offline." (3.46 s) is the chosen action CTA.
- **Spec access:** ETSI and 3GPP serve bot checks to curl. The ETSI PDF came through the session web fetcher; its text was extracted locally with pdftotext.

## Reproduce
From `production/30s/2026-11-17-english-20/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english20-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english20-01-thumbnail.png`

## Next
Batch 21 (2026-11-18) is next in the queue. No automation was created and nothing was uploaded to Drive.
