# QA — `recall-30s-english13-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-13-english-13/recall-30s-english13-01.mp4`
- **sha256:** `4f32aa47b4a4cb52c11a21588c548133392aba1adaa89fd2d9246837309d660e`
- **Size:** 9,750,298 bytes
- **Thumbnail:** `recall-30s-english13-01-thumbnail.png`, 1080x1920 PNG, sha256 `7221cafa8272a426b97360942fb9061637729ae7395b8471122235a244203f3d`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. For this batch the caption
check uses the new safe area (**x 100–900**) and labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the final MP4.

## Defect found after the first full render, and fix
1. **Caption wider than the new safe area.** The first full render failed one check: caption ink reached x 911 (limit 900),
   because captions are centred on the frame (x 540) while the new area 100–900 is centred at x 500. Fix: captions stay
   centred at 540 with text at most 660 px wide (so the text and its pill stay inside 100–900; two long lines now use 48 px
   instead of 56 px). Full re-render (all frames carry captions), re-mux, all QA re-run: caption ink now x 213–866.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 80.4 > 12); longest static run 21 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.012**. Transcript: "The elevator starts up, and the scale jumps from 75 to 84 kilos. Did you gain 9 kilos? No. A scale reads how hard it pushes up on you. To speed you up, it must push harder than gravity pulls. At steady speed, the push matches gravity again. Slowing at the top, it pushes less, so you read lighter. Your mass never changed. Only the push did while your speed was changing. Download Recall to turn your study material into lessons." |
| the only difference | "nine" written as the digit "9" |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.4 dBTP** (−1.6 dBTP in the mix before AAC), LRA 2.7 LU, **0 clipped samples** |
| voice over bed | +16.1 … +18.1 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.20 | 0.200 | 0.0 ms | 0.84 | hook_scale (75.0 → 84.2 kg) → react |
| l02 | 5.30 | 5.300 | 0.0 ms | 0.83 | react (hand to belly; head shake on "No.") |
| l03 | 7.65 | 7.650 | 0.0 ms | 0.87 | shaft_up (push arrow appears) |
| l04 | 10.25 | 10.250 | 0.0 ms | 0.84 | shaft_up (gravity arrow; extra push lights up) |
| l05 | 13.70 | 13.700 | 0.0 ms | 0.85 | shaft_cruise (arrows equal; 75.0 kg) |
| l06 | 16.95 | 16.950 | 0.0 ms | 0.85 | shaft_slow (less push; 65.8 kg; stops at floor 9) |
| l07 | 20.40 | 20.400 | 0.0 ms | 0.85 | payoff (mass: 75 kg; speed graph 84 / 75 / 66) |
| l08 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 12 spoken caption groups appear 0.07–0.10 s before their first spoken word and stay until their last.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | **x 213–866, y 341.5–464.5** (limits x 100–900, y 340–520); ≤ 2 lines; 56 px (two long lines 48 px) |
| y < 300 | no meaningful text |
| labels | 7 brief labels + the reading chip and the graph card, inside x 110–890, y 566–1455; at most two labels at a time; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 7 shots, plus
each caption start), both decoded from the final MP4, a full-size crop of three caption frames with x 100/900 guides, and the
thumbnail. Every boundary frame shows the right caption, labels and reading; the readings change on cue (84.2 → 75.0 →
65.8 → 75.0).

**Fixed before the full render (from preview stills):** the shared performer rig has no legs (the café counter always hid
them), so the performer floated in the car: simple legs and shoes added at runtime; react and payoff framings (head below the
caption); the "gravity" label collided with the reading chip; the graph's "speed" label overlapped "84"; the thumbnail
gradient showed an edge.

## Limits (honest)
- **I cannot listen.** The "listen-through" was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- The 84.2 / 75.0 kg readings come from a textbook calculation (OpenStax: 75.0 kg, 1.20 m/s²), not a measured elevator; the
  65.8 kg slowing reading assumes the same rate; the ride's timing is compressed for the story.
- The CTA uses the verified listing wording ("Download Recall to turn your study material into lessons."), not the earlier
  unverified "with AI" line.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
