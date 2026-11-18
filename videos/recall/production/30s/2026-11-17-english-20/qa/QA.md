# QA — `recall-30s-english20-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-17-english-20/recall-30s-english20-01.mp4`
- **sha256:** `9c85de40212c6f416203ab2b79c20179daba7cfb7128c568d94f8ef8726eb591`
- **Size:** 5,835,925 bytes
- **Thumbnail:** `recall-30s-english20-01-thumbnail.png`, 1080x1920 PNG, sha256 `03deee443afc805ed1e2a11d14c0976ca2d0ae6a5dbe8a1db8ab95d7fe72ed3b`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass on the first full render, and so do narration sync and caption sync.** No partial
re-render was needed.

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | a close-up of the café glass with the lime straw visibly snapped at the waterline (the underwater part drawn where it appears), plus the title "THIS STRAW / ISN'T BROKEN" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | Fredoka title, ink x 212–868, y 375–568 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill rows (y ≈ 1379–1488) excluded: mean absolute difference 1.74/255 (p99 4.3, i.e. compression only) |
| hook audio | straw clink and water swirl at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 68.5 > 12); longest static run 41 frames (limit < 60; the held pool side view while "¾ of real depth" is read) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "This straw isn't broken, so why does it snap at the water's surface? Light from the straw speeds up as it leaves the water and changes direction. Like a mower rolling from grass to pavement, one side speeds up first. Your brain traces the light back in a straight line, so the underwater part looks higher. That's why a pool looks shallower from above, about three-quarters of its real depth. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.7 LUFS**, true peak **−1.5 dBTP**, LRA 3.4 LU, **0 clipped samples** |
| voice over bed | +15.5 … +19.8 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | 0.0 ms | 0.86 | hook_glass (frame 0: snapped straw + title) |
| l02 | 1.50 | 1.500 | 0.0 ms | 0.85 | react_look (the performer peers at the glass, raised brow) |
| l03 | 4.75 | 4.750 | 0.0 ms | 0.84 | giant_rays (pulses leave the straw, "speeds up", then "bends") |
| l04 | 9.20 | 9.200 | −0.1 ms | 0.85 | mower (grass → pavement, "one side first") |
| l05 | 13.85 | 13.850 | 0.0 ms | 0.86 | giant_trace (dashed straight-back line, ghost straw: "straight line", "looks higher") |
| l06 | 20.40 | 20.400 | 0.0 ms | 0.83 | pool_wide ("looks shallower") → pool_depth at 22.89 ("¾ of real depth") |
| l07 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0; its words are spoken 0.05–0.69 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.43 s) x 212–868, y 375–568; all other captions **x 211–869, y 341.5–464.5**; ≤ 2 lines |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 7 brief labels, **one at a time**, inside x 191–890, y 566–1256: "speeds up" (x 592–875, y 754–841), "bends" (565–754, 791–875), "one side first" (355–698, 566–645), "straight line" (191–521, 723–807), "looks higher" (565–890, 1176–1256), "looks shallower" (334–740, 836–917), "¾ of real depth" (313–708, 852–935); no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 9 shots, plus
each caption start), both decoded from the final MP4, and the thumbnail. Every boundary frame shows the right caption and label
for its shot (no stale overlay); hard cuts only. Representative frames: the snapped straw (0.5 s), the performer peering (1.5 s),
pulses crossing the surface toward the eye (5.5–8.5 s), the mower before and after the edge (9.5–13.5 s), the dashed back-line and
ghost straw (15.5–18.5 s), the café glass proof (19.5 s), the pool with the shallower ghost floor and the depth bars (20.5–25.5 s),
the CTA (26.5–29.5 s).

**Fixed before the full render (six preview passes):** stale labels from the previous episode's overlay; the eye out of frame
(cameras widened); the iris and pupil silently dropped by an inline comment (split onto its own line); the ray drawn through the
eyeball (now ends at its front); a solid back-line (now dashed); the "looks higher" label beside the real tip (moved next to the
ghost image).

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- "About three quarters" holds for looking roughly straight down (OpenStax UP3 §2.3, n = 4/3); slanted views look shallower still.
  The café glass's break offset, mower speeds and angles, pulse speeds (drawn in a 1 : 1.333 ratio), the eye, ladder and lane
  rope are illustrations; the giant ray path is computed with Snell's law.
- Two worker restarts happened during this job: the first wiped the `/dev/shm` RAM frame cache before the full build started,
  so the full build was rerun with frames on disk (~5.6 GB free; the frame set is a few hundred MB). No earlier output was touched.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
