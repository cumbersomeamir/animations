# 21: Production 30s, batch 2026-11-07-english-08 (English): "Latency vs bandwidth: why a video call still lags"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-07-english-08/meshline-30s-english08-01.mp4`, sha256 `3a431ac4f95022444e80d9533c0ea96187cbcf203196d1c766757c0af9923c2a`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −3.6 dBTP, voice/bed +21.1 to +24.4 dB;
  - ASR WER 0.0 with numbers normalised (raw 0.043 is only "150" in digits);
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline` (local = origin at `dc907d4`). The assigned account is amir@tensorblue.com (CLAUDE.md); commits use the session's noreply identity.
- **State:** the tree was clean, no older job was running, and the batch folder did not exist.
- **The request arrived twice in one message;** exactly one episode was made.
- **Isolation:** only Meshline files were read. The "Recall" voice belongs to another app and was not used; no other app name appears in the CTA or copy.
- **Language override:** English narration and captions only, with the approved English blend (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98, en-us). No Hindi audio was reused.
- **Topic kept:** latency vs bandwidth had never been an episode (it was listed as unused in context 11), and it is distinct from 09 (upload vs download).

## Approved style kept (latest accepted: english-06/07)
- The actual renderer: Node 22 + `@napi-rs/canvas` 2D Transit Map sheet (`src/render.mjs`). The new scene `src/lag.mjs` uses the same helpers:
  - charcoal sheet, blue five-track routes, label halos, paper veils;
  - coral only for problems;
  - one screen-space instrument with sequential state swaps;
  - English captions at 52 px EBold, baselines 398/458;
  - CTA icon + wordmark at y ≈ 1462–1526;
  - the bottom note at 1612.
- No mascot. Quiet pad bed (`audio/mix_e8.py`) with the voice upfront.

## Final script (69 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–3.72 | Your message lands instantly; why does the video call lag? |
| l2 | 4.31–8.02 | That speed number is bandwidth: how many packets travel together. |
| l3 | 8.61–12.07 | Lag is latency: how long each packet takes to arrive. |
| l4 | 12.66–17.45 | A high satellite hop adds about a quarter second each way, however wide the pipe. |
| l5 | 18.04–22.62 | Past about one hundred fifty milliseconds, conversations stop feeling instant. |
| l6 | 23.21–25.54 | So check ping, not just download speed. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

Edits during drafting:
- The first draft had 80 words and 28.9 s of speech, which left only 0.16 s pauses.
- l5 lost "Texts don't mind; conversations do." (Kokoro adds a long pause at the full stop). The hook already makes that contrast. The final is 69 words with ~0.6 s pauses.

## Sources
See `production/30s/2026-11-07-english-08/research/claims.md`:
- ITU-T G.114 (05/2003, in force): the 150 ms "essentially transparent interactivity" guidance, the 400 ms planning limit, fibre 5 µs/km, and a 36 000 km satellite at 260 ms one way;
- M-Lab NDT (reports latency separately);
- the Meshline listing.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–4.3 | Hook | Cartouche "Fast but laggy? / width vs distance". A text envelope lands on the ground route ("text: delivered") while the call's speech bubble climbs the satellite route ("call audio: still travelling"). The instrument shows the two speakers' bars overlapping ("talking over each other"). |
| 4.3–8.6 | Bandwidth | Packets five abreast on both routes; "100 Mbps" on both ("same speed number"); two equal bars in the instrument. |
| 8.6–12.6 | Latency | One ping per route on a "one way · clock slowed down" stopwatch: ground ≈ 10 ms ✓, while the satellite ping is still climbing. |
| 12.6–17.6 | Satellite | Pan up: "36,000 km up", "≈ 260 ms each way", and "width ≠ delay" as the satellite bundle glows; the satellite ping lands at 260 ms ✓. |
| 17.6–23.0 | 150 ms | Instrument meter: "feels instant" up to the 150 ms line, then "lag you notice". Ground ≈ 10 sits left, satellite ≈ 260 sits right (ringed). Pings keep looping on the map. |
| 23.0–26.1 | Check ping | Two speed-test cards: the same "↓ 100 Mbps", with ping ≈ 20 ms vs 520+ ms boxed. |
| 26.1–30 | CTA | Icon and wordmark; pings keep looping, with a slow push-in. |

## Reproduce
From the batch folder:
- `<kokoro-py> ../../../education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr.py lines <faster-whisper-base.en>`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en> meshline-30s-english08-01.mp4 qa/asr_final.json`

## Next
Await review. No automation was created, nothing was uploaded to Drive, and no other video was started.
