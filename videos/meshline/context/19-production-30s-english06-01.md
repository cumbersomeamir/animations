# 19: Production 30s, batch 2026-11-06-english-06 (English): "One tick, but not two: where is your message?"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-06-english-06/meshline-30s-english06-01.mp4`, sha256 `336c3ff6780c930cdb563063aa51c920a632b8d5fddcf725dfee5f643f8ed5b5`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −14.0 LUFS, −2.9 dBTP, voice/bed +17.6 to +24.4 dB;
  - ASR WER 0.0 on the final MP4;
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`. The assigned account is amir@tensorblue.com (CLAUDE.md); commits use the session's noreply identity.
- **State:** the tree was clean at `4580a7c`, no job was running, and the batch folder did not exist.
- **Isolation:** only Meshline files were read. The "Recall" voice in the brief belongs to another app and was not used; no other app name appears in the CTA or copy.
- **Language override:** English narration and captions only. The approved English Meshline voice (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98, en-us) was used, and no Hindi audio was reused.
- **Topic replaced:** the suggested "crowded concert: full bars yet messages fail (signal ≠ capacity)" is episode 01 (English, 2026-11-02), plus pilot 01 and the 10s test. The fresh subject, sent vs delivered and where a message waits, keeps the brief's "direct nearby vs internet delivery" angle and its truthful Meshline link.

## Approved style kept
- The actual renderer: Node 22 + `@napi-rs/canvas` 2D Transit Map sheet (`src/render.mjs` from round 02). The new scene `src/ticks.mjs` uses the same helpers:
  - sheet, blue routes, white stations, pen tips, paper veils;
  - coral only for problems;
  - one screen-space instrument (a receipt tracker);
  - English captions at 52 px EBold, baselines 398/458;
  - CTA icon + wordmark at y ≈ 1462–1526;
  - the bottom note at 1612.
- Quiet pad bed (`audio/mix_e6.py`) with the voice upfront.

## Final script (79 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.22 | One tick, but not two? Your message is stuck halfway. |
| l2 | 3.99–8.09 | In many chat apps, one tick means it left your phone and reached the server. |
| l3 | 8.86–10.44 | Two ticks mean it reached their phone. |
| l4 | 11.22–15.08 | If their phone is off or offline, the server holds it and keeps trying. |
| l5 | 15.85–19.46 | Seeing a clock? It hasn't left your phone yet; check your connection. |
| l6 | 20.23–25.54 | A direct nearby link skips the server entirely, but only works within limited range. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

Edits during drafting:
- The first draft had 71 words but only 22.9 s of speech (about 1 s of dead air between lines).
- It was enriched to 79 words, within the app's 65–80 rule: "In many chat apps" (hedge), "or offline", "yet", "entirely", and "works within limited range".
- The CTA was shortened from 4.15 s ("…private nearby messaging, even without internet") to 3.41 s ("…nearby messaging, even offline"), so it sits in the last ~3.9 s.

## Sources
See `production/30s/2026-11-06-english-06/research/claims.md`:
- WhatsApp Help Center check-mark FAQ (sent, delivered, clock = not yet sent / connectivity, phone off = no second tick);
- WhatsApp Privacy Policy (undelivered messages are held on servers while delivery is retried);
- Bluetooth SIG (point-to-point links, finite range);
- the Meshline listing.

The publishing caption carries the transcript only; sources stay in repo notes, so no other app name appears in the copy.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–3.9 | Hook | Cartouche "Sent vs delivered". An envelope zips from "your phone" up to the "server" while the tracker moves from the clock to one tick. The route to "their phone" turns coral ("offline", "phone off"), and a coral "?" appears at the server. |
| 3.9–8.6 | One tick | Push along the first leg. A ghost envelope replays the climb on the highlighted "internet route", and "one tick = at the server" appears. |
| 8.6–11.0 | Two ticks | Their phone comes online, the route re-inks, and the envelope travels down. The tracker reaches ✓✓, with a ring at their phone. |
| 11.0–15.6 | Server holds it | Their phone goes off again. A second message reaches the server ("held · retrying"), and retry dots fizzle at the offline cut. |
| 15.6–20.0 | Clock | Your own route is cut ("your connection"). The envelope stays on your phone with a coral clock, and the tracker shows the clock. |
| 20.0–26.0 | Direct link | The internet routes veil. A "nearby phone" pops in, the pen draws a dashed direct link, and the envelope hops across. The tracker switches to "your phone → nearby phone · no server · limited range". A range ring grows, and their phone is "out of range". |
| 26.0–30 | CTA | The instrument fades and the Meshline icon and wordmark appear. The direct hop keeps looping, with a slow push-in. |

## Reproduce
From the batch folder:
- `<kokoro-py> ../../../education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr.py lines <faster-whisper-base.en>`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en> meshline-30s-english06-01.mp4 qa/asr_final.json`

## Next
Await review. No automation was created, nothing was uploaded to Drive, and no other video was started.
