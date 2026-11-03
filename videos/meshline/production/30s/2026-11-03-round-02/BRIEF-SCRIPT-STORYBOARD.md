# 15: Production 30s, round 02 ("Why nearby phones can talk directly while a far-away friend needs a route"), 2026-11-03

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-03-round-02/meshline-30s-round02-01.mp4`, sha256 `365aa20ed90fa09179b06c15957f16873a613322014cd3ce98de4674b950f64c`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks: full decode OK. No black or freeze. −14.3 LUFS, −3.3 dBTP. Voice/bed +19.3 to +22.0 dB. ASR WER 0.0. Captions inside y 350–470 and x 90–990.
- Prior outputs (01, 02, store-and-forward and earlier) are preserved and untouched.

## Pre-flight checks (before starting)
- The working tree was clean on `claude-video/meshline` (HEAD `763b0ce`). `production/30s/2026-11-03-round-02/` did not exist, and no render or TTS job was running.
- Topic history: Bluetooth / direct radio vs routing was never an episode. It appeared only as a planned title in `08-educational-strategy.md` and as a source mention in `13`. Distinct from 02 (walkie-talkie: push-to-talk on one channel) and from store-and-forward (contacts over time).

## Brief (user, 3 Nov 2026, "USER APPROVED NEW ROUND")
- One new 30 s English educational video in the exact accepted Transit Map style, palette and voice.
- Topic: a household room versus another city. Show the local direct link and the remote network path, and say radio reach is finite without a long warning.
- Verify against Bluetooth SIG primary pages. Don't invent a Meshline radio stack or range, and make no unlimited-range or guaranteed-connectivity claim.
- 65–75 natural words, with the CTA in the last 3–4 s: "Download Meshline for offline communication" (only if the official product facts support it).
- Source links go in repo/publishing copy, not in the video.

## Final script (73 words, Meshline Kokoro blend 0.7 af_bella + 0.3 am_puck, 0.98, en-us)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–4.87 | Why can phones in one room talk directly, but not to a friend in another city? |
| l2 | 5.29–10.01 | Nearby, Bluetooth radios can link devices directly, without the internet. |
| l3 | 10.43–14.73 | But that radio reach is limited by distance, walls and interference. |
| l4 | 15.13–18.02 | A friend in another city is far beyond that range. |
| l5 | 18.44–22.55 | Their messages need a route across the internet, hopping between routers. |
| l6 | 22.97–26.43 | Close by: a direct link. Far away: a network route. |
| l7 | 26.88–29.47 | Download Meshline for offline communication. |

Edits from the first draft (74 words), before synthesis:
- l4 "far beyond it" became "far beyond that range", so the referent is clear.
- l5 "Messages to them need a route through networks and routers, across the internet" became the shorter line with "hopping between routers", which matches the RFC 1812 next-hop wording.

The ASR line pass was verbatim on all 7 lines, so no intelligibility rewrites were needed.

## CTA check
"Download Meshline for offline communication" is supported by `assets/listing.json`: a free (0 INR, InStock) Google Play Android app in Communication, described as "messaging that keeps moving, even when the internet does not". The CTA makes no radio, range or connectivity claim.

## Citations (full mapping in `production/30s/2026-11-03-round-02/research/claims.md`)
- Bluetooth SIG range page:
  - range is "anywhere from more than a kilometer down to less than a meter";
  - path loss "occurs naturally over distance";
  - attenuators include "walls, windows…";
  - the PHY includes "guards in place to counter interference".
- Bluetooth SIG tech overview: "point-to-point device communication"; LE topologies "point-to-point, broadcast and mesh".
- IETF RFC 791: "The selection of a path for transmission is called routing."
- IETF RFC 1812: a router forwards to "the next-hop router or (for the final hop) the destination host".
- App fact: the listing only.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–2.9 | Hook | Printed cartouche "Near or far? / direct radio vs network route". A floor plan "one room" holds two phones and a router. Radio pulses alternate phone→phone, and each one lands and lights the other phone. |
| 2.9–4.9 | Hook reveal | Pull back to the whole sheet. One pulse spreads and fades long before "another city" (friend's phone, coral "?") is veiled in at the top right. |
| 4.9–10.3 | Direct link | Push into the room. 5.95: radio arcs and "Bluetooth radios". 7.15: the pen draws a dashed link, "direct radio link". 7.8: an envelope crosses straight between the phones. 8.55: the router dims, "no internet needed". The instrument appears with the row "nearby · direct radio". |
| 10.3–14.6 | Finite reach | Medium shot. The "radio reach" bubble grows ("limited"). 12.15: signal bars weaken along a radius ("distance"). 13.05: the walls flash and the reach beyond them is cut back ("walls"). 13.8: coral static wobbles and shrinks the outline ("interference"). The local link stays inside the reach. |
| 14.6–18.3 | Far friend | Pull back to wide; the city appears as it is named. The instrument row "far away · ?" appears. 16.45: a coral measuring line runs from the reach edge toward the friend, "far beyond radio reach". |
| 18.3–22.6 | Route | The pen draws home router → routers in a dashed "internet" zone → city router → friend, and each stop pops. The envelope hops router to router as the routers light ("routers"), then arrives and the friend lights. The instrument dots fill, "via routers". The camera drifts with the climbing message. |
| 22.6–26.9 | Takeaway | 22.97: "close by: direct link". The room and the instrument row 1 highlight, and an envelope loops between the phones. 24.65: "far away: network route". The route glows, row 2 highlights, and an envelope loops along the route. |
| 26.9–30 | CTA | The instrument fades and the Meshline icon and wordmark appear in the safe area. Slow push-in, loops continue. Caption "Download Meshline / for offline communication". |

## QA
See `production/30s/2026-11-03-round-02/QA.md`: 3 defects fixed, and the limits are listed honestly.

## Reproduce
From `videos/meshline/production/30s/2026-11-03-round-02`:
- `<kokoro-py> ../../../education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr.py lines <faster-whisper-base.en dir>` (writes `asr_words.json`, committed)
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en dir> meshline-30s-round02-01.mp4 qa/asr_final.json`

## Next
Await review. No automation was created, and nothing was uploaded to Drive.
