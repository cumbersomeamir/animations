# QA — `recall-30s-english08-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-07-english-08/recall-30s-english08-01.mp4`
- **sha256:** `0c171fc04c9dae5442202b0052d68bea4bfd1d8931e96c5448f0bfc70c18e597`
- **Size:** 8,345,969 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** (first full render 5 m 43 s, one build
process; then two targeted fixes, below).

**Fixes after the first full render (from the boundary sheet):** the battery close-up opened on an almost empty counter for
~0.2 s (the remote was still travelling down at the cut), and its last ~0.15 s showed the remote lifting away. The hand-offs
now happen exactly at the cuts (20.4 s and 23.6 s); the "no flicker" tag fades before the phone is set down. Only frames
600–799 were re-rendered (deterministic renderer; the old layout logs for those frames were replaced, 900 entries in total),
then the MP4 was re-muxed and all QA re-run on the new file (results below).

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 60.0 > 12); longest static run 5 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.013** (1 of 75 words). Transcript: "Your eyes can't see this remote's light, so why can your phone camera? Remote's blink infrared light just passed the red end your eyes detect in a quick code the TV reads. Many camera sensors respond to that infrared, so the blinks show up on screen. Remote not working, aim it at the camera and press a button. No flicker, try new batteries or another camera. Download Recall for learning any new subject with AI." |
| the one difference | "past" transcribed as "passed" (identical pronunciation; spelling only). "Remotes" → "Remote's" is the same word after normalisation |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP**, LRA 4.5 LU, 0 clipped samples |
| voice over bed | +15.7 … +17.6 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.40 | 0.400 | 0.0 ms | 0.85 | hook_pov (flash in the first frames, real LED dark) → react |
| l02 | 4.60 | 4.600 | 0.0 ms | 0.84 | giant_spectrum (infrared band 5.24, eye range 7.9) → giant_code (9.2) |
| l03 | 11.60 | 11.600 | 0.0 ms | 0.85 | giant_sensor (tiles glow, eye sees nothing) |
| l04 | 16.80 | 16.800 | −0.1 ms | 0.85 | tv_fail → test_pov (no flicker) → battery_cu (swap) |
| l05 | 26.35 | 26.350 | −0.2 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.05–0.10 s before their first spoken word and stay until their last.
- The takeaway "Flicker on camera = the remote is sending." is on-screen only (no VO), 23.7–26.25 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 135–945, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | inside x 100–980, y 560–1460; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 11 shots,
plus each caption start), both decoded from the final MP4.

**Fixed before the full render (from preview stills):** giant_code framing (TV off-frame); giant_sensor framing (sensor seen
edge-on, tiles hidden); counter TV moved and tv_fail / tv_ok / cafe_wide reframed; the battery swap moved to the counter with a
top-down close-up (the hand filled the frame); the hook remote raised into frame.

**Soft spot (not a defect):** in tv_fail / tv_ok the performer's head sits at the right edge while the TV and the aimed remote
are central.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR and loudness/ducking measurements.
- The giant set is illustrative: the infrared is drawn as ghost rings so it can be followed; the spectrum proportions and the
  on/off code are not measured; phone screens show infrared in a false violet-white.
- Not every phone camera shows a remote's infrared (hence "many" and "or another camera"); Bluetooth remotes do not flash
  (publishing note).
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
