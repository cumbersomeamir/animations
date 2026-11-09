# QA — `recall-30s-english10-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-09-english-10/recall-30s-english10-01.mp4`
- **sha256:** `bba454f18f84de22e3a6dcd50b56ce3307594e2216e700404b24a9898c18231d`
- **Size:** 9,305,894 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the final MP4.

## Defect found after the full render, and fix
1. **Near-still hook (0.63–2.57 s, 59 frames).** The stillness scan passed (limit < 60), but the black phone sat almost still
   behind the lens for ~2 s of the opening. Fixed with a slow camera push-in, a small puzzled shake of the phone before the
   turn (≤ 5°, so the screen stays black), and a soft sheen sliding across the lens. Only frames 0–107 (the hook shot) were
   re-rendered (3 processes, same renderer and composite path); the audio was unchanged; the MP4 was re-muxed and all QA was
   re-run. The renderer's layout log for frames 0–107 was replaced by the new one. Longest still run now: 11 frames.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 50.0 > 12); longest static run 11 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.014**. Transcript: "Sunglasses on and your phone goes black, turn it and it's back. Why? Many screens give off light that vibrates one way, set by a filter. Polarized sunglasses filter one direction two, cutting glare off water and roads. When the filters cross, the light is blocked, turn the phone and it passes. So just rotate the phone. And if it darkens, your sunglasses are polarized. Download Recall for learning any new subject with AI." |
| the only difference | "too" transcribed as "two" (a homophone; the caption shows "too") |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.4 dBTP** (−1.6 dBTP in the mix before AAC), LRA 3.9 LU, 0 clipped samples |
| voice over bed | +15.5 … +17.3 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.45 | 0.450 | −0.1 ms | 0.84 | hook_pov (lens drops on, screen black; phone turned, screen back) → react |
| l02 | 4.95 | 4.950 | 0.0 ms | 0.85 | giant_screen (light panel, horizontal-slot filter; every direction → one direction) |
| l03 | 9.30 | 9.300 | 0.0 ms | 0.84 | giant_glare (sun, water, vertical-slot lens; sideways glare stops at the lens) |
| l04 | 14.80 | 14.800 | −0.1 ms | 0.85 | giant_cross (phone behind the lens: crossed = blocked; turned = passes) |
| l05 | 19.20 | 19.200 | 0.0 ms | 0.85 | rotate_pov (dark → bright) → test_cu (lens turned over the flat phone: darkens) |
| l06 | 26.35 | 26.350 | −0.2 ms | 0.84 | take_cu → cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.05–0.10 s before their first spoken word and stay until their last.
- The takeaway "Rotate the phone. / Darkens? Polarized lenses." is on-screen only (no VO), 23.95–26.25 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 175–905, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | 9 distinct labels, inside x 110–974, y 570–1455; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 9 shots, plus
each caption start), both decoded from the final MP4, and a 5 fps strip of the re-rendered hook. Every boundary frame shows
the right caption and labels for its shot (no stale overlay).

**Fixed before the full render (from preview stills):** giant shots re-laid for portrait (high front three-quarter cameras,
see-through filters, sun in frame with mirror geometry, phone moved behind the lens); unpolarized light made gold (it was
invisible against the cream panel); the test close-up rebuilt (one lens centred over the screen and rotated about it; only
that lens darkens; hand holds the far hinge); a stray spline loop in the lens rims removed; the phone's in-hand fingertip
blocks hidden while it lies flat; the test rotation moved to 21.3 s so the clear view is seen first; the POV camera pulls back
as the phone turns sideways.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR and loudness/ducking measurements.
- The giant set is illustrative (slots, ribbons and brightness are not measured; the brightness follows Malus's law only to
  animate the dimming). Which way a real screen's filter points varies by phone; the caption note says so.
- The rotate test is stated one way only: darkening means polarized.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
