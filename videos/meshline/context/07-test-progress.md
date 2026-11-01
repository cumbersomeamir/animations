# 07: 15s style-test progress (text-message-animation)

## Facts (verified)
- App: Meshline, `com.cumbersomeamir.meshline`. The listing description is the only feature source: "Private nearby messaging that keeps moving, even when the internet does not."
- Palette sampled from `assets/icon.png` pixels: charcoal `#111714`, electric blue `#3157FF`, node white `#F7F7F2`. This palette is final, not provisional.
- No verified product screenshots exist in the approved assets. All chat UI is therefore an **explicitly labelled stylised illustration**, not Meshline's real UI.
- The 30s production video is preserved and committed (`750aeed`) at `videos/meshline/output/meshline-30s.mp4`.

## Skill provenance
- Fetched read-only on 2026-11-01 from `raw.githubusercontent.com/iart-ai/text-message-video-skills/HEAD/` (MIT license).
  - `skills/text-message-animation/SKILL.md`, sha256 `e0c16dc8cea19fab57afd1d85577c1cff7f77e20fb9f63b7772e10fa4d97b9f5`
  - `references/bubble-recipes.md`, sha256 `138ace3cd886471ca67ac83e90e77117e221fead17d297c22ba2a1e2b2df2557`
  - `references/data-driven.md`, sha256 `d79f14b519e3c0ec7f4e61dfdcc789e749b5fc0c4a3c464ce475347bd93900d1`
  - The `scripts/` helpers referenced by SKILL.md (contact-sheet.sh, probe-mp4.sh, README.md) returned 404 at HEAD. Nothing from that repository was executed.
- The skill is a Remotion/React recipe. We did not install Remotion. Its grammar is reimplemented in our own Node code with `@napi-rs/canvas` (npm, pinned) and FFmpeg.

## Creative choices
- Story: friends lose each other at a packed venue. The internet is down, so two sends fail ("Not delivered" with a shake). "Now messaging nearby" appears, the icon's wave sweeps down and refills the failed bubbles as "Delivered", and the conversation flows ("Right behind you. Blue jacket." → "Meet by the stage?" → "On my way" with a heart tapback). It ends on a chat-native app card: real icon, Meshline, "Private nearby messaging", CTA "Explore on Google Play".
- Chrome is a Meshline-palette stylised chat, not iMessage/WhatsApp. It carries a permanent "Stylised illustration · not actual app screens" label.
- Sound: one cue per message (send swoosh, receive ding, keyboard ticks under typing, fail bonk, refill tick). The groove (96 BPM, Emaj9–C#m9–Amaj9–B6) only unmutes at the nearby switch.
- VO is local Kokoro `af_heart`, two lines: "No internet?" (0.95 s) and "Meshline. Private, nearby messaging. Explore on Google Play." (10.70–14.59 s).
- Full skill mapping and adaptations: `tests/15s/SKILL-NOTES.md`.

## Render checks (final)
- Output: `videos/meshline/tests/15s/meshline-15s-test.mp4`, sha256 `795eb2d60bd8b19c2ce67d800888d7b3b29135aeb162b232f3472262e409d313`.
- Format: 15.000 s exactly, 450 frames, 1080x1920, 30 fps, H.264 High + AAC LC 48 kHz stereo.
- Full decode clean. No black or freeze. −15.3 LUFS, −3.1 dBTP. Speech-band voice/bed +16.1 / +9.9 dB.
- Contact sheet and boundary sheet inspected (typing, pops, fail, switch, sweep, receipts, tapback, card, last frame). 7 defects fixed (see `tests/15s/QA.md`).
- Commands (from `videos/meshline/tests/15s`):
  - `npm ci`
  - `PY=<python with numpy+scipy> scripts/build.sh`
  - `scripts/qa.sh`
  - `REGEN_VO=1 KOKORO_DIR=… scripts/build.sh` re-synthesises narration. The committed WAVs are used otherwise.

## Unresolved
- Narration has not been human-listened. Real Meshline UI is unverified, so the chat stays stylised.

## Next
- Test delivered. Awaiting user feedback on the style before any further variants.
