# QA — `recall-30s-english18-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-15-english-18/recall-30s-english18-01.mp4`
- **sha256:** `4dbba22a206be61c290ca5ce41e4dbc0a0a306c25cfde34692c83b078e830d29`
- **Size:** 7,217,283 bytes
- **Thumbnail:** `recall-30s-english18-01-thumbnail.png`, 1080x1920 PNG, sha256 `2b7da9324a70a0eeb6eb523271a5b6a5bad9c5803e6b800fc3d5f973b0a33714`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** after one partial re-render (below).

## Fix after the first full render
The first full render failed one check, `labels_in_central_region`: the "solids" label (frames 202–224) was anchored near the
counter and clamped at the bottom of the label area, so its box reached y 1463 (limit 1460). The anchor was raised; frames 198–228
were re-rendered, their layout-log entries merged into `layout_0_299.json`, the MP4 re-muxed from the frames and the existing mix,
and all QA re-run. The label now sits at y 1264–1352. (The first re-render attempt failed on a syntax error introduced by that
edit, an inline comment that cut off the rest of the line; it was caught by the renderer's page error, fixed, and re-run. The
session worker also restarted once after the full render had already completed; the build outputs were re-verified afterwards.)

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | a half-section of a vacuum flask on an oak counter: coffee inside, silver walls, orange infrared arrows zig-zagging in the gap between the mirror walls; plus the title "A MIRROR / FOR HEAT" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | 128 px Fredoka, ink x 246–834, y 355–592 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill area excluded: mean absolute difference 1.45/255 (p99 6.0, i.e. compression only) |
| hook audio | a glint and soft steam at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr (also re-run independently after the worker restart) |
| black frames / static runs | none (min frame luma 61.0 > 12); longest static run 42 frames (limit < 60; the bare bottle while "Heat escapes three ways" is spoken) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "A mirror for heat, that's the shiny wall inside a thermos. Why does it need one? Heat escapes three ways. Through solids, through air, and as infrared light. A thermos has two walls with a vacuum between them. With almost no air there, heat can barely conduct or flow across. But infrared crosses a vacuum, like sunlight through space. So the walls are shiny, bouncing it back. That leaves the top as the weak spot, so keep the lid on. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP** (−1.6 dBTP in the mix before AAC), LRA 1.7 LU, **0 clipped samples** |
| voice over bed | +15.9 … +20.8 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | −0.2 ms | 0.86 | hook_mirror (frame 0: mirror-walled flask + title) |
| l02 | 1.20 | 1.200 | 0.0 ms | 0.84 | react_peek (peeks into the steaming flask, then a raised brow) |
| l03 | 5.00 | 5.000 | 0.0 ms | 0.84 | giant_ways ("solids", "air", "infrared") |
| l04 | 9.45 | 9.450 | 0.0 ms | 0.85 | giant_walls (outer wall arrives, gap air pumped out: "vacuum") |
| l05 | 12.35 | 12.350 | −0.1 ms | 0.85 | giant_noair (conduction arrows stop at the empty gap: "almost no air") |
| l06 | 16.45 | 16.450 | −0.1 ms | 0.86 | giant_ir (infrared crosses the gap: "infrared") |
| l07 | 20.10 | 20.100 | 0.0 ms | 0.85 | giant_mirror (walls turn to mirrors, infrared bounces: "mirror") |
| l08 | 22.60 | 22.600 | 0.0 ms | 0.85 | giant_top (heat escapes the open top; the lid clicks on: "weak spot") |
| l09 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 16 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0; its words are spoken 0.05–0.53 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.13 s) x 246–834, y 355–592; all other captions **x 223–858, y 341.5–464.5**; ≤ 2 lines; 56 px (long lines 48 px) |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 7 brief labels ("solids", "air", "infrared", "vacuum", "almost no air", "mirror", "weak spot"), **one at a time**, inside x 110–890, y 561–1352; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 9 shots, plus
each caption start), both decoded from the final (re-muxed) MP4, and the thumbnail. Every boundary frame shows the right caption
and label for its shot (no stale overlay); hard cuts only.

**Fixed before the full render (three preview passes):** the infrared arrows first travelled through the coffee (physically the
radiation crosses the vacuum gap) → the gap was widened and the arrows now leave the inner wall, cross the gap, or zig-zag
between the mirror walls; the lid parked above the frame cast a black shadow blob on the backdrop → hidden, no lid shadows; the
coffee read orange → darker; the arrows were too thin for a phone → thicker and larger; the react shot cut the face and hid the
flask, then put the caption over the eyes → wider lens with the face below the caption and the steaming flask in view; frame 0's
lid sat behind the title → lid off in frame 0.

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- The cutaway exaggerates the vacuum gap and wall thickness; the heat arrows, their counts and speeds are illustrations, not
  measurements (no heat-loss numbers are claimed). Real flasks leave a little residual gas in the gap and silvering reduces,
  not eliminates, radiation, which is why the narration says "almost no air" and "barely".
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
