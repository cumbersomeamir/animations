# 37: Production 30s, batch 2026-11-23-english-24 (English): "Why a weak signal drains your battery faster"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-23-english-24/meshline-30s-english24-01.mp4`, sha256 `d5e777b2f64410e96fc4307dfa25999d211c5b647a1d112899938f61c52366d8`.
- Thumbnail: `…/meshline-30s-english24-01-thumbnail.png` (the frame-zero composition, "ONE BAR. / MORE DRAIN?"), sha256 `d4ccb5636e9ba663f1ef0545d7955e77fc5e87f54817d5cc27bea1e718c755af`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −4.2 dBTP, voice/bed +20.2 to +27.0 dB;
  - final-MP4 ASR WER 0.0 after number normalisation (raw 0.027: "50%" vs "fifty percent");
  - captions inside x 100–900 and y 280–460.
- No human watch-through or listen-through. Batches 20–23 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline` (synced with the remote: `f1f1746` was the latest), the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batch 23 was complete; there was no checkpointed work. This is the single batch-24 job.

## Topic (all prior topic records read; requested topic replaced)
- **Requested:** two radios talking at once silence each other (collision, random backoff).
- **Why replaced:** this is exactly episode 17 (english-15: listen-before-talk, collision, random backoff). Collisions are also the core of 21 (english-19), and retry backoff appears in 19 (english-17).
- **Chosen (unrelated, same genre):** why a weak signal drains your battery faster: rate adaptation (longer airtime), retransmissions and higher transmit power. Measured +52% energy for the same 3G download. Payoff: save big uploads for a stronger signal.
- **Distinct from batch 23** (address privacy) and 22 (hops) in question, setting (a vertical tower-and-two-phones shot) and mechanism.

## Feedback applied
- **"No, call to action needed":** spoken "Download Meshline for private nearby messages, even offline." plus the "Download free · Android" button. Listing facts only.
- **Visual identity kept.** Choreography varied: a vertical composition (tower at the top, near and far phones), an extreme close-up hook, and a split "same download" race with an energy readout.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "ONE BAR. / MORE DRAIN?"; a close-up of a one-bar phone, sending, at 41%.
- **Hook:** "Why does a weak signal drain your battery faster?"
- **Superhook:** "The radio has to work harder for every message."
- **Build/proof:** slower data rates mean longer sends; lost pieces are sent again; transmit power may rise. One study measured about 50% more energy for the same download (S1).
- **Payoff:** "So save big uploads for a stronger signal when you can."
- **CTA:** "Download Meshline for private nearby messages, even offline." + button.

## Final script (72 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–2.71 | Why does a weak signal drain your battery faster? |
| l2 | 3.45–6.04 | The radio has to work harder for every message. |
| l3 | 6.90–10.49 | Weak links get slower data rates, so each send takes longer. |
| l4 | 11.35–15.29 | Lost pieces are sent again, and the phone may transmit at higher power. |
| l5 | 16.15–20.51 | In one study, the same download used about fifty percent more energy. |
| l6 | 21.45–24.52 | So save big uploads for a stronger signal when you can. |
| l7 | 25.61–29.55 | Download Meshline for private nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–3.4 | Hook | Close-up: one bar, 41% → 38% (sped up), sending; "?". |
| 3.4–6.9 | Same download | Pull out: tower, "strong signal" and "weak signal" phones; the energy bars start. |
| 6.9–11.0 | Rate | Short quick bursts vs long slow bursts ("fast rate" / "slow rate, longer on air"). |
| 11.0–15.9 | Resend / power | ✕ "lost" → "sent again"; bigger, heavier rings: "higher power". |
| 15.9–21.0 | Measured | Both done ✓; energy 1× vs "+52%" ("one study, 3G"). |
| 21.0–25.5 | Payoff | Close-up: "big upload: waiting"; the bars climb; "sent on a strong signal" ✓. |
| 25.5–30 | CTA | Veil, push, icon + wordmark + "Download free · Android". |

## Decisions and lessons
- **Topic rule:** collision, backoff and turn-taking stories are repeats (17/19/21); replace them.
- **Sheet edges:** check the top edge too: at z 1.0, cam.y must be at least 16.67 (screen top = cam.y − 1000/(60·z) ≥ 0). Keep world content at y ≥ about 11 so wide shots never need a lower cam.y.
- **ASR:** "resent" was heard as "recent"; use "sent again". Report the number-normalised WER for "fifty percent" → "50%".

## Reproduce
From `production/30s/2026-11-23-english-24/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english24-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english24-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created, nothing was uploaded to Drive or social media, and no chat was created or renamed.
