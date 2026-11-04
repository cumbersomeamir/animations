# Progress

## Verified facts
- App: Meshline, `com.cumbersomeamir.meshline`, Android, Communication, free (0 INR), rated 12+, by Tensorblue AI (`assets/listing.json`).
- Listing description (the only feature source): "Private nearby messaging that keeps moving, even when the internet does not."
- Asset hashes match `03-assets.json`: icon `c80e7c20…23ef`, listing `b3df4726…f55f`.
- Icon palette (sampled pixels): background `#111714`, wave `#3157FF`, node `#F7F7F2`. Wave stroke width is 56/512 and node radius 21/512.
- Unknown and not claimed: transport tech, relay/multi-hop, encryption standard, metrics, pricing beyond free, testimonials.

## Creative decisions (30s production video)
- Stickman story: a Wi‑Fi sign physically breaks → two nearby people → short-range discovery rings → a thrown mesh line (icon geometry) → bubbles ride it → they walk while still linked → a high-five node becomes the logo → end card with the real icon and the CTA "Explore on Google Play".
- Coral only for offline. Blue only for Meshline.
- Phones are stylised glyph screens (no product UI claimed).
- Narration: local Kokoro-82M `af_heart` (Apache-2.0). Music and SFX are synthesised originals.
- Renderer: Node 22 + `@napi-rs/canvas` 1.0.11 → raw RGBA → FFmpeg libx264 (CRF 17). Remotion was avoided to sidestep company-license ambiguity.

## Completed (30s)
- Output: `videos/meshline/output/meshline-30s.mp4`, 30.000 s, 1080x1920, 30 fps, H.264 + AAC. sha256 `dbffaa2f8fb6dfe8e5f87f59a378b4964b41bf1933631c2ee81cfabe69c415e8`.
- Source: `videos/meshline/project/`. Docs: `storyboard.md`, `QA.md`, `LICENSES.md`. Evidence: `qa/`.
- Commands (from `videos/meshline/project`):
  - `scripts/setup.sh` (npm ci, venv, Kokoro download with sha256 check)
  - `PY=.cache/venv/bin/python scripts/build.sh`
  - `PY=python3 scripts/qa.sh`
- Checks: 900 frames, full decode clean, −15.7 LUFS, −1.6 dBTP, speech-band voice/bed ≥ +11 dB. Contact and boundary sheets inspected. 9 defects fixed (see `QA.md`).

## Unresolved
- Narration was not listened to by a human. It was verified by phonemes and level metrics only.

## Next
- 30s is delivered. The 15s text-message style test is tracked separately in `07-test-progress.md`.

## Production round 2026-11-03-round-02 (direct radio vs network route)
- Done. Output `production/30s/2026-11-03-round-02/meshline-30s-round02-01.mp4`, sha256 `365aa20e…f64c`. Details, sources, QA and next step are in `15-production-30s-round02-01.md`.

## Production 2026-11-03 Hindi batch 03 (airplane mode, Hindi)
- Done. Output `production/30s/2026-11-03-hindi-03/meshline-30s-hindi03-01.mp4`, sha256 `3fcc05cb…650a`. Details, the topic-swap reason, the Hindi voice decision, sources, QA and next step are in `16-production-30s-hindi03-01.md`.

## Production 2026-11-04 Hindi batch 04 (GPS without mobile data, offline maps)
- Done. Output `production/30s/2026-11-04-hindi-04/meshline-30s-hindi04-01.mp4`, sha256 `5239f66a…6a25`. Details, sources, QA and next step are in `17-production-30s-hindi04-01.md`.
