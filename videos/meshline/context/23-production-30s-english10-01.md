# 23: Production 30s, batch 2026-11-09-english-10 (English): "Full Wi-Fi bars, but no internet"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-09-english-10/meshline-30s-english10-01.mp4`, sha256 `cc71097a9a1e937f5a2530509d2ee6114b2c76f7e54985f4ebd6f185be59f6c9`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.1 LUFS, −2.5 dBTP, voice/bed +19.0 to +28.6 dB;
  - ASR WER 0.0;
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`. The assigned account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue order:** english-09 was finished and pushed first (`bc87c30`); this batch was second.
- **Isolation:** only Meshline files were read; no other app names appear.
- **Language:** English only, with the approved English blend (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).
- **Topic kept:** never covered before (distinct from 01 cellular capacity and 05 airplane mode).

## Approved style kept
- The same 2D `@napi-rs/canvas` Transit Map renderer and helpers; new scene `src/wifi.mjs`.
- One screen-space instrument (two link rows), English captions at 52 px in y 350–470, CTA icon + wordmark, no mascot.

## Final script (77 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–2.28 | Full Wi-Fi bars, but nothing loads? |
| l2 | 3.01–7.33 | Those bars measure only the radio link between your phone and the router. |
| l3 | 8.06–11.65 | The internet is a second link, from the router out to your provider. |
| l4 | 12.38–15.93 | When that link is down, the bars stay full and nothing gets through. |
| l5 | 16.66–21.33 | Quick check: if another device can't load either, it's the connection, not your phone. |
| l6 | 22.06–25.54 | Then check the router's cables, or restart the router and modem. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

## Sources
See `production/30s/2026-11-09-english-10/research/claims.md`:
- Android Developers (`WifiInfo.getRssi`, `WifiManager.calculateSignalLevel`, `NET_CAPABILITY_VALIDATED`);
- Google Pixel Help 6183600 (another-device check; restart router & modem; check cables);
- the Meshline listing.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–2.9 | Hook | Close on the phone: full Wi-Fi fan with a spinning loader; "Wi-Fi: full bars", "page: loading…", coral "?". Cartouche "Full bars, no internet? / two different links". |
| 2.9–7.9 | Radio link | The dashed phone ↔ router link is highlighted: "Wi-Fi radio link", "bars = this link". |
| 7.9–12.3 | Second link | Pan up; the pen draws router ↔ "internet provider" ("internet link"). |
| 12.3–16.4 | Down | Coral ×, "down"; a request crosses the Wi-Fi fine and fizzles at the cut ("nothing gets through"); the bars stay full. |
| 16.4–21.8 | Check | "another device" joins and fails too; "the problem is here" at the cut; "phone: OK". |
| 21.8–26.1 | Fix | "check cables" and "restart"; the link re-inks ("back up"), the instrument shows "up ✓", and both devices show ✓. |
| 26.1–30 | CTA | Icon and wordmark. |

## Next
english-11 (queued, next in order). No automation was created and nothing was uploaded to Drive.
