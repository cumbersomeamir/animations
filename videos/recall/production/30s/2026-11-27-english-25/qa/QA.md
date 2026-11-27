# QA — `recall-30s-english25-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-27-english-25/recall-30s-english25-01.mp4`
- **sha256:** `cfe9aada48f796e2e4d771e31c5ad31f8e873589353d4188791fefc8ac84e459`
- **Size:** 9,099,173 bytes (~2.4 Mb/s, x264 CRF 17 as in earlier episodes)
- **Thumbnail:** `recall-30s-english25-01-thumbnail.png`, 1080x1920 PNG, sha256 `bd75319f216882ef7e2c5361cfddafb1893464c0a391744b255ab07b999030a0`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, plus decoded-frame reviews of the contact sheet
(1/s), the boundary sheet (first/last frame of every cut and every caption start) and targeted frames. Raw outputs: `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json`, `cue_table.json`. Caption area: ink inside x 100–900,
y 230–1500, nothing in y 0–230; labels inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** (re-run on the final MP4 after the partial re-render).

## Render history (honest)
| step | result | fix |
|---|---|---|
| full render (3 workers, ~4.5 min per worker) | 25/25 checks, narration sync and caption sync passed first time | — |
| visual review of the contact and boundary sheets | (1) `pouch_react` (2.0–5.75 s): the caption pill sat over the performer's eyes; (2) `pull_tab` (24.0–26.45 s): the close-up was mostly forearm and the slider/opening was hard to read | (1) camera pulled back and aimed higher (fov 52) so the head sits below the caption band and the case stays above the bottom UI zone; (2) higher front view looking down on the case so the zip line and the opening gap behind the slider are visible. Stills previewed, then **partial re-render of frames 60–172 and 720–793** with the same renderer; untouched neighbours 59, 173, 719 and 794 are byte-identical (md5); layout logs merged (900 entries); re-mux; all QA re-run |

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | the giant slider cut-away with its lime pull tab: separate rows of teeth entering the top, joined teeth leaving the bottom; title "SAME SLIDER, / OPPOSITE JOBS" (= the spoken l01) at full opacity; no logo intro, no fade |
| title bounds | Fredoka title ink x 204–876, y 387–557 |
| frame 0 = thumbnail | decoded frame 0 vs the thumbnail, Recall-pill rows (y 1395–1475) excluded: mean absolute difference 1.76/255 (p99 6) — compression only |
| hook audio | slow zipper ratchet from 0.00 s; the narrator starts at 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode | exit 0, empty stderr |
| black frames / static runs | none (luma min/mean/max 72.7/102.8/145.4); longest static run 10 frames (0.33 s) |
| assets | fonts load for every caption; the Recall icon loads (end pill, thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0, established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated for this script |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. "Same slider, opposite jobs, pull it one way the teeth lock, pull it back they open, how. Inside, the slider's channel is shaped like a Y. Closing, it's slanted walls squeeze both rows together. Each tooth has a bump and a hollow, so each bump nests in the next hollow. Nested, they hardly pull apart sideways. Opening, a wedge between the arms splits them apart, and many sliders hold still, until you pull the tab. Download Recall to turn your study material into lessons." |
| loudness (final MP4) | **−14.7 LUFS**, true peak **−1.5 dBTP**, LRA 2.0 LU, decoded peak 0.84, **0 clipped samples** |
| voice over bed | +16.1 … +18.9 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | on screen |
|---|---|---|---|---|
| l01 | 0.05 | 0.050 | 0.0 ms | hook_giant (frame 0 + title, chain closing) |
| l02 | 2.15 | 2.150 | −0.2 ms | pouch_react (case zipped shut, then open; "How?") |
| l03 | 5.82 | 5.820 | 0.0 ms | giant_y (cover lifts, "Y channel") |
| l04 | 8.70 | 8.700 | 0.0 ms | giant_close (glowing "slanted walls", rows pressed together) |
| l05 | 11.98 | 11.980 | 0.0 ms | tooth_parts ("bump", "hollow") → tooth_nest at 14.2 ("nested") |
| l06 | 16.50 | 16.500 | −0.1 ms | pull_test (sideways pull arrows; "holds") |
| l07 | 19.03 | 19.030 | 0.0 ms | giant_open (glowing "wedge", rows split) |
| l08 | 22.25 | 22.250 | −0.2 ms | lock_catch (first frame 22.267 s; ghosted cover, lime catch, "lock") → pull_tab at 24.0 (tab pulled, case unzips) |
| l09 | 26.45 | 26.450 | 0.0 ms | cafe_cta (CTA, Recall pill) |

## Captions and layout (renderer box log, all 900 frames)
- All 13 caption groups start 0.00–0.05 s before their first spoken word and stay until their last; ≤ 2 lines; one headline (frame-0
  title) plus the current caption; English only; caption ink x 204–876, y 342–557; y 0–230 clear; labels inside the central region;
  no overlaps between captions, labels and the brand pill.

## Visual review (decoded frames)
- Contact and boundary sheets: one idea per cut; the giant chain scrolls the right way (closing: joined teeth leave the bottom;
  opening: rows leave the top split); the Y channel, slanted walls and wedge are each shown before they are named; the exploded stack
  shows bumps nesting into hollows; café, performer and pencil case stay consistent; nothing vital in the bottom/right UI zone.
- After the fixes: the performer's face is below the caption in `pouch_react`; `pull_tab` shows the slider travelling and the gap
  opening behind it (forearms still enter from the top of the frame — kept, the action is readable).

## Not verified / limits
- I cannot listen: audio is judged from loudness, peaks, voice-over-bed ratios, ASR and the event log, not by ear.
- I did not watch the MP4 in real time; motion was reviewed from decoded frames and frame-difference statistics.
- The zipper is a generic simplified metal zipper; speeds, angles, arrows, the lock catch and the exploded nest animation are illustrative (see `docs/SOURCES.md`).
