# QA — `recall-30s-english15-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-15-english-15/recall-30s-english15-01.mp4`
- **sha256:** `54f7cd7bbf4376b2fd1e93e6c7be61c633906c7aaedc968363c5d7fe037676aa`
- **Size:** 14,525,249 bytes
- **Thumbnail:** `recall-30s-english15-01-thumbnail.png`, 1080x1920 PNG, sha256 `661b15d593314e446f3884892bb4026d30ec1e9cea3af6b05e697a15a1f41b75`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the first full render (no re-render
needed).

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | the beaded glass of iced orange drink on its lime-ringed coaster, plus the title "WHERE'S THIS / WATER FROM?" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | 100 px Fredoka, ink x 203–877, y 379–565 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill area excluded: mean absolute difference 1.66/255 (p99 7.7, i.e. compression only) |
| hook audio | ice clinks at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 106.2 > 12); longest static run 11 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "Where's this water from? It isn't leaking. The drink is orange, but the drops are clear. The air around you contains invisible water vapor. Near the icy glass, that air cools below its dew point. Vapor molecules then stick to the cold glass faster than they escape, forming drops. More humid air means more vapor, so muggy days mean a sweatier glass. An insulated cup stays dry. Its outer wall doesn't get that cold. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP** (−1.6 dBTP in the mix before AAC), LRA 2.4 LU, **0 clipped samples** |
| voice over bed | +16.4 … +20.6 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | 0.0 ms | 0.87 | hook_glass (frame 0: beaded glass + title) |
| l02 | 1.35 | 1.350 | 0.0 ms | 0.85 | hook_glass ("orange drink", then "clear drops") |
| l03 | 5.05 | 5.050 | 0.0 ms | 0.84 | giant_air (vapor molecules beside the glass wall: "water vapor") |
| l04 | 8.40 | 8.400 | −0.1 ms | 0.85 | giant_cool (cold layer forms, molecules slow: "cold glass", "below dew point") |
| l05 | 11.95 | 11.950 | 0.0 ms | 0.84 | giant_stick (molecules land in growing beads: "sticks to the glass") |
| l06 | 17.45 | 17.450 | −0.1 ms | 0.84 | giant_humid (more molecules, beads swell and run: "humid: more vapor") |
| l07 | 21.95 | 21.950 | −0.1 ms | 0.85 | payoff_cup (beaded glass beside a dry tumbler: "stays dry") |
| l08 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 12 spoken caption groups appear 0.05–0.10 s before their first spoken word and stay until their last (the title group
  is on screen from frame 0; its words are spoken 0.05–0.53 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.28 s) x 203–877, y 379–565; all other captions **x 212–869, y 341.5–464.5**; ≤ 2 lines; 56 px (a few long lines 48–54 px) |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 8 brief labels inside x 110–890, y 566–1459; no overlaps with captions or the brand pill. Mostly one at a time; two deliberate pairs are revealed one after the other and stay together while the narration contrasts them: "orange drink" (2.0 s) + "clear drops" (3.15 s) in the hook, and "cold glass" (8.5 s) + "below dew point" (9.5 s) in giant_cool (126 frames with two labels in total) |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 7 shots, plus
each caption start), both decoded from the final MP4, and the thumbnail. Every boundary frame shows the right caption and
label for its shot (no stale overlay); hard cuts only.

**Fixed before the full render (from preview stills):** a finger-wipe close-up read as a blocky hand (removed, with the tumbler
lift); the performer's body intruded into the glass close-up (glass moved); the giant molecules and drops were invisible
because world positions were set inside a positioned group (local positions now); the drink read brown and the beads grey
(brighter materials); the glass wall was hard to read (frost, edge bars, lower opacity, reframed cameras, a visible cold layer
and a "cold glass" label).

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- The insulated-cup payoff is an inference from the cited condensation principle (no source tests cups); molecule sizes,
  speeds and counts, drop growth and the cold layer are illustrative.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
