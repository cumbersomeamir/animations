# QA: videos/meshline/tests/15s/meshline-15s-test.mp4

## Verification evidence (final render)
| Check | Result | Evidence |
|---|---|---|
| Codec/format | H.264 High, yuv420p, 1080x1920, 30/1 fps; AAC LC 48 kHz stereo | `qa/ffprobe.json`, `qa/ffprobe-summary.txt` |
| Duration | **15.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Frames | 450 decoded | `qa/frames.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥0.25 s, freeze ≥1.5 s) | `qa/black_freeze.txt` |
| Loudness | −15.3 LUFS integrated, LRA 3.6 LU, true peak −3.1 dBTP. The last second still carries audio (−26.8 dB mean). | `qa/loudness.txt` |
| Narration clarity (300–4000 Hz voice/bed) | n1 +16.1 dB, n2 +9.9 dB | `qa/voice_balance.json` |
| Sound sync | One cue per message from `cues()`, in the same timebase as the pictures (30 events) | `qa/cues.json` |
| Contact sheet | 16 frames, 0.25–14.95 s | `qa/contact-sheet.png` |
| Boundaries | 16 frames: frame 0, first pop, fail, second fail, switch, refill sweep, typing, reply pop, sent pop, receipt→Read, tapback, card pop, CTA, last frame | `qa/boundary-sheet.png` |
| SHA-256 | `795eb2d60bd8b19c2ce67d800888d7b3b29135aeb162b232f3472262e409d313` | `qa/sha256.txt` |

## Assessment
- **Readability:** bubble text is 48 px Inter Medium, white on `#3157FF` or `#222B28`. The newest bubble always lands between y≈1100 and y≈1505, clear of the compose bar and the bottom 360 px. End card: 112 px wordmark and a 48 px CTA on a blue pill, held for 3.5 s, with only a 25 % fade at the end.
- **Colour:** the palette is sampled from the icon. Coral appears only on offline elements (notice, "Not delivered", "!" badge, slashed Wi‑Fi). Blue marks Meshline and delivered messages.
- **Continuity:** the stack is bottom-anchored and grows smoothly through spring-eased slot heights. The typing bubble morphs into the reply in place. The offline notice stays in the history (dimmed) after the switch, so the internet is still down and the story stays honest.
- **Motion:** something moves on every beat: pops, shakes, the header slide, the wave sweep with refills, typing dots, tapback overshoot, scroll glides, card part pops and CTA shimmer.
- **Claims:** listing-backed only (see `storyboard.md`). The UI carries a permanent "not actual app screens" disclosure. "Google Play" appears as text only.

## Defects found and fixed
1. The thread hugged the top of the screen (lower half empty) → switched to the skill's flex-end, bottom-anchored stack.
2. The 40 px type was too small for an ad → 48 px, with padding and radius scaled.
3. Frame 0 was sparse → coral offline notice plus four prior-history messages.
4. The "Not delivered" receipt peeked under the compose clip while scrolling → higher floor (1505) and faster scroll settle.
5. Header status text crossfaded on top of itself → sequential slide out, then slide in.
6. The status-dot ripple overlapped the "Nearby" label → smaller, fainter ripple.
7. History messages emitted cues at t = −2 s → excluded from the cue sheet.

## Known limitations
- The narration is synthetic: local Kokoro-82M, voice `af_heart`, Apache-2.0. It was checked by level metrics, not by human listening.
- The chat chrome is an original stylised design, not Meshline's real interface (none is verified in the approved assets).
