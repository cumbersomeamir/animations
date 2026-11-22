# QA — `recall-30s-english23-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-21-english-23/recall-30s-english23-01.mp4`
- **sha256:** `bcb9b9e5ec0da14a527bb677ee99b7809a67d5c4b9b9131f6916fa0faf79ac79`
- **Size:** 11,627,383 bytes
- **Thumbnail:** `recall-30s-english23-01-thumbnail.png`, 1080x1920 PNG, sha256 `4386993f69ea4b1cce2ff94372d284eda8e878c871deb6ece7204103adc60555`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py` (run by `build.sh`), plus decoded-frame reviews
of the contact sheet (1 frame/s), the boundary sheet (first/last frame of every cut and every caption start) and targeted frames.
Raw outputs: `qa_report.json`, `ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json`, `cue_table.json`.
Caption area: ink inside x 100–900 and y 230–1500, nothing in y 0–230; labels inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync (second full render).**

## Render history (honest)
| render | result | fix |
|---|---|---|
| 1 | 25/25 automated checks and narration sync passed; **caption sync failed** for one group ("and some hits / the sensor." appeared at 15.11 s, 0.26 s after "and" was spoken, because the group was split at "some"). Visual review also found large foreground smoke particles in `giant_hit` and leftover kettle steam covering the alarm in `react_deadpan` end / `test_wide` | split at "and" (14.85 s); hide particles nearer than z 0.6 in `giant_hit`; steam spawns 18.6–20.1 s, lives 2.1 s and shrinks away |
| 2 (final) | everything passes | — |

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | low angle under the café ceiling smoke alarm (vent slots, lime test button, LED), the first toast smoke curling into it, and the title "HOW DOES IT / SEE SMOKE?" (5 words, = the spoken l01) at full opacity; no logo intro, no fade, no empty set |
| title bounds | Fredoka title, ink x 206–874, y 342–572 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 vs the thumbnail, pill rows (y 1380–1490) excluded: mean absolute difference 1.39/255 (p99 4.0; compression only) |
| hook audio | smoke hiss and an LED blip at 0.00 s; the narrator starts at 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s, ~2.9 Mb/s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (frame luma min/mean/max 39.6/93.2/160.3); longest static run 48 frames = 1.6 s (limit < 2 s) |
| assets | fonts load (`document.fonts.check` true for every caption); the Recall icon loads (end pill, thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated for this script; no cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. "How does it see smoke? Burnt toast and it screams. But what's in that plastic box? Many alarms hide a small chamber with a tiny light. The light aims away from the sensor, so normally it sees nothing. When smoke drifts in, particles scatter the light and some hits the sensor. Enough light and the alarm sounds. Thick steam can set it off, too, even with no fire. So test yours once a month using the test button. Download Recall to turn your study material into lessons." |
| loudness (final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 3.0 LU, decoded peak 0.83, **0 clipped samples** |
| voice over bed | +16.1 … +18.2 dB per line; alarm beeps are softened, low-passed and ducked under the voice |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | on screen |
|---|---|---|---|---|
| l01 | 0.05 | 0.050 | 0.0 ms | hook_alarm (frame 0: alarm + smoke + title) |
| l02 | 1.45 | 1.450 | 0.0 ms | toast_react (toast pops, smoke, alarm screams → flinch) → face_q at 3.25 ("plastic box?") |
| l03 | 5.25 | 5.250 | 0.0 ms | giant_open (cover lifts, LED on, "tiny light") |
| l04 | 8.45 | 8.450 | 0.0 ms | giant_miss (beam into the light trap, dark "sensor") |
| l05 | 12.35 | 12.350 | −0.1 ms | giant_scatter ("smoke" drifts in, rays) → giant_hit at 15.11 ("scattered light" reaches the sensor) |
| l06 | 16.60 | 16.600 | −0.1 ms | giant_hit (sensor glows) → alarm_blare at 17.46 ("the alarm sounds") |
| l07 | 18.85 | 18.850 | −0.1 ms | steam_giant ("steam") → react_deadpan at 20.65 ("even with no fire") |
| l08 | 22.20 | 22.200 | 0.0 ms | test_wide (broom up) → test_press at 24.00 ("test button" pressed at 24.30) |
| l09 | 26.45 | 26.450 | 0.0 ms | cafe_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
All 14 caption groups start 0.00–0.05 s before their first spoken word and stay until their last; ≤ 2 lines; one headline only
(the frame-0 title) plus the current caption.

## Layout (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions English only | yes (no non-Latin characters) |
| caption ink | x 206–874, y 342–572 (frame-0 title); pill captions centred at y 403 |
| y 0–230 | clear in every frame |
| labels | "tiny light", "sensor", "smoke", "scattered light", "steam", "test button": inside x 100–900, y 560–1460 |
| overlaps | none between captions, labels and the brand pill |

## Visual review (decoded frames; what I looked at)
- Contact sheet (1/s) and boundary sheet (26 frames): every cut changes scene and idea; continuity holds (same café, light, toaster,
  kettle, broom; the chamber matches the alarm's lime button and off-white shell); no static slideshow beats.
- Targeted frames: 14.80/14.90 (caption switch), 15.60/16.80 (hit shot), 20.90/21.80 (deadpan: steam rising into the blaring
  alarm), 22.30/23.20 (broom, clear ceiling), 24.40 (press), 29.90 (end card with caption + Recall pill).

## Not verified / limits (stated honestly)
- I cannot listen: audio quality is judged from measurements (loudness, peaks, voice-over-bed ratio), ASR and the event log, not by ear.
- I did not watch the MP4 in real time; motion was reviewed from decoded frames, frame-difference statistics and the static-run check.
- Educational accuracy is limited to the sourced claims in `docs/SOURCES.md`; the chamber is a simplified illustration.
