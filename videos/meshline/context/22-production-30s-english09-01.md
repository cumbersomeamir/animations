# 22: Production 30s, batch 2026-11-08-english-09 (English): "Packet loss and jitter: why a video call freezes"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-08-english-09/meshline-30s-english09-01.mp4`, sha256 `e6e5c16bde48cd66a40a4974957ea1b97cc9203328eca8f68e3be4361417a6db`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.4 LUFS, −1.1 dBTP, voice/bed +21.7 to +26.3 dB;
  - ASR WER 0.0 with numbers normalised;
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline` (local = origin at `94e1eea` when started). The assigned account is amir@tensorblue.com; commits use the session's noreply identity.
- **State:** no other job was running. This batch was accepted before english-10/11 and finished first, as the brief requires.
- **Isolation:** only Meshline files were read; no other app name appears in the CTA or copy.
- **Language:** English only, with the approved English blend (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).
- **Topic kept:** never covered before; distinct from 10 (latency vs bandwidth).

## Approved style kept
- The same 2D `@napi-rs/canvas` Transit Map renderer and helpers (`src/render.mjs`); new scene `src/jitter.mjs`.
- One screen-space instrument with sequential states, English captions at 52 px in y 350–470, CTA icon + wordmark, no mascot.

## Final script (74 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.81 | Your speed test looks fast; why does the video call freeze? |
| l2 | 4.19–7.71 | Calls send a steady stream of small packets, timed evenly. |
| l3 | 8.10–11.56 | Missing ones are packet loss: the picture freezes or skips. |
| l4 | 11.95–15.31 | Uneven arrivals are jitter: the app must wait and buffer. |
| l5 | 15.69–21.45 | Call networks target at most one lost packet per thousand, and jitter within fifty milliseconds. |
| l6 | 21.84–25.54 | Bandwidth and latency can look fine; check loss and jitter too. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

Edits during drafting:
- The first draft (76 words, 27.4 s) was tightened.
- l1 changed from "Speed test says fast" to "Your speed test looks fast", because ASR merged "test says" into "tests as".

## Sources
See `production/30s/2026-11-08-english-09/research/claims.md`:
- ITU-T Y.1541 Table 1 class 0 (VoIP/VTC): loss ≤ 1×10⁻³, IPDV ≤ 50 ms;
- RFC 3550 jitter definition;
- G.114 (a de-jitter buffer adds delay);
- RFC 3393;
- the Meshline listing.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–4.1 | Hook | "speed test ↓ 100 Mbps ✓" next to "call: frozen". A loss burst puffs packets out, the call screen freezes with blocky artefacts, and coral × marks fill the arrivals timeline. Cartouche "Fast, but frozen? / loss and jitter". |
| 4.1–8.0 | Steady stream | Evenly spaced packets ("steady stream"); the ball plays smoothly. |
| 8.0–11.9 | Packet loss | Packets puff out ("packet loss"), the picture freezes then skips, and the timeline shows ×. |
| 11.9–15.6 | Jitter | Packets bunch and spread ("jitter: uneven gaps"); the buffer fills ("wait to smooth · adds delay"). |
| 15.6–21.8 | Targets | A 1,000-dot grid with one ringed coral dot ("loss ≤ 1 in 1,000") and a jitter bar with the 50 ms line. |
| 21.8–26.1 | Check | "bandwidth = width", "latency = length", "stability = even spacing"; card "bandwidth ✓ · latency ✓ · loss · jitter check". |
| 26.1–30 | CTA | Icon and wordmark; the stream keeps flowing. |

## Next
english-10 (queued, next in order). No automation was created and nothing was uploaded to Drive.
