# 36: Production 30s, batch 2026-11-21-english-23 (English): "Why your phone keeps changing its Bluetooth address"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-21-english-23/meshline-30s-english23-01.mp4`, sha256 `cbd8e290b46b76efc36aa48075e3045fcba7d5815c984316dc983175f571f3a5`.
- Thumbnail: `…/meshline-30s-english23-01-thumbnail.png` (the frame-zero composition, "NEW ADDRESS. / SAME PHONE."), sha256 `95eb15199ceb6ef4afc25b129bdcd8bc0572dedd2e02244ddf0c97974b94b6d8`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −3.7 dBTP, voice/bed +22.1 to +29.0 dB;
  - final-MP4 ASR WER 0.0 after number normalisation (raw 0.013: "15" vs "fifteen");
  - captions inside x 100–900 and y 280–460.
- No human watch-through or listen-through. Batches 20–22 and all earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is the assigned Meshline account; commits use the session's noreply identity.
- **Queue:** batch 22 was already committed and pushed (`9ca86a6`); there was no checkpointed work. This is the single batch-23 job.

## Topic (all prior topic records read; requested topic replaced)
- **Requested:** why an elevator can swallow your wireless signal (metal enclosure, attenuation, position and obstruction).
- **Why replaced:** the same core question and payoff as 07, 14 and 16 (obstruction and placement). The ledger explicitly names "signal in a lift" and "lift blocking stories" as obstruction repeats.
- **Chosen (unrelated, same genre):** Bluetooth LE address privacy. A changing random address (RPA) stops strangers' scanners from following you; paired devices resolve it with the shared IRK; keep your device name plain.
- **Distinct from batch 22** (two hops vs one long hop) in question, setting (a transit-map street with scanners) and mechanism. **Distinct from batch 21** (pairing numeric comparison): verifying a partner vs not being tracked.

## Feedback applied
- **"No, call to action needed":** spoken "Download Meshline for private nearby messages, even offline." plus the "Download free · Android" button. Listing facts only.
- **Visual identity kept** (Transit Map palette, label halos, instrument, veil). **Choreography varied:** a walking pan along a transit line, split-flap address tags, a what-if run, then two close-ups.

## Story (Theory of Marketing)
- **Thumbnail / frame 0:** "NEW ADDRESS. / SAME PHONE."; the live tag with old tags left behind.
- **Hook:** "Why does your phone keep changing its Bluetooth address?"
- **Superhook:** "A fixed address would let scanners follow you around." (what-if run: tracked)
- **Build/proof:** Android rotates a random address at least every 15 minutes (CDD). A stranger's scanner sees a new device each time. Paired devices share a key, so they still recognise you (NIST, Bluetooth SIG).
- **Payoff:** "Your device name can still give you away, so keep it plain." (NIST)
- **CTA:** "Download Meshline for private nearby messages, even offline." + button.

## Final script (76 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–2.92 | Why does your phone keep changing its Bluetooth address? |
| l2 | 3.60–6.19 | A fixed address would let scanners follow you around. |
| l3 | 7.00–11.20 | So Android swaps in a new random address at least every fifteen minutes. |
| l4 | 12.00–15.24 | To a stranger's scanner, it is a new device each time. |
| l5 | 16.10–19.99 | But paired devices share a secret key, so they still know it is you. |
| l6 | 21.10–24.32 | Your device name can still give you away, so keep it plain. |
| l7 | 25.61–29.55 | Download Meshline for private nearby messages, even offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–3.5 | Hook | The live tag flips; old tags fade behind; "?". |
| 3.5–6.9 | What-if | A coral fixed tag zips past shop, café and station; every log matches; a coral trail: "tracked". |
| 6.9–15.9 | Rotation | A walking pan; the tag flips between stops; "≤ 15 min (sped up)"; three different log entries; "new device?". |
| 15.9–20.9 | Paired | Close-up: the friend's "shared key" resolves the tag to "it's you"; "stranger: ?". |
| 20.9–25.5 | Payoff | Close-up: the address changes, "Sam's Phone" stays the same → "Phone" ("plain name"). |
| 25.5–30 | CTA | Veil, push, icon + wordmark + "Download free · Android". |

## Decisions and lessons
- **Topic rule:** lift, elevator and metal-box stories are obstruction repeats; replace them with an unrelated mechanism.
- **Platform facts:** the Android CDD is the primary source for Android-wide behaviour (here the RPA rotation ceiling); state its scope in `claims.md`.
- **Right-side zone:** for walking shots, pan the camera with the subject so tags stay left of about 890 px.
- **ASR:** spoken number words come back as digits ("15"); report the number-normalised WER.

## Reproduce
From `production/30s/2026-11-21-english-23/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration` (then set starts as in the table)
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english23-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english23-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created, nothing was uploaded to Drive or social media, and no chat was created or renamed.
