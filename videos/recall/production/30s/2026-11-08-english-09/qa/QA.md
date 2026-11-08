# QA — `recall-30s-english09-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-08-english-09/recall-30s-english09-01.mp4`
- **sha256:** `084fddacc2805290a7de3634a3ec8fb3ab2a0114616036613897a1f90c4264d9`
- **Size:** 8,594,651 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the final render (6 m 53 s, one build
process).

## Defects found after the first full render, and fixes
1. **Masked word (audio).** ASR on the first final mix heard "Resistive" as "Recystive": the cut whoosh at 18.9 s overlapped the
   word's first syllable. The whoosh now ends before the word (18.62–18.92 s). ASR now hears "Resistive".
2. **Stale overlay frames (renderer).** The boundary sheet showed the giant_thread labels ("conductive thread", "signal") on
   the first frame of giant_resistive (frame 569). A frame-by-frame diff after the fix found one more: frame 96 (3.2 s) still
   showed the first caption. Cause: the GPU-accelerated 2D overlay canvas sometimes had not flushed a frame's clear and draws
   when the frame was captured, and the layout log (from the same draw call) was correct, so only pixels revealed it. It was
   deterministic in long sequential runs and absent in short runs. Fix: the overlay context is now a software canvas
   (`willReadFrequently`), a 1-pixel `getImageData` forces a flush after each overlay draw, and each frame is written from an
   explicit in-page composite (3D canvas + overlay canvas). Verified: frames 96 and 569 now match a clean short run exactly;
   all other frames differ from the first render only by sub-pixel text anti-aliasing (≤ 0.12% of pixels).

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 69.1 > 12); longest static run 16 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.027**. Transcript: "Why does your phone ignore you once you put on gloves? Your phone's screen is capacitive. It senses the electric charge of your fingertip. Ordinary knit gloves don't conduct, so they isolate your finger and nothing registers. Touch screen gloves weave conductive thread into the fingertips to carry your touch through. Resistive screens respond to pressure instead, so a gloved finger or plain stylus works. Download Recall for learning any new subject with AI." |
| the only difference | "Touchscreen" transcribed as "Touch screen" (the same words; counted as 2 edits) |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 3.4 LU, 0 clipped samples |
| voice over bed | +16.6 … +18.3 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.45 | 0.450 | 0.0 ms | 0.83 | hook_pov (two glove taps fail, a bare tap opens the app) → react |
| l02 | 3.30 | 3.300 | 0.0 ms | 0.85 | giant_cap (bare fingertip; charge flows; meter up) |
| l03 | 8.60 | 8.600 | 0.0 ms | 0.84 | giant_glove (knit: charge blocked; meter low) |
| l04 | 14.05 | 14.050 | 0.0 ms | 0.84 | giant_thread (conductive thread; meter up) |
| l05 | 19.05 | 19.050 | 0.0 ms | 0.84 | giant_resistive (gloved press, then stylus press: contact) |
| l06 | 26.35 | 26.350 | −0.2 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 10 spoken caption groups appear 0.04–0.10 s before their first spoken word and stay until their last.
- The takeaway "Winter tip: gloves with conductive fingertips." is on-screen only (no VO), 24.75–26.25 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 127–952, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | inside x 100–980, y 560–1460; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 8 shots, plus
each caption start), both decoded from the final MP4, and a full frame-by-frame diff against the first render.

**Fixed before the full render (from preview stills):** charge dots hidden inside the glove (now drawn x-ray); giant cameras
pulled back to include the signal meter; resistive camera lowered to a side view; resistive presses given an explicit hold.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR and loudness/ducking measurements.
- The giant set is illustrative (charge dots, meter levels and dents are not measured). The glove patents are applications
  (marked abandoned); they are cited for how such gloves work, not as proof about any product.
- Earlier episodes (E06–E08 and before) used the same GPU overlay canvas; a rare one-frame stale caption or label at a cut is
  possible there. Their boundary sheets looked clean, but they were not re-rendered or diffed.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
