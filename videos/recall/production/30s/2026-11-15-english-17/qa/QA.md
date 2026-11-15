# QA — `recall-30s-english17-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-15-english-17/recall-30s-english17-01.mp4`
- **sha256:** `97c70f905eb469331ee461d26e9eac38ce8ce8e506fdeed229236906b96064e1`
- **Size:** 11,079,293 bytes
- **Thumbnail:** `recall-30s-english17-01-thumbnail.png`, 1080x1920 PNG, sha256 `b6e687ea3a7ae227966c7ca36b1719611837079a3f6556ee640f87d61d2963b2`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** after one partial re-render (below).

## Fix after the first full render
The first full render failed one check, `labels_in_central_region`: in the payoff_moist shot the "moist cabin air" label was
anchored below the hole, and as the camera pushed in it was clamped at the bottom of the label area, so its box reached
y 1461 (limit 1460) in frames 722–791. The anchor was moved above the hole; frames 675–791 (the whole shot) were re-rendered, their
layout log entries merged into `layout_600_899.json`, the MP4 re-muxed from the frames and the existing mix, and all QA re-run.
The label now sits in y 564–696. The thumbnail's Recall pill was also moved below the window so it no longer sits next to the
glowing hole (thumbnail only).

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | the airliner window on the cream sidewall at sunset over a sea of clouds, shade partly down, the small hole in the middle layer glowing lime; plus the title "THAT HOLE IS / ON PURPOSE" (the brief's 5 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | 108 px Fredoka, ink x 203–877, y 372–572 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill area excluded: mean absolute difference 1.38/255 (p99 4.3, i.e. compression only) |
| hook audio | cabin ambience and a glint at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 84.3 > 12); longest static run 15 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "That hole is on purpose. It decides which layer holds the cabin in. Up high, cabin air pushes out much harder than the thin air outside. The thick outer layer takes that push. The hole lets cabin air into the gap, behind the middle layer. Equal pressure on both sides means that layer carries no load. It's the backup. See fog between the layers. That's moist cabin air that came in through the hole. Download recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 3.4 LU, **0 clipped samples** |
| voice over bed | +15.7 … +19.2 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | −0.1 ms | 0.86 | hook_window (frame 0: the glowing hole + title) |
| l02 | 1.55 | 1.550 | 0.0 ms | 0.86 | react_point (leans in, eyes on the hole, raised brow) |
| l03 | 4.65 | 4.650 | 0.0 ms | 0.84 | giant_climb (outside dots thin: "thin air") |
| l04 | 8.75 | 8.750 | 0.0 ms | 0.84 | giant_outer (push arrows on the outer layer: "outer layer") |
| l05 | 10.90 | 10.900 | 0.0 ms | 0.84 | giant_hole (lime ring, dots pass through: "hole") |
| l06 | 14.45 | 14.450 | 0.0 ms | 0.84 | giant_equal → giant_backup at 18.46 ("no load", then "backup") |
| l07 | 20.60 | 20.600 | 0.0 ms | 0.83 | payoff_fog → payoff_moist at 22.49 ("fog", then "moist cabin air") |
| l08 | 26.45 | 26.450 | 0.0 ms | 0.84 | cabin_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 14 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0; its words are spoken 0.05–0.63 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.48 s) x 203–877, y 372–572; all other captions **x 223–858, y 341.5–464.5**; ≤ 2 lines; 56 px (one long line 48 px) |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 7 brief labels ("thin air", "outer layer", "hole", "no load", "backup", "fog", "moist cabin air"), **one at a time**, inside x 110–890, y 561–696; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 10 shots, plus
each caption start), both decoded from the final (re-muxed) MP4, and the thumbnail. Every boundary frame shows the right caption
and label for its shot (no stale overlay); hard cuts only.

**Fixed before the full render (four preview passes):** the hook camera was too close (window filled the frame, grey haze,
back-lit grey clouds) → wider framing with the title over the wall, a sunset gradient with its horizon in view and self-lit
clouds, fainter pane tints, a larger hole marker; the react shot showed the back of the head and a blocky pointing fist →
camera from the window side, no pointing; the section's white dots vanished on a cream backdrop and the gap showed a black void
→ warm brown and sky-blue backdrops and a back plate; the hole glow was oversized → smaller glow plus a lime ring; the payoff was
one 5.9 s shot → split into fog and moist-air close-ups.

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- "Three layers" is the typical design (FAA AC 25.775-1 says "typically"); some windows differ. Dot densities, layer thicknesses
  and the hole marker's size are illustrative (a real breather hole is tiny); no pressure numbers are claimed.
- The frame-0 title has 5 words, as the brief specified; the older thumbnail rule asks for 2–4.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
