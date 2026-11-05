# QA — `recall-30s-english06-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-06-english-06/recall-30s-english06-01.mp4`
- **sha256:** `47c91d7f36b586ed552675d81761046ff411c51cdb87de5883fd06dc6b7468ef`
- **Size:** 16,090,083 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: all 25 automated checks pass, and so do narration sync and caption sync.** Caption sync was also run before
rendering (same result).

**Render note (honest):** the first build attempt was launched as a detached subshell that I believed had been killed; it
kept running alongside the second build, and both muxed into the same MP4 at once, which produced an undecodable file.
Both runs used identical code and the renderer is deterministic. I verified that all 900 PNG frames decode at 1080x1920 and
that 900 layout entries were logged, then re-muxed once and re-ran all QA on the new file (results below).

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 39.1 > 12); longest static run 10 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "The dot is right, so why is the arrow wrong next to a speaker? GPS places the dot. The arrow comes from a tiny compass sensor that feels Earth's magnetic field. That field is weak. Up close, a speaker's magnet or a steel desk can bend it, and the arrow swings. Step away from magnets and steel, then calibrate by waving a figure 8. Download Recall for learning any new subject with AI." ("figure 8" is scored as "figure eight") |
| numbers, dates, currency | none spoken (the "8" of "figure eight" only) |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP**, LRA 4.0 LU, 0 clipped samples |
| voice over bed | +14.7 … +16.7 dB per line (music quiet under speech; the diegetic speaker music in the hook was lowered from +7.3 dB) |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.45 | 0.450 | 0.0 ms | 0.84 | hook_cu (arrow swings 0.38–0.7) → react |
| l02 | 4.35 | 4.350 | 0.0 ms | 0.84 | giant_gps (satellites → dot) → giant_sensor (chip lifts at 7.9) → giant_field (streaks 9.35) |
| l03 | 11.55 | 11.550 | 0.0 ms | 0.83 | giant_magnet (weak 12.0, speaker in 13.0) → giant_steel (steel in 14.75, swing 16.5) |
| l04 | 18.65 | 18.650 | 0.0 ms | 0.84 | giant_away (phone slides 18.75–20.0) → fig8 (21.0–22.9) |
| l05 | 26.35 | 26.350 | −0.2 ms | 0.84 | smile → cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.05–0.11 s before their first spoken word and stay until their last.
- The takeaway "Away from magnets, then a figure 8." is on-screen only (no VO), 23.6–26.25 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters (`caption_non_latin_chars` = []) |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 175–905, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | inside x 100–980, y 560–1460; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 13 shots,
plus each caption start), both decoded from the final MP4.

**Fixed before the render (from preview stills):**
1. The hook beam swung toward the speaker while the giant shots swing it away; made consistent (away from the speaker).
2. Hook POV reframed (phone larger, speaker in view).
3. React, fig8 and cafe_wide framing (face clear of captions; performer and speaker both in the wide).
4. The giant desk re-laid out for portrait: the phone left the frame when "stepping away" sideways; it now moves down the frame.
5. The "step away" tag moved off the phone; the speaker's end rings pulse so it reads as playing.

**Soft spots (not defects):** the café pendant lamp shows as a dark shape near the top of the react shot; the POV inserts
(hook, fixed_cu) sit over a plain counter background.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR (exact transcript) and loudness/ducking measurements.
- The giant desk is illustrative: field strengths are tuned (chip ~74° near the speaker, ~32° near the steel, ~1° after
  moving away), not measured. Real phones also fuse other sensors and filter readings.
- The steel-desk claim applies the sources' soft-iron mechanism (fields induced in unmagnetised ferromagnetic material) to an
  object outside the phone; the sources describe parts in and near the sensor.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
